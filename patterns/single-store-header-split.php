<?php
/**
 * Title: Store Header, Split
 * Slug: dokan/single-store-header-split
 * Description: A store header with no banner: a large profile picture beside the name, info and social links.
 * Categories: dokan-store
 * Block Types: dokan/store-name, dokan/store-avatar
 * Keywords: store, vendor, header, split
 * Viewport Width: 1200
 *
 * @package dokan
 * @since   DOKAN_SINCE
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<!-- wp:group {"align":"wide","className":"dokan-single-store-header","style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide dokan-single-store-header" style="margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:columns {"verticalAlignment":"center"} -->
    <div class="wp-block-columns are-vertically-aligned-center">
        <!-- wp:column {"verticalAlignment":"center","width":"30%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:30%">
            <!-- wp:dokan/store-avatar {"shape":"circle","size":180} /-->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"center","width":"70%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:70%">
            <!-- wp:dokan/store-name {"level":1} /-->

            <!-- wp:dokan/store-info /-->

            <!-- wp:dokan/store-social /-->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->
