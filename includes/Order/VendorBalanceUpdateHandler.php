<?php

namespace WeDevs\Dokan\Order;

use Exception;
use WC_Abstract_Order;
use WC_Order;
use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Commission\OrderCommission;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Class VendorBalanceUpdateHandler.
 *
 * Handles the update of vendor balance after an order is edited.
 */
class VendorBalanceUpdateHandler implements Hookable {

    /**
     * Vendor earning without refund meta key.
     */
    public const DOKAN_VENDOR_EARNING_WITHOUT_REFUND_META_KEY = 'dokan_vendor_earning_without_refund';

    /**
     * Register hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'woocommerce_update_order', [ $this, 'handle_order_edit' ], 99, 2 );
        add_action( 'woocommerce_update_order', [ $this, 'update_dokan_order_table' ], 80, 2 );
    }

    /**
     * Handle after order object save.
     *
     * @param int $order_id Order ID.
     * @param WC_Order $order Order object.
     *
     * @return void
     */
    public function handle_order_edit( int $order_id, WC_Abstract_Order $order ) {
        if ( $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        try {
            $order_commission_calculator = dokan_get_container()->get( OrderCommission::class );
            $order_commission_calculator->set_order( $order );
            $order_commission_calculator->set_should_adjust_refund( false );
            $order_commission_calculator->calculate();

            $vendor_earning = $order_commission_calculator->get_vendor_earning();
        } catch ( Exception $e ) {
            error_log( sprintf( 'Dokan: Order %d commission calculation failed. Error: %s', $order_id, $e->getMessage() ) );
            return;
        }

        $previous_data = $this->get_order_amount( $order );

        if ( null === $previous_data || floatval( $previous_data ) === $vendor_earning ) {
            return;
        }

        $updated = $this->update_balance( $order, $vendor_earning );

        if ( $updated ) {
            return;
        }

        dokan_log(
            sprintf(
                'For Order %d Edit event, Vendor Balance entry could not be updated. Current Vendor Earning: %s, Previous Vendor Earning: %s',
                $order_id,
                $vendor_earning,
                $previous_data
            )
        );
    }

    /**
     * Update vendor balance entry for the order.
     *
     * @param WC_Abstract_Order $order Order.
     * @param float $balance New balance.
     *
     * @return bool|int
     */
    protected function update_balance( WC_Abstract_Order $order, float $balance ) {
        global $wpdb;

        remove_action( 'woocommerce_update_order', [ $this, 'handle_order_edit' ], 99 );
        $order->update_meta_data( self::DOKAN_VENDOR_EARNING_WITHOUT_REFUND_META_KEY, $balance );
        $order->save();
        add_action( 'woocommerce_update_order', [ $this, 'handle_order_edit' ], 99, 2 );

        return $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->dokan_vendor_balance,
            [ 'debit' => $balance ],
            [
                'trn_id'   => $order->get_id(),
                'trn_type' => 'dokan_orders',
            ],
            [ '%s' ],
            [ '%d', '%s' ]
        );
    }

    /**
     * Get order amount from vendor balance table.
     *
     * @param WC_Order $order Order.
     *
     * @return float|null
     */
    protected function get_order_amount( WC_Abstract_Order $order ): ?float {
        global $wpdb;

        $cached_value = $order->get_meta( self::DOKAN_VENDOR_EARNING_WITHOUT_REFUND_META_KEY );

        if ( $cached_value ) {
            return floatval( $cached_value );
        }

        return $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT debit FROM {$wpdb->dokan_vendor_balance} WHERE trn_id = %d AND trn_type = 'dokan_orders'",
                $order->get_id()
            )
        );
    }

    /**
     * Update dokan_orders table if necessary.
     *
     * @since 4.0.0
     *
     * @param  int $order_id Order ID.
     * @param  WC_Abstract_Order|WC_Order $order Order object.
     *
     * @return void
     */
    public function update_dokan_order_table( int $order_id, $order ) {
        global $wpdb;

        if ( $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        // Remove the action to prevent infinite loop
        remove_action( 'woocommerce_update_order', [ $this, 'update_dokan_order_table' ], 80 );

        try {
            $order_commission_calculator = dokan_get_container()->get( OrderCommission::class );
            $order_commission_calculator->set_order( $order );
            $order_commission_calculator->calculate();

            $calculated_earning = $order_commission_calculator->get_vendor_earning();
        } catch ( Exception $e ) {
            error_log( sprintf( 'Dokan: Order %d commission calculation failed. Error: %s', $order->get_id(), $e->getMessage() ) );
            return;
        }

        $earning_in_dokan_orders = dokan()->commission->get_earning_from_order_table( $order->get_id() );

        // Restore the action
        add_action( 'woocommerce_update_order', [ $this, 'update_dokan_order_table' ], 80, 2 );

        if ( $earning_in_dokan_orders === floatval( $calculated_earning ) ) {
            return;
        }

        $updated = $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->dokan_orders,
            [
                'net_amount' => $calculated_earning,
                'order_total' => $order->get_total(),
            ],
            [ 'order_id' => $order->get_id() ],
            [ '%s', '%s' ],
            [ '%d' ]
        );

        if ( ! $updated ) {
            return;
        }

        Cache::delete( "get_earning_from_order_table_{$order->get_id()}_seller" );
    }
}
