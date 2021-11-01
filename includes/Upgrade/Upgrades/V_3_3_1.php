<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_3_1 extends DokanUpgrader {

    /**
     * Updates withdraw database table column
     *
     * @since 3.3.7
     *
     * @return void
     */
    public static function update_withdraw_table_column() {
        global $wpdb;

        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $existing_columns = $wpdb->get_col( "DESC `{$wpdb->prefix}dokan_withdraw`", 0 );

        if ( in_array( 'details', $existing_columns, true ) ) {
            return;
        }

        $wpdb->query(
            "ALTER TABLE `{$wpdb->prefix}dokan_withdraw` ADD COLUMN `details` longtext AFTER `note`" // phpcs:ignore
        );
    }

    /**
     * Updates withdraw database table column
     *
     * @since 3.3.7
     *
     * @return void
     */
    public static function update_refund_table_column() {
        global $wpdb;

        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $existing_columns = $wpdb->get_col( "DESC `{$wpdb->prefix}dokan_refund`", 0 );

        if ( in_array( 'item_totals', $existing_columns, true ) && in_array( 'item_tax_totals', $existing_columns, true ) ) {
            $wpdb->query(
                "ALTER TABLE `{$wpdb->prefix}dokan_refund` MODIFY COLUMN item_totals text" // phpcs:ignore
            );

            $wpdb->query(
                "ALTER TABLE `{$wpdb->prefix}dokan_refund` MODIFY COLUMN item_tax_totals text" // phpcs:ignore
            );
        }
    }
}
