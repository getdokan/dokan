<?php
/**
 * Render `dokan/store-sidebar`.
 *
 * The block-theme replacement for the `sidebar-store` widget area. Its children
 * are the content, so the widget-area plumbing of `templates/store-sidebar.php`
 * is dropped — but both of its actions are preserved, because Pro's vendor
 * verification widget renders from `dokan_sidebar_store_after` and would
 * otherwise have nowhere to go on a block theme.
 *
 * @since DOKAN_SINCE
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content — inner blocks, already rendered.
 * @var WP_Block $block      Block instance.
 */

use WeDevs\Dokan\Blocks\VendorResolver;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

$attributes = wp_parse_args( $attributes, [ 'storeId' => 0 ] );

/*
 * Store pages already carry these, but a block can sit on any page — and blocks
 * placed in a block template are not in post_content, so the content sniff in
 * Blocks\Manager never sees them. Enqueue here rather than relying on it.
 */
wp_enqueue_style( 'dokan-style' );

// Font Awesome is opt-out in Appearance settings; honour that here too.
if ( 'off' === dokan_get_option( 'disable_dokan_fontawesome', 'dokan_appearance', 'off' ) ) {
    wp_enqueue_style( 'dokan-fontawesome' );
}

$resolver = dokan_get_container()->get( VendorResolver::class );
$vendor   = $resolver->resolve( $block->context ?? [], $attributes );

if ( ! $vendor ) {
    return; // Not a store context and not an editor preview — render nothing.
}

$before = '';
$after  = '';

/*
 * Both actions take a WP_User and the shop-info array, exactly as
 * templates/store-sidebar.php passes them — never the Vendor. Guarded so two
 * sidebars on one page do not render Pro's verification widget twice.
 */
if ( $vendor->data instanceof WP_User ) {
    $store_info = $vendor->get_shop_info();

    if ( ! did_action( 'dokan_sidebar_store_before' ) ) {
        $before = $resolver->render_in_store_context(
            $vendor,
            function () use ( $vendor, $store_info ) {
                /** This action is documented in templates/store-sidebar.php */
                do_action( 'dokan_sidebar_store_before', $vendor->data, $store_info );
            }
        );
    }

    if ( ! did_action( 'dokan_sidebar_store_after' ) ) {
        $after = $resolver->render_in_store_context(
            $vendor,
            function () use ( $vendor, $store_info ) {
                /** This action is documented in templates/store-sidebar.php */
                do_action( 'dokan_sidebar_store_after', $vendor->data, $store_info );
            }
        );
    }
}

printf(
    '<div %1$s role="complementary"><div class="dokan-widget-area widget-collapse">%2$s%3$s%4$s</div></div>',
    get_block_wrapper_attributes( [ 'class' => 'dokan-store-sidebar' ] ),
    $before, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped template parts by the listeners.
    $content, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks, already rendered by WP_Block::render().
    $after // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped template parts by the listeners.
);
