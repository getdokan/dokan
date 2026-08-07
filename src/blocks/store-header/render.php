<?php
/**
 * Render `dokan/store-header`.
 *
 * One block that renders whichever store header layout the marketplace has
 * chosen, so switching layouts is a dropdown rather than deleting blocks and
 * inserting a pattern. It renders the header patterns themselves rather than
 * reimplementing them, so the two can never drift apart.
 *
 * Precedence follows the rule the rest of the blocks use: the Appearance
 * setting supplies the default, and the block attribute overrides it locally.
 *
 * @since DOKAN_SINCE
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

use WeDevs\Dokan\Blocks\VendorResolver;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

$attributes = wp_parse_args(
    $attributes,
    [
        'storeId' => 0,
        'layout'  => '',
    ]
);

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

$layout = sanitize_key( $attributes['layout'] );

if ( '' === $layout ) {
    /*
     * Follow the classic Appearance setting, so a marketplace that picked a
     * header before moving to a block theme keeps the look it had. The classic
     * keys do not match the pattern names, because the classic "default" is the
     * panel layout and the others shift along by one.
     */
    $classic = dokan_get_option( 'store_header_template', 'dokan_appearance', 'default' );

    $layout = [
        'default' => 'panel',
        'layout1' => 'default',
        'layout2' => 'stacked',
        'layout3' => 'minimal',
    ][ $classic ] ?? 'panel';
}

/**
 * Header layouts this block can render, as pattern slug => label.
 *
 * Extensions add their own header patterns here to make them selectable from
 * the block, without shipping a second copy of the markup.
 *
 * @since DOKAN_SINCE
 *
 * @param array $layouts Map of layout key => registered pattern slug.
 */
$layouts = apply_filters(
    'dokan_store_header_layouts',
    [
        'panel'   => 'dokan/single-store-header-panel',
        'default' => 'dokan/single-store-header-default',
        'stacked' => 'dokan/single-store-header-stacked',
        'split'   => 'dokan/single-store-header-split',
        'minimal' => 'dokan/single-store-header-minimal',
    ]
);

if ( ! isset( $layouts[ $layout ] ) ) {
    $layout = 'panel';
}

/*
 * `dokan_store_header_layouts` is public, so a header pattern could be pointed
 * at one that contains this block. Rendering that would recurse until memory
 * runs out, which is a fatal rather than a broken layout — cheap to prevent.
 */
static $rendering = false;

if ( $rendering ) {
    return;
}

$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( $layouts[ $layout ] );

if ( ! $pattern || empty( $pattern['content'] ) ) {
    return; // The pattern was deregistered — render nothing rather than a broken frame.
}

/*
 * The pattern's blocks resolve their own vendor. Block context does not reach
 * blocks parsed from a string, so run the whole thing in store context instead:
 * that is what lets this block be pinned to a vendor on an ordinary page and
 * have the header follow.
 */
$rendering = true;

$header = $resolver->render_in_store_context(
    $vendor,
    function () use ( $pattern ) {
        echo do_blocks( $pattern['content'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered by the block renderer.
    }
);

$rendering = false;

if ( '' === trim( $header ) ) {
    return;
}

printf(
    '<div %1$s>%2$s</div>',
    get_block_wrapper_attributes( [ 'class' => 'is-header-' . $layout ] ),
    $header // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered by the block renderer.
);
