<?php

namespace WeDevs\Dokan\Install;

use WeDevs\Dokan\ReverseWithdrawal\InstallerHelper as ReverseWithdrawalInstallerHelper;
use WeDevs\Dokan\Rewrites;
use WP_Roles;

/**
 * Dokan installer class
 *
 * @author weDevs
 */
class Installer {
    public function do_install() {
        // installs
        $this->add_version_info();
        $this->user_roles();
        $this->setup_pages();
        $this->woocommerce_settings();
        $this->create_tables();
        $this->create_reverse_withdrawal_base_product();
        $this->product_design();
        $this->add_store_name_meta_key_for_admin_users();

        // does it needs any update?
        if ( dokan()->has_woocommerce() && dokan()->upgrades->is_upgrade_required() ) {
            dokan()->upgrades->do_upgrade();
        }

        if ( ! dokan()->has_woocommerce() ) {
            set_transient( 'dokan_setup_wizard_no_wc', true, 15 * MINUTE_IN_SECONDS );
            set_transient( 'dokan_theme_version_for_updater', get_option( 'dokan_theme_version', false ) );
        }

        $rewrites = new Rewrites();
        $rewrites->register_rule();

        flush_rewrite_rules();

        $was_installed_before = get_option( 'dokan_theme_version', false );

        update_option( 'dokan_theme_version', DOKAN_PLUGIN_VERSION );

        if ( ! $was_installed_before ) {
            update_option( 'dokan_admin_setup_wizard_ready', false );
            set_transient( '_dokan_setup_page_redirect', true, 30 );
        }
    }

    /**
     * Add store name meta key for admin users
     *
     * Since we are assuming admin/shop_manager users as vendors by default, and since dokan_store_name meta key is used for
     * various sql queries, we are assigning dokan_store_name meta key for admin users as well.
     *
     * @since 3.7.18
     *
     * @return void
     */
    public function add_store_name_meta_key_for_admin_users() {
        // get admin only users via WP_User_Query
        $args = [
            'role__in'    => [ 'administrator', 'shop_manager' ],
            'fields'  => 'ID',
        ];

        $users = new \WP_User_Query( $args );

        if ( ! empty( $users->get_results() ) ) {
            foreach ( $users->get_results() as $user_id ) {
                $meta = get_user_meta( $user_id, 'dokan_store_name', true );
                if ( ! empty( $meta ) ) {
                    continue;
                }

                $user = get_user_by( 'id', $user_id );
                update_user_meta( $user_id, 'dokan_store_name', $user->display_name );
            }
        }
    }

    /**
     * Adds plugin installation time.
     *
     * @since 3.3.1
     *
     * @return boolean
     */
    public function add_version_info() {
        if ( empty( get_option( 'dokan_installed_time' ) ) ) {
            $current_time = dokan_current_datetime()->getTimestamp();
            update_option( 'dokan_installed_time', $current_time );
        }
    }

    /**
     * Update WooCommerce mayaccount registration settings
     *
     * @since 1.0
     *
     * @return void
     */
    public function woocommerce_settings() {
        update_option( 'woocommerce_enable_myaccount_registration', 'yes' );
    }

    /**
     * Update product new style options
     *
     * When user first install this plugin
     * the new product style options changed to new
     *
     * @since 2.3
     *
     * @return void
     */
    public function product_design() {
        $installed_version = get_option( 'dokan_theme_version' );

        if ( ! $installed_version ) {
            $options = get_option( 'dokan_selling' );
            update_option( 'dokan_selling', $options );
        }
    }

    /**
     * Init dokan user roles
     *
     * @since Dokan 1.0
     *
     * @global WP_Roles $wp_roles
     */
    public function user_roles() {
        global $wp_roles;

        if ( class_exists( 'WP_Roles' ) && ! isset( $wp_roles ) ) {
            $wp_roles = new WP_Roles(); // @codingStandardsIgnoreLine
        }

        add_role(
            'seller', __( 'Vendor', 'dokan-lite' ), [
				'read'                      => true,
				'publish_posts'             => true,
				'edit_posts'                => true,
				'delete_published_posts'    => true,
				'edit_published_posts'      => true,
				'delete_posts'              => true,
				'manage_categories'         => true,
				'moderate_comments'         => true,
				'upload_files'              => true,
				'edit_shop_orders'          => true,
				'edit_product'              => true,
				'read_product'              => true,
				'delete_product'            => true,
				'edit_products'             => true,
				'publish_products'          => true,
				'read_private_products'     => true,
				'delete_products'           => true,
				'delete_private_products'   => true,
				'delete_published_products' => true,
				'edit_private_products'     => true,
				'edit_published_products'   => true,
				'manage_product_terms'      => true,
				'delete_product_terms'      => true,
				'assign_product_terms'      => true,
				'dokandar'                  => true,
			]
        );

        $capabilities = [];
        $all_cap      = dokan_get_all_caps();

        foreach ( $all_cap as $key => $cap ) {
            $capabilities = array_merge( $capabilities, array_keys( $cap ) );
        }

        $wp_roles->add_cap( 'shop_manager', 'dokandar' );
        $wp_roles->add_cap( 'administrator', 'dokandar' );

        foreach ( $capabilities as $key => $capability ) {
            $wp_roles->add_cap( 'seller', $capability );
            $wp_roles->add_cap( 'administrator', $capability );
            $wp_roles->add_cap( 'shop_manager', $capability );
        }
    }

    /**
     * Setup all pages for dokan
     *
     * @return void
     */
    public function setup_pages() {
        $meta_key = '_wp_page_template';

        // return if pages were created before
        $page_created = get_option( 'dokan_pages_created', false );

        if ( $page_created ) {
            return;
        }

        $pages = [
            [
                'post_title' => __( 'Dashboard', 'dokan-lite' ),
                'slug'       => 'dashboard',
                'page_id'    => 'dashboard',
                'content'    => '[dokan-dashboard]',
            ],
            [
                'post_title' => __( 'Store List', 'dokan-lite' ),
                'slug'       => 'store-listing',
                'page_id'    => 'store_listing',
                'content'    => '[dokan-stores]',
            ],
            [
                'post_title' => __( 'My Orders', 'dokan-lite' ),
                'slug'       => 'my-orders',
                'page_id'    => 'my_orders',
                'content'    => '[dokan-my-orders]',
            ],
        ];

        $dokan_page_settings = [];

        if ( $pages ) {
            foreach ( $pages as $page ) {
                $page_id = $this->create_page( $page );

                if ( $page_id ) {
                    $dokan_page_settings[ $page['page_id'] ] = $page_id;

                    if ( isset( $page['child'] ) && count( $page['child'] ) > 0 ) {
                        foreach ( $page['child'] as $child_page ) {
                            $child_page_id = $this->create_page( $child_page );

                            if ( $child_page_id ) {
                                $dokan_page_settings[ $child_page['page_id'] ] = $child_page_id;

                                wp_update_post(
                                    [
										'ID'          => $child_page_id,
										'post_parent' => $page_id,
									]
                                );
                            }
                        }
                    }
                }
            }
        }

        update_option( 'dokan_pages', $dokan_page_settings );
        update_option( 'dokan_pages_created', true );
    }

    public function create_page( $page ) {
        $meta_key = '_wp_page_template';
        $page_obj = get_page_by_path( $page['post_title'] );

        if ( ! $page_obj ) {
            $page_id = wp_insert_post(
                [
					'post_title'     => $page['post_title'],
					'post_name'      => $page['slug'],
					'post_content'   => $page['content'],
					'post_status'    => 'publish',
					'post_type'      => 'page',
					'comment_status' => 'closed',
				]
            );

            if ( $page_id && ! is_wp_error( $page_id ) ) {
                if ( isset( $page['template'] ) ) {
                    update_post_meta( $page_id, $meta_key, $page['template'] );
                }

                return $page_id;
            }
        }

        return false;
    }

    /**
     * Create necessary tables
     *
     * @since 1.4
     *
     * @return void
     */
    public function create_tables() {
        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $this->create_withdraw_table();
        $this->create_announcement_table();
        $this->create_sync_table();
        $this->create_refund_table();
        $this->create_vendor_balance_table();
        $this->create_reverse_withdrawal_table();
    }

    /**
     * Create withdraw table
     *
     * @return void
     */
    public function create_withdraw_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_withdraw` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `user_id` bigint(20) unsigned NOT NULL,
                    `amount` decimal(19,4) NOT NULL,
                    `date` timestamp NOT NULL,
                    `status` int(1) NOT NULL,
                    `method` varchar(30) NOT NULL,
                    `note` text NOT NULL,
                    `details` longtext DEFAULT NULL,
                    `ip` varchar(50) NOT NULL,
                    PRIMARY KEY (id)
               ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }

    /**
     * Create order sync table
     *
     * @return void
     */
    public function create_sync_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_orders` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `order_id` bigint(20) DEFAULT NULL,
                    `seller_id` bigint(20) DEFAULT NULL,
                    `order_total` decimal(19,4) DEFAULT NULL,
                    `net_amount` decimal(19,4) DEFAULT NULL,
                    `order_status` varchar(30) DEFAULT NULL,
                    PRIMARY KEY (`id`),
                    KEY `order_id` (`order_id`),
                    KEY `seller_id` (`seller_id`)
               ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }

    /**
     * Create Announcement table
     *
     * @since  2.1
     *
     * @return void
     */
    public function create_announcement_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_announcement` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `user_id` bigint(20) unsigned NOT NULL,
                    `post_id` bigint(11) NOT NULL,
                    `status` varchar(30) NOT NULL,
                    PRIMARY KEY (id)
               ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }

    /**
     * Add new table for refund request
     *
     * @since 2.4.11
     *
     * @return void
     */
    public function create_refund_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_refund` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `order_id` bigint(20) unsigned NOT NULL,
                    `seller_id` bigint(20) NOT NULL,
                    `refund_amount` decimal(19,4) NOT NULL,
                    `refund_reason` text NULL,
                    `item_qtys` varchar(200) NULL,
                    `item_totals` text NULL,
                    `item_tax_totals` text NULL,
                    `restock_items` varchar(10) NULL,
                    `date` timestamp NOT NULL,
                    `status` int(1) NOT NULL,
                    `method` varchar(30) NOT NULL,
                    PRIMARY KEY (id)
               ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }

    /**
     * Create vendor-balance table
     *
     * @return void
     */
    public function create_vendor_balance_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_vendor_balance` (
                    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                    `vendor_id` bigint(20) unsigned NOT NULL,
                    `trn_id` bigint(20) unsigned NOT NULL,
                    `trn_type` varchar(30) NOT NULL,
                    `perticulars` text NOT NULL,
                    `debit` decimal(19,4) NOT NULL,
                    `credit` decimal(19,4) NOT NULL,
                    `status` varchar(30) DEFAULT NULL,
                    `trn_date` timestamp NOT NULL,
                    `balance_date` timestamp NOT NULL,
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        dbDelta( $sql );
    }

    /**
     * Create Reverse Withdrawal Table
     *
     * @since 3.5.1
     *
     * @return void
     */
    private function create_reverse_withdrawal_table() {
        ReverseWithdrawalInstallerHelper::create_reverse_withdrawal_table();
    }

    /**
     * This method will create reverse withdrawal base product
     *
     * @since 3.5.1
     *
     * @return void
     */
    private function create_reverse_withdrawal_base_product() {
        ReverseWithdrawalInstallerHelper::create_reverse_withdrawal_base_product();
    }

    /**
     * Show plugin changes from upgrade notice
     *
     * @since 2.5.8
     */
    public static function in_plugin_update_message( $args ) {
        $transient_name = 'dokan_upgrade_notice_' . $args['Version'];
        $upgrade_notice = get_transient( $transient_name );

        if ( ! $upgrade_notice ) {
            $response = wp_safe_remote_get( 'https://plugins.svn.wordpress.org/dokan-lite/trunk/readme.txt' );

            if ( ! is_wp_error( $response ) && ! empty( $response['body'] ) ) {
                $upgrade_notice = self::parse_update_notice( $response['body'], $args['new_version'] );
                set_transient( $transient_name, $upgrade_notice, DAY_IN_SECONDS );
            }
        }

        echo wp_kses_post( $upgrade_notice );
    }

    /**
     * Parse upgrade notice from readme.txt file.
     *
     * @since 2.5.8
     *
     * @param string $content
     * @param string $new_version
     *
     * @return string
     */
    private static function parse_update_notice( $content, $new_version ) {
        // Output Upgrade Notice.
        $matches        = null;
        $regexp         = '~==\s*Upgrade Notice\s*==\s*=\s*(.*)\s*=(.*)(=\s*' . preg_quote( DOKAN_PLUGIN_VERSION, '/' ) . '\s*=|$)~Uis';
        $upgrade_notice = '';

        if ( preg_match( $regexp, $content, $matches ) ) {
            $notices = (array) preg_split( '~[\r\n]+~', trim( $matches[2] ) );

            // Convert the full version strings to minor versions.
            $notice_version_parts  = explode( '.', trim( $matches[1] ) );
            $current_version_parts = explode( '.', DOKAN_PLUGIN_VERSION );

            if ( 3 !== count( $notice_version_parts ) ) {
                return;
            }

            $notice_version  = $notice_version_parts[0] . '.' . $notice_version_parts[1];
            $current_version = $current_version_parts[0] . '.' . $current_version_parts[1];

            // Check the latest stable version and ignore trunk.
            if ( version_compare( $current_version, $notice_version, '<' ) ) {
                $upgrade_notice .= '</p><p class="dokan-plugin-upgrade-notice">';

                foreach ( $notices as $index => $line ) {
                    $upgrade_notice .= preg_replace( '~\[([^\]]*)\]\(([^\)]*)\)~', '<a href="${2}">${1}</a>', $line );
                }
            }
        }

        return wp_kses_post( $upgrade_notice );
    }
}
