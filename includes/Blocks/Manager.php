<?php

namespace WeDevs\Dokan\Blocks;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Registers Dokan's Gutenberg block types and the `dokan` block category.
 *
 * Lite owns the `dokan` block namespace and category; Pro and modules
 * contribute their own block collections through the
 * `dokan_block_type_collections` filter — the same Lite → Pro extension
 * pattern used for REST controllers (`dokan_rest_api_class_map`).
 *
 * @since DOKAN_SINCE
 */
class Manager implements Hookable {

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'init', [ $this, 'load_template_tags_for_block_rendering' ], 5 );
        add_action( 'init', [ $this, 'register_block_types' ] );
        // Before Pro's category registration (@10) so the dedupe guard wins in either load order.
        add_filter( 'block_categories_all', [ $this, 'register_block_category' ], 9 );
        add_action( 'enqueue_block_assets', [ $this, 'enqueue_editor_preview_styles' ] );
        add_action( 'enqueue_block_assets', [ $this, 'enqueue_editor_preview_scripts' ] );
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
    public function enqueue_editor_preview_styles(): void {
        if ( ! is_admin() ) {
            return; // The front end loads these through the block render callbacks.
        }

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
     * sort or layout controls the way the front end does. These load in the
     * editor document; the canvas is a same-origin iframe that scripts reach
     * into, since WordPress only carries a block's own view script inside it.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function enqueue_editor_preview_scripts(): void {
        if ( ! is_admin() ) {
            return; // Block.json already loads these on the front end.
        }

        /**
         * Script handles to load inside the block editor canvas.
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $handles Registered script handles.
         */
        $handles = apply_filters(
            'dokan_blocks_editor_preview_scripts',
            [ 'dokan-store-filter-bar-view-script' ]
        );

        foreach ( (array) $handles as $handle ) {
            if ( wp_script_is( $handle, 'registered' ) ) {
                wp_enqueue_script( $handle );
            }
        }
    }

    /**
     * Make Dokan's template tags available while blocks render in wp-admin.
     *
     * Dokan loads `template-tags.php` on the front end only, but store blocks
     * are server rendered in the editor too — the block editor renders the
     * post content through a preloaded REST request inside the admin request,
     * where helpers such as `dokan_store_sidebar_args()` would otherwise be
     * undefined and fatal.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_template_tags_for_block_rendering(): void {
        if ( is_admin() && ! function_exists( 'dokan_store_sidebar_args' ) ) {
            require_once DOKAN_INC_DIR . '/template-tags.php';
        }
    }

    /**
     * Register all block types from the built metadata collections.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_block_types(): void {
        /**
         * Block metadata collections to register. Pro modules append theirs here.
         *
         * @since DOKAN_SINCE
         *
         * @param array $collections Map of collection path => manifest file path.
         */
        $collections = apply_filters(
            'dokan_block_type_collections',
            [ DOKAN_DIR . '/assets/blocks' => DOKAN_DIR . '/assets/blocks/blocks-manifest.php' ]
        );

        foreach ( $collections as $path => $manifest ) {
            if ( file_exists( $manifest ) && function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
                wp_register_block_types_from_metadata_collection( $path, $manifest );
                continue;
            }

            // Manifest not built (dev checkout) — fall back to per-directory registration.
            foreach ( glob( trailingslashit( $path ) . '*/block.json' ) as $block_json ) {
                register_block_type( dirname( $block_json ) );
            }
        }
    }

    /**
     * Register the `dokan` block category.
     *
     * @since DOKAN_SINCE
     *
     * @param array $categories Registered block categories.
     *
     * @return array
     */
    public function register_block_category( $categories ): array {
        $categories = is_array( $categories ) ? $categories : [];

        if ( in_array( 'dokan', wp_list_pluck( $categories, 'slug' ), true ) ) {
            return $categories;
        }

        return array_merge(
            [
                [
                    'slug'  => 'dokan',
                    'title' => __( 'Dokan', 'dokan-lite' ),
                ],
            ],
            $categories
        );
    }
}
