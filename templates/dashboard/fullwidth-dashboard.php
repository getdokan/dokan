<?php
/**
 * Template Name: Dokan Dashboard Full Width.
 *
 * This template renders only the shortcode content in full-width mode
 * while preserving all wp_head() and wp_footer() hooks for scripts/styles
 *
 * @since 4.2.0
 *
 * @package Dokan
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
    <head>
        <meta charset="<?php bloginfo( 'charset' ); ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="robots" content="noindex, nofollow">
        <?php
        /**
         * Output all the wp_head() hooks.
         *
         * This ensures all enqueued scripts and styles are loaded
         * Do not remove or modify this.
         *
         * wp_head() hook - REQUIRED.
         */
        wp_head();
        ?>
    </head>
    <body <?php body_class( 'dokan-dashboard-fullwidth-template' ); ?>>
    <?php
    /**
     * Output the wp_body_open() hook.
     *
     * This ensures all scripts are loaded before the closing body tag
     * Do not remove or modify this.
     *
     * wp_body_open() hook.
     */
    if ( function_exists( 'wp_body_open' ) ) {
        wp_body_open();
    }
    ?>
        <div id="dokan-dashboard-fullwidth-wrapper" class="dokan-fullwidth-container">
            <div id='dokan-vendor-dashboard-layout-root' class='dokan-layout'></div>
            <?php
            // Render the page content (which contains the shortcode)
            while ( have_posts() ) :
                the_post();
                the_content();
            endwhile;
            ?>
        </div>
    <?php
    /**
     * Output all the wp_footer() hooks.
     *
     * This ensures all footer scripts are loaded
     * Do not remove or modify this.
     *
     * wp_footer() hook - REQUIRED.
     */
    wp_footer();
    ?>
    </body>
</html>
