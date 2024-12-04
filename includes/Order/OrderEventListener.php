<?php

namespace WeDevs\Dokan\Order;

use WC_Geolocation;
use WC_Order;

class OrderEventListener {

    public function __construct() {
        add_action( 'woocommerce_trash_order', array( $this, 'after_order_trash' ), 10, 1 );
        add_action( 'woocommerce_untrash_order', array( $this, 'after_order_untrash' ), 10, 1 );
    }

    /**
     * Perform actions after an order is trashed.
     *
     * This method is triggered when an order is moved to the trash. It updates the order status
     * in the Dokan tables and logs the action.
     *
     * @param int $order_id ID of the trashed order.
     *
     * @return void
     */
    public function after_order_trash( int $order_id ) {
        global $wpdb;

        $order = wc_get_order( $order_id );
        if ( ! $order instanceof WC_Order ) {
            dokan_log( "Failed to fetch order {$order_id} during trash operation." );
            return;
        }

        $this->process_order_status( $order, $wpdb, $order_id );
        $this->log_status_change( 'trashed', $order_id );
    }

    /**
     * Perform actions after an order is untrashed (restored).
     *
     * This method is triggered when an order is restored from the trash. It updates the order status
     * in the Dokan tables and logs the action.
     *
     * @param int $order_id ID of the restored order.
     *
     * @return void
     */
    public function after_order_untrash( int $order_id ) {
        global $wpdb;

        $order = wc_get_order( $order_id );
        if ( ! $order instanceof WC_Order ) {
            dokan_log( "Failed to fetch order {$order_id} after untrash." );
            return;
        }

        $this->process_order_status( $order, $wpdb, $order_id );
        $this->log_status_change( 'restored', $order_id );
    }

    /**
     * Update the order status in Dokan tables.
     *
     * This method updates the order status in the `dokan_orders` and `dokan_vendor_balance` tables
     * based on the current status of the WooCommerce order.
     *
     * @since 3.13.1
     *
     * @param WC_Order $order The WooCommerce order object.
     * @param \wpdb    $wpdb  The WordPress database object.
     * @param int      $order_id The ID of the order.
     *
     * @return void
     */
    protected function process_order_status( WC_Order $order, \wpdb $wpdb, int $order_id ): void {
        $previous_status = $order->get_status( 'edit' );
        if ( strpos( $previous_status, 'wc-' ) === false ) {
            $previous_status = 'wc-' . $previous_status;
        }

        // Update Dokan orders table
        $wpdb->update(
            $wpdb->prefix . 'dokan_orders',
            array( 'order_status' => $previous_status ),
            array( 'order_id' => $order_id ),
            array( '%s' ),
            array( '%d' )
        );

        // Update Dokan vendor balance table
        $wpdb->update(
            $wpdb->prefix . 'dokan_vendor_balance',
            array( 'status' => $previous_status ),
            array(
                'trn_id'   => $order_id,
                'trn_type' => 'dokan_orders',
            ),
            array( '%s' ),
            array( '%d', '%s' )
        );
    }

    /**
     * Log order status change events.
     *
     * @param string $action   The action performed (trashed/restored)
     * @param int    $order_id The order ID
     *
     * @return void
     */
    private function log_status_change( string $action, int $order_id ): void {
        $user_id = dokan_get_current_user_id();
        $action_message = $action === 'trashed' ? 'moved to trash' : 'restored from trash';

        if ( $user_id ) {
            $user = get_user_by( 'id', $user_id );

            $user_name = trim( sprintf( '%s %s', $user->first_name, $user->last_name ) );
            if ( empty( $user_name ) ) {
                $user_name = $user->user_login;
            }

            dokan_log(
                sprintf(
                    '[Order Sync] Order #%d %s by %s (%s) from IP: %s',
                    $order_id,
                    $action_message,
                    $user_name,
                    implode( ', ', $user->roles ),
                    WC_Geolocation::get_ip_address()
                )
            );
            return;
        }

        dokan_log(
            sprintf(
                '[Order Sync] Order #%d %s by System',
                $order_id,
                $action_message
            )
        );
    }
}
