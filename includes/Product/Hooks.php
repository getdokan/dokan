<?php

namespace WeDevs\Dokan\Product;

/**
* Admin Hooks
*
* @package dokan
*
* @since 3.0.0
*/
class Hooks {

    /**
     * Load autometically when class initiate
     *
     * @since 3.0.0
     */
    public function __construct() {
        add_action( 'template_redirect', [ $this, 'bulk_product_status_change' ] );
        add_action( 'dokan_bulk_product_status_change', [ $this, 'bulk_product_delete' ], 10, 2 );
    }

    /**
     * Change bulk product status in vendor dashboard
     *
     * @since 2.8.6
     *
     * @return string
     */
    function bulk_product_status_change() {
        if ( ! current_user_can( 'dokan_delete_product' ) ) {
            return;
        }

        $post_data = wp_unslash( $_POST );

        if ( ! isset( $post_data['security'] ) || ! wp_verify_nonce( $post_data['security'], 'bulk_product_status_change' ) ) {
            return;
        }
        if ( ! isset( $post_data['status'] ) || ! isset( $post_data['bulk_products'] ) ) {
            return;
        }

        $status   = $post_data['status'];
        $products = $post_data['bulk_products'];

        // -1 means bluk action option value
        if ( $status === '-1' ) {
            return;
        }

        do_action( 'dokan_bulk_product_status_change', $status, $products );
    }

    /**
     * Bulk product delete
     *
     * @param string $action
     * @param object $products
     *
     * @return void
     */
    function bulk_product_delete( $action, $products ) {
        if ( 'delete' !== $action || empty( $products ) ) {
            return;
        }

        foreach ( $products as $product_id ) {
            if ( dokan_is_product_author( $product_id ) ) {
                dokan()->product->delete( $product_id, true );
            }
        }

        wp_redirect( add_query_arg( array( 'message' => 'product_deleted' ), dokan_get_navigation_url( 'products' ) ) );
        exit;
    }

}
