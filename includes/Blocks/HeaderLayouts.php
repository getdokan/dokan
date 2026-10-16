<?php

namespace WeDevs\Dokan\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * The store header layouts the `dokan/store-header` block can render.
 *
 * One place for the layout => pattern map and for how an empty block setting
 * falls back to the classic Appearance option, so the render callback and the
 * editor's "Customize this header" button agree on which pattern a header is.
 *
 * @since DOKAN_SINCE
 */
class HeaderLayouts {

    /**
     * Layouts as layout key => registered pattern slug.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, string>
     */
    public static function get_layouts(): array {
        /**
         * Header layouts this block can render, as pattern slug => label.
         *
         * Extensions add their own header patterns here to make them selectable from
         * the block, without shipping a second copy of the markup.
         *
         * @since DOKAN_SINCE
         *
         * @param array $layouts Map of layout key => registered pattern slug.
         */
        $layouts = apply_filters(
            'dokan_store_header_layouts',
            [
                'panel'   => 'dokan/single-store-header-panel',
                'default' => 'dokan/single-store-header-default',
                'stacked' => 'dokan/single-store-header-stacked',
                'split'   => 'dokan/single-store-header-split',
                'minimal' => 'dokan/single-store-header-minimal',
            ]
        );

        return is_array( $layouts ) ? $layouts : [];
    }

    /**
     * Resolve a block's layout setting to a layout key.
     *
     * An empty setting follows the classic Appearance option, so a marketplace
     * that picked a header before moving to a block theme keeps the look it had.
     * The classic keys do not match the pattern names, because the classic
     * "default" is the panel layout and the others shift along by one.
     *
     * @since DOKAN_SINCE
     *
     * @param string     $layout  Block setting; empty for the marketplace default.
     * @param array|null $layouts Map from get_layouts(), when the caller already has it.
     *
     * @return string A key of get_layouts().
     */
    public static function resolve( string $layout, ?array $layouts = null ): string {
        $layout = sanitize_key( $layout );

        if ( '' === $layout ) {
            $classic = dokan_get_option( 'store_header_template', 'dokan_appearance', 'default' );

            $layout = [
                'default' => 'panel',
                'layout1' => 'default',
                'layout2' => 'stacked',
                'layout3' => 'minimal',
            ][ $classic ] ?? 'panel';
        }

        return isset( ( $layouts ?? self::get_layouts() )[ $layout ] ) ? $layout : 'panel';
    }
}
