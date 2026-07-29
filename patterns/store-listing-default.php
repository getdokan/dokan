<?php
/**
 * Title: Store Listing
 * Slug: dokan/store-listing-default
 * Description: The store listing page: filter bar and the vendor grid.
 * Categories: dokan-store-listing
 * Block Types: dokan/store-list
 * Viewport Width: 1100
 *
 * @package dokan
 * @since   DOKAN_SINCE
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<!-- wp:group {"align":"wide","className":"dokan-store-listing","style":{"spacing":{"blockGap":"var:preset|spacing|40","margin":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group alignwide dokan-store-listing" style="margin-top:var(--wp--preset--spacing--40);margin-bottom:var(--wp--preset--spacing--40)">
    <!-- wp:dokan/store-filter-bar /-->

    <!-- wp:dokan/store-list /-->
</div>
<!-- /wp:group -->
