<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_2_12 extends DokanUpgrader {

    /**
     * Update withdraw table for add new `details` column
     *
     * @return void
     */
    public static function update_dokan_withdraw_table() {
        global $wpdb;

        $map_table = $wpdb->prefix . 'dokan_withdraw';

        if ( $wpdb->get_var( $wpdb->prepare( 'show tables like %s', $map_table ) ) !== $map_table ) {
            return;
        }

        $columns = $wpdb->get_results( "describe {$map_table}" );

        $columns = array_filter(
            $columns, function ( $column ) {
            return 'details' === $column->Field;
        }
        );

        if ( empty( $columns ) ) {
            $wpdb->query(
                "alter table {$map_table} add column details longtext NOT NULL AFTER note"
            );
        }
    }
}
