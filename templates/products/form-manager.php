<?php
/**
 * Dokan Dashboard Product Edit Template
 *
 * @since DOKAN_SINCE
 *
 * @var $product WC_Product instance of WC_Product object
 *
 * @package dokan
 */

defined( 'ABSPATH' ) || exit;

global $post; // phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited

$post = get_post( $product->get_id() );

if ( ! dokan_is_product_author( $product->get_id() ) ) {
    wp_die( esc_html__( 'Access Denied', 'dokan-lite' ) );
}

/**
 * Action hook to fire before dokan dashboard wrap
 *
 *  @since 2.4
 */
do_action( 'dokan_dashboard_wrap_before', $post, $product->get_id() );
?>

<?php do_action( 'dokan_dashboard_wrap_start' ); ?>

    <div class="dokan-dashboard-wrap">

        <?php
        /**
         * Action took to fire before dashboard content.
         *
         *  @hooked get_dashboard_side_navigation
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_before' );

        /**
         * Action hook to fire before product content area.
         *
         * @since 2.4
         */
        do_action( 'dokan_before_product_content_area' );
        ?>

        <div class="dokan-dashboard-content dokan-product-edit">

            <?php
            /**
             * Action hook to fire inside product content area before
             *
             *  @since 2.4
             */
            do_action( 'dokan_product_content_inside_area_before' );

            ?>
            <input type="hidden" name="dokan_product_id" id="dokan_product_id" value="<?php echo esc_attr( $product->get_id() ); ?>" />
            <input type="hidden" name="dokan_new_product" id="dokan_new_product" value="<?php echo esc_attr( $new_product ); ?>" />
            <div id="product-form-manager-template" class="dokan-product-edit-form"></div>
            <?php
            /**
             * Action took to fire inside product content after.
             *
             *  @since 2.4
             */
            do_action( 'dokan_product_content_inside_area_after' );
            ?>
        </div>

        <?php
        /**
         * Action took to fire after dashboard content.
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_after' );

        /**
         * Action took to fire after product content area.
         *
         *  @since 2.4
         */
        do_action( 'dokan_after_product_content_area' );
        ?>

    </div><!-- .dokan-dashboard-wrap -->

<?php do_action( 'dokan_dashboard_wrap_end' ); ?>

<div class="dokan-clearfix"></div>

<?php

/**
 * Action hook to fire after dokan dashboard wrap
 *
 *  @since 2.4
 */
do_action( 'dokan_dashboard_wrap_after', $post, $product->get_id() );

wp_reset_postdata();
