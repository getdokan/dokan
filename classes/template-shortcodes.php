<?php

/**
 * Tempalte shortcode class file
 *
 * @load all shortcode for template  rendering
 */
class Dokan_Template_Shortcodes {

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
    }

    /**
     * Singleton method
     *
     * @return self
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Template_Shortcodes();
        }

        return $instance;
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
            return sprintf( __( 'Please install <a href="%s"><strong>WooCommerce</strong></a> plugin first', 'dokan' ), 'http://wordpress.org/plugins/woocommerce/' );
        }

        if ( isset( $wp->query_vars['products'] ) ) {
            dokan_get_template_part( 'products/products' );
            return;
        }

        if ( isset( $wp->query_vars['new-product'] ) ) {
            do_action( 'dokan_render_new_product_template', $wp->query_vars );
            return;
        }

        if ( isset( $wp->query_vars['orders'] ) ) {
            dokan_get_template_part( 'orders/orders' );
            return;
        }

        if ( isset( $wp->query_vars['withdraw'] ) ) {
            dokan_get_template_part( 'withdraw/withdraw' );
            return;
        }

        if ( isset( $wp->query_vars['settings'] ) ) {
            dokan_get_template_part('settings/store');
            return;
        }

        if ( isset( $wp->query_vars['page'] ) ) {
            dokan_get_template_part( 'dashboard/dashboard' );
            return;
        }
        if ( isset( $wp->query_vars['edit-account'] ) ) {
            dokan_get_template_part( 'dashboard/edit-account' );
            return;
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
            'seller_id' => '',
        ), $atts ), $atts );
        
        ob_start();
        ?>
        <ul>
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
        ), $atts ) );

        ob_start();
        ?>
        <ul>
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
        return dokan_get_template_part( 'my-orders' );
    }
}
