<?php

namespace WeDevs\Dokan\Blocks;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Registers the `dokan//single-store` block template for block themes.
 *
 * Store requests resolve through the index template hierarchy (Dokan forces
 * every conditional false on store pages), so injecting the `single-store`
 * slug there lets `locate_block_template()` pick it up with the correct
 * precedence: theme-shipped file > user Site Editor edits > this registration.
 *
 * @since DOKAN_SINCE
 */
class Templates implements Hookable {

    /**
     * Template slug.
     */
    public const TEMPLATE_SLUG = 'single-store';

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'init', [ $this, 'register_template' ] );
        add_filter( 'index_template_hierarchy', [ $this, 'inject_store_template_hierarchy' ] );
    }

    /**
     * Register the single store block template.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_template(): void {
        if ( ! function_exists( 'register_block_template' ) || ! wp_is_block_theme() ) {
            return;
        }

        $content_file = DOKAN_DIR . '/templates/block-templates/single-store.html';

        if ( ! is_readable( $content_file ) ) {
            return;
        }

        register_block_template(
            'dokan//' . self::TEMPLATE_SLUG,
            [
                'title'       => __( 'Single Store', 'dokan-lite' ),
                'description' => __( 'Displays a vendor store page with the store header and products.', 'dokan-lite' ),
                'content'     => file_get_contents( $content_file ), // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
                'plugin'      => 'dokan-lite',
            ]
        );
    }

    /**
     * Whether a single store block template can actually render the page.
     *
     * The theme, a Site Editor edit or this plugin may provide it. Without one,
     * handing the request to the block canvas would fall through to the index
     * template and show the blog instead of the store.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_available(): bool {
        if ( ! wp_is_block_theme() || ! function_exists( 'resolve_block_template' ) ) {
            return false;
        }

        return null !== resolve_block_template( self::TEMPLATE_SLUG, [ self::TEMPLATE_SLUG ], '' );
    }

    /**
     * Put the single store template first in line on store page requests.
     *
     * @since DOKAN_SINCE
     *
     * @param array $templates Template hierarchy candidates.
     *
     * @return array
     */
    public function inject_store_template_hierarchy( $templates ): array {
        $templates = is_array( $templates ) ? $templates : [];

        if ( function_exists( 'dokan_is_store_page' ) && dokan_is_store_page() ) {
            array_unshift( $templates, self::TEMPLATE_SLUG );
        }

        return $templates;
    }
}
