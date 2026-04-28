<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class Extensions extends AbstractPage {

    /**
     * Get the ID of the page.
     *
     * @since 5.0.0
     *
     * @return string
     */
    public function get_id(): string {
        return 'extensions';
    }

    /**
     * Get the title of the page.
     *
     * @since 5.0.0
     *
     * @param string $title Default title.
     * @param string $page_title Page title.
     *
     * @return array
     */
    public function menu( string $capability, string $position ): array {
        return apply_filters(
            'dokan_extensions_menu',
            [
                'page_title' => esc_html__( 'Extensions', 'dokan-lite' ),
                'menu_title' => esc_html__( 'Extensions', 'dokan-lite' ),
                'route'      => 'extensions',
                'capability' => $capability,
                'position'   => 55,
                'hidden'     => true, // Rendered via Menu::append_dashboard_page_submenu() so it sits directly under "Settings".
            ]
        );
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
     * @since 5.0.0
     *
     * @return array
     */
    protected function get_extensions_data(): array {
        $thumbnail_dir = DOKAN_PLUGIN_ASSEST . '/images/extensions';

        return [
            'recommended'  => $this->get_recommended_addons( $thumbnail_dir ),
            'mobile_apps'  => $this->get_mobile_apps( $thumbnail_dir ),
            'welabs'       => $this->get_welabs_data( $thumbnail_dir ),
        ];
    }

    /**
     * Get weLabs data for services.
     *
     * @since 5.0.0
     *
     * @param string $thumbnail_dir Base URL for thumbnails.
     *
     * @return array
     */
    protected function get_welabs_data( string $thumbnail_dir ): array {
        return [
            'title'       => esc_html__( 'weLabs', 'dokan-lite' ),
            'description' => esc_html__( 'weLabs is a sister concern of weDevs, specializing in customizing Dokan-related integrations and development. From bespoke feature development to complex integration work, weLabs helps you extend Dokan exactly the way your business needs.', 'dokan-lite' ),
            'image'       => $thumbnail_dir . '/services/welabs.svg',
            'url'         => 'https://welabs.dev',
            'position'    => 10,
        ];
    }

    /**
     * Get recommended addons list.
     *
     * @since 5.0.0
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
                'title'       => esc_html__( 'Dokan WPML', 'dokan-lite' ),
                'description' => esc_html__( 'Expand globally with multilingual support - translate your marketplace into multiple languages and reach more customers and vendors without barriers.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-wpml.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'dokan-wpml',
                'basename'    => 'dokan-wpml/dokan-wpml.php',
                'installed'   => isset( $installed_plugins['dokan-wpml/dokan-wpml.php'] ),
                'position'    => 10,
            ],
            [
                'slug'        => 'dokan-booking',
                'title'       => esc_html__( 'Dokan Booking Addon', 'dokan-lite' ),
                'description' => esc_html__( 'Turn products into bookable services - let vendors offer appointments, rentals, and schedules to unlock new revenue streams effortlessly.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-booking.svg',
                'button_type' => 'get_plugin',
                'url'         => 'https://dokan.co/wordpress/modules/woocommerce-booking-integration/',
                'basename'    => 'dokan-pro/dokan-pro.php',
                'installed'   => $this->is_premium_addon_installed( 'booking', $installed_plugins ),
                'standalone'  => 'dokan-wc-booking/dokan-wc-booking.php',
                'position'    => 20,
            ],
            [
                'slug'        => 'dokan-auction',
                'title'       => esc_html__( 'Dokan Auction Addon', 'dokan-lite' ),
                'description' => esc_html__( 'Create excitement with auctions - enable bidding on products to increase engagement, competition, and maximize your overall sales value.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-auction.svg',
                'button_type' => 'get_plugin',
                'url'         => 'https://dokan.co/wordpress/modules/dokan-simple-auctions/',
                'basename'    => 'dokan-pro/dokan-pro.php',
                'installed'   => $this->is_premium_addon_installed( 'auction', $installed_plugins ),
                'standalone'  => 'dokan-simple-auction/dokan-simple-auction.php',
                'position'    => 30,
            ],
            [
                'slug'        => 'dokan-invoice',
                'title'       => esc_html__( 'Dokan PDF Invoice', 'dokan-lite' ),
                'description' => esc_html__( 'Generate professional PDF invoices automatically - streamline order management and give your marketplace a more trusted, polished experience.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-invoice.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'dokan-invoice',
                'basename'    => 'dokan-invoice/dokan-invoice.php',
                'installed'   => isset( $installed_plugins['dokan-invoice/dokan-invoice.php'] ),
                'position'    => 40,
            ],
            [
                'slug'        => 'wepos',
                'title'       => esc_html__( 'wePos', 'dokan-lite' ),
                'description' => esc_html__( 'Run your physical store smarter - manage sales, inventory, and customers in real time with a powerful POS built for WooCommerce.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/wepos.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'wepos',
                'basename'    => 'wepos/wepos.php',
                'installed'   => isset( $installed_plugins['wepos/wepos.php'] ),
                'position'    => 50,
            ],
            [
                'slug'        => 'texty',
                'title'       => esc_html__( 'Texty', 'dokan-lite' ),
                'description' => esc_html__( 'Stay connected with instant SMS alerts - notify vendors and customers about orders, updates, and key actions without missing a moment.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/texty.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'texty',
                'basename'    => 'texty/texty.php',
                'installed'   => isset( $installed_plugins['texty/texty.php'] ),
                'position'    => 60,
            ],
            [
                'slug'        => 'storegrowth-sales-booster',
                'title'       => esc_html__( 'StoreGrowth', 'dokan-lite' ),
                'description' => esc_html__( 'Accelerate your store growth with smart tools - boost engagement, increase conversions, and turn more visitors into paying customers.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/storegrowth.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'storegrowth-sales-booster',
                'basename'    => 'storegrowth-sales-booster/storegrowth-sales-booster.php',
                'installed'   => isset( $installed_plugins['storegrowth-sales-booster/storegrowth-sales-booster.php'] ),
                'position'    => 70,
            ],
            [
                'slug'        => 'tryaura',
                'title'       => esc_html__( 'TryAura', 'dokan-lite' ),
                'description' => esc_html__( 'Deliver immersive virtual try-ons - help customers visualize products better, build confidence, and increase conversions across your store.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/tryaura.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'tryaura',
                'basename'    => 'tryaura/tryaura.php',
                'installed'   => isset( $installed_plugins['tryaura/tryaura.php'] ),
                'position'    => 80,
            ],
            [
                'slug'        => 'wp-user-frontend',
                'title'       => esc_html__( 'WPUF', 'dokan-lite' ),
                'description' => esc_html__( 'Enable frontend control for users - collect posts, registrations, and data easily without backend access, improving user experience.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/wpuf.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'wp-user-frontend',
                'basename'    => 'wp-user-frontend/wpuf.php',
                'installed'   => isset( $installed_plugins['wp-user-frontend/wpuf.php'] ),
                'position'    => 90,
            ],
            [
                'slug'        => 'wemail',
                'title'       => esc_html__( 'weMail', 'dokan-lite' ),
                'description' => esc_html__( 'Simplify email marketing with automation - engage customers, nurture leads, and drive repeat sales with powerful campaigns.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/wemail.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'wemail',
                'basename'    => 'wemail/wemail.php',
                'installed'   => isset( $installed_plugins['wemail/wemail.php'] ),
                'position'    => 100,
            ],
            [
                'slug'        => 'cartpulse',
                'title'       => esc_html__( 'CartPulse', 'dokan-lite' ),
                'description' => esc_html__( 'Recover abandoned carts automatically - send timely follow-ups and bring customers back to complete their purchases and boost revenue.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/cartpulse.svg',
                'button_type' => 'get_plugin',
                'url'         => 'https://cartpulse.co/',
                'basename'    => 'cartpulse/cartpulse.php',
                'installed'   => isset( $installed_plugins['cartpulse/cartpulse.php'] ),
                'position'    => 110,
            ],
            [
                'slug'        => 'woocommerce-conversion-tracking',
                'title'       => esc_html__( 'Conversion Tracking for WooCommerce', 'dokan-lite' ),
                'description' => esc_html__( 'Track conversions, optimize campaigns, and use clear insights to boost ROI and drive smarter growth.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/conversion-tracking.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'woocommerce-conversion-tracking',
                'basename'    => 'woocommerce-conversion-tracking/conversion-tracking.php',
                'installed'   => isset( $installed_plugins['woocommerce-conversion-tracking/conversion-tracking.php'] ),
                'position'    => 120,
            ],
            [
                'slug'        => 'dokan-migrator',
                'title'       => esc_html__( 'Dokan Migrator', 'dokan-lite' ),
                'description' => esc_html__( 'Migrate your marketplace with ease - transfer data securely from other platforms and launch quickly without losing valuable information.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/addons/dokan-migrator.svg',
                'button_type' => 'install',
                'wp_org_slug' => 'dokan-migrator',
                'basename'    => 'dokan-migrator/dokan-migrator.php',
                'installed'   => isset( $installed_plugins['dokan-migrator/dokan-migrator.php'] ),
                'position'    => 130,
            ],
        ];

        /**
         * Filter the recommended addons list for the extensions page.
         *
         * @since 5.0.0
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
     * @since 5.0.0
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
         * @since 5.0.0
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
     * @since 5.0.0
     *
     * @param string $thumbnail_dir Base URL for thumbnails.
     *
     * @return array
     */
    protected function get_mobile_apps( string $thumbnail_dir ): array {
        return [
            [
                'slug'        => 'dokan-customer-app',
                'title'       => esc_html__( 'Dokan Customer App', 'dokan-lite' ),
                'audience'    => esc_html__( 'For Customers', 'dokan-lite' ),
                'description' => esc_html__( 'A fully-featured shopping app for your Dokan marketplace customers. Browse vendor stores, discover products, place orders, and track deliveries all from one place.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/apps/dokan-customer-app.svg',
                'url'         => 'https://dokan.co/wordpress/dokan-mobile-app/',
                'position'    => 10,
            ],
            [
                'slug'        => 'dokan-vendor-app',
                'title'       => esc_html__( 'Dokan Vendor App', 'dokan-lite' ),
                'audience'    => esc_html__( 'For Vendors', 'dokan-lite' ),
                'description' => esc_html__( 'Gives vendors complete control over their store on the go. Manage products, process orders, view earnings, and respond to customer queries without needing a desktop.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/apps/dokan-vendor-app.svg',
                'url'         => 'https://play.google.com/store/apps/details?id=co.dokan.plugin.vendor&hl=en',
                'position'    => 20,
            ],
            [
                'slug'        => 'delivery-driver-app',
                'title'       => esc_html__( 'Delivery Driver App', 'dokan-lite' ),
                'audience'    => esc_html__( 'For Delivery Staff', 'dokan-lite' ),
                'description' => esc_html__( 'Built for delivery agents to accept tasks, navigate routes, update delivery status in real time, and communicate with customers and vendors seamlessly.', 'dokan-lite' ),
                'image'       => $thumbnail_dir . '/apps/delivery-driver-app.svg',
                'url'         => 'https://dokan.co/wordpress/delivery-driver-app/',
                'position'    => 30,
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
