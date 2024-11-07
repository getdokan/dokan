<?php

namespace WeDevs\Dokan\Dashboard\Templates;

/**
 * Dokan Template Dashboard Class
 *
 * @author weDves
 */
class Dashboard {
    /**
     * @var int $user_id current user id
     */
    protected $user_id;

    /**
     * @var array $order_count
     */
    protected $orders_count;

    /**
     * Load autometically when class inistantiate
     * hooked up all actions and filters
     *
     * @since 2.4
     */
    public function __construct() {
        $this->user_id = dokan_get_current_user_id();

        add_action( 'dokan_dashboard_content_inside_before', [ $this, 'show_seller_dashboard_notice' ], 10 );
        add_action( 'dokan_dashboard_left_widgets', [ $this, 'get_big_counter_widgets' ], 10 );
        add_action( 'dokan_dashboard_left_widgets', [ $this, 'get_orders_widgets' ], 15 );
        add_action( 'dokan_dashboard_left_widgets', [ $this, 'get_products_widgets' ], 20 );
        add_action( 'dokan_dashboard_right_widgets', [ $this, 'get_sales_report_chart_widget' ], 10 );
    }

    /**
     * Get Seller Dashboard Notice
     *
     * @since 2.4
     *
     * @return void
     */
    public function show_seller_dashboard_notice() {
        if ( ! dokan_is_seller_enabled( $this->user_id ) ) {
            dokan_seller_not_enabled_notice();
        }
    }

    /**
     * Get big counter widget in dashboard
     *
     * @since 2.4
     *
     * @return void
     */
    public function get_big_counter_widgets() {
        if ( ! apply_filters( 'dokan_dashboard_widget_applicable', true, 'reports' ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_view_sales_overview' ) ) {
            return;
        }

        if ( ! is_array( $this->orders_count ) ) {
            $this->orders_count = $this->get_orders_count();
        }

        dokan_get_template_part(
            'dashboard/big-counter-widget', '', [
                'pageviews'      => $this->get_pageviews(),
                'orders_count'   => $this->orders_count,
                'earning'        => $this->get_earning(),
                'seller_balance' => $this->get_seller_balance(),
            ]
        );
    }

    /**
     * Get order widget in Dashboard
     *
     * @since 2.4
     *
     * @return void
     */
    public function get_orders_widgets() {
        if ( ! apply_filters( 'dokan_dashboard_widget_applicable', true, 'orders' ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_view_order_report' ) ) {
            return;
        }

        if ( ! is_array( $this->orders_count ) ) {
            $this->orders_count = $this->get_orders_count();
        }

        $order_data = [
            [
                'value' => $this->orders_count->{'wc-completed'},
                'color' => '#73a724',
                'label' => __( 'Completed', 'dokan-lite' ),
            ],
            [
                'value' => $this->orders_count->{'wc-pending'},
                'color' => '#999',
                'label' => __( 'Pending', 'dokan-lite' ),
            ],
            [
                'value' => $this->orders_count->{'wc-processing'},
                'color' => '#21759b',
                'label' => __( 'Processing', 'dokan-lite' ),
            ],
            [
                'value' => $this->orders_count->{'wc-cancelled'},
                'color' => '#d54e21',
                'label' => __( 'Cancelled', 'dokan-lite' ),
            ],
            [
                'value' => $this->orders_count->{'wc-refunded'},
                'color' => '#e6db55',
                'label' => __( 'Refunded', 'dokan-lite' ),
            ],
            [
                'value' => $this->orders_count->{'wc-on-hold'},
                'color' => '#f0ad4e',
                'label' => __( 'On Hold', 'dokan-lite' ),
            ],
        ];

        $nonce          = wp_create_nonce( 'seller-order-filter-nonce' );
        $order_url      = dokan_get_navigation_url( 'orders' );
        $completed_url  = add_query_arg(
            [
                'order_status'              => 'wc-completed',
                'seller_order_filter_nonce' => $nonce,
            ],
            $order_url
        );
        $pending_url    = add_query_arg(
            [
                'order_status'              => 'wc-pending',
                'seller_order_filter_nonce' => $nonce,
            ],
            $order_url
        );
        $processing_url = add_query_arg(
            [
                'order_status'              => 'wc-processing',
                'seller_order_filter_nonce' => $nonce,
            ],
            $order_url
        );
        $cancelled_url  = add_query_arg(
            [
                'order_status'              => 'wc-cancelled',
                'seller_order_filter_nonce' => $nonce,
            ],
            $order_url
        );
        $refunded_url   = add_query_arg(
            [
                'order_status'              => 'wc-refunded',
                'seller_order_filter_nonce' => $nonce,
            ],
            $order_url
        );
        $on_hold_url    = add_query_arg(
            [
                'order_status'              => 'wc-on-hold',
                'seller_order_filter_nonce' => $nonce,
            ],
            $order_url
        );

        dokan_get_template_part(
            'dashboard/orders-widget', '', [
                'order_data'     => $order_data,
                'orders_count'   => $this->orders_count,
                'orders_url'     => $order_url,
                'completed_url'  => $completed_url,
                'pending_url'    => $pending_url,
                'processing_url' => $processing_url,
                'cancelled_url'  => $cancelled_url,
                'refunded_url'   => $refunded_url,
                'on_hold_url'    => $on_hold_url,
            ]
        );
    }

    /**
     * Get product widgets in dashboard
     *
     * @since 2.4
     *
     * @return void
     */
    public function get_products_widgets() {
        if ( ! apply_filters( 'dokan_dashboard_widget_applicable', true, 'products' ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_view_product_status_report' ) ) {
            return;
        }
        $nonce       = wp_create_nonce( 'product_listing_filter' );
        $product_url = dokan_get_navigation_url( 'products' );
        $online_url  = add_query_arg(
            [
                'post_status'                   => 'publish',
                '_product_listing_filter_nonce' => $nonce,
            ], $product_url
        );
        $draft_url   = add_query_arg(
            [
                'post_status'                   => 'draft',
                '_product_listing_filter_nonce' => $nonce,
            ], $product_url
        );
        $pending_url = add_query_arg(
            [
                'post_status'                   => 'pending',
                '_product_listing_filter_nonce' => $nonce,
            ], $product_url
        );
        dokan_get_template_part(
            'dashboard/products-widget', '', [
                'post_counts'  => $this->get_post_counts(),
                'products_url' => $product_url,
                'online_url'   => $online_url,
                'draft_url'    => $draft_url,
                'pending_url'  => $pending_url,
            ]
        );
    }

    /**
     * Get sales report chart widget in dashboard
     *
     * @since 2.4
     *
     * @return void
     */
    public function get_sales_report_chart_widget() {
        if ( ! apply_filters( 'dokan_dashboard_widget_applicable', true, 'reports' ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_view_sales_report_chart' ) ) {
            return;
        }

        dokan_get_template_part( 'dashboard/sales-chart-widget', '' );
    }

    /**
     * Get orders Count
     *
     * @since 2.4
     *
     * @return array
     */
    public function get_orders_count() {
        return dokan_count_orders( $this->user_id );
    }

    /**
     * Get Post Count
     *
     * @since 2.4
     *
     * @return array
     */
    public function get_post_counts() {
        return dokan_count_posts( 'product', $this->user_id );
    }

    /**
     * Get Comments Count
     *
     * @since 2.4
     *
     * @return array
     */
    public function get_comment_counts() {
        return dokan_count_comments( 'product', $this->user_id );
    }

    /**
     * Get Pageview Count
     *
     * @since 2.4
     *
     * @return integer
     */
    public function get_pageviews() {
        return (int) dokan_author_pageviews( $this->user_id );
    }

    /**
     * Get Author Sales Count
     *
     * @since 2.4
     *
     * @return integer
     */
    public function get_earning() {
        return dokan_author_total_sales( $this->user_id );
    }

    /**
     * Get Seller Balance
     *
     * @since 2.4
     *
     * @return integer
     */
    public function get_seller_balance() {
        return dokan_get_seller_balance( $this->user_id );
    }
}
