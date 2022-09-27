<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_3_1 extends DokanUpgrader {

    /**
     * Updates withdraw database table column
     *
     * @since 3.3.1
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
     * Updates refund database table column
     *
     * @since 3.3.1
     *
     * @return void
     */
    public static function update_refund_table_column() {
        global $wpdb;

        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $existing_columns = $wpdb->get_results( "DESC `{$wpdb->prefix}dokan_refund`" );

        foreach ( (array) $existing_columns as $existing_column ) {
            if ( in_array( $existing_column->Field, [ 'item_totals', 'item_tax_totals' ], true ) && 'text' !== $existing_column->Type ) { // phpcs:ignore
                $wpdb->query(
                    "ALTER TABLE `{$wpdb->prefix}dokan_refund` MODIFY COLUMN {$existing_column->Field} text" // phpcs:ignore
                );
            }
        }
    }

    /**
     * This will add installed time for existing users
     *
     * @since 3.3.1
     *
     * @return void
     */
    public static function add_version_info() {
        if ( empty( get_option( 'dokan_installed_time' ) ) ) {
            $current_time = dokan_current_datetime()->modify( '- 11 days' )->getTimestamp();
            update_option( 'dokan_installed_time', $current_time );
        }
    }
}
