<?php

namespace WeDevs\Dokan\Dashboard\Templates;

/**
 * Dokan Order Template Class
 *
 * @since 2.4
 *
 * @author weDves <info@wedevs.com>
 */
class Orders {

    /**
     * Load autometically when class inistantiate
     * hooked up all actions and filters
     *
     * @since 2.4
     */
    function __construct() {
        add_action( 'template_redirect', array( $this, 'handle_order_export' ) );
        add_action( 'dokan_order_content_inside_before', array( $this, 'show_seller_enable_message' ) );
        add_action( 'dokan_order_inside_content', array( $this, 'order_listing_status_filter' ), 10 );
        add_action( 'dokan_order_inside_content', array( $this, 'order_main_content' ), 15 );
    }

    /**
     * Show Seller Enable Error Message
     *
     * @since 2.4
     *
     * @return void
     */
    public function show_seller_enable_message() {
        $user_id = get_current_user_id();

        if ( ! dokan_is_seller_enabled( $user_id ) ) {
            echo esc_html( dokan_seller_not_enabled_notice() );
        }
    }

    /**
     * Render Order listing status filter template
     *
     * @since 2.4
     *
     * @return void
     */
    public function order_listing_status_filter() {
        dokan_get_template_part( 'orders/orders-status-filter' );
    }

    /**
     * Get Order Main Content
     *
     * @since 2.4
     *
     * @return void
     */
    public function order_main_content() {
        $order_id = isset( $_GET['order_id'] ) ? intval( $_GET['order_id'] ) : 0;

        if ( $order_id ) {
            $_nonce = isset( $_REQUEST['_wpnonce'] ) ? sanitize_key( $_REQUEST['_wpnonce'] ) : '';

            if ( wp_verify_nonce( $_nonce, 'dokan_view_order' ) && current_user_can( 'dokan_view_order' ) ) {
                dokan_get_template_part( 'orders/details' );
            } else if ( isset ( $_REQUEST['_view_mode'] ) && 'email' == $_REQUEST['_view_mode'] && current_user_can( 'dokan_view_order' ) ) {
                dokan_get_template_part( 'orders/details' );
            } else {
                dokan_get_template_part( 'global/dokan-error', '', array( 'deleted' => false, 'message' => __( 'You have no permission to view this order', 'dokan-lite' ) ) );
            }

        } else {
            dokan_get_template_part( 'orders/date-export' );
            dokan_get_template_part( 'orders/listing' );
        }
    }

    /**
     * Export user orders to CSV format
     *
     * @since 1.4
     * @since 3.2.13  dokan_export_order permission check added
     *                for vendor staff
     *
     * @return void
     */
    function handle_order_export() {
        if ( ! isset( $_POST['dokan_vendor_order_export_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['dokan_vendor_order_export_nonce'] ) ), 'dokan_vendor_order_export_action' ) ) {
            return;
        }

        // return if is not vendor or vendor staff
        if ( ! dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return;
        }

        // return if current user is vendor staff and don't have proper permission
        if ( current_user_can( 'vendor_staff' ) && ! current_user_can( 'dokan_export_order' ) ) {
            return;
        }

        if ( isset( $_POST['dokan_order_export_all'] ) ) {
            $filename = 'Orders-' . time();
            header( 'Content-Type: application/csv; charset=' . get_option( 'blog_charset' ) );
            header( "Content-Disposition: attachment; filename=$filename.csv" );

            $user_orders = dokan_get_seller_orders( dokan_get_current_user_id(), 'all', null, 10000000, 0 );
            dokan_order_csv_export( $user_orders );
            exit();
        }

        if ( isset( $_POST['dokan_order_export_filtered'] ) ) {
            $customer_id = isset( $_GET['customer_id'] ) ? absint( wp_unslash( $_GET['customer_id'] ) ) : 0;

            $filename = 'Orders-' . time();
            header( 'Content-Type: application/csv; charset=' . get_option( 'blog_charset' ) );
            header( "Content-Disposition: attachment; filename=$filename.csv" );

            $order_date   = ( isset( $_POST['order_date'] ) ) ? sanitize_text_field( wp_unslash( $_POST['order_date'] ) ) : null;
            $order_status = ( isset( $_POST['order_status'] ) ) ? sanitize_text_field( wp_unslash( $_POST['order_status'] ) ) : 'all';

            $user_orders  = dokan_get_seller_orders( dokan_get_current_user_id(), $order_status, $order_date, 10000000, 0, $customer_id );
            dokan_order_csv_export( $user_orders );
            exit();
        }
        
        /**
         * Just after exporting the csv file
         * 
         * @since 3.2.13 removed hook argument
         * use $_POST superglobal to access post data
         */
        do_action( 'dokan_after_handle_order_export' );
    }

}