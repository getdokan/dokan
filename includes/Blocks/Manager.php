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
        add_action( 'init', [ $this, 'register_block_types' ] );
        // Before Pro's category registration (@10) so the dedupe guard wins in either load order.
        add_filter( 'block_categories_all', [ $this, 'register_block_category' ], 9 );
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
