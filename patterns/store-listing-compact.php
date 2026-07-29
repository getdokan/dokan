<?php
/**
 * Title: Compact Store Grid
 * Slug: dokan/store-listing-compact
 * Description: A bare vendor grid section to drop into any page.
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
    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading"><?php esc_html_e( 'Featured Stores', 'dokan-lite' ); ?></h2>
    <!-- /wp:heading -->

    <!-- wp:dokan/store-list {"columns":4,"perPage":8} /-->
</div>
<!-- /wp:group -->
