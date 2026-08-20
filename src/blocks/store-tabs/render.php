<?php
/**
 * Render `dokan/store-tabs`.
 *
 * Reproduces the `.dokan-store-tabs` region of `templates/store-header.php`.
 * Because the tab list comes from `dokan_get_store_tabs()`, Pro's Reviews and
 * Biography tabs appear here with no block-side work — the same as on the
 * classic page.
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

$store_id   = $vendor->get_id();
$store_tabs = dokan_get_store_tabs( $store_id );

if ( empty( $store_tabs ) ) {
    return; // Mirrors the classic template, which omits the region entirely.
}

/*
 * Resolve the active tab BEFORE entering store context: render_in_store_context()
 * sets the store query var, after which "is this vendor's page being viewed?"
 * would answer yes for every vendor.
 */
$active_tab = dokan_get_current_store_tab( $store_id );
$is_preview = $resolver->is_editor_preview() && ! $store_id;

if ( $is_preview && '' === $active_tab ) {
    $active_tab = 'products'; // Give the preview something to highlight.
}

$items = '';

foreach ( $store_tabs as $key => $store_tab ) {
    $tab_url = isset( $store_tab['url'] ) ? $store_tab['url'] : '';

    // The classic template skips url-less tabs; the preview vendor has no real
    // urls at all, so give it inert ones rather than dropping every tab.
    if ( empty( $tab_url ) ) {
        if ( ! $is_preview ) {
            continue;
        }

        $tab_url = '#';
    }

    $items .= sprintf(
        '<li class="dokan-store-tab dokan-store-tab--%1$s%2$s"><a href="%3$s"%4$s>%5$s</a></li>',
        esc_attr( $key ),
        $key === $active_tab ? ' is-active' : '',
        esc_url( $tab_url ),
        $key === $active_tab ? ' aria-current="page"' : '',
        esc_html( isset( $store_tab['title'] ) ? $store_tab['title'] : $key )
    );
}

if ( '' === $items ) {
    return;
}

/*
 * Pro's share, support and live-chat buttons render from this action into the
 * button row beside the tabs. It takes the store id — not the Vendor object.
 * Run it in store context so callbacks gating on dokan_is_store_page() work
 * when the block sits on an ordinary page.
 */
$buttons = $resolver->render_in_store_context(
    $vendor,
    function () use ( $store_id ) {
        /** This action is documented in templates/store-header.php */
        do_action( 'dokan_after_store_tabs', $store_id );
    }
);

printf(
    '<nav %1$s><ul class="dokan-modules-button">%2$s</ul><ul class="dokan-store-tab-list">%3$s</ul></nav>',
    get_block_wrapper_attributes( [ 'class' => 'dokan-store-tabs' ] ),
    $buttons, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped template parts by the listeners.
    $items // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Each item is escaped as it is built.
);
