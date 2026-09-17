<?php

namespace WeDevs\Dokan\Blocks;

use WeDevs\Dokan\Vendor\Vendor;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Resolves the vendor a store block should render.
 *
 * Single source of truth for vendor context across every store block:
 * explicit block context, then the queried store page, then a preview
 * vendor inside the editor, then nothing.
 *
 * @since DOKAN_SINCE
 */
class VendorResolver {

    /**
     * Resolve the vendor for a block render.
     *
     * Resolution order: the vendor the block explicitly targets, the vendor
     * provided through block context, the vendor whose store page is being
     * viewed, then a preview stand-in inside the editor.
     *
     * @since DOKAN_SINCE
     *
     * @param array $block_context Block context (checks `dokan/storeId`).
     * @param array $attributes    Block attributes (checks `storeId`).
     *
     * @return Vendor|null Null means "render nothing" (front end, outside any store context).
     */
    public function resolve( array $block_context = [], array $attributes = [] ): ?Vendor {
        if ( ! empty( $attributes['storeId'] ) ) {
            $vendor = dokan()->vendor->get( absint( $attributes['storeId'] ) );

            if ( $vendor->get_id() ) {
                return $vendor;
            }
        }

        if ( ! empty( $block_context['dokan/storeId'] ) ) {
            $vendor = dokan()->vendor->get( absint( $block_context['dokan/storeId'] ) );

            if ( $vendor->get_id() ) {
                return $vendor;
            }
        }

        $store_slug = get_query_var( dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ) );

        if ( ! empty( $store_slug ) ) {
            $store_user = get_user_by( 'slug', $store_slug );

            if ( $store_user && dokan_is_user_seller( $store_user->ID ) ) {
                return dokan()->vendor->get( $store_user->ID );
            }
        }

        if ( $this->is_editor_preview() ) {
            return new PreviewVendor();
        }

        return null;
    }

    /**
     * Run a renderer with the queried store pointing at the given vendor.
     *
     * Store templates and the legacy store widgets read the vendor from the
     * `author` and store query vars, and several of them only produce real
     * output while `dokan_is_store_page()` is true — outside it, page builder
     * integrations swap in placeholder data meant for their editors. Blocks can
     * live on any page, so the context is set up for the duration of the render
     * and restored afterwards.
     *
     * @since DOKAN_SINCE
     *
     * @param Vendor   $vendor   Vendor being rendered.
     * @param callable $renderer Renderer that echoes its output.
     *
     * @return string
     */
    public function render_in_store_context( Vendor $vendor, callable $renderer ): string {
        $store_query_var = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );
        $previous_author = get_query_var( 'author' );
        $previous_store  = get_query_var( $store_query_var );

        set_query_var( 'author', $vendor->get_id() );
        set_query_var( $store_query_var, $vendor->data->user_nicename ?? '' );

        ob_start();

        // Restored even if the renderer throws, or the swapped store context leaks
        // into whatever renders next in this request.
        try {
            $renderer();
        } finally {
            $output = ob_get_clean();

            set_query_var( 'author', $previous_author );
            set_query_var( $store_query_var, $previous_store );
        }

        return (string) $output;
    }

    /**
     * Whether the current request is an editor preview render.
     *
     * Block render callbacks only execute for editor previews over the REST API
     * (`/wp/v2/block-renderer` for ServerSideRender, template/pattern reads in the
     * Site Editor), and those requests carry `context=edit`. `is_admin()` covers
     * the widgets screen and classic-editor previews.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_editor_preview(): bool {
        if ( defined( 'REST_REQUEST' ) && REST_REQUEST && 'edit' === filter_input( INPUT_GET, 'context' ) ) {
            return true;
        }

        return is_admin();
    }
}
