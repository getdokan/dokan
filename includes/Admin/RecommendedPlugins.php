<?php

namespace WeDevs\Dokan\Admin;

/**
 * Recommended Plugins Class.
 *
 * @since 4.0.0
 */
class RecommendedPlugins {

    /**
     * Array of Recommended Plugins.
     *
     * @var array
     */
    protected array $plugins;

    /**
     * Class Constructor.
     *
     * @since 4.0.0
     */
    public function __construct() {
        $this->plugins = [
            // [
            //     'type'        => 'store_growth',
            //     'title'       => __( 'StoreGrowth', 'dokan-lite' ),
            //     'description' => __( 'Best WooCommerce Marketing Solution!', 'dokan-lite' ),
            //     'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/store-growth-logo.svg',
            //     'img_alt'     => __( 'StoreGrowth logo', 'dokan-lite' ),
            //     'slug'        => 'storegrowth-sales-booster',
            //     'basename'    => 'storegrowth-sales-booster/storegrowth-sales-booster.php',
            // ],
            [
                'type'        => 'wemail',
                'title'       => __( 'weMail', 'dokan-lite' ),
                'description' => __( 'Simplified Email Marketing Solution for WordPress!', 'dokan-lite' ),
                'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/wemail-logo.png',
                'img_alt'     => __( 'weMail logo', 'dokan-lite' ),
                'slug'        => 'wemail',
                'basename'    => 'wemail/wemail.php',
            ],
            [
                'type'        => 'wc_conversion_tracking',
                'title'       => __( 'WooCommerce Conversion Tracking', 'dokan-lite' ),
                'description' => __( 'Track conversions on your WooCommerce store like a pro!', 'dokan-lite' ),
                'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/wc-conversion-tracking-logo.png',
                'img_alt'     => __( 'WooCommerce Conversion Tracking logo', 'dokan-lite' ),
                'slug'        => 'woocommerce-conversion-tracking',
                'basename'    => 'woocommerce-conversion-tracking/conversion-tracking.php',
            ],
            [
                'type'        => 'texty',
                'title'       => __( 'Texty', 'dokan-lite' ),
                'description' => __( 'SMS Notification for WordPress, WooCommerce, Dokan and more!', 'dokan-lite' ),
                'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/texty-logo.png',
                'img_alt'     => __( 'Texty logo', 'dokan-lite' ),
                'slug'        => 'texty',
                'basename'    => 'texty/texty.php',
            ],
        ];
    }

    /**
     * Get All Enlisted Plugins.
     *
     * @since 4.0.0
     *
     * @return array
     */
    protected function get_enlisted_plugins(): array {
        /**
         * Filter the list of recommended plugins.
         *
         * @since 4.0.0
         *
         * @param array $plugins List of recommended plugins.
         *
         * @return array Filtered list of recommended plugins.
         */
        return apply_filters( 'dokan_recommended_plugins_list', $this->plugins );
    }

    /**
     * Is Plugin Active.
     *
     * @since 4.0.0
     *
     * @param string $basename
     *
     * @return bool
     */
    protected function is_active( string $basename ): bool {
        /**
         * Filter to determine if a recommended plugin is active.
         *
         * @since 4.0.0
         *
         * @param bool   $is_active Whether the plugin is active.
         * @param string $basename  The basename of the plugin.
         *
         * @return bool Filtered value indicating if the plugin is active.
         */
        return apply_filters( 'dokan_recommended_plugin_is_active', is_plugin_active( $basename ), $basename );
    }

    /**
     * Get List of Recommended Inactive Plugins.
     *
     * @since 4.0.0
     *
     * @return array
     */
    public function get(): array {
        $enlisted_plugins = $this->get_enlisted_plugins();

        $recommended_plugins = array_filter(
            $enlisted_plugins,
            function ( $plugin ) {
                return isset( $plugin['basename'] ) && ! $this->is_active( $plugin['basename'] );
            }
        );

        /**
         * Filter the list of recommended inactive plugins.
         *
         * @since 4.0.0
         *
         * @param array $recommended_plugins List of recommended inactive plugins.
         *
         * @return array Filtered list of recommended inactive plugins.
         */
        return apply_filters( 'dokan_recommended_inactive_plugins', $recommended_plugins );
    }
}
