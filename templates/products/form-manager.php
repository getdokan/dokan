<?php
/**
 * Dokan Dashboard Product Edit Template
 *
 * @since 2.4
 *
 * @var $product WC_Product instance of WC_Product object
 * @var $from_shortcode bool if the template loaded from shortcode
 * @package dokan
 */

defined( 'ABSPATH' ) || exit;

global $post; // phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited

// apply security check for theme
if ( ! current_user_can( 'dokan_edit_product' ) ) {
	dokan_get_template_part(
		'global/dokan-error', '', [
			'deleted' => false,
			'message' => __( 'You have no permission to view this page', 'dokan-lite' ),
		]
	);
	return;
}

// check if seller is enabled for selling
if ( ! dokan_is_seller_enabled( dokan_get_current_user_id() ) ) {
	dokan_seller_not_enabled_notice();
	return;
}

// while calling from theme, we need to check if the product id is passed or not
$post_id = isset( $_GET['product_id'] ) ? intval( wp_unslash( $_GET['product_id'] ) ) : $post->ID; //phpcs:ignore
if ( ! $post_id ) {
	// this is `add new` product page
	$product = new WC_Product_Simple();
	$product->set_status( 'auto-draft' );
	$product->save();
} else {
	$product = wc_get_product( $post_id );
}


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
