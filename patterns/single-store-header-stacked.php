<?php
/**
 * Title: Store Header, Stacked
 * Slug: dokan/single-store-header-stacked
 * Description: A centred store header: banner, then profile picture, name, info and social links stacked beneath it.
 * Categories: dokan-store
 * Block Types: dokan/store-banner, dokan/store-name
 * Keywords: store, vendor, header, centered, stacked
 * Viewport Width: 1200
 *
 * @package dokan
 * @since   DOKAN_SINCE
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<!-- wp:group {"align":"full","className":"dokan-single-store-header","style":{"spacing":{"blockGap":"var:preset|spacing|30","margin":{"bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull dokan-single-store-header" style="margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:dokan/store-banner {"align":"full"} /-->

    <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
    <div class="wp-block-group">
        <!-- wp:dokan/store-avatar {"shape":"circle","size":150,"align":"center"} /-->

        <!-- wp:dokan/store-name {"level":1,"textAlign":"center"} /-->

        <!-- wp:dokan/store-info /-->

        <!-- wp:dokan/store-social /-->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
