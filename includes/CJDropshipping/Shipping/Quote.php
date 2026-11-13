<?php

namespace WeDevs\Dokan\CJDropshipping\Shipping;

use WeDevs\Dokan\CJDropshipping\Api\ApiException;
use WeDevs\Dokan\CJDropshipping\Api\Catalog;
use WeDevs\Dokan\CJDropshipping\Api\ProductDetails;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Settings;
use WP_Error;

/**
 * Prices shipping for a vendor's CJ items to one address (epic §3).
 *
 * @since DOKAN_SINCE
 */
class Quote {

    public const CACHE_TTL    = 12 * HOUR_IN_SECONDS;
    public const FALLBACK_TTL = DAY_IN_SECONDS;
    public const NEGATIVE_TTL = MINUTE_IN_SECONDS;

    protected Catalog $catalog;

    protected VariantRepository $variants;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param Catalog|null           $catalog  CJ API.
     * @param VariantRepository|null $variants Variants.
     */
    public function __construct( ?Catalog $catalog = null, ?VariantRepository $variants = null ) {
        $this->catalog  = $catalog ?? new Catalog();
        $this->variants = $variants ?? new VariantRepository();
    }

    /**
     * Quote the cheapest sensible CJ shipping for the items.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $items   Each: vid, quantity, name.
     * @param string $country Destination country.
     * @param string $zip     Destination postcode.
     *
     * @return array|WP_Error price_usd, days (min, max), groups[], cross_border, required[].
     */
    public function get( array $items, string $country, string $zip = '' ) {
        $country = strtoupper( $country );

        if ( '' === $country ) {
            return new WP_Error( 'dokan_cj_no_address', __( 'Enter your address to see shipping.', 'dokan-lite' ) );
        }

        if ( in_array( $country, Settings::blocked_countries(), true ) ) {
            return $this->item_error( 'dokan_cj_blocked', $items );
        }

        $plans = $this->plans( $items );

        if ( is_wp_error( $plans ) ) {
            return $plans;
        }

        $lines = [];

        foreach ( $items as $item ) {
            $lines[ (string) $item['vid'] ] = (int) $item['quantity'];
        }

        ksort( $lines );

        $key      = md5( wp_json_encode( [ $country, $zip, $lines, $plans, Settings::counts_warehouse_only() ] ) );
        $cached   = get_transient( 'dokan_cj_quote_' . $key );
        $negative = get_transient( 'dokan_cj_quote_fail_' . $key );

        if ( is_array( $cached ) ) {
            return isset( $cached['error'] ) ? new WP_Error( $cached['error'], $cached['message'] ) : $cached;
        }

        if ( $negative ) {
            return $this->fallback( $key );
        }

        try {
            $result = $this->quote_plans( $plans, $items, $country, $zip );
        } catch ( ApiException $e ) {
            set_transient( 'dokan_cj_quote_fail_' . $key, 1, self::NEGATIVE_TTL );

            return $this->fallback( $key );
        }

        if ( is_wp_error( $result ) ) {
            // Routes CJ doesn't serve don't change by the minute; don't pay to ask again.
            set_transient(
                'dokan_cj_quote_' . $key,
                [
                    'error'   => $result->get_error_code(),
                    'message' => $result->get_error_message(),
                ],
                self::CACHE_TTL
            );
        } else {
            set_transient( 'dokan_cj_quote_' . $key, $result, self::CACHE_TTL );
            set_transient( 'dokan_cj_quote_last_' . $key, $result, self::FALLBACK_TTL );
        }

        return $result;
    }

    /**
     * Ways to ship the items: one warehouse that has everything, or the fewest groups.
     *
     * @since DOKAN_SINCE
     *
     * @param array $items Items.
     *
     * @return array|WP_Error 'single' => [ countries ] or 'split' => [ country => [ vids ] ].
     */
    protected function plans( array $items ) {
        $candidates = [];

        foreach ( $items as $item ) {
            $countries = [];

            foreach ( $this->variants->get_stock( $item['vid'] ) as $country => $row ) {
                if ( ProductDetails::counted( $row ) >= (int) $item['quantity'] ) {
                    $countries[] = $country;
                }
            }

            if ( ! $countries ) {
                return $this->item_error( 'dokan_cj_no_stock', [ $item ] );
            }

            $candidates[ $item['vid'] ] = $countries;
        }

        // Warehouses that stock every item.
        $lists  = array_values( $candidates );
        $common = array_values( array_reduce( array_slice( $lists, 1 ), static fn( $carry, $list ) => array_intersect( $carry, $list ), $lists[0] ) );
        sort( $common );

        if ( $common ) {
            return [ 'single' => $common ];
        }

        // Greedy: the warehouse covering most remaining items first.
        $groups    = [];
        $remaining = $candidates;

        while ( $remaining ) {
            $counts = array_count_values( array_merge( ...array_values( $remaining ) ) );
            arsort( $counts );
            $country = (string) array_key_first( $counts );

            foreach ( $remaining as $vid => $countries ) {
                if ( in_array( $country, $countries, true ) ) {
                    $groups[ $country ][] = (string) $vid;
                    unset( $remaining[ $vid ] );
                }
            }
        }

        ksort( $groups );

        return [ 'split' => $groups ];
    }

    /**
     * Ask CJ and pick a route per group.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $plans   plans() result.
     * @param array  $items   Items.
     * @param string $country Destination.
     * @param string $zip     Postcode.
     *
     * @return array|WP_Error
     * @throws ApiException When CJ fails.
     */
    protected function quote_plans( array $plans, array $items, string $country, string $zip ) {
        $by_vid = array_column( $items, null, 'vid' );
        $groups = isset( $plans['single'] )
            ? array_fill_keys( $plans['single'], array_map( 'strval', array_keys( $by_vid ) ) )
            : $plans['split'];

        $requests = [];

        foreach ( $groups as $warehouse => $vids ) {
            $requests[] = $this->request( (string) $warehouse, $vids, $by_vid, $country, $zip );
        }

        $routes = $this->best_routes( $this->catalog->freight( $requests ) );

        if ( isset( $plans['single'] ) ) {
            $options = array_intersect_key( $routes, $groups );

            if ( ! $options ) {
                return $this->item_error( 'dokan_cj_unreachable', $items );
            }

            // Fastest warehouse; cheaper on a tie. An unknown delivery time is never the fastest.
            $slowest = static fn( $route ) => $route['days'][1] > 0 ? $route['days'][1] : PHP_INT_MAX;
            uasort( $options, static fn( $a, $b ) => [ $slowest( $a ), $a['price_usd'] ] <=> [ $slowest( $b ), $b['price_usd'] ] );
            $warehouse = (string) array_key_first( $options );
            $chosen    = [ $warehouse => $groups[ $warehouse ] ];
        } else {
            $chosen = $groups;

            foreach ( $groups as $warehouse => $vids ) {
                if ( ! isset( $routes[ $warehouse ] ) ) {
                    return $this->item_error( 'dokan_cj_unreachable', array_intersect_key( $by_vid, array_flip( $vids ) ) );
                }
            }
        }

        $result = [
            'price_usd'    => 0.0,
            'days'         => [ 0, 0 ],
            'groups'       => [],
            'cross_border' => false,
            'required'     => [],
        ];

        foreach ( $chosen as $warehouse => $vids ) {
            $route = $routes[ $warehouse ];

            $result['price_usd']   += $route['price_usd'];
            $result['days']         = [ max( $result['days'][0], $route['days'][0] ), max( $result['days'][1], $route['days'][1] ) ];
            $result['cross_border'] = $result['cross_border'] || $warehouse !== $country;
            $result['required']     = array_values( array_unique( array_merge( $result['required'], $route['required'] ) ) );
            $result['groups'][]     = [
                'warehouse' => (string) $warehouse,
                'vids'      => array_values( $vids ),
                'method'    => $route['method'],
                'days'      => $route['days'],
                'price_usd' => $route['price_usd'],
            ];
        }

        return $result;
    }

    /**
     * One freight request for a warehouse group.
     *
     * @since DOKAN_SINCE
     *
     * @param string $warehouse Warehouse country.
     * @param array  $vids      Variant ids in the group.
     * @param array  $by_vid    Items keyed by vid.
     * @param string $country   Destination.
     * @param string $zip       Postcode.
     *
     * @return array
     */
    protected function request( string $warehouse, array $vids, array $by_vid, string $country, string $zip ): array {
        $lines = [];
        $props = [];

        foreach ( $vids as $vid ) {
            $variant = $this->variants->get( (string) $vid );
            $props   = array_merge( $props, array_filter( explode( ',', (string) ( $variant['props'] ?? '' ) ) ) );
            $lines[] = [
                'vid'      => (string) $vid,
                'sku'      => (string) ( $variant['sku'] ?? '' ),
                'quantity' => (int) $by_vid[ $vid ]['quantity'],
                'weight'   => (int) ( $variant['weight_g'] ?? 0 ),
                'volume'   => (float) ( $variant['volume_cm3'] ?? 0 ),
            ];
        }

        return [
            'warehouse' => $warehouse,
            'country'   => $country,
            'zip'       => $zip,
            'items'     => $lines,
            'props'     => $props,
        ];
    }

    /**
     * Per origin warehouse: CJ's recommended route, else the cheapest (decided PM 2026-10-30).
     *
     * @since DOKAN_SINCE
     *
     * @param array[] $rows CJ quote rows.
     *
     * @return array<string, array> Warehouse => method, price_usd, days, required.
     */
    protected function best_routes( array $rows ): array {
        $routes = [];

        foreach ( $rows as $row ) {
            $origin = strtoupper( (string) ( $row['srcAreaCode'] ?? $row['srcArea']['shortCode'] ?? '' ) );

            if ( '' === $origin || ! isset( $row['totalPostageFee'] ) ) {
                continue;
            }

            $recommended = 1 === (int) ( $row['compositeRecommendSort'] ?? 0 ) || in_array( 2, array_map( 'intval', (array) ( $row['recommendLogisticsTypeList'] ?? [] ) ), true );
            $route       = [
                'method'      => (string) ( $row['option']['enName'] ?? $row['logisticName'] ?? '' ),
                'price_usd'   => (float) $row['totalPostageFee'],
                'days'        => self::parse_days( (string) ( $row['arrivalTime'] ?? $row['logisticAging'] ?? '' ) ),
                'recommended' => $recommended,
                'required'    => $this->required_fields( (array) ( $row['allRuleTips'] ?? [] ) ),
            ];

            $current = $routes[ $origin ] ?? null;

            if ( ! $current
                || ( $route['recommended'] && ! $current['recommended'] )
                || ( $route['recommended'] === $current['recommended'] && $route['price_usd'] < $current['price_usd'] ) ) {
                $routes[ $origin ] = $route;
            }
        }

        return $routes;
    }

    /**
     * Recipient fields a route insists on, e.g. phone or tax ID (F10).
     *
     * @since DOKAN_SINCE
     *
     * @param array[] $tips CJ allRuleTips.
     *
     * @return string[]
     */
    protected function required_fields( array $tips ): array {
        $fields = [];

        foreach ( $tips as $tip ) {
            if ( '0' === (string) ( $tip['interceptType'] ?? '' ) && in_array( $tip['type'] ?? '', [ 'phone', 'dutyNo' ], true ) ) {
                $fields[] = (string) $tip['type'];
            }
        }

        return $fields;
    }

    /**
     * CJ's "4-6" day range as [ 4, 6 ].
     *
     * @since DOKAN_SINCE
     *
     * @param string $range Range text.
     *
     * @return int[]
     */
    public static function parse_days( string $range ): array {
        preg_match_all( '/\d+/', $range, $matches );
        $numbers = array_map( 'intval', $matches[0] );

        if ( ! $numbers ) {
            return [ 0, 0 ];
        }

        return [ min( $numbers ), max( $numbers ) ];
    }

    /**
     * The last good quote, up to a day old, when CJ can't be asked (F2).
     *
     * @since DOKAN_SINCE
     *
     * @param string $key Cache key.
     *
     * @return array|WP_Error
     */
    protected function fallback( string $key ) {
        $last = get_transient( 'dokan_cj_quote_last_' . $key );

        if ( is_array( $last ) ) {
            return $last;
        }

        return new WP_Error( 'dokan_cj_unavailable', __( 'We couldn\'t get a shipping price for these items right now. Please try again in a few minutes.', 'dokan-lite' ) );
    }

    /**
     * Error that names the items affected; never mentions CJ (C1).
     *
     * @since DOKAN_SINCE
     *
     * @param string $code  Error code.
     * @param array  $items Items.
     *
     * @return WP_Error
     */
    protected function item_error( string $code, array $items ): WP_Error {
        $names = implode( ', ', array_filter( wp_list_pluck( $items, 'name' ) ) );

        $messages = [
            /* translators: %s: product names */
            'dokan_cj_blocked'     => __( '%s can\'t be shipped to your country.', 'dokan-lite' ),
            /* translators: %s: product names */
            'dokan_cj_unreachable' => __( '%s can\'t be shipped to your address.', 'dokan-lite' ),
            /* translators: %s: product names */
            'dokan_cj_no_stock'    => __( '%s is out of stock in the quantity you chose.', 'dokan-lite' ),
        ];

        return new WP_Error( $code, sprintf( $messages[ $code ], $names ) );
    }
}
