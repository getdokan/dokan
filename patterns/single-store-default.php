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
 * templates/block-templates/single-store.html deliberately does NOT reference
 * this pattern, and its header differs by design: the template ships the panel
 * header fully exploded so every block is selectable on first open (a
 * `wp:pattern` reference gets stamped with `metadata.patternName` and
 * content-locked, and the single `dokan/store-header` block seals its pieces).
 * The cost, accepted knowingly: on the shipped template the Appearance ->
 * Store Header Template setting has no effect until the site owner swaps the
 * loose header for the `dokan/store-header` block. Keep the template's tabs +
 * sidebar body in step with this pattern when the default layout changes; this
 * pattern remains what gets inserted on ordinary pages.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<!-- wp:group {"align":"full","className":"dokan-single-store","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull dokan-single-store">
    <?php
    /*
     * A single header block rather than the header's blocks loose, so changing
     * layout is a dropdown in the block's sidebar — and, left on its default,
     * follows the marketplace's Store Header Template setting. A merchant who
     * wants to arrange the header themselves replaces this one block with any
     * of the header patterns, which insert as ordinary editable blocks.
     */
    ?>
    <!-- wp:dokan/store-header /-->

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
