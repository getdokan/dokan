<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

/**
 * Upgrade class for version DOKAN_SINCE.
 *
 * @since DOKAN_SINCE
 */
class V_5_0_0 extends DokanUpgrader {

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
}
