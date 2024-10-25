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

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $existing_columns = $wpdb->get_col( "DESC `{$wpdb->prefix}dokan_withdraw`", 0 );

        if ( in_array( 'details', $existing_columns, true ) ) {
            return;
        }

        $table = $wpdb->prefix . 'dokan_withdraw';
        $column = 'details';
        $after = 'note';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQLPlaceholders.UnsupportedIdentifierPlaceholder
        $wpdb->query( $wpdb->prepare( 'ALTER TABLE %i ADD COLUMN %i longtext AFTER %i', $table, $column, $after ) );
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

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $existing_columns = $wpdb->get_results( "DESC `{$wpdb->prefix}dokan_refund`" );

        foreach ( (array) $existing_columns as $existing_column ) {
            if ( in_array( $existing_column->Field, [ 'item_totals', 'item_tax_totals' ], true ) && 'text' !== $existing_column->Type ) { // phpcs:ignore
                $table  = $wpdb->prefix . 'dokan_refund';
                $column = $existing_column->Field; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQLPlaceholders.UnsupportedIdentifierPlaceholder
                $wpdb->query( $wpdb->prepare( 'ALTER TABLE %i MODIFY COLUMN %i text', $table, $column ) );
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
