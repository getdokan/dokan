<?php
/**
 * Template Name: Dokan Dashboard Full Width.
 *
 * This template renders only the shortcode content in full-width mode
 * while preserving all wp_head() and wp_footer() hooks for scripts/styles
 *
 * @since DOKAN_SINCE
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
         * wp_head() hook - REQUIRED
         * This ensures all enqueued scripts and styles are loaded
         * Do not remove or modify this
         */
        wp_head();
        ?>
    </head>
    <body <?php body_class( 'dokan-dashboard-fullwidth-template' ); ?>>
    <?php
    /**
     * wp_body_open() hook
     * Introduced in WordPress 5.2
     */
    if ( function_exists( 'wp_body_open' ) ) {
        wp_body_open();
    }
    ?>
        <div id="dokan-dashboard-fullwidth-wrapper" class="dokan-fullwidth-container">
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
     * wp_footer() hook - REQUIRED
     * This ensures all footer scripts are loaded
     * Do not remove or modify this
     */
    wp_footer();
    ?>
    </body>
</html>
