<?php
/**
 * Title: Store Header
 * Slug: dokan/single-store-header-default
 * Description: Store banner with the profile picture, name, info and social links below it.
 * Categories: dokan-store
 * Block Types: dokan/store-banner, dokan/store-name
 * Keywords: store, vendor, header, banner
 * Viewport Width: 1200
 *
 * @package dokan
 * @since   DOKAN_SINCE
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<!-- wp:group {"align":"full","className":"dokan-single-store-header","style":{"spacing":{"blockGap":"var:preset|spacing|40","margin":{"bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull dokan-single-store-header" style="margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:dokan/store-banner {"align":"full"} /-->

    <!-- wp:columns {"verticalAlignment":"center","align":"wide"} -->
    <div class="wp-block-columns alignwide are-vertically-aligned-center">
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
</div>
<!-- /wp:group -->
