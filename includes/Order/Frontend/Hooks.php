<?php

namespace WeDevs\Dokan\Order\Frontend;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Order Frontend Hooks
 *
 * @since 3.8.0
 */
class Hooks {
    /**
     * Class constructor
     *
     * @since 3.8.0
     */
    public function __construct() {
        add_action( 'template_redirect', [ $this, 'bulk_order_status_change' ] );
    }

    /**
     * Change bulk order status in vendor dashboard
     *
     * @since 2.8.3
     * @since 3.8.0 Moved this method from includes/wc-functions.php file
     *
     * @return void
     */
    public function bulk_order_status_change() {
        if ( ! isset( $_POST['security'] ) || ! wp_verify_nonce( sanitize_key( $_POST['security'] ), 'bulk_order_status_change' ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_manage_order' ) ) {
            return;
        }

        if ( dokan_get_option( 'order_status_change', 'dokan_selling' ) === 'off' ) {
            return;
        }

        // Doing the bulk action for orders.
        dokan_apply_bulk_order_status_change(
            [
                'status'      => isset( $_POST['status'] ) ? sanitize_text_field( wp_unslash( $_POST['status'] ) ) : '',
                'bulk_orders' => isset( $_POST['bulk_orders'] ) ? array_map( 'absint', $_POST['bulk_orders'] ) : [],
            ]
        );
    }
}
