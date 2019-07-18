<?php

/**
 * Tempalte shortcode class file
 *
 * @load all shortcode for template  rendering
 */
class Dokan_Shortcodes {

    /**
     *  Dokan template shortcodes __constract
     *  Initial loaded when class create an instanace
     *
     *  @since 2.4
     */
    function __construct() {
        add_shortcode( 'dokan-dashboard', array( $this, 'load_template_files' ) );
        add_shortcode( 'dokan-best-selling-product', array( $this, 'best_selling_product_shortcode' ) );
        add_shortcode( 'dokan-top-rated-product', array( $this, 'top_rated_product_shortcode' ) );
        add_shortcode( 'dokan-my-orders', array( $this, 'my_orders_page' ) );
        add_shortcode( 'dokan-stores', array( $this, 'store_listing' ) );
    }

    /**
     * Load template files
     *
     * Based on the query vars, load the appropriate template files
     * in the frontend user dashboard.
     *
     * @return void
     */
    public function load_template_files() {
        global $wp;

        if ( ! function_exists( 'WC' ) ) {
            return sprintf( __( 'Please install <a href="%s"><strong>WooCommerce</strong></a> plugin first', 'dokan-lite' ), 'http://wordpress.org/plugins/woocommerce/' );
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return __( 'You have no permission to view this page', 'dokan-lite' );
        }

        ob_start();

        if ( isset( $wp->query_vars['products'] ) ) {
            if ( ! current_user_can( 'dokan_view_product_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'products/products' );
            }
            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['new-product'] ) ) {
            if ( ! current_user_can( 'dokan_add_product' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                do_action( 'dokan_render_new_product_template', $wp->query_vars );
            }
            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['orders'] ) ) {
            if ( ! current_user_can( 'dokan_view_order_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'orders/orders' );
            }
            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['withdraw'] ) ) {
            if ( ! current_user_can( 'dokan_view_withdraw_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'withdraw/withdraw' );
            }
            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['settings'] ) ) {
            dokan_get_template_part('settings/store');
            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['page'] ) ) {
            if ( ! current_user_can( 'dokan_view_overview_menu' ) ) {
                dokan_get_template_part( 'global/no-permission' );
            } else {
                dokan_get_template_part( 'dashboard/dashboard' );
            }
            return ob_get_clean();
        }
        if ( isset( $wp->query_vars['edit-account'] ) ) {
            dokan_get_template_part( 'dashboard/edit-account' );
            return ob_get_clean();
        }

        do_action( 'dokan_load_custom_template', $wp->query_vars );

    }

    /**
     * Render best selling products
     *
     * @param  array  $atts
     *
     * @return string
     */
    function best_selling_product_shortcode( $atts ) {
        /**
        * Filter return the number of best selling product per page.
        *
        * @since 2.2
        *
        * @param array
        */
        $atts_val = shortcode_atts( apply_filters( 'dokan_best_selling_product_per_page', array(
            'no_of_product' => 8,
            'seller_id' => ''
        ), $atts ), $atts );

        ob_start();
        ?>
        <ul class="products">
            <?php
            $best_selling_query = dokan_get_best_selling_products( $atts_val['no_of_product'], $atts_val['seller_id'] );
            ?>
            <?php while ( $best_selling_query->have_posts() ) : $best_selling_query->the_post(); ?>

                <?php wc_get_template_part( 'content', 'product' ); ?>

            <?php endwhile; ?>
        </ul>
        <?php

        return ob_get_clean();
    }

    /**
     * Render top rated products via shortcode
     *
     * @param  array  $atts
     *
     * @return string
     */
    function top_rated_product_shortcode( $atts ) {

        /**
         * Filter return the number of top rated product per page.
         *
         * @since 2.2
         *
         * @param array
         */
        $per_page = shortcode_atts( apply_filters( 'dokan_top_rated_product_per_page', array(
            'no_of_product' => 8
        ), $atts ), $atts );

        ob_start();
        ?>
        <ul class="products">
            <?php
            $best_selling_query = dokan_get_top_rated_products();
            ?>
            <?php while ( $best_selling_query->have_posts() ) : $best_selling_query->the_post(); ?>

                <?php wc_get_template_part( 'content', 'product' ); ?>

            <?php endwhile; ?>
        </ul>
        <?php

        return ob_get_clean();
    }

    /**
     * Render my orders page
     *
     * @return string
     */
    function my_orders_page() {
        if ( ! is_user_logged_in() ) {
            return;
        }

        ob_start();

        dokan_get_template_part( 'my-orders' );

        return ob_get_clean();
    }

     /**
     * Displays the store lists
     *
     * @since 2.4
     *
     * @param  array $atts
     *
     * @return string
     */
    function store_listing( $atts ) {

        $defaults = array(
            'per_page' => 10,
            'search'   => 'yes',
            'per_row'  => 3,
            'featured' => 'no'
        );

        /**
         * Filter return the number of store listing number per page.
         *
         * @since 2.2
         *
         * @param array
         */
        $attr   = shortcode_atts( apply_filters( 'dokan_store_listing_per_page', $defaults ), $atts );
        $paged  = (int) is_front_page() ? max( 1, get_query_var( 'page' ) ) : max( 1, get_query_var( 'paged' ) );
        $limit  = $attr['per_page'];
        $offset = ( $paged - 1 ) * $limit;

        $seller_args = array(
            'number' => $limit,
            'offset' => $offset
        );

        $_get_data = wp_unslash( $_GET );

        // if search is enabled, perform a search
        if ( 'yes' == $attr['search'] ) {

            $search_term = isset( $_get_data['dokan_seller_search'] ) ? sanitize_text_field( $_get_data['dokan_seller_search'] ) : '';

            if ( '' != $search_term ) {

                $seller_args['meta_query'] = array(
                    array(
                        'key'     => 'dokan_store_name',
                        'value'   => $search_term,
                        'compare' => 'LIKE'
                    )
                );
            }
        }

        if ( $attr['featured'] == 'yes' ) {
            $seller_args['featured'] = 'yes';
        }

        $sellers = dokan_get_sellers( apply_filters( 'dokan_seller_listing_args', $seller_args, $_GET ) );

        /**
         * Filter for store listing args
         *
         * @since 2.4.9
         */
        $template_args = apply_filters( 'dokan_store_list_args', array(
            'sellers'    => $sellers,
            'limit'      => $limit,
            'offset'     => $offset,
            'paged'      => $paged,
            'image_size' => 'full',
            'search'     => $attr['search'],
            'per_row'    => $attr['per_row']
        ) );

        ob_start();
        dokan_get_template_part( 'store-lists', false, $template_args );
        $content = ob_get_clean();

        return apply_filters( 'dokan_seller_listing', $content, $attr );
    }

}
