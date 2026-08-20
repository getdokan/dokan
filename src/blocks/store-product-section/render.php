<?php
/**
 * Render `dokan/store-product-section`.
 *
 * Reuses `templates/store-products-section.php`, so the section markup and its
 * two dynamic actions are identical to the ones the classic store page renders
 * from `dokan_store_profile_frame_after`.
 *
 * This block does NOT fire `dokan_store_profile_frame_after` itself: the
 * ProductSections manager is already attached to it at priority 20 and would
 * render every enabled section again. The block exists for merchants who want
 * to place a section explicitly — see the editor notice about the overlap.
 *
 * @since DOKAN_SINCE
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

use WeDevs\Dokan\Blocks\VendorResolver;
use WeDevs\Dokan\ProductSections\AbstractProductSection;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

$attributes = wp_parse_args(
    $attributes,
    [
        'storeId'   => 0,
        'sectionId' => 'featured',
        'title'     => '',
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

$section_id = sanitize_key( $attributes['sectionId'] );
$section    = dokan()->product_sections->{$section_id} ?? null;

$dokan_section_placeholder = static function ( $message ) {
    printf(
        '<div %1$s><p class="dokan-info">%2$s</p></div>',
        get_block_wrapper_attributes( [ 'class' => 'is-editor-placeholder' ] ),
        esc_html( $message )
    );
};

if ( ! $section instanceof AbstractProductSection ) {
    if ( $resolver->is_editor_preview() ) {
        $dokan_section_placeholder(
            __( 'This product section is no longer available. It may belong to an extension that is not active.', 'dokan-lite' )
        );
    }

    return;
}

/*
 * The marketplace gate, re-checked here regardless of block attributes. Note the
 * inverted sense: the Customizer control reads "Hide <section>", so is_enabled()
 * returns false when the merchant has switched the section off.
 */
if ( ! $section->is_enabled() ) {
    if ( $resolver->is_editor_preview() ) {
        $dokan_section_placeholder(
            __( 'This product section is hidden in Appearance settings, so it will not appear on the store page.', 'dokan-lite' )
        );
    }

    return;
}

// The preview vendor has no products to query.
if ( ! $vendor->get_id() ) {
    $dokan_section_placeholder(
        __( "The vendor's products for this section appear here on the store page.", 'dokan-lite' )
    );

    return;
}

$products = $section->get_products( $vendor->get_id() );

// No products means no section at all — not an empty heading, matching the classic page.
if ( ! $products instanceof WP_Query || ! $products->have_posts() ) {
    if ( $resolver->is_editor_preview() ) {
        $dokan_section_placeholder(
            __( 'This store has no products in this section yet.', 'dokan-lite' )
        );
    }

    return;
}

$section_title = '' !== trim( (string) $attributes['title'] )
    ? $attributes['title']
    : $section->get_section_title();

$section_output = $resolver->render_in_store_context(
    $vendor,
    function () use ( $section_id, $products, $section_title, $vendor ) {
        dokan_get_template_part(
            'store-products-section',
            '',
            [
                'section_id'    => $section_id,
                'products'      => $products,
                'section_title' => $section_title,
                'vendor'        => $vendor,
            ]
        );
    }
);

printf(
    '<div %1$s>%2$s</div>',
    get_block_wrapper_attributes( [ 'class' => 'dokan-store-product-section-block woocommerce' ] ),
    $section_output // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped template parts.
);
