<?php

/**
 * Dokan installer class
 *
 * @author weDevs
 */
class Dokan_Installer {

    function do_install() {

        // upgrades
        $this->do_upgrades();

        // installs
        $this->user_roles();
        $this->setup_pages();
        $this->woocommerce_settings();
        $this->create_tables();
        $this->product_design();
        
          
        if( class_exists( 'Dokan_Rewrites' )){
            Dokan_Rewrites::init()->register_rule();
        }

        flush_rewrite_rules();

        $was_installed_before = get_option( 'dokan_theme_version', false );

        update_option( 'dokan_theme_version', DOKAN_PLUGIN_VERSION );

        if ( ! $was_installed_before ) {
            set_transient( '_dokan_setup_page_redirect', true, 30 );
        }
    }

    /**
     * Perform all the upgrade routines
     *
     * @return void
     */
    function do_upgrades() {
        $installed_version = get_option( 'dokan_theme_version' );

        // may be it's the first install
        if ( ! $installed_version ) {
            return false;
        }

        $dokan_updates = array(
            '1.2'       => 'dokan-upgrade-1.2.php',
            '2.1'       => 'dokan-upgrade-2.1.php',
            '2.3'       => 'dokan-upgrade-2.3.php',
            '2.4.11'    => 'dokan-upgrade-2.4.11.php',
            '2.4.12'    => 'dokan-upgrade-2.4.12.php',
        );

        foreach ( $dokan_updates as $version => $path ) {
            if ( version_compare( $installed_version, $version, '<' ) ) {
                require_once DOKAN_INC_DIR . '/upgrades/' . $path;
                update_option( 'dokan_theme_version', $version );
            }
        }

        // finally update to the latest version
        update_option( 'dokan_theme_version', DOKAN_PLUGIN_VERSION );
    }

    /**
     * Update WooCommerce mayaccount registration settings
     *
     * @since 1.0
     *
     * @return void
     */
    function woocommerce_settings() {
        update_option( 'woocommerce_enable_myaccount_registration', 'yes' );
    }

    /**
     * Redirect to Setup page if transient is valid
     *
     * @since 2.5
     *
     * @return void
     */
    public static function setup_page_redirect( $plugin ) {

        if ( !get_transient( '_dokan_setup_page_redirect' ) ) {
            return;
        }
        // Delete the redirect transient
        delete_transient( '_dokan_setup_page_redirect' );

        wp_safe_redirect( add_query_arg( array( 'page' => 'dokan-setup' ), admin_url( 'index.php' ) ) );
        exit;
    }

    /**
     * Update product new style options
     *
     * when user first install this plugin
     * the new product style options changed to new
     *
     * @since 2.3
     *
     * @return void
     */
    function product_design() {
        $installed_version = get_option( 'dokan_theme_version' );

        if ( !$installed_version ) {
            $options = get_option( 'dokan_selling' );
            $options['product_style'] = 'new';
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
    function user_roles() {
        global $wp_roles;

        if ( class_exists( 'WP_Roles' ) && !isset( $wp_roles ) ) {
            $wp_roles = new WP_Roles();
        }

        add_role( 'seller', __( 'Vendor', 'dokan' ), array(
            'read'                   => true,
            'publish_posts'          => true,
            'edit_posts'             => true,
            'delete_published_posts' => true,
            'edit_published_posts'   => true,
            'delete_posts'           => true,
            'manage_categories'      => true,
            'moderate_comments'      => true,
            'unfiltered_html'        => true,
            'upload_files'           => true,
            'edit_shop_orders'       => true,
            'dokandar'               => true
        ) );

        $wp_roles->add_cap( 'shop_manager', 'dokandar' );
        $wp_roles->add_cap( 'administrator', 'dokandar' );
    }

    function setup_pages() {
        $meta_key = '_wp_page_template';

        // return if pages were created before
        $page_created = get_option( 'dokan_pages_created', false );
        if ( $page_created ) {
            return;
        }

        $pages = array(
            array(
                'post_title' => __( 'Dashboard', 'dokan' ),
                'slug'       => 'dashboard',
                'page_id'    => 'dashboard',
                'content'    => '[dokan-dashboard]'
            ),
            array(
                'post_title' => __( 'Store List', 'dokan' ),
                'slug'       => 'store-listing',
                'page_id'    => 'store_listing',
                'content'    => '[dokan-stores]'
            ),
            array(
                'post_title' => __( 'My Orders', 'dokan' ),
                'slug'       => 'my-orders',
                'page_id'    => 'my_orders',
                'content'    => '[dokan-my-orders]'
            ),
        );

        $dokan_page_settings = array();

        if ( $pages ) {
            foreach ($pages as $page) {
                $page_id = $this->create_page( $page );

                if ( $page_id ) {
                    $dokan_page_settings[$page['page_id']] = $page_id;

                    if ( isset( $page['child'] ) && count( $page['child'] ) > 0 ) {
                        foreach ($page['child'] as $child_page) {
                            $child_page_id = $this->create_page( $child_page );

                            if ( $child_page_id ) {
                                $dokan_page_settings[$child_page['page_id']] = $child_page_id;

                                wp_update_post( array( 'ID' => $child_page_id, 'post_parent' => $page_id ) );
                            }
                        }
                    } // if child
                } // if page_id
            } // end foreach
        } // if pages

        update_option( 'dokan_pages', $dokan_page_settings );
        update_option( 'dokan_pages_created', true );
    }

    function create_page( $page ) {
        $meta_key = '_wp_page_template';
        $page_obj = get_page_by_path( $page['post_title'] );

        if ( ! $page_obj ) {
            $page_id = wp_insert_post( array(
                'post_title'     => $page['post_title'],
                'post_name'      => $page['slug'],
                'post_content'   => $page['content'],
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'comment_status' => 'closed'
            ) );

            if ( $page_id && !is_wp_error( $page_id ) ) {

                if ( isset( $page['template'] ) ) {
                    update_post_meta( $page_id, $meta_key, $page['template'] );
                }

                return $page_id;
            }
        }

        return false;
    }

    function create_tables() {
        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $this->create_withdraw_table();
        $this->create_announcement_table();
        $this->create_sync_table();
        $this->create_refund_table();
    }

    function create_withdraw_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->dokan_withdraw} (
               `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
               `user_id` bigint(20) unsigned NOT NULL,
               `amount` float(11) NOT NULL,
               `date` timestamp NOT NULL,
               `status` int(1) NOT NULL,
               `method` varchar(30) NOT NULL,
               `note` text NOT NULL,
               `ip` varchar(15) NOT NULL,
              PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";

        dbDelta( $sql );
    }

    function create_sync_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_orders` (
          `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
          `order_id` bigint(20) DEFAULT NULL,
          `seller_id` bigint(20) DEFAULT NULL,
          `order_total` float(11,2) DEFAULT NULL,
          `net_amount` float(11,2) DEFAULT NULL,
          `order_status` varchar(30) DEFAULT NULL,
          PRIMARY KEY (`id`),
          KEY `order_id` (`order_id`),
          KEY `seller_id` (`seller_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";

        dbDelta( $sql );
    }

    /**
     * Create Announcement table
     *
     * @since  2.1
     *
     * @return void
     *
     */
    function create_announcement_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'dokan_announcement';

        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
               `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
               `user_id` bigint(20) unsigned NOT NULL,
               `post_id` bigint(11) NOT NULL,
               `status` varchar(30) NOT NULL,
              PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );


    }

    /**
     * Add new table for refund request
     *
     * @since 2.4.11
     *
     * @return void
     */
    function create_refund_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_refund` (
               `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
               `order_id` bigint(20) unsigned NOT NULL,
               `seller_id` bigint(20) NOT NULL,
               `refund_amount` float(11) NOT NULL,
               `refund_reason` text NULL,
               `item_qtys` varchar(50) NULL,
               `item_totals` varchar(50) NULL,
               `item_tax_totals` varchar(50) NULL,
               `restock_items` varchar(10) NULL,
               `date` timestamp NOT NULL,
               `status` int(1) NOT NULL,
               `method` varchar(30) NOT NULL,
              PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";

        dbDelta( $sql );
    }

}
