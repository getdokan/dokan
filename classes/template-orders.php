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
            dokan_get_template_part( 'orders/details' );
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

        if ( isset( $_POST['dokan_order_export_all'] ) ) {

            $filename = "Orders-".time();
            header( "Content-Type: application/csv; charset=" . get_option( 'blog_charset' ) );
            header( "Content-Disposition: attachment; filename=$filename.csv" );

            $headers = array(
                'order_id'             => __( 'Order No', 'dokan' ),
                'order_items'          => __( 'Order Items', 'dokan' ),
                'order_shipping'       => __( 'Shipping method', 'dokan' ),
                'order_shipping_cost'  => __( 'Shipping Cost', 'dokan' ),
                'order_payment_method' => __( 'Payment method', 'dokan' ),
                'order_total'          => __( 'Order Total', 'dokan' ),
                'order_status'         => __( 'Order Status', 'dokan' ),
                'order_date'           => __( 'Order Date', 'dokan' ),
                'customer_name'        => __( 'Customer Name', 'dokan' ),
                'customer_email'       => __( 'Customer Email', 'dokan' ),
                'customer_phone'       => __( 'Customer Phone', 'dokan' ),
                'customer_ip'          => __( 'Customer IP', 'dokan' ),
            );

            foreach ( (array)$headers as $label ) {
                echo $label .', ';
            }

            echo "\r\n";
            $user_orders = dokan_get_seller_orders( get_current_user_id(), 'all', NULL, 10000000, 0 );
            $statuses    = wc_get_order_statuses();
            $results     = array();
            foreach ( $user_orders as $order ) {
                $the_order = new WC_Order( $order->order_id );

                $customer = get_post_meta( $order->order_id , '_customer_user', true );
                if ( $customer ) {
                    $customer_details = get_user_by( 'id', $customer );
                    $customer_name    = $customer_details->user_login;
                    $customer_email   = esc_html( get_post_meta( $order->order_id, '_billing_email', true ) );
                    $customer_phone   = esc_html( get_post_meta( $order->order_id, '_billing_phone', true ) );
                    $customer_ip      = esc_html( get_post_meta( $order->order_id, '_customer_ip_address', true ) );
                } else {
                    $customer_name  = get_post_meta( $order->id, '_billing_first_name', true ). ' '. get_post_meta( $order->id, '_billing_last_name', true ).'(Guest)';
                    $customer_email = esc_html( get_post_meta( $order->order_id, '_billing_email', true ) );
                    $customer_phone = esc_html( get_post_meta( $order->order_id, '_billing_phone', true ) );
                    $customer_ip    = esc_html( get_post_meta( $order->order_id, '_customer_ip_address', true ) );
                }

                $results = array(
                    'order_id'             => $order->order_id,
                    'order_items'          => dokan_get_product_list_by_order( $the_order, ';' ),
                    'order_shipping'       => $the_order->get_shipping_method(),
                    'order_shipping_cost'  => $the_order->get_total_shipping(),
                    'order_payment_method' => get_post_meta( $order->order_id, '_payment_method_title', true ),
                    'order_total'          => $the_order->get_total(),
                    'order_status'         => $statuses[$the_order->post_status],
                    'order_date'           => $the_order->order_date,
                    'customer_name'        => $customer_name,
                    'customer_email'       => $customer_email,
                    'customer_phone'       => $customer_phone,
                    'customer_ip'          => $customer_ip,
                );

                foreach ( $results as $csv_key => $csv_val ) {
                    echo $csv_val . ', ';
                }
                echo "\r\n";
            }
            exit();
        }

        if ( isset( $_POST['dokan_order_export_filtered'] ) ) {

            $filename = "Orders-".time();
            header( "Content-Type: application/csv; charset=" . get_option( 'blog_charset' ) );
            header( "Content-Disposition: attachment; filename=$filename.csv" );

            $headers = array(
                'order_id'             => __( 'Order No', 'dokan' ),
                'order_items'          => __( 'Order Items', 'dokan' ),
                'order_shipping'       => __( 'Shipping method', 'dokan' ),
                'order_shipping_cost'  => __( 'Shipping Cost', 'dokan' ),
                'order_payment_method' => __( 'Payment method', 'dokan' ),
                'order_total'          => __( 'Order Total', 'dokan' ),
                'order_status'         => __( 'Order Status', 'dokan' ),
                'order_date'           => __( 'Order Date', 'dokan' ),
                'customer_name'        => __( 'Customer Name', 'dokan' ),
                'customer_email'       => __( 'Customer Email', 'dokan' ),
                'customer_phone'       => __( 'Customer Phone', 'dokan' ),
                'customer_ip'          => __( 'Customer IP', 'dokan' ),
            );

            foreach ( (array)$headers as $label ) {
                echo $label .', ';
            }
            echo "\r\n";

            $order_date   = ( isset( $_POST['order_date'] ) ) ? $_POST['order_date'] : NULL;
            $order_status = ( isset( $_POST['order_status'] ) ) ? $_POST['order_status'] : 'all';
            $user_orders  = dokan_get_seller_orders( get_current_user_id(), $order_status, $order_date, 10000000, 0 );
            $statuses     = wc_get_order_statuses();
            $results      = array();

            foreach ( $user_orders as $order ) {
                $the_order = new WC_Order( $order->order_id );

                $customer = get_post_meta( $order->order_id , '_customer_user', true );
                if ( $customer ) {
                    $customer_details = get_user_by( 'id', $customer );
                    $customer_name    = $customer_details->user_login;
                    $customer_email   = esc_html( get_post_meta( $order->order_id, '_billing_email', true ) );
                    $customer_phone   = esc_html( get_post_meta( $order->order_id, '_billing_phone', true ) );
                    $customer_ip      = esc_html( get_post_meta( $order->order_id, '_customer_ip_address', true ) );
                } else {
                    $customer_name  = get_post_meta( $order->id, '_billing_first_name', true ). ' '. get_post_meta( $order->id, '_billing_last_name', true ).'(Guest)';
                    $customer_email = esc_html( get_post_meta( $order->order_id, '_billing_email', true ) );
                    $customer_phone = esc_html( get_post_meta( $order->order_id, '_billing_phone', true ) );
                    $customer_ip    = esc_html( get_post_meta( $order->order_id, '_customer_ip_address', true ) );
                }

                $results = array(
                    'order_id'             => $order->order_id,
                    'order_items'          => dokan_get_product_list_by_order( $the_order ),
                    'order_shipping'       => $the_order->get_shipping_method(),
                    'order_shipping_cost'  => $the_order->get_total_shipping(),
                    'order_payment_method' => get_post_meta( $order->order_id, '_payment_method_title', true ),
                    'order_total'          => $the_order->get_total(),
                    'order_status'         => $statuses[$the_order->post_status],
                    'order_date'           => $the_order->order_date,
                    'customer_name'        => $customer_name,
                    'customer_email'       => $customer_email,
                    'customer_phone'       => $customer_phone,
                    'customer_ip'          => $customer_ip,
                );

                foreach ( $results as $csv_key => $csv_val ) {
                    echo $csv_val . ', ';
                }
                echo "\r\n";
            }
            exit();
        }
    }

}