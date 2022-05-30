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
        add_action( 'dokan_order_inside_content', array( $this, 'order_details_content' ), 15 );
        add_action( 'dokan_order_inside_content', array( $this, 'order_main_content' ), 15 );
        add_filter( 'body_class', array( $this, 'add_css_class_to_body' ) );
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
     * Render the order details page
     *
     * @since DOKAN_SINCE
     */
    public function order_details_content() {
        if ( ! isset( $_GET['order_id'] ) ) {
            return;
        }

        // get order id
        $order_id = intval( wp_unslash( $_GET['order_id'] ) );

        if ( isset( $_GET['_wpnonce'] ) && wp_verify_nonce( $_GET['_wpnonce'], 'dokan_view_order' ) ) {
            dokan_get_template_part( 'orders/details', '', [ 'order_id' => $order_id ] );
        } elseif ( isset ( $_REQUEST['_view_mode'] ) && 'email' == $_REQUEST['_view_mode'] && current_user_can( 'dokan_view_order' ) ) {
            dokan_get_template_part( 'orders/details', '', [ 'order_id' => $order_id ] );
        } else {
            dokan_get_template_part( 'global/dokan-error', '', array( 'deleted' => false, 'message' => __( 'You have no permission to view this order', 'dokan-lite' ) ) );
        }
    }

    /**
     * Get Order Main Content
     *
     * @since 2.4
     * @since DOKAN_SINCE Moved order details content to a different function
     *
     * @return void
     */
    public function order_main_content() {
        if ( isset( $_GET['order_id'] ) ) {
            return;
        }

        // default parameters
        $defaults = [
            'user_string'         => '',
            'user_id'             => '',
            'order_statuses'      => wc_get_order_statuses(),
            'seller_id'           => dokan_get_current_user_id(),
            'customer_id'         => '',
            'order_status'        => 'all',
            'filter_date_start'   => null,
            'filter_date_end'     => null,
            'search'              => null,
            'allow_shipment'      => dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' ),
            'wc_shipping_enabled' => get_option( 'woocommerce_calc_shipping' ) === 'yes',
            'bulk_order_statuses' => apply_filters( 'dokan_bulk_order_statuses', [
                '-1'            => __( 'Bulk Actions', 'dokan-lite' ),
                'wc-on-hold'    => __( 'Change status to on-hold', 'dokan-lite' ),
                'wc-processing' => __( 'Change status to processing', 'dokan-lite' ),
                'wc-completed'  => __( 'Change status to completed', 'dokan-lite' ),
            ] ),
        ];

        $page  = 1;
        $limit = 10;

        //if nonce is set and it is valid
        if ( ! empty( $_GET['seller_order_filter_nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['seller_order_filter_nonce'] ) ), 'seller-order-filter-nonce' ) ) {
            $user_string = '';
            $user_id = '';

            if ( ! empty( $_GET['customer_id'] ) ) {
                $user_id = absint( wp_unslash( $_GET['customer_id'] ) );
                $customer = new \WC_Customer( $user_id );

                $user_string = sprintf(
                    /* translators: 1: user first, 2: user last name */
                    esc_html__( '%1$s %2$s', 'dokan-lite' ),
                    $customer->get_first_name(), $customer->get_last_name()
                );
            }

            $template_args = [
                'user_string'       => $user_string,
                'filter_date_start' => isset( $_GET['order_date_start'] ) ? sanitize_key( wp_unslash( $_GET['order_date_start'] ) ) : null,
                'filter_date_end'   => isset( $_GET['order_date_end'] ) ? sanitize_key( wp_unslash( $_GET['order_date_end'] ) ) : null,
                'order_status'      => isset( $_GET['order_status'] ) ? sanitize_key( wp_unslash( $_GET['order_status'] ) ) : 'all',
                'search'            => isset( $_GET['search'] ) ? sanitize_text_field( wp_unslash( $_GET['search'] ) ) : null,
                'customer_id'       => $user_id,
            ];

            $page = isset( $_GET['pagenum'] ) ? absint( $_GET['pagenum'] ) : 1;

            $template_args = wp_parse_args( $template_args, $defaults );

            $query_args = [
                'customer_id' => $user_id,
                'status'      => $template_args['order_status'],
                'paged'       => $page,
                'limit'       => $limit,
                'start_date'  => $template_args['filter_date_start'],
                'end_date'    => $template_args['filter_date_end'],
            ];

            if ( is_numeric( $template_args['search'] ) ) {
                $query_args['order_id'] = absint( $template_args['search'] );
            } elseif( ! empty( $search ) ) {
                $query_args['search'] = $template_args['search'];
            }

            $template_args['user_orders'] = dokan()->order->all( $query_args );

            unset( $query_args['limit'] );
            unset( $query_args['paged'] );
            $query_args['seller_id'] = dokan_get_current_user_id();

            $template_args = $this->add_pagination_info( $limit, $page, $template_args, $query_args );

            dokan_get_template_part( 'orders/date-export', '', $template_args );
            dokan_get_template_part( 'orders/listing', '', $template_args );
        } elseif ( ! empty( $_GET['seller_order_filter_nonce'] ) ) { //if nonce is set but invalid
            dokan_get_template_part( 'global/dokan-error', '', [ 'deleted' => false, 'message' => __( 'Nonce verification failed!', 'dokan-lite' ) ] );
        } else { // if no nonce set
            $defaults['user_orders'] = dokan()->order->all( [
                'paged'     => $page,
                'limit'     => $limit,
                'seller_id' => dokan_get_current_user_id()
            ] );

            $defaults = $this->add_pagination_info( $limit, $page, $defaults, [ 'seller_id' => dokan_get_current_user_id() ] );

            dokan_get_template_part( 'orders/date-export', '', $defaults );
            dokan_get_template_part( 'orders/listing', '', $defaults );
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

            $user_orders = dokan_get_seller_orders( dokan_get_current_user_id(), [
                'status'     => 'all',
                'order_date' => null,
                'limit'      => 10000000,
                'offset'     => 0,
            ] );

            dokan_order_csv_export( $user_orders );
            exit();
        }

        if ( isset( $_POST['dokan_order_export_filtered'] ) ) {
            $customer_id = isset( $_GET['customer_id'] ) ? absint( wp_unslash( $_GET['customer_id'] ) ) : 0;

            $filename = 'Orders-' . time();
            header( 'Content-Type: application/csv; charset=' . get_option( 'blog_charset' ) );
            header( "Content-Disposition: attachment; filename=$filename.csv" );

            $order_date_start = ( isset( $_POST['order_date_start'] ) ) ? sanitize_text_field( wp_unslash( $_POST['order_date_start'] ) ) : null;
            $order_date_end   = ( isset( $_POST['order_date_end'] ) ) ? sanitize_text_field( wp_unslash( $_POST['order_date_end'] ) ) : null;
            $order_status     = ( isset( $_POST['order_status'] ) ) ? sanitize_text_field( wp_unslash( $_POST['order_status'] ) ) : 'all';
            $search           = ( isset( $_POST['search'] ) ) ? sanitize_text_field( wp_unslash( $_POST['search'] ) ) : null;

            $query_args = [
                'status'      => $order_status,
                'order_date'  => null,
                'limit'       => 10000000,
                'offset'      => 0,
                'customer_id' => $customer_id,
                'start_date'  => $order_date_start,
                'end_date'    => $order_date_end,
            ];

            if ( is_numeric( $search ) ) {
                $query_args['order_id'] = absint( $search );
            } elseif ( ! empty( $search ) ) {
                $query_args['search'] = $search;
            }

            $user_orders  = dokan_get_seller_orders( dokan_get_current_user_id(), $query_args );

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

    /**
     * Add a specific class to the body of Vendor Dashboard Orders page to apply css into the select2 input box
     *
     * @since DOKAN_SINCE
     *
     * @param array $classes
     *
     * @return array
     */
    public function add_css_class_to_body( $classes ) {
        if ( dokan_is_seller_dashboard() && false !== get_query_var( 'orders', false ) ) {
            $classes = array_merge( $classes, [ 'vendor-dashboard-orders-page' ] );
        }

        return $classes;
    }

    /**
     * Add Pagination information into template arguments
     *
     * @since DOKAN_SINCE
     *
     * @param int $limit
     * @param int $page
     * @param array $args
     * @param array $query_args
     *
     * @return array
     */
    private function add_pagination_info( $limit, $page, array $args, array $query_args ) {
        $order_count  = dokan_get_seller_orders_number( $query_args );
        $num_of_pages = ceil( $order_count / $limit );
        $base_url     = dokan_get_navigation_url( 'orders' );
        $page_links   = paginate_links([
            'current' => $page,
            'total' => $num_of_pages,
            'base' => $base_url . '%_%',
            'format' => '?pagenum=%#%&asdf=44',
            'add_args' => false,
            'type' => 'array',
        ]);

        $args['num_of_pages'] = $num_of_pages;
        $args['page_links']   = $page_links;

        return $args;
    }
}
