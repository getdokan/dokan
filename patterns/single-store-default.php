<?php
/**
 * Title: Single Store Page
 * Slug: dokan/single-store-default
 * Description: A complete vendor store page: header, tab navigation, products and a store sidebar.
 * Categories: dokan-store
 * Block Types: dokan/store-tab-content
 * Keywords: store, vendor, page, layout
 * Viewport Width: 1200
 *
 * @package dokan
 * @since   DOKAN_SINCE
 *
 * The registered `dokan//single-store` block template renders this pattern, so
 * this file is the single source of truth for the default store layout. A
 * merchant swapping layouts replaces the header group above with one of the
 * other three header patterns; everything below it stays put.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<!-- wp:group {"align":"full","className":"dokan-single-store","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull dokan-single-store">
    <!-- wp:dokan/store-banner {"align":"full"} /-->

    <!-- wp:columns {"verticalAlignment":"center","align":"wide","style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center" style="margin-bottom:var(--wp--preset--spacing--40)">
        <!-- wp:column {"verticalAlignment":"center","width":"25%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:25%">
            <!-- wp:dokan/store-avatar {"shape":"circle","size":150} /-->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:dokan/store-name {"level":1} /-->

            <!-- wp:dokan/store-info /-->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"center","width":"25%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:25%">
            <!-- wp:dokan/store-social /-->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:dokan/store-tabs {"align":"wide"} /-->

    <?php
    /*
     * Sidebar first, at a third of the width: the arrangement every Elementor
     * store template uses and the one the classic `store_layout` theme mod
     * defaults to, so a store keeps the shape it already had. Kept as a PHP
     * comment so it does not travel into the rendered page.
     */
    ?>
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:dokan/store-sidebar -->
            <!-- wp:dokan/store-category-menu /-->

            <!-- wp:dokan/store-location-map /-->

            <!-- wp:dokan/store-open-close-hours /-->

            <!-- wp:dokan/store-contact-form /-->
            <!-- /wp:dokan/store-sidebar -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"67%"} -->
        <div class="wp-block-column" style="flex-basis:67%">
            <!-- wp:dokan/store-tab-content /-->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->
