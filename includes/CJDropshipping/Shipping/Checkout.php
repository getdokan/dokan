<?php

namespace WeDevs\Dokan\CJDropshipping\Shipping;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\Contracts\Hookable;
use WC_Order;
use WC_Order_Item_Product;
use WC_Order_Item_Shipping;
use WP_Error;

/**
 * Checkout for CJ items: own package and shipping line, no COD, order data for fulfilment (epic §3).
 *
 * @since DOKAN_SINCE
 */
class Checkout implements Hookable {

    public const PACKAGE_KEY = 'dokan_cj_package';
    public const TAX_ID_KEY   = 'billing_dokan_cj_tax_id';
    public const BLOCK_TAX_ID = 'dokan-cj/tax-id';

    // Quotes computed during this request, keyed by package.
    protected static array $quotes = [];

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_cart_shipping_packages', [ $this, 'split_packages' ], 20 );
        add_action( 'woocommerce_load_shipping_methods', [ $this, 'load_method' ] );
        add_filter( 'woocommerce_package_rates', [ $this, 'only_cj_rates' ], 99999, 2 );
        add_action( 'woocommerce_after_calculate_totals', [ $this, 'explain_missing_rates' ], 20 );
        add_action( 'woocommerce_store_api_cart_errors', [ $this, 'add_store_api_errors' ], 10, 2 );
        add_action( 'woocommerce_after_shipping_rate', [ $this, 'print_rate_notes' ], 10, 2 );
        add_action( 'woocommerce_init', [ $this, 'register_block_tax_id_field' ] );
        add_action( 'woocommerce_store_api_checkout_update_order_from_request', [ $this, 'validate_store_api' ], 10, 2 );
        add_filter( 'dokan_delivery_time_skip_pickup_package', [ $this, 'skip_pickup' ], 10, 2 );
        add_filter( 'woocommerce_available_payment_gateways', [ $this, 'hide_cod' ], 20 );
        add_filter( 'woocommerce_checkout_fields', [ $this, 'add_tax_id_field' ] );
        add_action( 'woocommerce_after_checkout_validation', [ $this, 'validate' ], 20, 2 );
        add_action( 'woocommerce_checkout_create_order_line_item', [ $this, 'add_line_item_meta' ], 20, 3 );
        add_action( 'woocommerce_checkout_create_order_shipping_item', [ $this, 'add_shipping_item_meta' ], 20, 3 );
        add_filter( 'dokan_shipping_fee_recipient', [ $this, 'vendor_gets_shipping' ], 20, 2 );
        add_filter( 'dokan_shipping_tax_fee_recipient', [ $this, 'vendor_gets_shipping' ], 20, 2 );
    }

    /**
     * Move each vendor's CJ items into their own package (H1).
     *
     * @since DOKAN_SINCE
     *
     * @param array $packages Packages, one per vendor.
     *
     * @return array
     */
    public function split_packages( $packages ): array {
        if ( ! Settings::is_enabled() ) {
            return (array) $packages;
        }

        $links = new LinkRepository();
        $split = [];

        foreach ( (array) $packages as $package ) {
            $cj_items = [];

            foreach ( (array) ( $package['contents'] ?? [] ) as $key => $item ) {
                if ( self::is_cj_item( $item, $links ) ) {
                    $cj_items[ $key ] = $item;
                    unset( $package['contents'][ $key ] );
                }
            }

            if ( $package['contents'] ) {
                $package['contents_cost'] = array_sum( wp_list_pluck( $package['contents'], 'line_total' ) );
                $split[]                  = $package;
            }

            if ( $cj_items ) {
                $cj_package                      = $package;
                $cj_package['contents']          = $cj_items;
                $cj_package['contents_cost']     = array_sum( wp_list_pluck( $cj_items, 'line_total' ) );
                $cj_package[ self::PACKAGE_KEY ] = true;
                $split[]                         = $cj_package;
            }
        }

        return $split;
    }

    /**
     * Offer the CJ method to CJ packages only.
     *
     * @since DOKAN_SINCE
     *
     * @param array $package Package being rated.
     *
     * @return void
     */
    public function load_method( $package ): void {
        if ( empty( $package[ self::PACKAGE_KEY ] ) ) {
            return;
        }

        WC()->shipping()->shipping_methods[ Method::ID ] = new Method();
    }

    /**
     * A CJ package gets only CJ's rate; no rate means it can't be bought right now.
     *
     * @since DOKAN_SINCE
     *
     * @param array $rates   Rates.
     * @param array $package Package.
     *
     * @return array
     */
    public function only_cj_rates( $rates, $package ): array {
        if ( empty( $package[ self::PACKAGE_KEY ] ) ) {
            return (array) $rates;
        }

        return array_filter(
            (array) $rates,
            static fn( $rate ) => 0 === strpos( (string) $rate->get_method_id(), Method::ID )
        );
    }

    /**
     * Why each CJ package has no rate, naming the items and never CJ.
     *
     * @since DOKAN_SINCE
     *
     * @return string[] Package key => message.
     */
    public static function missing_rate_messages(): array {
        $messages = [];

        foreach ( WC()->shipping()->get_packages() as $key => $package ) {
            if ( empty( $package[ self::PACKAGE_KEY ] ) || ! empty( $package['rates'] ) ) {
                continue;
            }

            $quote = self::quote_for_package( $package );

            if ( is_wp_error( $quote ) ) {
                $messages[ $key ] = $quote->get_error_message();
            }
        }

        return $messages;
    }

    /**
     * Show the reason in the classic cart and checkout; retry when CJ was only unreachable.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function explain_missing_rates(): void {
        if ( ! WC()->session || ! self::cart_has_cj_items() ) {
            return;
        }

        foreach ( self::missing_rate_messages() as $key => $message ) {
            // WooCommerce keeps rates per package hash; drop them so the next load asks again.
            WC()->session->set( 'shipping_for_package_' . $key, null );

            if ( ( is_cart() || is_checkout() || wp_doing_ajax() ) && ! wc_has_notice( $message, 'error' ) ) {
                wc_add_notice( $message, 'error' );
            }
        }
    }

    /**
     * Block checkout: the same reasons as cart errors.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Error $errors Cart errors.
     * @param \WC_Cart $cart   Cart.
     *
     * @return void
     */
    public function add_store_api_errors( $errors, $cart ): void {
        if ( ! $errors instanceof WP_Error ) {
            return;
        }

        foreach ( self::missing_rate_messages() as $message ) {
            $errors->add( 'dokan_cj_shipping', $message );
        }
    }

    /**
     * Classic cart and checkout: delivery range and notes under the CJ rate.
     *
     * @since DOKAN_SINCE
     *
     * @param \WC_Shipping_Rate $rate  Rate.
     * @param int|string        $index Package index.
     *
     * @return void
     */
    public function print_rate_notes( $rate, $index ): void {
        if ( ! $rate instanceof \WC_Shipping_Rate || 0 !== strpos( $rate->get_id(), Method::ID ) ) {
            return;
        }

        $parts = array_filter( [ $rate->get_delivery_time(), $rate->get_description() ] );

        if ( $parts ) {
            echo '<br><small class="dokan-cj-rate-notes">' . esc_html( implode( ' · ', $parts ) ) . '</small>';
        }
    }

    /**
     * CJ ships the parcel, so store pickup never applies to it.
     *
     * @since DOKAN_SINCE
     *
     * @param bool  $skip    Whether to skip.
     * @param array $package Package.
     *
     * @return bool
     */
    public function skip_pickup( $skip, $package ): bool {
        return (bool) $skip || ! empty( $package[ self::PACKAGE_KEY ] );
    }

    /**
     * Hide cash on delivery when the cart has a CJ item.
     *
     * @since DOKAN_SINCE
     *
     * @param array $gateways Gateways.
     *
     * @return array
     */
    public function hide_cod( $gateways ): array {
        $gateways = (array) $gateways;

        if ( isset( $gateways['cod'] ) && ! is_admin() && self::cart_has_cj_items() ) {
            unset( $gateways['cod'] );
        }

        return $gateways;
    }

    /**
     * Tax ID field for routes that need one (F10), shown only with CJ items in the cart.
     *
     * @since DOKAN_SINCE
     *
     * @param array $fields Checkout fields.
     *
     * @return array
     */
    public function add_tax_id_field( $fields ): array {
        $fields = (array) $fields;

        if ( ! self::cart_has_cj_items() ) {
            return $fields;
        }

        $fields['billing'][ self::TAX_ID_KEY ] = [
            'label'       => __( 'Tax ID', 'dokan-lite' ),
            'description' => __( 'Some countries need your personal tax ID for customs.', 'dokan-lite' ),
            'required'    => false,
            'priority'    => 120,
        ];

        return $fields;
    }

    /**
     * Block checkout: optional tax ID field (F10).
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_block_tax_id_field(): void {
        if ( ! Settings::is_enabled() || ! function_exists( 'woocommerce_register_additional_checkout_field' ) ) {
            return;
        }

        woocommerce_register_additional_checkout_field(
            [
                'id'       => self::BLOCK_TAX_ID,
                'label'    => __( 'Tax ID (needed for customs in some countries)', 'dokan-lite' ),
                'location' => 'order',
                'type'     => 'text',
                'required' => false,
            ]
        );
    }

    /**
     * Block checkout: ask for the phone or tax ID a route insists on (F10).
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order         $order   Order being placed.
     * @param \WP_REST_Request $request Checkout request.
     *
     * @return void
     * @throws \Automattic\WooCommerce\StoreApi\Exceptions\RouteException When a field is missing.
     */
    public function validate_store_api( $order, $request ): void {
        $required = self::required_fields();
        $fields   = (array) ( $request['additional_fields'] ?? [] );
        $phone    = $order->get_billing_phone() ? $order->get_billing_phone() : $order->get_shipping_phone();

        if ( in_array( 'phone', $required, true ) && ! $phone ) {
            throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'dokan_cj_phone', esc_html__( 'A phone number is needed to deliver to your address.', 'dokan-lite' ), 400 );
        }

        if ( in_array( 'dutyNo', $required, true ) && empty( $fields[ self::BLOCK_TAX_ID ] ) ) {
            throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'dokan_cj_tax_id', esc_html__( 'Your tax ID is needed for customs in your country.', 'dokan-lite' ), 400 );
        }
    }

    /**
     * Recipient fields the cart's CJ routes insist on.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    public static function required_fields(): array {
        $required = [];

        foreach ( WC()->shipping()->get_packages() as $package ) {
            if ( empty( $package[ self::PACKAGE_KEY ] ) ) {
                continue;
            }

            $quote = self::quote_for_package( $package );

            if ( ! is_wp_error( $quote ) ) {
                $required = array_merge( $required, $quote['required'] );
            }
        }

        return array_values( array_unique( $required ) );
    }

    /**
     * Ask for the phone or tax ID a route insists on (F10).
     *
     * @since DOKAN_SINCE
     *
     * @param array    $data   Posted checkout data.
     * @param WP_Error $errors Errors.
     *
     * @return void
     */
    public function validate( $data, $errors ): void {
        $required = self::required_fields();

        if ( in_array( 'phone', $required, true ) && empty( $data['billing_phone'] ) ) {
            $errors->add( 'dokan_cj_phone', __( 'A phone number is needed to deliver to your address.', 'dokan-lite' ) );
        }

        if ( in_array( 'dutyNo', $required, true ) && empty( $data[ self::TAX_ID_KEY ] ) ) {
            $errors->add( 'dokan_cj_tax_id', __( 'Your tax ID is needed for customs in your country.', 'dokan-lite' ) );
        }
    }

    /**
     * Save what the vendor needs to order on CJ onto each CJ line (epic §4, §5).
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order_Item_Product $item     Order item.
     * @param string                $cart_key Cart item key.
     * @param array                 $values   Cart item.
     *
     * @return void
     */
    public function add_line_item_meta( $item, $cart_key, $values ): void {
        $product_id = ! empty( $values['variation_id'] ) ? (int) $values['variation_id'] : (int) ( $values['product_id'] ?? 0 );
        $link       = ( new LinkRepository() )->get( $product_id );

        if ( ! $link ) {
            return;
        }

        $variant = ( new VariantRepository() )->get( $link['vid'] );

        $item->add_meta_data( '_dokan_cj_vid', $link['vid'], true );
        $item->add_meta_data( '_dokan_cj_pid', $link['pid'], true );
        $item->add_meta_data( '_dokan_cj_sku', (string) ( $variant['sku'] ?? '' ), true );
        $item->add_meta_data( '_dokan_cj_cost', wc_format_decimal( Settings::to_store_currency( (float) ( $variant['cost_usd'] ?? 0 ) ), wc_get_price_decimals() ), true );

        // The quote of the package this cart item ships in.
        foreach ( WC()->shipping()->get_packages() as $package ) {
            if ( empty( $package[ self::PACKAGE_KEY ] ) || ! isset( $package['contents'][ $cart_key ] ) ) {
                continue;
            }

            $quote = self::quote_for_package( $package );

            foreach ( is_wp_error( $quote ) ? [] : $quote['groups'] as $group ) {
                if ( in_array( (string) $link['vid'], array_map( 'strval', $group['vids'] ), true ) ) {
                    $item->add_meta_data( '_dokan_cj_warehouse', $group['warehouse'], true );
                    $item->add_meta_data( '_dokan_cj_method', $group['method'], true );
                }
            }
        }
    }

    /**
     * Save the CJ route per warehouse onto the CJ shipping line.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order_Item_Shipping $item        Shipping item.
     * @param int|string             $package_key Package key.
     * @param array                  $package     Package.
     *
     * @return void
     */
    public function add_shipping_item_meta( $item, $package_key, $package ): void {
        if ( empty( $package[ self::PACKAGE_KEY ] ) ) {
            return;
        }

        $quote = self::quote_for_package( $package );

        if ( ! is_wp_error( $quote ) ) {
            $item->add_meta_data( '_dokan_cj_groups', $quote['groups'], true );
        }
    }

    /**
     * Shipping and its tax go to the vendor on orders with a CJ item; the vendor pays CJ's freight (A2).
     *
     * @since DOKAN_SINCE
     *
     * @param string $recipient admin or seller.
     * @param int    $order_id  Order id.
     *
     * @return string
     */
    public function vendor_gets_shipping( $recipient, $order_id ): string {
        $order = wc_get_order( $order_id );

        if ( ! $order instanceof WC_Order || ! apply_filters( 'dokan_cj_vendor_gets_shipping', true, $order ) ) {
            return (string) $recipient;
        }

        foreach ( $order->get_items() as $item ) {
            if ( $item->get_meta( '_dokan_cj_vid' ) ) {
                return 'seller';
            }
        }

        return (string) $recipient;
    }

    /**
     * Quote for a CJ package, once per request.
     *
     * @since DOKAN_SINCE
     *
     * @param array $package Package.
     *
     * @return array|WP_Error
     */
    public static function quote_for_package( array $package ) {
        $links = new LinkRepository();
        $items = [];

        foreach ( (array) ( $package['contents'] ?? [] ) as $cart_item ) {
            $product_id = ! empty( $cart_item['variation_id'] ) ? (int) $cart_item['variation_id'] : (int) ( $cart_item['product_id'] ?? 0 );
            $link       = $links->get( $product_id );

            if ( ! $link ) {
                continue;
            }

            $vid = $link['vid'];

            $items[ $vid ] = [
                'vid'      => $vid,
                'quantity' => ( $items[ $vid ]['quantity'] ?? 0 ) + (int) $cart_item['quantity'],
                'name'     => $cart_item['data']->get_name(),
            ];
        }

        $country = (string) ( $package['destination']['country'] ?? '' );
        $zip     = (string) ( $package['destination']['postcode'] ?? '' );
        $key     = md5( wp_json_encode( [ $items, $country, $zip ] ) );

        if ( ! isset( self::$quotes[ $key ] ) ) {
            self::$quotes[ $key ] = ( new Quote() )->get( array_values( $items ), $country, $zip );
        }

        return self::$quotes[ $key ];
    }

    /**
     * Whether a cart item is a CJ product.
     *
     * @since DOKAN_SINCE
     *
     * @param array          $item  Cart item.
     * @param LinkRepository $links Links.
     *
     * @return bool
     */
    protected static function is_cj_item( array $item, LinkRepository $links ): bool {
        $product_id = ! empty( $item['variation_id'] ) ? (int) $item['variation_id'] : (int) ( $item['product_id'] ?? 0 );

        return null !== $links->get( $product_id );
    }

    /**
     * Whether the cart has a CJ product.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function cart_has_cj_items(): bool {
        if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
            return false;
        }

        $links = new LinkRepository();

        foreach ( WC()->cart->get_cart() as $item ) {
            if ( self::is_cj_item( $item, $links ) ) {
                return true;
            }
        }

        return false;
    }
}
