<?php
/**
 * Title: Store Listing
 * Slug: dokan/store-listing-default
 * Description: Heading, filter bar and vendor grid — the classic store listing page.
 * Categories: dokan, dokan-store-listing
 * Block Types: dokan/store-list
 * Viewport Width: 1400
 *
 * @package dokan
 * @since   DOKAN_SINCE
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide">
    <!-- wp:heading {"level":1} -->
    <h1 class="wp-block-heading"><?php esc_html_e( 'Our Stores', 'dokan-lite' ); ?></h1>
    <!-- /wp:heading -->

    <!-- wp:dokan/store-filter-bar /-->

    <!-- wp:dokan/store-list {"columns":3} /-->
</div>
<!-- /wp:group -->
