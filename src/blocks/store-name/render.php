<?php
/**
 * Render `dokan/store-name`.
 *
 * Emits its own markup rather than reusing `templates/store-header.php`: that
 * template is one monolithic tree whose styles hang off a seven-level selector
 * chain no sibling block can reproduce. See
 * docs/adr/0005-store-header-blocks-emit-fresh-markup.md.
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
        'level'   => 1,
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

$shop_name = $vendor->get_shop_name();

if ( '' === trim( (string) $shop_name ) ) {
    return;
}

$level        = absint( $attributes['level'] );
$heading_tag  = in_array( $level, [ 1, 2, 3, 4, 5, 6 ], true ) ? 'h' . $level : 'h1';

/*
 * Pro's verification badge renders from this action, and the classic template
 * passes the Vendor object — not a WP_User and not an id. The listener calls
 * $vendor->get_id(), so anything else is fatal. Run it inside store context so
 * callbacks that gate on dokan_is_store_page() still produce output when the
 * block sits on an ordinary page.
 */
$after_name = $resolver->render_in_store_context(
    $vendor,
    function () use ( $vendor ) {
        /** This action is documented in templates/store-header.php */
        do_action( 'dokan_store_header_after_store_name', $vendor );
    }
);

printf( '<%1$s %2$s>', esc_html( $heading_tag ), get_block_wrapper_attributes() );

if ( ! empty( $attributes['isLink'] ) ) {
    printf(
        '<a class="wp-block-dokan-store-name__link" href="%1$s">%2$s</a>',
        esc_url( $vendor->get_shop_url() ),
        esc_html( $shop_name )
    );
} else {
    echo esc_html( $shop_name );
}

echo $after_name; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped template parts by the listeners.

printf( '</%s>', esc_html( $heading_tag ) );
