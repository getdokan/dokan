<?php
/**
 * Render `dokan/store-open-close-hours`.
 *
 * Reuses the `StoreOpenClose` widget verbatim, so the markup, the settings it
 * reads and the hooks it fires stay identical to the classic store sidebar.
 * The widget gates on `dokan_is_store_page()` and reads the `author` query var,
 * both of which `VendorResolver::render_in_store_context()` supplies.
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
        : __( 'Store Time', 'dokan-lite' );
}

/*
 * The preview vendor has no id, so the widget would bail. Render the widget's
 * own template over the preview's sample hours instead, behind the same
 * marketplace switch the widget checks.
 */
if ( ! $vendor->get_id() ) {
    if ( 'on' !== dokan_get_option( 'store_open_close', 'dokan_appearance', 'on' ) ) {
        printf(
            '<div %1$s><p class="dokan-info">%2$s</p></div>',
            get_block_wrapper_attributes( [ 'class' => 'is-editor-placeholder' ] ),
            esc_html__( 'Store opening hours are switched off in Dokan settings, so this block will not appear on the store page.', 'dokan-lite' )
        );

        return;
    }

    ob_start();

    dokan_get_template_part(
        'widgets/store-open-close',
        '',
        [
            'seller_id'        => 0,
            'dokan_store_time' => $vendor->get_store_time(),
            'dokan_days'       => dokan_get_translated_days(),
        ]
    );

    printf(
        '<div %1$s><aside class="widget dokan-store-widget dokan-store-open-close">%2$s%3$s</aside></div>',
        get_block_wrapper_attributes(),
        '' !== $widget_title ? '<h3 class="widget-title">' . esc_html( $widget_title ) . '</h3>' : '',
        ob_get_clean() // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by the template part.
    );

    return;
}

$widget_output = $resolver->render_in_store_context(
    $vendor,
    function () use ( $widget_title ) {
        the_widget(
            'WeDevs\\Dokan\\Widgets\\StoreOpenClose',
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
