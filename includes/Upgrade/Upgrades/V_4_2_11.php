<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Install\Installer;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_4_2_11_RegenerateReportData;

/**
 * Upgrade class for version DOKAN_SINCE.
 *
 * @since DOKAN_SINCE
 */
class V_4_2_11 extends DokanUpgrader {

    /**
     * Alter dokan_order_stats table to add new columns and regenerate data.
     *
     * @since DOKAN_SINCE
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

        foreach ( $columns_to_add as $alter_query ) {
            $wpdb->query( $alter_query );
        }

        // Update the order_type column comment to include new types.
        $wpdb->query(
            "ALTER TABLE `{$table_name}` MODIFY COLUMN `order_type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = Dokan Parent Order, 1 = Dokan Single Vendor Order, 2 = Dokan Suborder, 3 = Refund of Dokan Parent Order, 4 = Refund of Dokan Suborder, 5 = Refund of Dokan Single Order, 6 = Advertisement Product Order, 7 = Advertisement Refund Order, 8 = Subscription Order, 9 = Subscription Refund Order'"
        );
        // @codingStandardsIgnoreEnd

        // Regenerate the order stats data.
        $processor = new V_4_2_11_RegenerateReportData();
        $processor->push_to_queue( [ 'regenerate' => true ] )->dispatch_process();
    }
}
