<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_9_13 extends DokanUpgrader {

    /**
     * Update single product multi vendor module table
     *
     * @return void
     */
    public static function update_spmv_product_map_table() {
        global $wpdb;

        $map_table = $wpdb->prefix . 'dokan_product_map';

        if ( $wpdb->get_var( $wpdb->prepare( 'show tables like %s', $map_table ) ) !== $map_table ) {
            return;
        }

        // @codingStandardsIgnoreStart
        $columns = $wpdb->get_results( "describe {$map_table}" );

        $columns = array_filter(
            $columns, function ( $column ) {
				return 'visibility' === $column->Field;
			}
        );

        if ( empty( $columns ) ) {
            $wpdb->query(
                "alter table {$map_table} add column visibility tinyint(1) default 1"
            );
        }
        // @codingStandardsIgnoreEnd
    }
}
