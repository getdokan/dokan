<?php

namespace WeDevs\Dokan;

/**
 * Dokan rewrite rules class
 *
 * @package Dokan
 */
class Rewrites {

    public $query_vars = [];
    public $custom_store_url = '';

    /**
     * Hook into the functions
     */
    public function __construct() {
        $this->custom_store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

        add_action( 'init', [ $this, 'register_rule' ] );
        add_action( 'pre_get_posts', [ $this, 'store_query_filter' ] );

        add_filter( 'woocommerce_get_query_vars', [ $this, 'resolve_wc_query_conflict' ] );
        add_filter( 'template_include', [ $this, 'store_template' ], 99 );
        add_filter( 'template_include', [ $this, 'product_edit_template' ], 99 );
        add_filter( 'template_include', [ $this, 'store_toc_template' ], 99 );
        add_filter( 'query_vars', [ $this, 'register_query_var' ] );
        add_filter( 'woocommerce_get_breadcrumb', [ $this, 'store_page_breadcrumb' ] );
        add_filter( 'tiny_mce_before_init', [ $this, 'remove_h1_from_heading_in_edit_product_page' ] );
    }

    /**
     * Generate breadcrumb for store page
     *
     * @param array $crumbs
     *
     * @since 2.4.7
     *
     * @return void | array $crumbs
     */
    public function store_page_breadcrumb( $crumbs ) {
        if ( ! dokan_is_store_page() ) {
            return $crumbs;
        }

        if ( function_exists( 'yoast_breadcrumb' ) && \WPSEO_Options::get( 'breadcrumbs-enable' ) ) {
            unset( $crumbs );

            return;
        }

        $author      = get_query_var( $this->custom_store_url );
        $seller_info = get_user_by( 'slug', $author );

        if ( ! $seller_info ) {
            return;
        }

        $crumbs[1]   = [ ucwords( $this->custom_store_url ), get_permalink( dokan_get_option( 'store_listing', 'dokan_pages' ) ) ];
        $crumbs[2]   = [ $author, dokan_get_store_url( $seller_info->data->ID ) ];

        return $crumbs;
    }

    /**
     * Check if WooCommerce installed or not
     *
     * @return boolean
     */
    public function is_woo_installed() {
        return function_exists( 'WC' );
    }

    /**
     * Register the rewrite rule
     *
     * @return void
     */
    public function register_rule() {
        $this->query_vars = apply_filters(
            'dokan_query_var_filter', [
                'products',
                'new-product',
                'orders',
                'withdraw',
                'withdraw-requests',
                'reverse-withdrawal',
                'settings',
                'edit-account',
                'account-migration',
            ]
        );

        foreach ( $this->query_vars as $var ) {
            add_rewrite_endpoint( $var, EP_PAGES );
        }

        $permalinks = get_option( 'woocommerce_permalinks', [] );
        if ( isset( $permalinks['product_base'] ) ) {
            $base = substr( $permalinks['product_base'], 1 );
        }

        // default base is product
        $base = empty( $base ) ? 'product' : $base;

        // get custom store url from settings so that we can use it from other places
        $this->custom_store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

        // special treatment for product cat
        if ( stripos( $base, 'product_cat' ) ) {

            // get the category base. usually: shop
            $base_array = explode( '/', ltrim( $base, '/' ) ); // remove first '/' and explode
            $cat_base   = isset( $base_array[0] ) ? $base_array[0] : 'shop';

            add_rewrite_rule( $cat_base . '/(.+?)/([^/]+)(/[0-9]+)?/edit?$', 'index.php?product_cat=$matches[1]&product=$matches[2]&page=$matches[3]&edit=true', 'top' );
        } else {
            add_rewrite_rule( $base . '/([^/]+)(/[0-9]+)?/edit/?$', 'index.php?product=$matches[1]&page=$matches[2]&edit=true', 'top' );
        }

        add_rewrite_rule( $this->custom_store_url . '/([^/]+)/?$', 'index.php?' . $this->custom_store_url . '=$matches[1]', 'top' );
        add_rewrite_rule( $this->custom_store_url . '/([^/]+)/page/?([0-9]{1,})/?$', 'index.php?' . $this->custom_store_url . '=$matches[1]&paged=$matches[2]', 'top' );

        add_rewrite_rule( $this->custom_store_url . '/([^/]+)/section/?([0-9]{1,})/?$', 'index.php?' . $this->custom_store_url . '=$matches[1]&term=$matches[2]&term_section=true', 'top' );
        add_rewrite_rule( $this->custom_store_url . '/([^/]+)/section/?([0-9]{1,})/page/?([0-9]{1,})/?$', 'index.php?' . $this->custom_store_url . '=$matches[1]&term=$matches[2]&paged=$matches[3]&term_section=true', 'top' );

        add_rewrite_rule( $this->custom_store_url . '/([^/]+)/toc?$', 'index.php?' . $this->custom_store_url . '=$matches[1]&toc=true', 'top' );
        add_rewrite_rule( $this->custom_store_url . '/([^/]+)/toc/page/?([0-9]{1,})/?$', 'index.php?' . $this->custom_store_url . '=$matches[1]&paged=$matches[2]&toc=true', 'top' );

        do_action( 'dokan_rewrite_rules_loaded', $this->custom_store_url );
    }

    /**
     * Resolve query var conflicts with WooCommerce
     *
     * @param array $query_vars
     *
     * @since 2.9.13
     *
     * @return array
     */
    public function resolve_wc_query_conflict( $query_vars ) {
        global $post;

        $dashboard_id = apply_filters( 'dokan_get_dashboard_page_id', dokan_get_option( 'dashboard', 'dokan_pages', 0 ) );

        if ( ! empty( $post->ID ) && apply_filters( 'dokan_get_current_page_id', $post->ID ) === absint( $dashboard_id ) ) {
            unset( $query_vars['orders'] );
            unset( $query_vars['edit-account'] );
        }

        return $query_vars;
    }

    /**
     * Register the query var
     *
     * @param array $vars
     *
     * @return array
     */
    public function register_query_var( $vars ) {
        $vars[] = $this->custom_store_url;
        $vars[] = 'edit';
        $vars[] = 'term_section';
        $vars[] = 'toc';

        foreach ( $this->query_vars as $var ) {
            $vars[] = $var;
        }

        return $vars;
    }

    /**
     * Include store template
     *
     * @param type $template
     *
     * @return string
     */
    public function store_template( $template ) {
        $store_name = get_query_var( $this->custom_store_url );

        if ( ! $this->is_woo_installed() ) {
            return $template;
        }

        if ( ! empty( $store_name ) ) {
            $store_user = get_user_by( 'slug', $store_name );

            if ( ! $store_user ) {
                return get_404_template();
            }

            // Bell out for Vendor Stuff extensions
            if ( ! is_super_admin( $store_user->ID ) && user_can( $store_user->ID, 'vendor_staff' ) ) {
                return get_404_template();
            }

            // no user found
            if ( ! $store_user ) {
                return get_404_template();
            }

            // check if the user is seller
            if ( ! dokan_is_user_seller( $store_user->ID ) ) {
                return get_404_template();
            }

            return dokan_locate_template( 'store.php' );
        }

        return $template;
    }

    /**
     * Returns the terms_and_conditions template
     *
     * @param string $template
     *
     * @since 2.3
     *
     * @return string
     */
    public function store_toc_template( $template ) {
        if ( ! $this->is_woo_installed() ) {
            return $template;
        }

        if ( get_query_var( 'toc' ) ) {
            $store_name = get_query_var( $this->custom_store_url );

            if ( ! empty( $store_name ) ) {
                $seller = get_user_by( 'slug', $store_name );

                //redirect to 404 if no seller found
                if ( ! $seller ) {
                    return get_404_template();
                }

                return dokan_locate_template( 'store-toc.php' );
            }
        }

        return $template;
    }

    /**
     * Returns the edit product template
     *
     * @param string $template
     *
     * @return string
     */
    public function product_edit_template( $template ) {
        if ( ! $this->is_woo_installed() ) {
            return $template;
        }

        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            return $template;
        }

        if ( ! ( get_query_var( 'edit' ) && is_singular( 'product' ) ) ) {
            return $template;
        }

        $edit_product_url = dokan_locate_template( 'products/edit-product-single.php' );

        return apply_filters( 'dokan_get_product_edit_template', $edit_product_url );
    }

    /**
     * Remove h1 tag in edit product page.
     *
     * @param $args
     *
     * @return mixed
     */
    public function remove_h1_from_heading_in_edit_product_page( $args ) {
        global $wp;
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ( dokan_is_seller_dashboard() && isset( $wp->query_vars['settings'] ) && $wp->query_vars['settings'] === 'store' ) || ( ! empty( $_GET['product_id'] ) && ! empty( $_GET['action'] ) && ! empty( $_GET['_dokan_edit_product_nonce'] ) ) ) {
            // Just omit h1 from the list
            $args['block_formats'] = 'Paragraph=p;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;Pre=pre';
            return $args;
        }

        return $args;
    }

    /**
     * Store query filter
     *
     * Handles the product filtering by category in store page
     *
     * @param object $query
     *
     * @return void
     */
    public function store_query_filter( $query ) {
        global $wp_query;

        $author = get_query_var( $this->custom_store_url );

        if ( ! is_admin() && $query->is_main_query() && ! empty( $author ) ) {
            $seller_info = get_user_by( 'slug', $author );

            if ( ! $seller_info ) {
                return get_404_template();
            }

            $store_info    = dokan_get_store_info( $seller_info->data->ID );
            $product_ppp   = dokan_get_option( 'store_products_per_page', 'dokan_general', 12 );
            $post_per_page = isset( $store_info['store_ppp'] ) && ! empty( $store_info['store_ppp'] ) ? $store_info['store_ppp'] : $product_ppp;

            do_action( 'dokan_store_page_query_filter', $query, $store_info );
            set_query_var( 'posts_per_page', apply_filters( 'dokan_store_products_per_page', $post_per_page ) );

            $query->set( 'post_type', 'product' );
            $query->set( 'author_name', $author );

            $tax_query                    = [];
            $query->query['term_section'] = isset( $query->query['term_section'] ) ? $query->query['term_section'] : [];

            $attributes = dokan_get_chosen_taxonomy_attributes();
            if ( ! empty( $attributes ) ) {
                foreach ( $attributes as $key => $attribute ) {
                    $tax_query[] = [
                        'taxonomy' => $key,
                        'field'    => 'name',
                        'terms'    => $attribute['terms'],
                    ];
                }
            }

            if ( $query->query['term_section'] ) {
                array_push(
                    $tax_query, [
                        'taxonomy' => 'product_cat',
                        'field'    => 'term_id',
                        'terms'    => $query->query['term'],
                    ]
                );
            }

            // Hide out of stock products
            $product_visibility_terms  = wc_get_product_visibility_term_ids();
            $product_visibility_not_in = [ is_search() && $query->is_main_query() ? $product_visibility_terms['exclude-from-search'] : $product_visibility_terms['exclude-from-catalog'] ];

            if ( 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' ) ) {
                $product_visibility_not_in[] = $product_visibility_terms['outofstock'];
            }

            if ( ! empty( $product_visibility_not_in ) ) {
                array_push(
                    $tax_query, [
                        'taxonomy' => 'product_visibility',
                        'field'    => 'term_taxonomy_id',
                        'terms'    => $product_visibility_not_in,
                        'operator' => 'NOT IN',
                    ]
                );
            }

            $query->set( 'tax_query', apply_filters( 'dokan_store_tax_query', $tax_query ) );

            if ( ! empty( $_GET['product_name'] ) ) { //phpcs:ignore
                $product_name = wc_clean( wp_unslash( $_GET['product_name'] ) ); //phpcs:ignore
                $query->set( 's', $product_name );
            }

            // set orderby param
            $ordering = $this->get_catalog_ordering_args();

            $query->set( 'orderby', $ordering['orderby'] );
            $query->set( 'order', $ordering['order'] );
        }
    }

    /**
     * Returns an array of arguments for ordering products based on the selected values.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $orderby Order by param
     * @param string $order Order param
     *
     * @return array
     */
    public function get_catalog_ordering_args( $orderby = '', $order = '' ) {
        // Get ordering from query string unless defined.
        if ( ! $orderby ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $orderby_value = isset( $_GET['product_orderby'] ) ? wc_clean( wp_unslash( $_GET['product_orderby'] ) ) : wc_clean( get_query_var( 'product_orderby' ) ); //phpcs:ignore

            if ( ! $orderby_value ) {
                if ( is_search() ) {
                    $orderby_value = 'relevance';
                } else {
                    $orderby_value = apply_filters( 'dokan_default_catalog_orderby', get_option( 'woocommerce_default_catalog_orderby', 'menu_order' ) );
                }
            }

            // Get order + orderby args from string.
            $orderby_value = is_array( $orderby_value ) ? $orderby_value : explode( '-', $orderby_value );
            $orderby       = esc_attr( $orderby_value[0] );
            $order         = ! empty( $orderby_value[1] ) ? $orderby_value[1] : $order;
        }

        // Convert to correct format.
        $orderby = strtolower( is_array( $orderby ) ? (string) current( $orderby ) : (string) $orderby );
        $order   = strtoupper( is_array( $order ) ? (string) current( $order ) : (string) $order );
        $args    = array(
            'orderby'  => $orderby,
            'order'    => ( 'DESC' === $order ) ? 'DESC' : 'ASC',
            'meta_key' => '', // @codingStandardsIgnoreLine
        );

        switch ( $orderby ) {
            case 'id':
                $args['orderby'] = 'ID';
                break;
            case 'menu_order':
                $args['orderby'] = 'menu_order title';
                break;
            case 'title':
                $args['orderby'] = 'title';
                $args['order']   = ( 'DESC' === $order ) ? 'DESC' : 'ASC';
                break;
            case 'relevance':
                $args['orderby'] = 'relevance';
                $args['order']   = 'DESC';
                break;
            case 'rand':
                $args['orderby'] = 'rand'; // @codingStandardsIgnoreLine
                break;
            case 'date':
                $args['orderby'] = 'date ID';
                $args['order']   = ( 'ASC' === $order ) ? 'ASC' : 'DESC';
                break;
            case 'price':
                $callback = 'DESC' === $order ? 'order_by_price_desc_post_clauses' : 'order_by_price_asc_post_clauses';
                add_filter( 'posts_clauses', [ $this, $callback ] );
                break;
            case 'popularity':
                add_filter( 'posts_clauses', [ $this, 'order_by_popularity_post_clauses' ] );
                break;
            case 'rating':
                add_filter( 'posts_clauses', [ $this, 'order_by_rating_post_clauses' ] );
                break;
        }

        return apply_filters( 'dokan_get_store_products_ordering_args', $args, $orderby, $order );
    }

    /**
     * Handle numeric price sorting
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param array $args Query args
     *
     * @return array
     */
    public function order_by_price_asc_post_clauses( $args ) {
        $args['join']    = $this->append_product_sorting_table_join( $args['join'] );
        $args['orderby'] = ' wc_product_meta_lookup.min_price ASC, wc_product_meta_lookup.product_id ASC ';
        return $args;
    }

    /**
     * Handle numeric price sorting
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param array $args Query args
     *
     * @return array
     */
    public function order_by_price_desc_post_clauses( $args ) {
        $args['join']    = $this->append_product_sorting_table_join( $args['join'] );
        $args['orderby'] = ' wc_product_meta_lookup.max_price DESC, wc_product_meta_lookup.product_id DESC ';
        return $args;
    }

    /**
     * WP Core does not let us change the sort direction for individual orderby params
     *
     * This lets us sort by meta value desc, and have a second orderby param
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param array $args Query args
     *
     * @return array
     */
    public function order_by_popularity_post_clauses( $args ) {
        $args['join']    = $this->append_product_sorting_table_join( $args['join'] );
        $args['orderby'] = ' wc_product_meta_lookup.total_sales DESC, wc_product_meta_lookup.product_id DESC ';
        return $args;
    }

    /**
     * Order by rating post clauses
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param array $args Query args
     *
     * @return array
     */
    public function order_by_rating_post_clauses( $args ) {
        $args['join']    = $this->append_product_sorting_table_join( $args['join'] );
        $args['orderby'] = ' wc_product_meta_lookup.average_rating DESC, wc_product_meta_lookup.rating_count DESC, wc_product_meta_lookup.product_id DESC ';
        return $args;
    }

    /**
     * Join wc_product_meta_lookup to posts if not already joined.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $sql SQL join
     *
     * @return string
     */
    private function append_product_sorting_table_join( $sql ) {
        global $wpdb;

        if ( ! strstr( $sql, 'wc_product_meta_lookup' ) ) {
            $sql .= " LEFT JOIN {$wpdb->wc_product_meta_lookup} wc_product_meta_lookup ON $wpdb->posts.ID = wc_product_meta_lookup.product_id ";
        }
        return $sql;
    }
}
