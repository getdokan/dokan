<?php
/**
 * Render `dokan/store-info`.
 *
 * Reproduces `ul.dokan-store-info` from `templates/store-header.php` as
 * block-scoped markup. See docs/adr/0005-store-header-blocks-emit-fresh-markup.md.
 *
 * Every field carries the same server-side gate the classic template applies.
 * Block attributes are client-supplied, so a toggle may only ever *subtract* a
 * field — never reveal one the marketplace or the vendor has hidden.
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
        'storeId'       => 0,
        'showAddress'   => true,
        'showPhone'     => true,
        'showEmail'     => true,
        'showRating'    => true,
        'showOpenClose' => true,
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

$store_id = $vendor->get_id();
$items    = '';

// Address — admin privacy gate.
if ( ! empty( $attributes['showAddress'] ) && ! dokan_is_vendor_info_hidden( 'address' ) ) {
    $store_address = dokan_get_seller_short_address( $store_id, false );

    if ( ! empty( $store_address ) ) {
        $items .= sprintf(
            '<li class="dokan-store-address"><i class="fas fa-map-marker-alt"></i>%s</li>',
            wp_kses_post( $store_address )
        );
    }
}

// Phone — admin privacy gate.
if ( ! empty( $attributes['showPhone'] ) && ! dokan_is_vendor_info_hidden( 'phone' ) ) {
    $phone = $vendor->get_phone();

    if ( ! empty( $phone ) ) {
        $items .= sprintf(
            '<li class="dokan-store-phone"><i class="fas fa-mobile-alt"></i><a href="tel:%1$s">%2$s</a></li>',
            esc_attr( $phone ),
            esc_html( $phone )
        );
    }
}

// Email — two independent gates: the admin privacy option and the vendor's own setting.
if ( ! empty( $attributes['showEmail'] ) && ! dokan_is_vendor_info_hidden( 'email' ) && $vendor->show_email() ) {
    $email = $vendor->get_email();

    if ( ! empty( $email ) ) {
        $items .= sprintf(
            '<li class="dokan-store-email"><i class="far fa-envelope"></i><a href="mailto:%1$s">%1$s</a></li>',
            esc_attr( antispambot( $email ) )
        );
    }
}

// Rating — the classic header has no server-side gate here, so do not invent one.
if ( ! empty( $attributes['showRating'] ) ) {
    $items .= sprintf(
        '<li class="dokan-store-rating"><i class="fas fa-star"></i>%s</li>',
        wp_kses_post( dokan_get_readable_seller_rating( $store_id ) )
    );
}

// Opening hours — the marketplace appearance option AND the vendor's own toggle.
if (
    ! empty( $attributes['showOpenClose'] )
    && 'on' === dokan_get_option( 'store_open_close', 'dokan_appearance', 'on' )
    && $vendor->is_store_time_enabled()
) {
    $current_time = dokan_current_datetime();
    $is_open      = dokan_is_store_open( $store_id );
    $notice       = $is_open
        ? $vendor->get_store_open_notice( __( 'Store Open', 'dokan-lite' ) )
        : $vendor->get_store_close_notice( __( 'Store Closed', 'dokan-lite' ) );

    ob_start();

    // The weekly hours popover is the classic template verbatim — it is opened by a
    // CSS :hover rule this block's stylesheet reproduces, so there is no script.
    dokan_get_template_part(
        'store-header-times',
        '',
        [
            'dokan_store_times' => $vendor->get_store_time(),
            'today'             => strtolower( $current_time->format( 'l' ) ),
            'dokan_days'        => dokan_get_translated_days(),
            'current_time'      => $current_time,
            'times_heading'     => __( 'Weekly Store Timing', 'dokan-lite' ),
            'closed_status'     => __( 'CLOSED', 'dokan-lite' ),
        ]
    );

    $times = ob_get_clean();

    $items .= sprintf(
        '<li class="dokan-store-open-close"><i class="fas fa-shopping-cart"></i><div class="store-open-close-notice"><span class="store-notice">%1$s</span><span class="fas fa-angle-down"></span>%2$s</div></li>',
        esc_html( $notice ),
        $times // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by the template part.
    );
}

/*
 * Extensions add their own rows here — Pro's Germanized module is one. It fires
 * unconditionally, exactly as the classic template does; its listeners apply
 * their own privacy gates. Buffered so an otherwise-empty list can be detected.
 */
ob_start();

/** This action is documented in templates/store-header.php */
do_action( 'dokan_store_header_info_fields', $store_id );

$items .= ob_get_clean();

if ( '' === trim( $items ) ) {
    return; // Every field is hidden — emit nothing rather than an empty list.
}

printf(
    '<ul %1$s>%2$s</ul>',
    get_block_wrapper_attributes( [ 'class' => 'dokan-store-info' ] ),
    $items // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Each item is escaped as it is built.
);
