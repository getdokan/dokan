<?php
/**
 * Render `dokan/store-social`.
 *
 * See docs/adr/0005-store-header-blocks-emit-fresh-markup.md for why this block
 * does not reuse `templates/store-header.php`.
 *
 * This block is also the anchor Pro's follow, support, live-chat and share
 * buttons attach to through Block Hooks — being a registered block type is all
 * that requires, so nothing here needs to know about them.
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
        'storeId'    => 0,
        'iconSize'   => 24,
        'showLabels' => false,
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

$social_fields = dokan_get_social_profile_fields();
$social_info   = $vendor->get_social_profiles();

if ( empty( $social_fields ) || empty( $social_info ) ) {
    return;
}

$icon_size = min( 96, max( 10, absint( $attributes['iconSize'] ) ) );
$items     = '';

foreach ( $social_fields as $key => $field ) {
    if ( empty( $social_info[ $key ] ) ) {
        continue;
    }

    /*
     * Most fields carry a bare Font Awesome name that needs the `fab fa-` prefix,
     * but a few already ship a complete class string. Prefixing those blindly —
     * as the classic template does — produces `fab fa-fa-brands fa-…`, which
     * renders no icon at all.
     */
    $icon       = isset( $field['icon'] ) ? trim( (string) $field['icon'] ) : '';
    $icon_class = ( '' !== $icon && false === strpos( $icon, 'fa-' ) ) ? 'fab fa-' . $icon : $icon;
    $label      = isset( $field['title'] ) ? $field['title'] : $key;

    $items .= sprintf(
        '<li class="dokan-store-social-item dokan-store-social-item--%1$s"><a class="dokan-store-social-link" href="%2$s" target="_blank" rel="noopener noreferrer"><i class="%3$s" aria-hidden="true"></i><span class="dokan-store-social-label">%4$s</span></a></li>',
        esc_attr( $key ),
        esc_url( $social_info[ $key ] ),
        esc_attr( $icon_class ),
        esc_html( $label )
    );
}

if ( '' === $items ) {
    return;
}

printf(
    '<div %1$s><ul class="dokan-store-social-list">%2$s</ul></div>',
    get_block_wrapper_attributes(
        [
			'class' => empty( $attributes['showLabels'] ) ? 'has-icons-only' : '',
			'style' => sprintf( '--dokan-social-icon-size:%dpx;', $icon_size ),
		]
    ),
    $items // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Each item is escaped as it is built.
);
