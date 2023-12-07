<?php
/**
 * Dokan Dashboard Product Edit Template
 *
 * @since 2.4
 *
 * @var $product WC_Product instance of WC_Product object
 * @var $from_shortcode bool if the template loaded from shortcode
 * @var $new_product bool if the product is new
 * @package dokan
 */

defined( 'ABSPATH' ) || exit;

global $post; // phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited

if ( ! isset( $from_shortcode ) || ! wc_string_to_bool( $from_shortcode ) ) {
    // this file is loaded from theme
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
        $new_product = true;
    } else {
        $product = wc_get_product( $post_id );
        $new_product = false;
    }
}

$post = get_post( $product->get_id() );

if ( ! dokan_is_product_author( $product->get_id() ) ) {
    wp_die( esc_html__( 'Access Denied', 'dokan-lite' ) );
}

if ( ! $from_shortcode ) {
    get_header();
}

if ( isset( $_GET['errors'] ) ) { // phpcs:ignore
    dokan()->dashboard->templates->products->set_errors( array_map( 'sanitize_text_field', wp_unslash( $_GET['errors'] ) ) ); //phpcs:ignore
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

            if ( $new_product ) {
                do_action( 'dokan_new_product_before_product_area' );
            }
            ?>

            <header class="dokan-dashboard-header dokan-clearfix">
                <h1 class="entry-title">
                    <?php
                    if ( $new_product || 'auto-draft' === $product->get_status() ) {
                        esc_html_e( 'Add New Product', 'dokan-lite' );
                    } else {
                        esc_html_e( 'Edit Product', 'dokan-lite' );
                    }
                    ?>
                    <span class="dokan-label <?php echo esc_attr( dokan_get_post_status_label_class( $product->get_status() ) ); ?> dokan-product-status-label">
                        <?php echo esc_html( dokan_get_post_status( $product->get_status() ) ); ?>
                    </span>

                    <?php if ( $product->get_status() === 'publish' ) : ?>
                        <span class="dokan-right">
                            <a class="dokan-btn dokan-btn-theme dokan-btn-sm" href="<?php echo esc_url( $product->get_permalink() ); ?>" target="_blank"><?php esc_html_e( 'View Product', 'dokan-lite' ); ?></a>
                        </span>
                    <?php endif; ?>

                    <?php if ( $product->get_catalog_visibility() === 'hidden' ) : ?>
                        <span class="dokan-right dokan-label dokan-label-default dokan-product-hidden-label"><i class="far fa-eye-slash"></i> <?php esc_html_e( 'Hidden', 'dokan-lite' ); ?></span>
                    <?php endif; ?>
                </h1>
            </header><!-- .entry-header -->

            <div class="product-edit-new-container product-edit-container">
                <?php if ( dokan()->dashboard->templates->products->has_errors() ) : ?>
                    <div class="dokan-alert dokan-alert-danger">
                        <a class="dokan-close" data-dismiss="alert">&times;</a>

                        <?php foreach ( dokan()->dashboard->templates->products->get_errors() as $error ) : ?>
                            <strong><?php esc_html_e( 'Error!', 'dokan-lite' ); ?></strong> <?php echo esc_html( $error ); ?>.<br>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <?php if ( isset( $_GET['message'] ) && sanitize_text_field( wp_unslash( $_GET['message'] ) ) === 'success' ) : //phpcs:ignore ?>
                    <div class="dokan-message">
                        <button type="button" class="dokan-close" data-dismiss="alert">&times;</button>
                        <strong><?php esc_html_e( 'Success!', 'dokan-lite' ); ?></strong> <?php esc_html_e( 'The product has been saved successfully.', 'dokan-lite' ); ?>

                        <?php if ( $product->get_status() === 'publish' ) : ?>
                            <a href="<?php echo esc_url( $product->get_permalink() ); ?>" target="_blank"><?php esc_html_e( 'View Product &rarr;', 'dokan-lite' ); ?></a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <?php
                if ( apply_filters( 'dokan_can_post', true ) ) {
                    // we are using require_once intentionally
                    include DOKAN_TEMPLATE_DIR . '/products/edit/sections/general.php';
                } else {
                    do_action( 'dokan_can_post_notice' );
                }
                ?>
            </div> <!-- #primary .content-area -->

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

if ( ! $from_shortcode ) {
    get_footer();
}

// phpcs:enable WordPress.WP.GlobalVariablesOverride.Prohibited
