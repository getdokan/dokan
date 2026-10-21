<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

/**
 * Upgrade class for version 5.0.0.
 *
 * @since 5.0.0
 */
class V_5_0_0 extends DokanUpgrader {

    /**
     * Alter dokan_order_stats table to add new columns and regenerate data.
     *
     * @since 5.0.0
     *
     * @return void
     */
    public static function alter_dokan_order_stats_table_and_regenerate() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'dokan_order_stats';

        // @codingStandardsIgnoreStart
        $columns_to_add = [
            'vendor_shipping_tax' => "ALTER TABLE `{$table_name}` ADD COLUMN `vendor_shipping_tax` double NOT NULL DEFAULT '0' AFTER `vendor_discount`",
            'vendor_order_tax'    => "ALTER TABLE `{$table_name}` ADD COLUMN `vendor_order_tax` double NOT NULL DEFAULT '0' AFTER `vendor_shipping_tax`",
            'admin_earning'       => "ALTER TABLE `{$table_name}` ADD COLUMN `admin_earning` double NOT NULL DEFAULT '0' AFTER `vendor_order_tax`",
            'admin_shipping_tax'  => "ALTER TABLE `{$table_name}` ADD COLUMN `admin_shipping_tax` double NOT NULL DEFAULT '0' AFTER `admin_discount`",
            'admin_order_tax'     => "ALTER TABLE `{$table_name}` ADD COLUMN `admin_order_tax` double NOT NULL DEFAULT '0' AFTER `admin_shipping_tax`",
        ];

        $existing_columns = $wpdb->get_col( "SHOW COLUMNS FROM `{$table_name}`", 0 );

        foreach ( $columns_to_add as $col_name => $alter_query ) {
            if ( ! in_array( $col_name, $existing_columns, true ) ) {
                $wpdb->query( $alter_query );
            }
        }

        // Update the order_type column comment to include new types.
        $wpdb->query(
            "ALTER TABLE `{$table_name}` MODIFY COLUMN `order_type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = Dokan Parent Order, 1 = Dokan Single Vendor Order, 2 = Dokan Suborder, 3 = Refund of Dokan Parent Order, 4 = Refund of Dokan Suborder, 5 = Refund of Dokan Single Order, 6 = Advertisement Product Order, 7 = Advertisement Refund Order, 8 = Subscription Order, 9 = Subscription Refund Order'"
        );
        // @codingStandardsIgnoreEnd
    }

    /**
     * Create Vendor Onboarding page if it doesn't exist.
     *
     * @since 5.0.0
     *
     * @return void
     */
    public static function create_vendor_onboarding_page() {
        $dokan_pages = get_option( 'dokan_pages', [] );

        // Check if vendor_onboarding page already exists
        if ( isset( $dokan_pages['vendor_onboarding'] ) ) {
            $page_id = $dokan_pages['vendor_onboarding'];
            $page = get_post( $page_id );

            // If page exists and is published, skip creation
            if ( $page && 'publish' === $page->post_status ) {
                return;
            }
        }

        // Create vendor onboarding page
        $page_id = wp_insert_post(
            [
                'post_title'     => __( 'Vendor Onboarding', 'dokan-lite' ),
                'post_name'      => 'vendor-onboarding',
                'post_content'   => '[dokan-vendor-onboarding-registration]',
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'comment_status' => 'closed',
            ]
        );

        // Update dokan_pages option
        if ( $page_id && ! is_wp_error( $page_id ) ) {
            $dokan_pages['vendor_onboarding'] = $page_id;
            update_option( 'dokan_pages', $dokan_pages );
        }
    }
}
