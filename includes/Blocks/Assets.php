<?php

namespace WeDevs\Dokan\Blocks;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Loads the stylesheets, scripts and data Dokan's blocks need.
 *
 * Block rendering is one job and getting the assets to the page is another: the
 * front end, the editor document and the editor's iframed canvas each need a
 * different set, so they live here rather than in the block registry.
 *
 * @since DOKAN_SINCE
 */
class Assets implements Hookable {

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_block_data' ] );
        add_action( 'enqueue_block_assets', [ $this, 'enqueue_editor_preview_assets' ] );
        // After Dokan's own asset logic (@10) so store pages keep their enqueue order.
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_front_block_styles' ], 20 );
    }

    /**
     * Load the store styles when Dokan blocks are used outside a store page.
     *
     * Store pages already get these through Assets; a page built with store
     * blocks does not, and enqueuing from the render callbacks would print the
     * stylesheets in the footer, after the markup they style.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function enqueue_front_block_styles(): void {
        $post = get_post();

        if ( ! $post instanceof \WP_Post || false === strpos( $post->post_content, '<!-- wp:dokan/' ) ) {
            return;
        }

        wp_enqueue_style( 'dokan-style' );
        wp_enqueue_style( 'dokan-fontawesome' );
        wp_enqueue_style( 'dashicons' );
        wp_enqueue_script( 'dokan-script' );
    }

    /**
     * Load the front-end store styles inside the block editor canvas.
     *
     * Server-side rendered previews come back as bare HTML — the styles the
     * render callbacks enqueue never reach the editor iframe, so the same
     * stylesheets must ride `enqueue_block_assets` for preview parity.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function enqueue_editor_preview_assets(): void {
        if ( ! is_admin() ) {
            return; // The front end loads these through the block render callbacks.
        }

        $this->enqueue_preview_styles();
        $this->enqueue_preview_scripts();
    }

    /**
     * Load the front-end store styles inside the block editor canvas.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function enqueue_preview_styles(): void {
        // Star ratings inside store blocks are styled by WooCommerce, which only
        // registers its front-end stylesheet on the front end.
        if ( ! wp_style_is( 'woocommerce-general', 'registered' ) && function_exists( 'WC' ) ) {
            wp_register_style(
                'woocommerce-general',
                WC()->plugin_url() . '/assets/css/woocommerce.css',
                [],
                defined( 'WC_VERSION' ) ? WC_VERSION : null
            );
        }

        /**
         * Front-end stylesheets to load inside the block editor canvas.
         *
         * Store blocks render through Dokan's own templates, and anything those
         * templates hook into — vendor buttons, badges, colour schemes — is
         * styled by the stylesheet that registered it. Extensions add their
         * handles here so their markup previews the way it looks on the store.
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $handles Registered style handles.
         */
        $handles = apply_filters(
            'dokan_blocks_editor_preview_styles',
            [ 'dokan-style', 'dokan-fontawesome', 'dashicons', 'woocommerce-general' ]
        );

        foreach ( (array) $handles as $handle ) {
            if ( wp_style_is( $handle, 'registered' ) ) {
                wp_enqueue_style( $handle );
            }
        }

        /**
         * Extra CSS to print inside the block editor canvas.
         *
         * Appearance settings such as the colour scheme are printed inline on
         * `wp_head`, which the editor iframe never runs, so previews fall back to
         * the default palette. Extensions return their front-end CSS here to keep
         * the preview honest.
         *
         * @since DOKAN_SINCE
         *
         * @param string $css Inline CSS.
         */
        $inline_css = apply_filters( 'dokan_blocks_editor_preview_inline_css', '' );

        if ( ! empty( $inline_css ) && wp_style_is( 'dokan-style', 'enqueued' ) ) {
            wp_add_inline_style( 'dokan-style', $inline_css );
        }
    }

    /**
     * Load the editor preview scripts for Dokan blocks.
     *
     * Server rendered previews are inert HTML — nothing wires up the filter,
     * sort or layout controls the way the front end does.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function enqueue_preview_scripts(): void {
        /**
         * Script handles to load inside the block editor canvas.
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $handles Registered script handles.
         */
        $handles = apply_filters(
            'dokan_blocks_editor_preview_scripts',
            $this->get_block_handles( 'dokan/store-filter-bar', 'view_script_handles' )
        );

        foreach ( (array) $handles as $handle ) {
            if ( ! wp_script_is( $handle, 'registered' ) ) {
                continue;
            }

            // The canvas body class lands after the view script boots, so it is told where it is up front.
            wp_add_inline_script( $handle, 'window.dokanBlocksEditorPreview = true;', 'before' );
            wp_enqueue_script( $handle );
        }
    }

    /**
     * Publish server-side listing data the block editor cannot derive on its own.
     *
     * Sort options are filterable and Pro modules add to them, so the inspector
     * has to be told what exists rather than shipping a hardcoded list.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function enqueue_editor_block_data(): void {
        /**
         * Listing data handed to the block editor.
         *
         * @since DOKAN_SINCE
         *
         * @param array $data Editor data.
         */
        $data = apply_filters(
            'dokan_blocks_editor_data',
            [
                'sortOptions' => \WeDevs\Dokan\Vendor\StoreListsFilter::sort_by_options(),
                'settings'    => [
                    'openClose' => 'on' === dokan_get_option( 'store_open_close', 'dokan_appearance', 'on' ),
                    'address'   => ! dokan_is_vendor_info_hidden( 'address' ),
                    'phone'     => ! dokan_is_vendor_info_hidden( 'phone' ),
                ],
            ]
        );

        // Attached to every Dokan block: any of them may be the only one on a page.
        foreach ( [ 'dokan/store-filter-bar', 'dokan/store-list' ] as $block_name ) {
            foreach ( $this->get_block_handles( $block_name, 'editor_script_handles' ) as $handle ) {
                wp_add_inline_script( $handle, 'window.dokanBlocksData = ' . wp_json_encode( $data ) . ';', 'before' );
            }
        }
    }

    /**
     * Read a registered block's generated asset handles.
     *
     * @since DOKAN_SINCE
     *
     * @param string $block_name Block name.
     * @param string $property   Handle property on the block type.
     *
     * @return string[]
     */
    protected function get_block_handles( string $block_name, string $property ): array {
        $block = \WP_Block_Type_Registry::get_instance()->get_registered( $block_name );

        return $block instanceof \WP_Block_Type ? (array) $block->{$property} : [];
    }
}
