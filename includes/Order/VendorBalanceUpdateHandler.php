<?php

namespace WeDevs\Dokan\Order;

use Exception;
use WC_Abstract_Order;
use WC_Order;
use WeDevs\Dokan\Commission\OrderCommission;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * Class VendorBalanceUpdateHandler.
 *
 * Handles the update of vendor balance after an order is edited.
 */
class VendorBalanceUpdateHandler implements Hookable {

    /**
     * Register hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'woocommerce_update_order', [ $this, 'handle_order_edit' ], 99, 2 );
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
            $order_commission_calculator->calculate();

            $vendor_earning = $order_commission_calculator->get_vendor_total_earning();
        } catch ( Exception $e ) {
            error_log( sprintf( 'Dokan: Order %d commission calculation failed. Error: %s', $order_id, $e->getMessage() ) );
            return;
        }

        $previous_data = $this->get_order_amount( $order );

        if ( null === $previous_data || $previous_data === $vendor_earning ) {
            return;
        }

        $this->update_balance( $order, $vendor_earning );

        error_log(
            sprintf(
                'Dokan: Order %d commission after save. Vendor Earning: %s, Previous Vendor Earning: %s',
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
        $order->update_meta_data( 'dokan_vendor_balance', $balance );
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

        $cached_value = $order->get_meta( 'dokan_vendor_balance' );

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
}
