<?php
/**
 * Dokan Order Template Class
 *
 * @since 2.4
 *
 * @author weDves <info@wedevs.com>
 */
class Dokan_Template_Orders {

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
     * Singleton method
     *
     * @return self
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Template_Orders();
        }

        return $instance;
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
            echo dokan_seller_not_enabled_notice();
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

            if ( wp_verify_nonce( $_REQUEST['_wpnonce'], 'dokan_view_order' ) && current_user_can( 'dokan_view_order' ) ) {
                dokan_get_template_part( 'orders/details' );
            } else {
                dokan_get_template_part( 'global/dokan-error', '', array( 'deleted' => false, 'message' => __( 'You have no permission to view this order', 'dokan-lite' ) ) );
            }

        } else {
            dokan_get_template_part( 'orders/date-export');
            dokan_get_template_part( 'orders/listing' );
        }
    }

    /**
     * Export user orders to CSV format
     *
     * @since 1.4
     *
     * @return void
     */
    function handle_order_export() {
        if ( ! is_user_logged_in() ) {
            return;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return;
        }

        if ( isset( $_POST['dokan_vendor_order_export_nonce'] ) && ! wp_verify_nonce( $_POST['dokan_vendor_order_export_nonce'], 'dokan_vendor_order_export_action' ) ) {
            return;
        }

        if ( isset( $_POST['dokan_order_export_all'] ) ) {

            $filename = "Orders-".time();
            header( "Content-Type: application/csv; charset=" . get_option( 'blog_charset' ) );
            header( "Content-Disposition: attachment; filename=$filename.csv" );

            $user_orders = dokan_get_seller_orders( dokan_get_current_user_id(), 'all', NULL, 10000000, 0 );
            dokan_order_csv_export( $user_orders );
            exit();
        }

        if ( isset( $_POST['dokan_order_export_filtered'] ) ) {

            $filename = "Orders-".time();
            header( "Content-Type: application/csv; charset=" . get_option( 'blog_charset' ) );
            header( "Content-Disposition: attachment; filename=$filename.csv" );

            $order_date   = ( isset( $_POST['order_date'] ) ) ? $_POST['order_date'] : NULL;
            $order_status = ( isset( $_POST['order_status'] ) ) ? $_POST['order_status'] : 'all';

            $user_orders  = dokan_get_seller_orders( dokan_get_current_user_id(), $order_status, $order_date, 10000000, 0 );
            dokan_order_csv_export( $user_orders );
            exit();
        }
    }

}
