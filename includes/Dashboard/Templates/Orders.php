<?php

namespace WeDevs\Dokan\Dashboard\Templates;

/**
 * Dokan Order Template Class
 *
 * @since  2.4
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
    public function __construct() {
        add_action( 'template_redirect', [ $this, 'handle_order_export' ] );
        add_action( 'dokan_order_content_inside_before', [ $this, 'show_seller_enable_message' ] );
        add_action( 'dokan_order_inside_content', [ $this, 'order_listing_status_filter' ], 10 );
        add_action( 'dokan_order_inside_content', [ $this, 'order_details_content' ], 15 );
        add_action( 'dokan_order_inside_content', [ $this, 'order_main_content' ], 15 );
        add_filter( 'body_class', [ $this, 'add_css_class_to_body' ] );
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
            dokan_seller_not_enabled_notice();
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
     * @since 3.6.3
     */
    public function order_details_content() {
        if ( ! isset( $_GET['order_id'] ) ) {
            return;
        }

        // get order id
        $order_id = intval( wp_unslash( $_GET['order_id'] ) );

        if ( isset( $_GET['_wpnonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_wpnonce'] ) ), 'dokan_view_order' ) ) {
            dokan_get_template_part( 'orders/details', '', [ 'order_id' => $order_id ] );
        } elseif ( isset( $_REQUEST['_view_mode'] ) && 'email' === sanitize_text_field( wp_unslash( $_REQUEST['_view_mode'] ) ) && current_user_can( 'dokan_view_order' ) ) {
            // view order details page from link sent to email
            dokan_get_template_part( 'orders/details', '', [ 'order_id' => $order_id ] );
        } else {
            dokan_get_template_part(
                'global/dokan-error',
                '',
                [
                    'deleted' => false,
                    'message' => __( 'You have no permission to view this order', 'dokan-lite' ),
                ]
            );
        }
    }

    /**
     * Get Order Main Content
     *
     * @since 2.4
     * @since 3.6.3 Moved order details content to a different function
     *
     * @return void
     */
    public function order_main_content() {
        if ( isset( $_GET['order_id'] ) ) {
            return;
        }

        // check if nonce verification failed, in that case early return from here
        if ( ! empty( $_GET['seller_order_filter_nonce'] ) && ! wp_verify_nonce( sanitize_key( wp_unslash( $_GET['seller_order_filter_nonce'] ) ), 'seller-order-filter-nonce' ) ) {
            dokan_get_template_part(
                'global/dokan-error',
                '',
                [
                    'deleted' => false,
                    'message' => __( 'Nonce verification failed!', 'dokan-lite' ),
                ]
            );

            return;
        }

        // default parameters
        $template_args = [
            'user_string'         => '',
            'user_id'             => '',
            'order_statuses'      => wc_get_order_statuses(),
            'seller_id'           => dokan_get_current_user_id(),
            'customer_id'         => '',
            'order_status'        => 'all',
            'filter_date_start'   => '',
            'filter_date_end'     => '',
            'search'              => '',
            'allow_shipment'      => dokan_get_option( 'enabled', 'dokan_shipping_status_setting', 'off' ),
            'wc_shipping_enabled' => get_option( 'woocommerce_calc_shipping' ) === 'yes',
            'bulk_order_statuses' => apply_filters(
                'dokan_bulk_order_statuses',
                [
                    '-1'            => __( 'Bulk Actions', 'dokan-lite' ),
                    'wc-on-hold'    => __( 'Change status to on-hold', 'dokan-lite' ),
                    'wc-processing' => __( 'Change status to processing', 'dokan-lite' ),
                    'wc-completed'  => __( 'Change status to completed', 'dokan-lite' ),
                ]
            ),
            'page'                => 1,
            'limit'               => 10,
        ];

        // check if nonce isn't set, in that case display first 10 items without any filtering is applied
        if ( empty( $_GET['seller_order_filter_nonce'] ) ) {
            $query_args = [
                'seller_id' => $template_args['seller_id'],
                'paged'     => $template_args['page'],
                'limit'     => $template_args['limit'],
                'return'    => 'objects',
            ];

            $template_args['user_orders'] = dokan()->order->all( $query_args );

            $query_args['return'] = 'count';
            $total_order_count    = dokan()->order->all( $query_args );

            $template_args = array_merge( $template_args, $this->add_pagination_info( $template_args['limit'], $template_args['page'], $total_order_count ) );

            dokan_get_template_part( 'orders/date-export', '', $template_args );
            dokan_get_template_part( 'orders/listing', '', $template_args );

            return;
        }

        //if nonce is not set or it is not valid
        if ( empty( $_GET['seller_order_filter_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_GET['seller_order_filter_nonce'] ) ), 'seller-order-filter-nonce' ) ) {
            return;
        }

        // get filtered data
        $user_query_args = [
            'filter_date_start' => isset( $_GET['order_date_start'] ) ? sanitize_key( wp_unslash( $_GET['order_date_start'] ) ) : '',
            'filter_date_end'   => isset( $_GET['order_date_end'] ) ? sanitize_key( wp_unslash( $_GET['order_date_end'] ) ) : '',
            'order_status'      => isset( $_GET['order_status'] ) ? sanitize_key( wp_unslash( $_GET['order_status'] ) ) : 'all',
            'search'            => isset( $_GET['search'] ) ? sanitize_text_field( wp_unslash( $_GET['search'] ) ) : '',
            'page'              => isset( $_GET['pagenum'] ) ? absint( wp_unslash( $_GET['pagenum'] ) ) : 1,
            'limit'             => isset( $_GET['limit'] ) ? absint( wp_unslash( $_GET['limit'] ) ) : 10,
        ];

        if ( ! empty( $_GET['customer_id'] ) ) {
            $customer_id = absint( wp_unslash( $_GET['customer_id'] ) );
            $customer    = new \WC_Customer( $customer_id );

            $user_query_args['user_string'] = sprintf( '%1$s %2$s', $customer->get_first_name(), $customer->get_last_name() );
            $user_query_args['user_id']     = $customer_id;
        }

        $template_args = wp_parse_args( $user_query_args, $template_args );

        $query_args = [
            'customer_id' => $template_args['user_id'],
            'seller_id'   => dokan_get_current_user_id(),
            'status'      => $template_args['order_status'],
            'search'      => $template_args['search'],
            'paged'       => $template_args['page'],
            'limit'       => $template_args['limit'],
            'return'      => 'objects',
        ];

        if ( ! empty( $template_args['filter_date_start'] ) ) {
            $query_args['date']['from'] = $template_args['filter_date_start'];
        }

        if ( ! empty( $template_args['filter_date_end'] ) ) {
            $query_args['date']['to'] = $template_args['filter_date_end'];
        }

        $template_args['user_orders'] = dokan()->order->all( $query_args );

        $query_args['return'] = 'count';
        $total_order_count    = dokan()->order->all( $query_args );

        $template_args = array_merge( $template_args, $this->add_pagination_info( $template_args['limit'], $template_args['page'], $total_order_count ) );

        dokan_get_template_part( 'orders/date-export', '', $template_args );
        dokan_get_template_part( 'orders/listing', '', $template_args );
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
    public function handle_order_export() {
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

        $query_args = [
            'seller_id' => dokan_get_current_user_id(),
            'limit'     => 10000000,
            'return'    => 'ids',
        ];

        if ( isset( $_POST['dokan_order_export_filtered'] ) ) {
            $customer_id      = isset( $_GET['customer_id'] ) ? absint( wp_unslash( $_GET['customer_id'] ) ) : 0;
            $order_date_start = isset( $_POST['order_date_start'] ) ? sanitize_text_field( wp_unslash( $_POST['order_date_start'] ) ) : '';
            $order_date_end   = isset( $_POST['order_date_end'] ) ? sanitize_text_field( wp_unslash( $_POST['order_date_end'] ) ) : '';
            $order_status     = isset( $_POST['order_status'] ) ? sanitize_text_field( wp_unslash( $_POST['order_status'] ) ) : 'all';
            $search           = isset( $_POST['search'] ) ? sanitize_text_field( wp_unslash( $_POST['search'] ) ) : '';

            $query_args['customer_id']  = $customer_id;
            $query_args['status']       = $order_status;
            $query_args['date']['from'] = $order_date_start;
            $query_args['date']['to']   = $order_date_end;

            if ( is_numeric( $search ) ) {
                $query_args['order_id'] = absint( $search );
            } elseif ( ! empty( $search ) ) {
                $query_args['search'] = $search;
            }
        }

        $user_orders = dokan()->order->all( $query_args );

        /**
         * Just after exporting the csv file
         *
         * @since 3.6.3
         * use $_POST superglobal to access post data
         */
        do_action( 'dokan_before_handle_order_export', $user_orders, $query_args );

        $filename = 'Orders-' . time();
        header( 'Content-Type: application/csv; charset=' . get_option( 'blog_charset' ) );
        header( "Content-Disposition: attachment; filename=$filename.csv" );

        dokan_order_csv_export( $user_orders );
        exit();
    }

    /**
     * Add a specific class to the body of Vendor Dashboard Orders page to apply css into the select2 input box
     *
     * @since 3.6.3
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
     * @since 3.6.3
     *
     * @param int   $limit
     * @param int   $page
     * @param array $args
     * @param array $query_args
     *
     * @return array
     */
    private function add_pagination_info( $limit, $page, $order_count ) {
        $num_of_pages = ceil( $order_count / $limit );
        $base_url     = dokan_get_navigation_url( 'orders' );
        $page_links   = paginate_links(
            [
                'current'  => $page,
                'total'    => $num_of_pages,
                'base'     => $base_url . '%_%',
                'format'   => '?pagenum=%#%&seller_order_filter_nonce=' . wp_create_nonce( 'seller-order-filter-nonce' ),
                'add_args' => false,
                'type'     => 'array',
            ]
        );

        $args = [
            'num_of_pages' => $num_of_pages,
            'page_links'   => $page_links,
        ];

        return $args;
    }
}
