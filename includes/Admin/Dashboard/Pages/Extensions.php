<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Extensions extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since SUSPENDED
     *
     * @return string
     */
    public function get_id(): string {
        return 'extensions';
    }

    /**
     * @inheritDoc
     */
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => __( 'Extensions', 'dokan-lite' ),
            'menu_title' => __( 'Extensions', 'dokan-lite' ),
            'route'      => 'extensions',
            'capability' => $capability,
            'position'   => 55,
        ];
    }

    /**
     * @inheritDoc
     */
    public function settings(): array {
        return [
            'extensions' => $this->get_extensions_data(),
        ];
    }

    /**
     * Get extension data for the frontend.
     *
     * @since SUSPENDED
     *
     * @return array
     */
    protected function get_extensions_data(): array {
        $thumbnail_dir = DOKAN_PLUGIN_ASSEST . '/images/extensions';

        return [
            'recommended'  => $this->get_recommended_addons( $thumbnail_dir ),
            'mobile_apps'  => $this->get_mobile_apps( $thumbnail_dir ),
            'welabs_image' => $thumbnail_dir . '/services/welabs.svg',
        ];
    }

    /**
     * Get recommended addons list.
     *
     * @since SUSPENDED
     *
     * @param string $thumbnail_dir Base URL for thumbnails.
     *
     * @return array
     */
    protected function get_recommended_addons( string $thumbnail_dir ): array {
        $installed_plugins = get_plugins();

        $addons = [
            [
                'slug'        => 'dokan-wpml',
                'title'       => __( 'Dokan WPML', 'dokan-lite' ),
                'description' => __( 'WPML integration for Dokan multivendor marketplace.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-wpml.png',
                'button_type' => 'install',
                'wp_org_slug' => 'dokan-wpml',
                'basename'    => 'dokan-wpml/dokan-wpml.php',
                'installed'   => isset( $installed_plugins['dokan-wpml/dokan-wpml.php'] ),
            ],
            [
                'slug'        => 'dokan-booking',
                'title'       => __( 'Dokan Booking Addon', 'dokan-lite' ),
                'description' => __( 'Integrates WooCommerce Booking with Dokan.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-booking.svg',
                'button_type' => 'get_plugin',
                'url'         => 'https://dokan.co/wordpress/modules/woocommerce-booking-integration/',
                'basename'    => 'dokan-pro/dokan-pro.php',
                'installed'   => $this->is_premium_addon_installed( 'booking', $installed_plugins ),
                'standalone'  => 'dokan-wc-booking/dokan-wc-booking.php',
            ],
            [
                'slug'        => 'dokan-auction',
                'title'       => __( 'Dokan Auction Addon', 'dokan-lite' ),
                'description' => __( 'A plugin that combined WooCommerce simple auction and Dokan plugin.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-auction.svg',
                'button_type' => 'get_plugin',
                'url'         => 'https://dokan.co/wordpress/modules/dokan-simple-auctions/',
                'basename'    => 'dokan-pro/dokan-pro.php',
                'installed'   => $this->is_premium_addon_installed( 'auction', $installed_plugins ),
                'standalone'  => 'dokan-simple-auction/dokan-simple-auction.php',
            ],
            [
                'slug'        => 'dokan-invoice',
                'title'       => __( 'Dokan PDF Invoice', 'dokan-lite' ),
                'description' => __( 'PDF invoice for Dokan vendor and customer orders.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-invoice.png',
                'button_type' => 'install',
                'wp_org_slug' => 'dokan-invoice',
                'basename'    => 'dokan-invoice/dokan-invoice.php',
                'installed'   => isset( $installed_plugins['dokan-invoice/dokan-invoice.php'] ),
            ],
            [
                'slug'        => 'wepos',
                'title'       => __( 'wePos', 'dokan-lite' ),
                'description' => __( 'A fast and responsive Point of Sale plugin for WooCommerce.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/wepos.png',
                'button_type' => 'install',
                'wp_org_slug' => 'wepos',
                'basename'    => 'wepos/wepos.php',
                'installed'   => isset( $installed_plugins['wepos/wepos.php'] ),
            ],
            [
                'slug'        => 'texty',
                'title'       => __( 'Texty', 'dokan-lite' ),
                'description' => __( 'SMS Notification for WordPress, WooCommerce, Dokan and more.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/texty.png',
                'button_type' => 'install',
                'wp_org_slug' => 'texty',
                'basename'    => 'texty/texty.php',
                'installed'   => isset( $installed_plugins['texty/texty.php'] ),
            ],
            [
                'slug'        => 'storegrowth-sales-booster',
                'title'       => __( 'StoreGrowth', 'dokan-lite' ),
                'description' => __( 'Increase revenue with powerful sales tools for WooCommerce.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/storegrowth.png',
                'button_type' => 'install',
                'wp_org_slug' => 'storegrowth-sales-booster',
                'basename'    => 'storegrowth-sales-booster/storegrowth-sales-booster.php',
                'installed'   => isset( $installed_plugins['storegrowth-sales-booster/storegrowth-sales-booster.php'] ),
            ],
            [
                'slug'        => 'tryaura',
                'title'       => __( 'TryAura', 'dokan-lite' ),
                'description' => __( 'All-in-one loyalty, rewards and referral plugin for WooCommerce.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/tryaura.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'tryaura',
                'basename'    => 'tryaura/tryaura.php',
                'installed'   => isset( $installed_plugins['tryaura/tryaura.php'] ),
            ],
            [
                'slug'        => 'wp-user-frontend',
                'title'       => __( 'WPUF', 'dokan-lite' ),
                'description' => __( 'Frontend post submission and user registration plugin.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/wpuf.gif',
                'button_type' => 'install',
                'wp_org_slug' => 'wp-user-frontend',
                'basename'    => 'wp-user-frontend/wpuf.php',
                'installed'   => isset( $installed_plugins['wp-user-frontend/wpuf.php'] ),
            ],
            [
                'slug'        => 'wemail',
                'title'       => __( 'weMail', 'dokan-lite' ),
                'description' => __( 'Simplified Email Marketing Solution for WordPress.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/wemail.png',
                'button_type' => 'install',
                'wp_org_slug' => 'wemail',
                'basename'    => 'wemail/wemail.php',
                'installed'   => isset( $installed_plugins['wemail/wemail.php'] ),
            ],
            [
                'slug'        => 'cartpulse',
                'title'       => __( 'CartPulse', 'dokan-lite' ),
                'description' => __( 'Recover abandoned carts and boost WooCommerce revenue.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/cartpulse.svg',
                'button_type' => 'get_plugin',
                'url'         => 'https://cartpulse.co/',
                'basename'    => 'cartpulse/cartpulse.php',
                'installed'   => isset( $installed_plugins['cartpulse/cartpulse.php'] ),
            ],
            [
                'slug'        => 'woocommerce-conversion-tracking',
                'title'       => __( 'Conversion Tracking for WooCommerce', 'dokan-lite' ),
                'description' => __( 'Track conversions on your WooCommerce store like a pro.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/conversion-tracking.png',
                'button_type' => 'install',
                'wp_org_slug' => 'woocommerce-conversion-tracking',
                'basename'    => 'woocommerce-conversion-tracking/conversion-tracking.php',
                'installed'   => isset( $installed_plugins['woocommerce-conversion-tracking/conversion-tracking.php'] ),
            ],
            [
                'slug'        => 'dokan-migrator',
                'title'       => __( 'Dokan Migrator', 'dokan-lite' ),
                'description' => __( 'Migrate to Dokan from other marketplace plugins seamlessly.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-migrator.png',
                'button_type' => 'install',
                'wp_org_slug' => 'dokan-migrator',
                'basename'    => 'dokan-migrator/dokan-migrator.php',
                'installed'   => isset( $installed_plugins['dokan-migrator/dokan-migrator.php'] ),
            ],
        ];

        /**
         * Filter the recommended addons list for the extensions page.
         *
         * @since SUSPENDED
         *
         * @param array $addons List of recommended addons.
         *
         * @return array
         */
        return apply_filters( 'dokan_extensions_recommended_addons', $addons );
    }

    /**
     * Check if a premium addon module is available.
     *
     * A premium addon is considered "installed" when:
     * - The standalone plugin for that addon is installed, OR
     * - Dokan Pro is installed and the module is available in the current plan.
     *
     * @since SUSPENDED
     *
     * @param string $module_key        The module key (e.g. 'booking', 'simple-auction').
     * @param array  $installed_plugins List of installed plugins.
     *
     * @return bool
     */
    protected function is_premium_addon_installed( string $module_key, array $installed_plugins ): bool {

        /**
         * Filter the standalone plugins for premium addons.
         *
         * @since DOKAN_SINCE
         *
         * @param array $standalone_plugins List of standalone plugins for premium addons.
         */
        $standalone_plugins = apply_filters(
            'dokan_extensions_premium_addon_standalone_plugins',
            [
                'booking'        => 'dokan-wc-booking/dokan-wc-booking.php',
                'auction'        => 'dokan-simple-auction/dokan-auction.php',
            ]
        );

        // Check if the standalone plugin is installed.
        if ( isset( $standalone_plugins[ $module_key ] ) && isset( $installed_plugins[ $standalone_plugins[ $module_key ] ] ) ) {
            return true;
        }

        // Check if Dokan Pro has the module available in the current plan.
        if ( dokan()->is_pro_exists() && dokan_pro()->module->is_available( $module_key ) ) {
            return true;
        }

        return false;
    }

    /**
     * Get mobile apps data.
     *
     * @since SUSPENDED
     *
     * @param string $thumbnail_dir Base URL for thumbnails.
     *
     * @return array
     */
    protected function get_mobile_apps( string $thumbnail_dir ): array {
        return [
            [
                'slug'        => 'dokan-customer-app',
                'title'       => __( 'Dokan Customer App', 'dokan-lite' ),
                'audience'    => __( 'For Customers', 'dokan-lite' ),
                'tagline'     => __( 'Shop on the go from your favorite marketplace.', 'dokan-lite' ),
                'description' => __( 'Let your customers browse products, place orders, and track deliveries right from their phones with the Dokan Customer App.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/apps/dokan-customer-app.svg',
                'url'         => 'https://dokan.co/wordpress/dokan-mobile-app/',
            ],
            [
                'slug'        => 'dokan-vendor-app',
                'title'       => __( 'Dokan Vendor App', 'dokan-lite' ),
                'audience'    => __( 'For Vendors', 'dokan-lite' ),
                'tagline'     => __( 'Manage your store from anywhere.', 'dokan-lite' ),
                'description' => __( 'Allow vendors to manage products, orders, and earnings from their mobile devices with the Dokan Vendor App.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/apps/dokan-vendor-app.svg',
                'url'         => 'https://play.google.com/store/apps/details?id=co.dokan.plugin.vendor&hl=en',
            ],
            [
                'slug'        => 'delivery-driver-app',
                'title'       => __( 'Delivery Driver App', 'dokan-lite' ),
                'audience'    => __( 'For Drivers', 'dokan-lite' ),
                'tagline'     => __( 'Streamline deliveries for your marketplace.', 'dokan-lite' ),
                'description' => __( 'Empower delivery drivers with route info, order details, and delivery status updates via the Delivery Driver App.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/apps/delivery-driver-app.svg',
                'url'         => 'https://dokan.co/wordpress/delivery-driver-app/',
            ],
        ];
    }

    /**
     * @inheritDoc
     */
    public function scripts(): array {
        return [];
    }

    /**
     * @inheritDoc
     */
    public function styles(): array {
        return [];
    }

    /**
     * @inheritDoc
     */
    public function register(): void {}
}