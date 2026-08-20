<?php
/**
 * Render `dokan/store-tab-content`.
 *
 * Replaces the body of `templates/store.php` and `templates/store-toc.php`, and
 * carries the hook-continuity guarantee of the whole FSE effort: Pro's coupons,
 * vacation notice and order discount, plus Lite's own product sections and
 * product sort form, all hang off `dokan_store_profile_frame_after` and keep
 * working here before a single Pro block exists.
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
        'storeId'        => 0,
        'columns'        => 0,
        'showPagination' => true,
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

$store_id = $vendor->get_id();

/*
 * The wrapper must carry `woocommerce`: every product-grid rule in WooCommerce is
 * scoped as `.woocommerce ul.products`, and the classic page picked the class up
 * from `<div id="dokan-content" class="store-page-wrap woocommerce">`.
 */
$dokan_tab_wrapper = static function ( $extra_class = '' ) {
    return get_block_wrapper_attributes(
        [ 'class' => trim( 'dokan-store-tab-content-block woocommerce ' . $extra_class ) ]
    );
};

/*
 * Editor preview. PreviewVendor has no products, and its `data` is null — firing
 * dokan_store_profile_frame_after with that would hand null to five listeners
 * that dereference it. Render a static stand-in and stop.
 */
if ( ! $store_id ) {
    printf(
        '<div %1$s><p class="dokan-info">%2$s</p></div>',
        $dokan_tab_wrapper( 'is-editor-placeholder' ),
        esc_html__( "The vendor's products appear here on the store page.", 'dokan-lite' )
    );

    return;
}

// Resolve before entering store context, which would otherwise make every
// vendor look like the one being viewed.
$current_tab = dokan_get_current_store_tab( $store_id );

// Terms and conditions — the body of templates/store-toc.php.
if ( 'terms_and_conditions' === $current_tab ) {
    $dokan_tnc = $vendor->get_store_tnc();

    // The classic template omits the heading entirely when the vendor has set
    // no terms, rather than printing an empty section.
    $dokan_toc_body = empty( $dokan_tnc )
        ? ''
        : sprintf(
            '<h2 class="headline">%1$s</h2><div>%2$s</div>',
            esc_html__( 'Terms And Conditions', 'dokan-lite' ),
            wp_kses_post( wpautop( wptexturize( $dokan_tnc ) ) )
        );

    printf(
        '<div %1$s><div id="store-toc-wrapper"><div id="store-toc">%2$s</div></div></div>',
        $dokan_tab_wrapper( 'store-toc-wrap' ),
        $dokan_toc_body // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above.
    );

    return;
}

/*
 * Extensions render their tab bodies here. Pro's Reviews and Biography tabs use
 * this instead of taking over `template_include`, which is broken on block
 * themes — see docs/adr/0006-pro-store-tabs-render-as-bodies-not-template-takeovers.md.
 */
if ( '' !== $current_tab && 'products' !== $current_tab ) {
    $tab_body = $resolver->render_in_store_context(
        $vendor,
        function () use ( $current_tab, $vendor, $attributes ) {
            /**
             * Renders the body of a store tab that is not one of Lite's own.
             *
             * @since DOKAN_SINCE
             *
             * @param string                       $current_tab Tab key from `dokan_get_store_tabs()`.
             * @param \WeDevs\Dokan\Vendor\Vendor   $vendor      Vendor whose store is being rendered.
             * @param array                        $attributes  Block attributes.
             */
            do_action( 'dokan_block_store_tab_content', $current_tab, $vendor, $attributes );
        }
    );

    if ( '' !== trim( $tab_body ) ) {
        printf(
            '<div %1$s>%2$s</div>',
            $dokan_tab_wrapper(),
            $tab_body // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped template parts by the listeners.
        );

        return;
    }
}

// --- Products tab -------------------------------------------------------

/*
 * Fired at most once per request. Two tab-content blocks on a page would
 * otherwise duplicate the vacation notice, coupons and product sections — the
 * same guard the store listing filter bar uses for its own shared action.
 *
 * The signature is the classic one: a WP_User (Vendor::$data), never the Vendor.
 */
$dokan_before_products = '';

if ( ! did_action( 'dokan_store_profile_frame_after' ) && $vendor->data instanceof WP_User ) {
    $dokan_before_products = $resolver->render_in_store_context(
        $vendor,
        function () use ( $vendor ) {
            /** This action is documented in templates/store.php */
            do_action( 'dokan_store_profile_frame_after', $vendor->data, $vendor->get_shop_info() );
        }
    );
}

/*
 * On the vendor's own store page the main query already carries their products,
 * their ordering and their attribute filters — `Rewrites::store_query_filter()`
 * shapes it on `pre_get_posts`, and reusing it is what keeps pagination, the
 * sort form and Pro's filters working. Anywhere else the main query belongs to
 * whatever page the block was dropped on, so it has to be queried explicitly.
 */
$dokan_own_page = '' !== $current_tab;

if ( $dokan_own_page ) {
    $dokan_query = $GLOBALS['wp_query'];
} else {
    $dokan_query = new WP_Query(
        [
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'author'         => $store_id,
            'posts_per_page' => absint( dokan_get_option( 'store_products_per_page', 'dokan_general', 12 ) ),
            'paged'          => max( 1, absint( get_query_var( 'paged' ) ) ),
        ]
    );
}

ob_start();

if ( $dokan_query->have_posts() ) {
    echo '<div class="seller-items">';

    /*
     * Columns is declared in block.json, so it must do something. Zero means
     * "theme default", matching how WooCommerce itself resolves the loop. The
     * loop prop is request-global, so everything here stays inside the guard:
     * reading it outside would make WooCommerce materialise the whole loop
     * state (a potential option write) even for blocks left on the default.
     */
    $dokan_columns      = min( 6, absint( $attributes['columns'] ) );
    $dokan_prev_columns = null;

    if ( $dokan_columns > 0 ) {
        $dokan_prev_columns = wc_get_loop_prop( 'columns' );
        wc_set_loop_prop( 'columns', $dokan_columns );
    }

    woocommerce_product_loop_start();

    while ( $dokan_query->have_posts() ) {
        $dokan_query->the_post();
        wc_get_template_part( 'content', 'product' );
    }

    woocommerce_product_loop_end();

    if ( null !== $dokan_prev_columns ) {
        wc_set_loop_prop( 'columns', $dokan_prev_columns );
    }

    echo '</div>';

    if ( ! empty( $attributes['showPagination'] ) ) {
        if ( $dokan_own_page ) {
            dokan_content_nav( 'nav-below' );
        } else {
            echo wp_kses_post(
                paginate_links(
                    [
                        'total'   => (int) $dokan_query->max_num_pages,
                        'current' => max( 1, absint( get_query_var( 'paged' ) ) ),
                        'type'    => 'list',
                    ]
                )
            );
        }
    }

    // Only the block's own query needs resetting; doing it for the main query
    // would leave the global $post pointing at the last product in the loop.
    // The WooCommerce loop state our loop seeded is reset for the same reason:
    // left behind, a later [products] loop on the page would inherit this
    // block's totals and print "Showing 0 results" with no pagination.
    if ( ! $dokan_own_page ) {
        wp_reset_postdata();

        if ( function_exists( 'wc_reset_loop' ) ) {
            wc_reset_loop();
        }
    }
} else {
    printf(
        '<p class="dokan-info">%s</p>',
        esc_html__( 'No products were found of this vendor!', 'dokan-lite' )
    );
}

$dokan_products = ob_get_clean();

printf(
    '<div %1$s>%2$s%3$s</div>',
    $dokan_tab_wrapper(),
    $dokan_before_products, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped template parts by the listeners.
    $dokan_products // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped WooCommerce template parts.
);
