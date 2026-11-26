<?php

namespace WeDevs\Dokan\Vendor;

/**
 * Store Lists Class
 *
 * @since 2.9.30
 */
class StoreListsFilter {

    /**
     * WP_User_Query holder
     *
     * @var object
     */
    private $query;

    /**
     * Orderby holder
     *
     * @var string
     */
    private $orderby;

    /**
     * Boot method
     *
     * @since  2.9.30
     *
     * @return void
     */
    public function __construct() {
        $this->maybe_disable_stote_lists_filter();

        wp_enqueue_style( 'dashicons' );
        add_action( 'dokan_store_lists_filter_form', [ $this, 'filter_area' ] );
        add_filter( 'dokan_seller_listing_args', [ $this, 'filter_pre_user_query' ], 10, 2 );
    }

    /**
     * Maybe disable the store lists filter form
     *
     * @since  2.9.30
     *
     * @return void
     */
    public function maybe_disable_stote_lists_filter() {
        $not_valid = class_exists( 'Dokan_Geolocation' ) && version_compare( dokan_pro()->version, '2.9.17', '<' );

        if ( $not_valid ) {
            add_filter( 'dokan_store_lists_filter', '__return_false' );
        }
    }

    /**
     * Filter area
     *
     * @since  2.9.30
     *
     * @param  WP_Users $stores
     *
     * @return void
     */
    public function filter_area( $stores ) {
        dokan_get_template_part(
            'store-lists-filter', '', [
				'stores'          => $stores,
				'number_of_store' => $stores['count'],
				'sort_filters'    => self::sort_by_options(),
				'sort_by'         => $this->orderby,
			]
        );
    }

    /**
     * Read the listing filters the visitor asked for.
     *
     * The store listing carries its runtime state in the query string, and every
     * caller that rebuilds the listing has to read it the same way — the store
     * blocks each render in a request of their own, so this is what keeps their
     * results describing the same result set.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_requested_data(): array {
        $requested_data = [];

        if ( isset( $_GET['_store_filter_nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_store_filter_nonce'] ) ), 'dokan_store_lists_filter_nonce' ) ) {
            $requested_data = wc_clean( wp_unslash( $_GET ) );
        }

        // Sorting is whitelisted, so it travels without the filter-form nonce on plain sort links.
        if ( empty( $requested_data['stores_orderby'] ) && isset( $_GET['stores_orderby'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $stores_orderby = sanitize_text_field( wp_unslash( $_GET['stores_orderby'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

            if ( array_key_exists( $stores_orderby, self::sort_by_options() ) ) {
                $requested_data['stores_orderby'] = $stores_orderby;
            }
        }

        if ( isset( $_GET['store_categories'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $requested_data['store_categories'] = wc_clean( wp_unslash( $_GET['store_categories'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        }

        return $requested_data;
    }

    /**
     * Get the sort option in effect, falling back to the marketplace default.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_requested_sort_by(): string {
        $requested = self::get_requested_data();
        $sort_by   = ! empty( $requested['stores_orderby'] )
            ? $requested['stores_orderby']
            : dokan_get_option( 'store_list_sort_by', 'dokan_appearance', 'most_recent' );

        return array_key_exists( $sort_by, self::sort_by_options() ) ? $sort_by : 'most_recent';
    }

    /**
     * Get sort by options
     *
     * @since  2.9.30
     *
     * @return array
     */
    public static function sort_by_options() {
        return apply_filters(
            'dokan_store_lists_sort_by_options', [
				'most_recent'   => __( 'Most Recent', 'dokan-lite' ),
				'total_orders'  => __( 'Most Popular', 'dokan-lite' ),
				'random'        => __( 'Random', 'dokan-lite' ),
			]
        );
    }

    /**
     * Filter pre user query
     *
     * @since  2.9.30
     *
     * @param  array $args
     * @param  array $request
     *
     * @return array
     */
    public function filter_pre_user_query( $args, $request ) {
        if ( ! empty( $request['stores_orderby'] ) ) {
            $args['orderby'] = wc_clean( $request['stores_orderby'] );
        } elseif ( empty( $args['orderby'] ) ) {
            $sort_by         = dokan_get_option( 'store_list_sort_by', 'dokan_appearance', 'most_recent' );
            $args['orderby'] = ( ! array_key_exists( $sort_by, self::sort_by_options() ) ) ? 'most_recent' : $sort_by;
        }

        add_action( 'pre_user_query', array( $this, 'filter_user_query' ), 9 );

        return $args;
    }

    /**
     * Filter user query
     *
     * @since  2.9.30
     *
     * @param  WP_User_Query
     *
     * @return void
     */
    public function filter_user_query( $query ) {
        $this->query   = $query;
        $this->orderby = ! empty( $query->query_vars['orderby'] ) ? $query->query_vars['orderby'] : null;

        do_action( 'dokan_before_filter_user_query', $this->query, $this->orderby );

        $this->filter_query_from();
        $this->filter_query_orderby();
    }

    /**
     * Filter query form
     *
     * @since  2.9.30
     *
     * @return void
     */
    private function filter_query_from() {
        global $wpdb;

        if ( 'total_orders' === $this->orderby ) {
            $this->query->query_from .= " LEFT JOIN (
                                SELECT seller_id,
                                COUNT(*) AS orders_count
                                FROM {$wpdb->dokan_orders}
                                GROUP BY seller_id
                                ) as dokan_orders
                                ON ( {$wpdb->users}.ID = dokan_orders.seller_id )";
        }
    }

    /**
     * Filter query orderby
     *
     * @since  2.9.30
     *
     * @return void
     */
    private function filter_query_orderby() {
        if ( 'total_orders' === $this->orderby ) {
            $this->query->query_orderby = 'ORDER BY orders_count DESC';
            return;
        }

        if ( 'most_recent' === $this->orderby ) {
            $this->query->query_orderby = 'ORDER BY ID DESC';
            return;
        }

        if ( 'random' === $this->orderby ) {
            $order_by = [
                'ID',
                'user_login, ID',
                'user_email',
                'user_registered, ID',
                'user_nicename, ID',
            ];

            $selected_orderby = get_transient( 'dokan_store_listing_random_orderby' );

            if ( false === $selected_orderby ) {
                $selected_orderby = $order_by[ array_rand( $order_by, 1 ) ];

                set_transient( 'dokan_store_listing_random_orderby', $selected_orderby, MINUTE_IN_SECONDS * 5 );
            }

            $this->query->query_orderby = "ORDER BY $selected_orderby";
        }
    }
}
