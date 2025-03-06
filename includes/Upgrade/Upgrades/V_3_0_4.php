<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_0_4 extends DokanUpgrader {

    /**
     * Get table_name and columns in key value pair
     *
     * @since 3.0.4
     *
     * @return array
     */
    public static function get_tables() {
        return [
            'dokan_withdraw'       => [ 'amount' ],
            'dokan_refund'         => [ 'refund_amount' ],
            'dokan_vendor_balance' => [ 'debit', 'credit' ],
            'dokan_orders'         => [ 'order_total', 'net_amount' ],
        ];
    }

    /**
     * Update various dokan tables
     *
     * @since 3.0.4
     *
     * @return void
     */
    public static function update_dokan_tables() {
        global $wpdb;

        foreach ( self::get_tables() as $table => $columns ) {
            $table_name = $wpdb->prefix . $table;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) !== $table_name ) {
                continue;
            }

            foreach ( $columns as $column ) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQLPlaceholders.UnsupportedIdentifierPlaceholder
                $wpdb->query( $wpdb->prepare( 'ALTER TABLE %i MODIFY COLUMN %i DECIMAL(19,4)', $table_name, $column ) );
            }
        }
    }
}
