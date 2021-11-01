<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_3_1 extends DokanUpgrader {

    /**
     * Updates withdraw database table column
     *
     * @since DOKAN_LITE_SINCE
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
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public static function update_refund_table_column() {
        global $wpdb;

        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $existing_columns = $wpdb->get_results( "DESC `{$wpdb->prefix}dokan_refund`" );

        if ( ! empty( $existing_columns ) ) {
            foreach ( $existing_columns as $existing_column ) {
                if ( ( ( 'item_totals' === $existing_column->Field ) || ( 'item_tax_totals' === $existing_column->Field ) ) && 'text' !== $existing_column->Type ) {
                    $wpdb->query(
                        "ALTER TABLE `{$wpdb->prefix}dokan_refund` MODIFY COLUMN {$existing_column->Field} text" // phpcs:ignore
                    );
                }
            }
        }
    }
}
