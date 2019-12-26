<?php

/**
 * Update single product multi vendor module table
 *
 * @return void
 */
function dokan_update_spmv_product_map_table_2_9_13() {
    global $wpdb;

    $map_table = $wpdb->prefix . 'dokan_product_map';

    if ( $wpdb->get_var( $wpdb->prepare("show tables like %s", $map_table ) ) !== $map_table ) {
        return;
    }

    $columns = $wpdb->get_results( "describe {$wpdb->prefix}dokan_product_map" );

    $columns = array_filter( $columns, function ( $column ) {
        return 'visibility' === $column->Field;
    } );

    if ( empty( $columns ) ) {
        $wpdb->query(
            $wpdb->prepare( "alter table `{$wpdb->prefix}dokan_product_map` add column visibility tinyint(1) default %d", 1 )
        );
    }
}

dokan_update_spmv_product_map_table_2_9_13();
