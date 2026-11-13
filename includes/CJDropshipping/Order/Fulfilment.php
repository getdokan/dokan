<?php

namespace WeDevs\Dokan\CJDropshipping\Order;

use WeDevs\Dokan\CJDropshipping\Data\OrderRefRepository;
use WeDevs\Dokan\CJDropshipping\Settings;
use WC_Order;
use WC_Order_Item_Product;
use WP_Error;

/**
 * The vendor's manual CJ fulfilment: CJ order numbers, tracking and delivery (epic §5).
 *
 * @since DOKAN_SINCE
 */
class Fulfilment {

    public const SNAPSHOT_META = '_dokan_cj_snapshot';
    public const CHANGED_META  = '_dokan_cj_changed_notified';
    public const UNKNOWN       = 'unknown';

    protected OrderRefRepository $refs;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param OrderRefRepository|null $refs Order refs.
     */
    public function __construct( ?OrderRefRepository $refs = null ) {
        $this->refs = $refs ?? new OrderRefRepository();
    }

    /**
     * CJ items of an order grouped by warehouse, with what the panel shows.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Vendor's (sub-)order.
     *
     * @return array<string, array> Warehouse => items, method, cost, ref.
     */
    public function groups( WC_Order $order ): array {
        $groups = [];
        $refs   = $this->refs->for_order( $order->get_id() );

        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof WC_Order_Item_Product || ! $item->get_meta( '_dokan_cj_vid' ) ) {
                continue;
            }

            $warehouse = (string) $item->get_meta( '_dokan_cj_warehouse' );
            $warehouse = '' !== $warehouse ? $warehouse : self::UNKNOWN;
            $cost      = (float) $item->get_meta( '_dokan_cj_cost' ) * $item->get_quantity();

            $groups[ $warehouse ]['warehouse']  = $warehouse;
            $groups[ $warehouse ]['method']     = (string) $item->get_meta( '_dokan_cj_method' );
            $groups[ $warehouse ]['items'][]    = [
                'name'     => $item->get_name(),
                'cj_sku'   => (string) $item->get_meta( '_dokan_cj_sku' ),
                'quantity' => $item->get_quantity(),
                'cost'     => $cost,
            ];
            $groups[ $warehouse ]['cost']       = ( $groups[ $warehouse ]['cost'] ?? 0 ) + $cost;
            $groups[ $warehouse ]['ref']        = $refs[ $warehouse ] ?? null;
        }

        ksort( $groups );

        return $groups;
    }

    /**
     * Whether the order has CJ items.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order.
     *
     * @return bool
     */
    public static function has_cj_items( WC_Order $order ): bool {
        foreach ( $order->get_items() as $item ) {
            if ( $item->get_meta( '_dokan_cj_vid' ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Save CJ's order number and tracking for one warehouse group (D6, D7).
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order       Order.
     * @param int      $vendor_id   Vendor id.
     * @param string   $warehouse   Warehouse group.
     * @param string   $cj_order_no CJ order number.
     * @param string   $tracking_no Tracking number.
     *
     * @return array|WP_Error Saved group plus duplicates (other order ids with this CJ number).
     */
    public function save( WC_Order $order, int $vendor_id, string $warehouse, string $cj_order_no, string $tracking_no ) {
        $groups = $this->groups( $order );

        if ( ! isset( $groups[ $warehouse ] ) ) {
            return new WP_Error( 'dokan_cj_unknown_group', __( 'That warehouse group is not on this order.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $previous = $groups[ $warehouse ]['ref'] ?? [];

        $this->refs->save(
            $order->get_id(),
            $vendor_id,
            $warehouse,
            [
                'cj_order_no' => $cj_order_no,
                'tracking_no' => $tracking_no,
            ]
        );

        if ( $cj_order_no && ( $previous['cj_order_no'] ?? '' ) !== $cj_order_no ) {
            /* translators: 1: CJ order number, 2: warehouse country */
            $order->add_order_note( sprintf( __( 'Ordered on CJ: %1$s (ships from %2$s).', 'dokan-lite' ), $cj_order_no, self::warehouse_name( $warehouse ) ), 0, true );

            // The first CJ order fixes the snapshot; later groups keep a change warning for earlier ones.
            if ( ! array_filter( array_column( array_filter( array_column( $groups, 'ref' ) ), 'cj_order_no' ) ) ) {
                $order->update_meta_data( self::SNAPSHOT_META, self::snapshot( $order ) );
                $order->delete_meta_data( self::CHANGED_META );
                $order->save();
            }
        }

        if ( $tracking_no && ( $previous['tracking_no'] ?? '' ) !== $tracking_no ) {
            /* translators: %s: tracking number */
            $order->add_order_note( sprintf( __( 'CJ tracking number: %s', 'dokan-lite' ), $tracking_no ), 0, true );

            // Pro turns this into a Dokan shipment so the buyer is emailed (D6).
            do_action( 'dokan_cj_tracking_saved', $order, $warehouse, $tracking_no, $groups[ $warehouse ] );
        }

        return [
            'duplicates' => $cj_order_no ? $this->refs->orders_with_number( $vendor_id, $cj_order_no, $order->get_id() ) : [],
        ];
    }

    /**
     * Complete the order once CJ delivered it, even if vendors can't change status (D2).
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order.
     *
     * @return true|WP_Error
     */
    public function mark_delivered( WC_Order $order ) {
        // Only paid orders being fulfilled; never an unpaid or refunded one.
        if ( ! $order->has_status( 'processing' ) ) {
            return new WP_Error( 'dokan_cj_not_processing', __( 'Only orders in Processing can be marked as delivered.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        if ( ! $this->is_fully_ordered( $order ) ) {
            return new WP_Error( 'dokan_cj_not_ordered', __( 'Save the CJ order number for every warehouse first.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        foreach ( array_keys( $this->groups( $order ) ) as $warehouse ) {
            $this->refs->save( $order->get_id(), 0, $warehouse, [ 'delivered_at' => current_time( 'mysql', true ) ] );
        }

        $order->update_status( 'completed', __( 'Marked as delivered from the CJ panel.', 'dokan-lite' ) );

        return true;
    }

    /**
     * Whether every warehouse group has a CJ order number.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order.
     *
     * @return bool
     */
    public function is_fully_ordered( WC_Order $order ): bool {
        return $this->refs->is_fully_ordered( $order->get_id(), array_keys( $this->groups( $order ) ) );
    }

    /**
     * Whether the address or items changed since the vendor saved a CJ order number (D4).
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order.
     *
     * @return bool
     */
    public static function changed_since_ordered( WC_Order $order ): bool {
        $saved = (string) $order->get_meta( self::SNAPSHOT_META );

        return '' !== $saved && $saved !== self::snapshot( $order );
    }

    /**
     * Fingerprint of what CJ needs: shipping address and CJ items.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order.
     *
     * @return string
     */
    public static function snapshot( WC_Order $order ): string {
        $items = [];

        foreach ( $order->get_items() as $item ) {
            if ( $item->get_meta( '_dokan_cj_vid' ) ) {
                $items[] = [ $item->get_meta( '_dokan_cj_vid' ), $item->get_quantity() ];
            }
        }

        return md5( wp_json_encode( [ self::address( $order ), $items ] ) );
    }

    /**
     * The address to send CJ, one field per line.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order.
     *
     * @return array<string, string>
     */
    public static function address( WC_Order $order ): array {
        $prefix = $order->has_shipping_address() ? 'shipping' : 'billing';
        $get    = static fn( $field ) => (string) $order->{"get_{$prefix}_{$field}"}();

        return array_filter(
            [
                'name'      => trim( $get( 'first_name' ) . ' ' . $get( 'last_name' ) ),
                'company'   => $get( 'company' ),
                'address_1' => $get( 'address_1' ),
                'address_2' => $get( 'address_2' ),
                'city'      => $get( 'city' ),
                'state'     => $get( 'state' ),
                'postcode'  => $get( 'postcode' ),
                'country'   => $get( 'country' ),
                'phone'     => $order->get_shipping_phone() ? $order->get_shipping_phone() : $order->get_billing_phone(),
                'email'     => $order->get_billing_email(),
                'tax_id'    => (string) ( $order->get_meta( '_billing_dokan_cj_tax_id' ) ? $order->get_meta( '_billing_dokan_cj_tax_id' ) : $order->get_meta( '_wc_other/dokan-cj/tax-id' ) ),
            ],
            static fn( $value ) => '' !== $value
        );
    }

    /**
     * Country name for a warehouse code.
     *
     * @since DOKAN_SINCE
     *
     * @param string $warehouse Warehouse country code.
     *
     * @return string
     */
    public static function warehouse_name( string $warehouse ): string {
        if ( self::UNKNOWN === $warehouse ) {
            return __( 'the warehouse you choose on CJ', 'dokan-lite' );
        }

        return WC()->countries->get_countries()[ $warehouse ] ?? $warehouse;
    }

    /**
     * The vendor's paid CJ orders still waiting for a CJ order number (D10).
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id.
     *
     * @return int[] Order ids.
     */
    public function awaiting( int $vendor_id ): array {
        global $wpdb;

        // Oldest first: those are the ones the buyer has waited longest for.
        $order_ids = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $wpdb->prepare(
                "SELECT DISTINCT do.order_id FROM {$wpdb->prefix}dokan_orders do
                INNER JOIN {$wpdb->prefix}woocommerce_order_items oi ON oi.order_id = do.order_id
                INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta im ON im.order_item_id = oi.order_item_id AND im.meta_key = '_dokan_cj_vid'
                WHERE do.seller_id = %d AND do.order_status = 'wc-processing'
                ORDER BY do.order_id ASC LIMIT 200",
                $vendor_id
            )
        );
        $ids       = [];

        foreach ( array_map( 'intval', (array) $order_ids ) as $order_id ) {
            $order = wc_get_order( $order_id );

            if ( $order && ! $this->is_fully_ordered( $order ) ) {
                $ids[] = $order_id;
            }
        }

        return $ids;
    }

    /**
     * CJ cost of the order's CJ items, for the panel's money line.
     *
     * @since DOKAN_SINCE
     *
     * @param array $groups groups() result.
     *
     * @return float
     */
    public static function total_cost( array $groups ): float {
        return (float) array_sum( wp_list_pluck( $groups, 'cost' ) );
    }

    /**
     * Freight CJ quoted per warehouse at checkout, in store currency.
     *
     * @since DOKAN_SINCE
     *
     * @param WC_Order $order Order.
     *
     * @return array<string, float>
     */
    public static function quoted_freight( WC_Order $order ): array {
        $freight = [];

        foreach ( $order->get_items( 'shipping' ) as $shipping ) {
            $groups = $shipping->get_meta( '_dokan_cj_groups' );

            foreach ( is_array( $groups ) ? $groups : [] as $group ) {
                if ( is_array( $group ) && isset( $group['warehouse'], $group['price_usd'] ) ) {
                    $freight[ $group['warehouse'] ] = Settings::to_store_currency( (float) $group['price_usd'] );
                }
            }
        }

        return $freight;
    }
}
