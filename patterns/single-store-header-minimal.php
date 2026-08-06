<?php
/**
 * Title: Store Header, No Banner
 * Slug: dokan/single-store-header-minimal
 * Description: A compact store header with no banner: profile picture, name and info on the left, social links on the right.
 * Categories: dokan-store
 * Block Types: dokan/store-name
 * Keywords: store, vendor, header, compact
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
        <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
            <div class="wp-block-group">
                <!-- wp:dokan/store-avatar {"shape":"square","size":100} /-->

                <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|10"}},"layout":{"type":"default"}} -->
                <div class="wp-block-group">
                    <!-- wp:dokan/store-name {"level":1} /-->

                    <!-- wp:dokan/store-info /-->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:dokan/store-social {"showLabels":false} /-->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->
