<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Install\Installer;
use Automattic\WooCommerce\Admin\ReportsSync;

/**
 * Upgrade class for version 3.15.0.
 *
 * @since 3.15.0
 */
class V_4_2_10 extends DokanUpgrader {

    /**
     * Alter dokan_order_stats table to add new columns and regenerate data.
     *
     * @since 3.15.0
     *
     * @return void
     */
    public static function alter_dokan_order_stats_table_and_regenerate() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'dokan_order_stats';

        // Check if table exists
        $table_exists = $wpdb->get_var(
            $wpdb->prepare(
                'SHOW TABLES LIKE %s',
                $table_name
            )
        );

        if ( ! $table_exists ) {
            // If table doesn't exist, create it with all columns
            ( new Installer() )->create_dokan_order_stats_table();
        } else {
            // @codingStandardsIgnoreStart
            // Add new columns if they don't exist
            $columns_to_add = [
                'vendor_shipping_tax' => "ALTER TABLE `{$table_name}` ADD COLUMN `vendor_shipping_tax` double NOT NULL DEFAULT '0' AFTER `vendor_discount`",
                'vendor_order_tax'    => "ALTER TABLE `{$table_name}` ADD COLUMN `vendor_order_tax` double NOT NULL DEFAULT '0' AFTER `vendor_shipping_tax`",
                'admin_earning'       => "ALTER TABLE `{$table_name}` ADD COLUMN `admin_earning` double NOT NULL DEFAULT '0' AFTER `vendor_shipping_tax`",
                'admin_shipping_tax'  => "ALTER TABLE `{$table_name}` ADD COLUMN `admin_shipping_tax` double NOT NULL DEFAULT '0' AFTER `admin_discount`",
                'admin_order_tax'     => "ALTER TABLE `{$table_name}` ADD COLUMN `admin_order_tax` double NOT NULL DEFAULT '0' AFTER `admin_shipping_tax`",
            ];

            foreach ( $columns_to_add as $column_name => $alter_query ) {
                $column_exists = $wpdb->get_results(
                    $wpdb->prepare(
                        "SHOW COLUMNS FROM `{$table_name}` LIKE %s",
                        $column_name
                    )
                );

                if ( empty( $column_exists ) ) {
                    $wpdb->query( $alter_query ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
                }
            }

            // Update the order_type column comment to include new types
            $wpdb->query(
                "ALTER TABLE `{$table_name}` MODIFY COLUMN `order_type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = Dokan Parent Order, 1 = Dokan Single Vendor Order, 2 = Dokan Suborder, 3 = Refund of Dokan Parent Order, 4 = Refund of Dokan Suborder, 5 = Refund of Dokan Single Order, 6 = Advertisement Product Order, 7 = Advertisement Refund Order, 8 = Subscription Order, 9 = Subscription Refund Order'"
            );
            // @codingStandardsIgnoreEnd
        }

        // Regenerate the order stats data
        self::regenerate_order_stats_data();
    }

    /**
     * Regenerate order stats data by syncing WC order stats.
     *
     * @since 3.15.0
     *
     * @return void
     */
    private static function regenerate_order_stats_data() {
        // Sync the WC order stats to regenerate dokan order stats
        if ( class_exists( ReportsSync::class ) ) {
            ReportsSync::regenerate_report_data( null, false );
        }
    }
}
