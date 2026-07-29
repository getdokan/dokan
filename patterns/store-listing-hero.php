<?php
/**
 * Title: Store Listing with Hero
 * Slug: dokan/store-listing-hero
 * Description: A search-first landing page: hero cover with store search, then the vendor grid.
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
<!-- wp:cover {"dimRatio":60,"overlayColor":"contrast","minHeight":320,"align":"full","layout":{"type":"constrained"}} -->
<div class="wp-block-cover alignfull" style="min-height:320px">
    <span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-60 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:heading {"textAlign":"center","level":1,"textColor":"base"} -->
        <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color"><?php esc_html_e( 'Find your favorite store', 'dokan-lite' ); ?></h1>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","textColor":"base"} -->
        <p class="has-text-align-center has-base-color has-text-color"><?php esc_html_e( 'Browse independent vendors from all over the marketplace.', 'dokan-lite' ); ?></p>
        <!-- /wp:paragraph -->

        <!-- wp:dokan/store-filter-bar {"showStoreCount":false,"showSort":false,"showViewToggle":false} /-->
    </div>
</div>
<!-- /wp:cover -->

<!-- wp:group {"align":"wide","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide">
    <!-- wp:dokan/store-list {"columns":3} /-->
</div>
<!-- /wp:group -->
