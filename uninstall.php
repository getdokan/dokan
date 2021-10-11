<?php

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

/**
 * Dokan Uninstall
 *
 * Uninstalling Dokan deletes user roles, tables, pages, meta data and options.
 *
 * @package Dokan\Uninstaller
 *
 * @since 3.2.15
 */
class Dokan_Uninstaller {
    /**
     * Constructor for the class Dokan_Uninstaller
     *
     * @since 3.2.15
     */
    public function __construct() {
        global $wpdb;
        $general_options = get_option( 'dokan_general', [] );
        $setting = array_key_exists( 'data_clear_on_uninstall', $general_options ) ? $general_options['data_clear_on_uninstall'] : 'off';

        /*
         * Only remove data when Dokan data clear setting is enabled by admin
         * This is to prevent data loss when deleting the plugin and to ensure only the site owner can perform this action.
         */
        if ( 'on' === $setting ) {
            // Make existing vendors to Woocommerce Customer
            $this->change_vendor_role_to_customer();

            // Roles + caps.
            $this->remove_roles();

            // Drop Dokan related Tables
            $this->drop_tables();

            // Delete Pages created by dokan
            $pages = get_option( 'dokan_pages', [] );
            foreach ( $pages as $page_id ) {
                wp_delete_post( $page_id, true );
            }

            // Delete Dokan related options
            $wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '%dokan%';" );

            // Delete Dokan related user_meta
            $wpdb->query( "DELETE FROM $wpdb->usermeta WHERE meta_key LIKE '%dokan%';" );

            // Clear any cached data that has been removed.
            wp_cache_flush();
        }
    }

    /**
     * Return a list of Dokan capabilities
     *
     * @since 3.2.15
     *
     * @return string[]
     */
    private function get_dokan_capabilities() {
        require_once dirname( __FILE__ ) . '/includes/functions.php';

        $capabilities = [];
        foreach ( dokan_get_all_caps() as $cap ) {
            $capabilities = array_merge( $capabilities, array_keys( $cap ) );
        }
        $capabilities[] = 'dokandar';
        $capabilities[] = 'seller';

        /* Capabilities added from RMA module */
        $capabilities = array_merge( $capabilities, [ 'dokan_view_store_rma_menu', 'dokan_view_store_rma_settings_menu' ] );

        /* Capabilities added from Booking module */
        $capabilities = array_merge(
            $capabilities,
            [
                'dokan_view_booking_menu',
                'dokan_add_booking_product',
                'dokan_edit_booking_product',
                'dokan_delete_booking_product',
                'dokan_manage_booking_products',
                'dokan_manage_booking_calendar',
                'dokan_manage_bookings',
                'dokan_manage_booking_resource',
            ]
        );

        /* Capabilities added from Support Ticket module */
        $capabilities = array_merge( $capabilities, [ 'dokan_manage_support_tickets' ] );

        /* Capabilities added from ExportImport module */
        $capabilities = array_merge( $capabilities, [ 'dokan_view_tools_menu' ] );

        /* Capabilities added from Vendor Verification module */
        $capabilities = array_merge( $capabilities, [ 'dokan_view_store_verification_menu' ] );

        /* Capabilities added from Simple Auction module */
        $capabilities = array_merge(
            $capabilities, [
                'dokan_view_auction_menu',
                'dokan_add_auction_product',
                'dokan_edit_auction_product',
                'dokan_delete_auction_product',
            ]
        );

        return $capabilities;
    }

    /**
     * Remove Dokan roles.
     *
     * @since 3.2.15
     *
     * @return void
     */
    private function remove_roles() {
        $wp_roles = wp_roles();

        if ( ! is_a( $wp_roles, 'WP_Roles' ) ) {
            return;
        }

        foreach ( $this->get_dokan_capabilities() as $capability ) {
            $wp_roles->remove_cap( 'administrator', $capability );
            $wp_roles->remove_cap( 'shop_manager', $capability );
        }

        remove_role( 'seller' );
        remove_role( 'vendor_staff' );
    }

    /**
     * Return a list of tables. Used to make sure all Dokan tables are dropped
     * when uninstalling the plugin
     *
     * @since 3.2.15
     *
     * @return array Dokan tables.
     */
    private function get_tables() {
        return [
            'dokan_refund',
            'dokan_withdraw',
            'dokan_announcement',
            'dokan_orders',
            'dokan_vendor_balance',
            'dokan_product_map',
            'dokan_follow_store_followers',
            'dokan_report_abuse_reports',
            'dokan_rma_conversations',
            'dokan_rma_request',
            'dokan_rma_request_product',
            'dokan_shipping_zone_methods',
            'dokan_shipping_zone_locations',
            'dokan_shipping_tracking',
            'dokan_delivery_time',
        ];
    }

    /**
     * Drop all tables created by Dokan Lite and Pro
     *
     * @since 3.2.15
     *
     * @return void
     */
    private function drop_tables() {
        global $wpdb;

        $tables = $this->get_tables();

        foreach ( $tables as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}{$table}" ); // phpcs:ignore
        }
    }

    /**
     * Change Dokan Vendor to WooCommerce Customer
     *
     * @since 3.2.15
     *
     * @return void
     */
    private function change_vendor_role_to_customer() {
        global $wpdb;
        $ids = $wpdb->get_col( "SELECT user_id FROM {$wpdb->prefix}usermeta WHERE meta_key = 'dokan_enable_selling'" ); // phpcs:ignore
        $capabilities = maybe_serialize( [ 'customer' => 1 ] );

        $wpdb->query( "UPDATE {$wpdb->prefix}usermeta SET meta_value = '{$capabilities}' WHERE meta_key = 'wp_capabilities' AND user_id IN ('" . implode( "','", $ids ) . "')" ); // phpcs:ignore
    }
}

new Dokan_Uninstaller();
