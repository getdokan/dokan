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
     * Publish the attributes of the block about to render.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $attributes Block attributes.
     * @param string $block_name Name of the block rendering, e.g. `dokan/store-list`.
     *
     * @return void
     */
    public static function publish_rendering_attributes( array $attributes, string $block_name = '' ): void {
        /**
         * Fires as each Dokan block publishes its attributes.
         *
         * A store block renders through Dokan's own templates and hooks, so the
         * extensions drawing into it never receive its attributes otherwise. An
         * extension whose markup lands in a different block than the one carrying
         * its setting listens here — Dokan Pro's map toggle lives on the filter
         * bar, but the map itself can render inside the grid.
         *
         * @since DOKAN_SINCE
         *
         * @param array  $attributes Block attributes.
         * @param string $block_name Name of the block rendering, so a listener can tell the bar from the grid.
         */
        do_action( 'dokan_blocks_rendering_attributes', $attributes, $block_name );
    }

    /**
     * Let extensions set up the store listing before a block renders it.
     *
     * `templates/store-lists.php` fires this once, ahead of the listing, and
     * modules use it to decide where their own markup goes — the geolocation
     * module moves its map out of the product loop and into the filter bar here.
     * The editor renders every block in a request of its own, so each block that
     * reproduces part of that template has to dispatch it too, or a module that
     * relocates itself would render twice.
     *
     * Dokan's own listener draws the classic filter template the blocks replace,
     * so it stands aside for the dispatch and goes back on the hook afterwards.
     *
     * @since DOKAN_SINCE
     *
     * @param array $stores Store query result passed to the action.
     *
     * @return void
     */
    public static function dispatch_store_lists_filter_form( $stores ): void {
        if ( did_action( 'dokan_store_lists_filter_form' ) ) {
            return;
        }

        $filter = dokan()->get_container()->get( \WeDevs\Dokan\Vendor\StoreListsFilter::class );

        remove_action( 'dokan_store_lists_filter_form', [ $filter, 'filter_area' ] );

        /** This action is documented in templates/store-lists.php */
        do_action( 'dokan_store_lists_filter_form', $stores );

        add_action( 'dokan_store_lists_filter_form', [ $filter, 'filter_area' ] );
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
