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
 * @since DOKAN_LITE_SINCE
 */
class Dokan_Uninstaller {
    /**
     * Constructor for the class Dokan_Uninstaller
     *
     * @since DOKAN_LITE_SINCE
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
                wp_trash_post( $page_id );
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
     * @since DOKAN_LITE_SINCE
     *
     * @return string[]
     */
    private function get_dokan_capabilities() {
        return [
            'dokan_view_sales_overview',
            'dokan_view_sales_report_chart',
            'dokan_view_announcement',
            'dokan_view_order_report',
            'dokan_view_review_reports',
            'dokan_view_product_status_report',
            'dokan_view_overview_report',
            'dokan_view_daily_sale_report',
            'dokan_view_top_selling_report',
            'dokan_view_top_earning_report',
            'dokan_view_statement_report',
            'dokan_view_order',
            'dokan_manage_order',
            'dokan_manage_order_note',
            'dokan_manage_refund',
            'dokan_add_coupon',
            'dokan_edit_coupon',
            'dokan_delete_coupon',
            'dokan_view_reviews',
            'dokan_manage_reviews',
            'dokan_manage_withdraw',
            'dokan_add_product',
            'dokan_edit_product',
            'dokan_delete_product',
            'dokan_view_product',
            'dokan_duplicate_product',
            'dokan_import_product',
            'dokan_export_product',
            'dokan_view_overview_menu',
            'dokan_view_product_menu',
            'dokan_view_order_menu',
            'dokan_view_coupon_menu',
            'dokan_view_report_menu',
            'dokan_view_review_menu',
            'dokan_view_withdraw_menu',
            'dokan_view_store_settings_menu',
            'dokan_view_store_payment_menu',
            'dokan_view_store_shipping_menu',
            'dokan_view_store_social_menu',
            'dokan_view_store_seo_menu',
            'dokandar',
            'seller',
        ];
    }

    /**
     * Remove Dokan roles.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    private function remove_roles() {
        global $wp_roles;

        if ( ! class_exists( 'WP_Roles' ) ) {
            return;
        }

        if ( ! isset( $wp_roles ) ) {
            $wp_roles = new WP_Roles(); // @codingStandardsIgnoreLine
        }

        foreach ( $this->get_dokan_capabilities() as $capability ) {
            $wp_roles->remove_cap( 'administrator', $capability );
            $wp_roles->remove_cap( 'shop_manager', $capability );
        }

        remove_role( 'seller' );
    }

    /**
     * Return a list of tables. Used to make sure all Dokan tables are dropped
     * when uninstalling the plugin
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array Dokan tables.
     */
    private function get_tables() {
        global $wpdb;

        return array(
            "{$wpdb->prefix}dokan_refund",
            "{$wpdb->prefix}dokan_withdraw",
            "{$wpdb->prefix}dokan_announcement",
            "{$wpdb->prefix}dokan_orders",
            "{$wpdb->prefix}dokan_vendor_balance",
            "{$wpdb->prefix}dokan_product_map",
            "{$wpdb->prefix}dokan_follow_store_followers",
            "{$wpdb->prefix}dokan_report_abuse_reports",
            "{$wpdb->prefix}dokan_rma_conversations",
            "{$wpdb->prefix}dokan_rma_request",
            "{$wpdb->prefix}dokan_rma_request_product",
            "{$wpdb->prefix}dokan_shipping_zone_methods",
            "{$wpdb->prefix}dokan_shipping_zone_locations",
            "{$wpdb->prefix}dokan_shipping_tracking",
            "{$wpdb->prefix}dokan_delivery_time",
        );
    }

    /**
     * Drop all tables created by Dokan Lite and Pro
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    private function drop_tables() {
        global $wpdb;

        $tables = $this->get_tables();

        foreach ( $tables as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS {$table}" ); // phpcs:ignore
        }
    }

    /**
     * Change Dokan Vendor to WooCommerce Customer
     *
     * @since DOKAN_LITE_SINCE
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
