<?php
/**
 * Render `dokan/store-banner`.
 *
 * See docs/adr/0005-store-header-blocks-emit-fresh-markup.md for why this block
 * does not reuse `templates/store-header.php`.
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
        'height'  => 0,
        'isLink'  => false,
    ]
);

/*
 * Store pages already carry these, but a block can sit on any page — and blocks
 * placed in a block template are not in post_content, so the content sniff in
 * Blocks\Manager never sees them. Enqueue here rather than relying on it.
 */
wp_enqueue_style( 'dokan-style' );
wp_enqueue_style( 'dokan-fontawesome' );

$resolver = dokan_get_container()->get( VendorResolver::class );
$vendor   = $resolver->resolve( $block->context ?? [], $attributes );

if ( ! $vendor ) {
    return; // Not a store context and not an editor preview — render nothing.
}

$banner_url = $vendor->get_banner();
$height     = absint( $attributes['height'] );
$height     = $height > 0 ? $height : absint( dokan_get_vendor_store_banner_height() );
$width      = absint( dokan_get_vendor_store_banner_width() );

// A vendor with no banner renders nothing on the front end; the editor needs a
// visible frame so the block can still be selected and positioned.
if ( empty( $banner_url ) ) {
    if ( ! $resolver->is_editor_preview() ) {
        return;
    }

    printf(
        '<div %1$s><div class="wp-block-dokan-store-banner__placeholder" style="height:%2$dpx">%3$s</div></div>',
        get_block_wrapper_attributes(),
        (int) $height,
        esc_html__( 'Store banner', 'dokan-lite' )
    );

    return;
}

$banner_id = absint( $vendor->get_banner_id() );
$alt       = $vendor->get_shop_name();
$img_style = sprintf( 'height:%dpx;', $height );

if ( $banner_id ) {
    $image = wp_get_attachment_image(
        $banner_id,
        'full',
        false,
        [
            'class'    => 'wp-block-dokan-store-banner__image',
            'alt'      => $alt,
            'style'    => $img_style,
            'loading'  => 'lazy',
            'decoding' => 'async',
        ]
    );
} else {
    // Marketplace default banner (or the preview stand-in) — a URL with no attachment.
    $image = sprintf(
        '<img class="wp-block-dokan-store-banner__image" src="%1$s" alt="%2$s" width="%3$d" height="%4$d" style="%5$s" loading="lazy" decoding="async">',
        esc_url( $banner_url ),
        esc_attr( $alt ),
        (int) $width,
        (int) $height,
        esc_attr( $img_style )
    );
}

if ( ! empty( $attributes['isLink'] ) ) {
    $image = sprintf(
        '<a class="wp-block-dokan-store-banner__link" href="%1$s">%2$s</a>',
        esc_url( $vendor->get_shop_url() ),
        $image
    );
}

printf(
    '<figure %1$s>%2$s</figure>',
    get_block_wrapper_attributes(),
    $image // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above.
);
