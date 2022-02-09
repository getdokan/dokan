<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_3_7 extends DokanUpgrader {

    /**
     * Updates withdraw database table column. Before on dokan_withdraw
     * table details column it was set longtext NOT NUll, now we are setting it null by default.
     *
     * @since 3.3.7
     *
     * @return void
     */
    public static function update_withdraw_table_column() {
        global $wpdb;

        $existing_columns = $wpdb->get_results( "DESC `{$wpdb->prefix}dokan_withdraw`" );

        foreach ( (array) $existing_columns as $existing_column ) {
            if ( 'details' === $existing_column->Field && 'NO' === $existing_column->Null ) { // phpcs:ignore
                $wpdb->query(
                    "ALTER TABLE `{$wpdb->prefix}dokan_withdraw` MODIFY COLUMN {$existing_column->Field} longtext NULL" // phpcs:ignore
                );
            }
        }
    }

    /**
     * Flush rewrite rules so that new menu is visible without permalink reset
     *
     * @since 3..3.7
     *
     * @return void
     */
    public static function flush_rewrite_rules() {
        do_action( 'woocommerce_flush_rewrite_rules' );
    }
}
