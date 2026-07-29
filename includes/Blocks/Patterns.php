<?php

namespace WeDevs\Dokan\Blocks;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * File-header based block pattern registry.
 *
 * Registers every PHP file under `patterns/` as a block pattern. Files are
 * executable PHP (WooCommerce-style) so strings stay translatable and asset
 * URLs resolve at include time. Pro contributes files through the
 * `dokan_block_pattern_files` filter.
 *
 * @since DOKAN_SINCE
 */
class Patterns implements Hookable {

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'init', [ $this, 'register' ], 9 );
    }

    /**
     * Register pattern categories and patterns.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {
        if ( ! function_exists( 'register_block_pattern' ) ) {
            return;
        }

        $this->register_categories();

        /**
         * Block pattern files to register. Pro modules append theirs here.
         *
         * @since DOKAN_SINCE
         *
         * @param string[] $files Absolute paths of pattern PHP files.
         */
        $files = apply_filters( 'dokan_block_pattern_files', glob( DOKAN_DIR . '/patterns/*.php' ) );

        foreach ( (array) $files as $file ) {
            $this->register_pattern_file( $file );
        }
    }

    /**
     * Register the Dokan pattern categories.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function register_categories(): void {
        register_block_pattern_category( 'dokan', [ 'label' => __( 'Dokan', 'dokan-lite' ) ] );
        register_block_pattern_category( 'dokan-store', [ 'label' => __( 'Dokan Single Store', 'dokan-lite' ) ] );
        register_block_pattern_category( 'dokan-store-listing', [ 'label' => __( 'Dokan Store Listing', 'dokan-lite' ) ] );
    }

    /**
     * Register a single pattern file.
     *
     * @since DOKAN_SINCE
     *
     * @param string $file Absolute path of the pattern PHP file.
     *
     * @return void
     */
    protected function register_pattern_file( string $file ): void {
        if ( ! is_readable( $file ) ) {
            return;
        }

        $headers = get_file_data(
            $file,
            [
                'title'         => 'Title',
                'slug'          => 'Slug',
                'description'   => 'Description',
                'categories'    => 'Categories',
                'keywords'      => 'Keywords',
                'blockTypes'    => 'Block Types',
                'viewportWidth' => 'Viewport Width',
                'inserter'      => 'Inserter',
            ]
        );

        if ( empty( $headers['title'] ) || empty( $headers['slug'] ) ) {
            return;
        }

        $pattern = [
            'title'       => $headers['title'],
            'description' => $headers['description'],
            'content'     => $this->get_pattern_content( $file ),
        ];

        if ( empty( $pattern['content'] ) ) {
            return;
        }

        if ( ! empty( $headers['categories'] ) ) {
            $pattern['categories'] = array_filter( array_map( 'trim', explode( ',', $headers['categories'] ) ) );
        }

        if ( ! empty( $headers['keywords'] ) ) {
            $pattern['keywords'] = array_filter( array_map( 'trim', explode( ',', $headers['keywords'] ) ) );
        }

        if ( ! empty( $headers['blockTypes'] ) ) {
            $pattern['blockTypes'] = array_filter( array_map( 'trim', explode( ',', $headers['blockTypes'] ) ) );
        }

        if ( ! empty( $headers['viewportWidth'] ) ) {
            $pattern['viewportWidth'] = absint( $headers['viewportWidth'] );
        }

        if ( ! empty( $headers['inserter'] ) ) {
            $pattern['inserter'] = in_array( strtolower( $headers['inserter'] ), [ 'yes', 'true' ], true );
        }

        register_block_pattern( $headers['slug'], $pattern );
    }

    /**
     * Get a pattern file's block markup.
     *
     * @since DOKAN_SINCE
     *
     * @param string $file Absolute path of the pattern PHP file.
     *
     * @return string
     */
    protected function get_pattern_content( string $file ): string {
        ob_start();
        include $file;

        return trim( (string) ob_get_clean() );
    }
}
