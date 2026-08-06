<?php
/**
 * Render `dokan/store-avatar`.
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
        'shape'   => 'circle',
        'size'    => 150,
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

$avatar_url = $vendor->get_avatar();

if ( empty( $avatar_url ) ) {
    return;
}

// Attributes are client-supplied: clamp the size and allowlist the shape before
// either reaches markup.
$size      = min( 400, max( 32, absint( $attributes['size'] ) ) );
$shape     = 'square' === $attributes['shape'] ? 'square' : 'circle';
$avatar_id = absint( $vendor->get_avatar_id() );
$alt       = $vendor->get_shop_name();
$img_style = sprintf( 'width:%1$dpx;height:%1$dpx;', $size );

if ( $avatar_id ) {
    $image = wp_get_attachment_image(
        $avatar_id,
        [ $size, $size ],
        false,
        [
            'class'    => 'wp-block-dokan-store-avatar__image',
            'alt'      => $alt,
            'style'    => $img_style,
            'loading'  => 'lazy',
            'decoding' => 'async',
        ]
    );
} else {
    // Gravatar or the marketplace default — a URL with no attachment behind it.
    $image = sprintf(
        '<img class="wp-block-dokan-store-avatar__image" src="%1$s" alt="%2$s" width="%3$d" height="%3$d" style="%4$s" loading="lazy" decoding="async">',
        esc_url( $avatar_url ),
        esc_attr( $alt ),
        (int) $size,
        esc_attr( $img_style )
    );
}

if ( ! empty( $attributes['isLink'] ) ) {
    $image = sprintf(
        '<a class="wp-block-dokan-store-avatar__link" href="%1$s">%2$s</a>',
        esc_url( $vendor->get_shop_url() ),
        $image
    );
}

printf(
    '<div %1$s>%2$s</div>',
    get_block_wrapper_attributes( [ 'class' => 'is-shape-' . $shape ] ),
    $image // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above.
);
