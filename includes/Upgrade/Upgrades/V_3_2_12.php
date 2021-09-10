<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_2_9_23_StoreName;

class V_3_2_12 extends DokanUpgrader {

    /**
     * Update withdraw table for add new `details` column
     *
     * @since 3.2.12
     *
     * @return void
     */
    public static function update_dokan_withdraw_table() {
        global $wpdb;

        $map_table = $wpdb->prefix . 'dokan_withdraw';

        if ( $wpdb->get_var( $wpdb->prepare( 'show tables like %s', $map_table ) ) !== $map_table ) {
            return;
        }

        $columns = $wpdb->get_results( "describe {$map_table}" ); // phpcs:ignore

        $columns = array_filter(
            $columns, function ( $column ) {
                return 'details' === $column->Field; // phpcs:ignore
            }
        );

        if ( empty( $columns ) ) {
            $wpdb->query(
                "alter table {$map_table} add column details longtext NOT NULL AFTER note" // phpcs:ignore
            );
        }
    }

    /** Update store name meta data
     *
     * @since 3.2.12
     *
     * @return void
     */
    public static function dokan_update_store_name() {
        $processor = new V_2_9_23_StoreName();

        $args = [
            'updating' => 'store_name',
            'paged'    => 0,
        ];

        $processor->push_to_queue( $args )->dispatch_process();
    }
}
