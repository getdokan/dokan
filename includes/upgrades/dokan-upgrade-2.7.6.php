<?php
/**
 * Modify ip column to support the max possible length of IPv6
 */
function dokan_update_table_structure_276(){
    global $wpdb;

    $wpdb->query(
        "ALTER TABLE `{$wpdb->prefix}dokan_withdraw`
        MODIFY COLUMN ip varchar(50) NOT NULL"
    );
}

dokan_update_table_structure_276();