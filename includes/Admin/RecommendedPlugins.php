<?php

namespace WeDevs\Dokan\Admin;

/**
 * Recommended Plugins Class.
 *
 * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     */
    public function __construct() {
        $this->plugins = [
            // [
            //     'type'        => 'store_growth',
            //     'title'       => __( 'StoreGrowth', 'dokan-lite' ),
            //     'description' => __( 'Best WooCommerce Marketing Solution!', 'dokan-lite' ),
            //     'img_url'     => DOKAN_PLUGIN_ASSEST . '/images/store-growth-logo.png',
            //     'img_alt'     => __( 'StoreGrowth logo', 'dokan-lite' ),
            //     'slug'        => 'storegrowth-sales-booster',
            //     'basename'    => 'storegrowth-sales-booster/storegrowth-sales-booster.php',
            // ],
            [
                'type'        => 'wemail',
                'title'       => __( 'weMail', 'dokan-lite' ),
                'description' => __( 'Simplified Email  Marketing Solution for WordPress!', 'dokan-lite' ),
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
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function get_enlisted_plugins(): array {
        return apply_filters( 'dokan_recommended_plugins_list', $this->plugins );
    }

    /**
     * Is Plugin Active.
     *
     * @since DOKAN_SINCE
     *
     * @param string $basename
     *
     * @return bool
     */
    protected function is_active( string $basename ): bool {
        return apply_filters( 'dokan_recommended_plugin_is_active', is_plugin_active( $basename ), $basename );
    }

    /**
     * Get List of Recommended Inactive Plugins.
     *
     * @since DOKAN_SINCE
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

        return apply_filters( 'dokan_recommended_inactive_plugins', $recommended_plugins );
    }
}
