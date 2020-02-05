<?php

namespace WeDevs\Dokan;

/**
 * Dokan rewrite rules class
 *
 * @package Dokan
 */
class Rewrites {

    public $query_vars = array();
    public $custom_store_url = '';

    /**
     * Hook into the functions
     */
    public function __construct() {
        $this->custom_store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

        add_action( 'init', array( $this, 'register_rule' ) );
        add_action( 'pre_get_posts', array( $this, 'store_query_filter' ) );

        add_filter( 'woocommerce_get_query_vars', array( $this, 'resolve_wc_query_conflict' ) );
        add_filter( 'template_include', array( $this, 'store_template' ) );
        add_filter( 'template_include', array( $this, 'product_edit_template' ), 99 );
        add_filter( 'template_include', array( $this, 'store_toc_template' ) );
        add_filter( 'query_vars', array( $this, 'register_query_var' ) );
        add_filter( 'woocommerce_get_breadcrumb', array( $this, 'store_page_breadcrumb' ) );
    }

    /**
     * Generate breadcrumb for store page
     *
     * @since 2.4.7
     *
     * @param array $crumbs
     *
     * @return array $crumbs
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
        $crumbs[1]   = array( ucwords( $this->custom_store_url ), site_url() . '/' . $this->custom_store_url );
        $crumbs[2]   = array( $author, dokan_get_store_url( $seller_info->data->ID ) );

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
    function register_rule() {
        $this->query_vars = apply_filters( 'dokan_query_var_filter', array(
            'products',
            'new-product',
            'orders',
            'withdraw',
            'settings',
            'edit-account'
        ) );

        foreach ( $this->query_vars as $var ) {
            add_rewrite_endpoint( $var, EP_PAGES );
        }

        $permalinks = get_option( 'woocommerce_permalinks', array() );
        if ( isset( $permalinks['product_base'] ) ) {
            $base = substr( $permalinks['product_base'], 1 );
        }

        // default base is product
        $base = empty( $base ) ? 'product' : $base;

        // special treatment for product cat
        if ( stripos( $base, 'product_cat' ) ) {

            // get the category base. usually: shop
            $base_array = explode( '/', ltrim( $base, '/' ) ); // remove first '/' and explode
            $cat_base = isset( $base_array[0] ) ? $base_array[0] : 'shop';

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
     * @since 2.9.13
     *
     * @param array $query_vars
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
     * @param array  $vars
     *
     * @return array
     */
    function register_query_var( $vars ) {
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
     * @param type  $template
     *
     * @return string
     */
    function store_template( $template ) {

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
     * @since 2.3
     *
     * @param string $template
     *
     * @return string
     */
    function store_toc_template( $template ) {

        if ( ! $this->is_woo_installed() ) {
            return $template;
        }
        if ( get_query_var( 'toc' ) ) {
            return dokan_locate_template( 'store-toc.php' );
        }

        return $template;

    }

    /**
     * Returns the edit product template
     *
     * @param string  $template
     *
     * @return string
     */
    function product_edit_template( $template ) {
        if ( ! $this->is_woo_installed() ) {
            return $template;
        }

        if ( ! current_user_can( 'dokan_edit_product' ) ) {
            return $template;
        }

        if ( ! ( get_query_var( 'edit' ) && is_singular( 'product' ) ) ) {
            return $template;
        }

        $edit_product_url = dokan_locate_template( 'products/new-product-single.php' );
        return apply_filters( 'dokan_get_product_edit_template', $edit_product_url );
    }

    /**
     * Store query filter
     *
     * Handles the product filtering by category in store page
     *
     * @param object  $query
     *
     * @return void
     */
    function store_query_filter( $query ) {
        global $wp_query;

        $author = get_query_var( $this->custom_store_url );

        if ( ! is_admin() && $query->is_main_query() && ! empty( $author ) ) {
            $seller_info = get_user_by( 'slug', $author );

            if ( ! $seller_info ) {
                return get_404_template();
            }

            $store_info    = dokan_get_store_info( $seller_info->data->ID );
            $post_per_page = isset( $store_info['store_ppp'] ) && ! empty( $store_info['store_ppp'] ) ? $store_info['store_ppp'] : 12;

            set_query_var( 'posts_per_page', $post_per_page );

            $query->set( 'post_type', 'product' );
            $query->set( 'author_name', $author );

            $tax_query                    = [];
            $query->query['term_section'] = isset( $query->query['term_section'] ) ? $query->query['term_section'] : array();

            if ( $query->query['term_section'] ) {
                array_push( $tax_query, [
                    'taxonomy' => 'product_cat',
                    'field'    => 'term_id',
                    'terms'    => $query->query['term']
                ] );
            }

            // Hide out of stock products
            $product_visibility_terms  = wc_get_product_visibility_term_ids();
            $product_visibility_not_in = [ is_search() && $query->is_main_query() ? $product_visibility_terms['exclude-from-search'] : $product_visibility_terms['exclude-from-catalog'] ];

            if ( 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' ) ) {
                $product_visibility_not_in[] = $product_visibility_terms['outofstock'];
            }

            if ( ! empty( $product_visibility_not_in ) ) {
                array_push( $tax_query, [
                    'taxonomy' => 'product_visibility',
                    'field'    => 'term_taxonomy_id',
                    'terms'    => $product_visibility_not_in,
                    'operator' => 'NOT IN'
                ] );
            }

            $query->set( 'tax_query', apply_filters( 'dokan_store_tax_query', $tax_query ) );
        }
    }
}
