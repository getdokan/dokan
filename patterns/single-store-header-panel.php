<?php
/**
 * Title: Store Header, Panel
 * Slug: dokan/single-store-header-panel
 * Description: The classic default store header: a panel holding the profile picture, name and details beside the store banner.
 * Categories: dokan-store
 * Block Types: dokan/store-banner, dokan/store-name
 * Keywords: store, vendor, header, panel, classic, default
 * Viewport Width: 1200
 *
 * @package dokan
 * @since   DOKAN_SINCE
 *
 * Stands in for the classic `store_header_template` "Default Layout", which is
 * what every store using the classic template renders today. That layout floats
 * the panel over the banner with a diagonal edge; blocks place the two side by
 * side instead, which reads the same without the fixed-position markup the
 * classic stylesheet needs. See docs/adr/0005-store-header-blocks-emit-fresh-markup.md.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<!-- wp:group {"align":"full","className":"dokan-single-store-header is-panel","style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"},"padding":{"top":"0","bottom":"0"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained","contentSize":"100%"}} -->
<div class="wp-block-group alignfull dokan-single-store-header is-panel has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:0;padding-bottom:0;margin-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:columns {"verticalAlignment":"stretch","isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"left":"0"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-stretch">
        <!-- wp:column {"verticalAlignment":"center","width":"38%","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|20"}}} -->
        <div class="wp-block-column is-vertically-aligned-center" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40);flex-basis:38%">
            <!-- wp:dokan/store-avatar {"shape":"circle","size":110} /-->

            <!-- wp:dokan/store-name {"level":1,"style":{"typography":{"fontSize":"1.75rem"}}} /-->

            <!-- wp:dokan/store-info /-->

            <!-- wp:dokan/store-social /-->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"stretch","width":"62%"} -->
        <div class="wp-block-column is-vertically-aligned-stretch" style="flex-basis:62%">
            <!-- wp:dokan/store-banner {"height":420} /-->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->
