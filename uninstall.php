<?php

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

/**
 * Dokan Uninstall
 *
 * Uninstalling Dokan deletes user roles, tables, pages, meta data and options.
 *
 * @since   3.2.15
 *
 * @package Dokan\Uninstaller
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
        $setting         = array_key_exists( 'data_clear_on_uninstall', $general_options ) ? $general_options['data_clear_on_uninstall'] : 'off';

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

            // delete user metas related to dokan and dokan pro
            $this->delete_usermeta();

            // Delete Pages created by dokan
            $pages = get_option( 'dokan_pages', [] );
            foreach ( $pages as $page_id ) {
                wp_delete_post( $page_id, true );
            }

            // Delete Dokan related options
            $wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '%dokan%';" );

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
            'dokan_seller_badge',
            'dokan_seller_badge_level',
            'dokan_seller_badge_acquired',
            'dokan_request_quotes',
            'dokan_request_quote_rules',
            'dokan_request_quote_details',
            'dokan_reverse_withdrawal',
            'dokan_advertised_products',
            'dokan_table_rate_shipping',
            'dokan_distance_rate_shipping',
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

        $args       = [
            'role__in' => [ 'seller' ],
            'number'   => - 1,
            'fields'   => 'ids',
        ];
        $user_query = new WP_User_Query( $args );
        $results = $user_query->get_results();

        if ( empty( $results ) ) {
            return;
        }

        $capabilities = maybe_serialize( [ 'customer' => 1 ] );

        $wpdb->query( "UPDATE {$wpdb->prefix}usermeta SET meta_value = '{$capabilities}' WHERE meta_key = '{$wpdb->prefix}capabilities' AND user_id IN (" . implode( ",", $results ) . ")" ); // phpcs:ignore
    }

    /**
     * Delete Dokan and Dokan Pro related user metas
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    private function delete_usermeta() {
        global $wpdb;

        $user_metas = [
            'dokan_enable_selling',
            'dokan_profile_settings',
            'dokan_store_name',
            'dokan_geo_latitude',
            'dokan_geo_longitude',
            'dokan_geo_public',
            'dokan_geo_address',
            'dokan_company_name',
            'dokan_vat_number',
            'dokan_company_id_number',
            'dokan_bank_name',
            'dokan_bank_iban',
            'dokan_feature_seller',
            'dokan_publishing',
            'dokan_admin_percentage_type',
            'dokan_admin_percentage',
            'dokan_admin_additional_fee',
            'dokan_vendor_verification_folder_hash',
            'dokan_stripe_customer_id',
            'billing_dokan_company_id_number',
            'billing_dokan_vat_number',
            'billing_dokan_bank_name',
            'billing_dokan_bank_iban',
            'dokan_has_active_cancelled_subscrption',
            'dokan_vendor_seen_setup_wizard',
            'dokan_wcpdf_documents_settings_invoice',
            'dokan_disable_auction',
            'dokan_verification_status',
            '_dokan_mangopay_account_id_sandbox',
            '_dokan_mangopay_user_birthday',
            '_dokan_mangopay_user_nationality',
            '_dokan_mangopay_user_status',
            '_dokan_mangopay_bank_account_id_IBAN_sandbox',
            '_dokan_mangopay_active_bank_account_sandbox',
            '_dokan_vendor_delivery_time_settings',
            '_dokan_paypal_create_partner_referral_debug_id',
            '_dokan_rma_settings',
            '_dokan_vendor_delivery_time_slots',
        ];

        // Delete Dokan related user_meta
        $meta_keys = "'" . implode( "','", $user_metas ) . "'";
        $wpdb->query( "DELETE FROM $wpdb->usermeta WHERE meta_key IN ($meta_keys)" ); //phpcs:ignore
    }
}

new Dokan_Uninstaller();
