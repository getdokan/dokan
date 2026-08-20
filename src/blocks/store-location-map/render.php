<?php
/**
 * Render `dokan/store-location-map`.
 *
 * Reuses the `StoreLocation` widget verbatim, so the markup, the settings it
 * reads and the hooks it fires stay identical to the classic store sidebar.
 * The widget gates on `dokan_is_store_page()` and reads the `author` query var,
 * both of which `VendorResolver::render_in_store_context()` supplies — which is
 * what lets the block work on an ordinary page with a pinned vendor.
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
        'storeId'   => 0,
        'title'     => '',
        'showTitle' => true,
    ]
);

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

/*
 * An empty title is a one-way door without this toggle: the widget falls back
 * to its default heading, so there would be no way to render it heading-less.
 * The widgets themselves already suppress the heading for an empty title.
 */
$widget_title = '';

if ( ! empty( $attributes['showTitle'] ) ) {
    $widget_title = '' !== trim( (string) $attributes['title'] )
        ? $attributes['title']
        : __( 'Store Location', 'dokan-lite' );
}

// The preview vendor has no id, so the widget would bail — show why instead.
if ( ! $vendor->get_id() ) {
    printf(
        '<div %1$s><p class="dokan-info">%2$s</p></div>',
        get_block_wrapper_attributes( [ 'class' => 'is-editor-placeholder' ] ),
        esc_html__( 'The store location map appears here on the store page. It needs a map API key in Dokan settings and a location on the vendor\'s profile.', 'dokan-lite' )
    );

    return;
}

$widget_output = $resolver->render_in_store_context(
    $vendor,
    function () use ( $widget_title ) {
        the_widget(
            'WeDevs\\Dokan\\Widgets\\StoreLocation',
            [ 'title' => $widget_title ],
            [
                'before_widget' => '<aside class="widget dokan-store-widget %1$s">',
                'after_widget'  => '</aside>',
                'before_title'  => '<h3 class="widget-title">',
                'after_title'   => '</h3>',
            ]
        );
    }
);

if ( '' === trim( $widget_output ) ) {
    return; // Nothing configured for this vendor — the classic sidebar shows nothing either.
}

printf(
    '<div %1$s>%2$s</div>',
    get_block_wrapper_attributes(),
    $widget_output // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped widget templates.
);
