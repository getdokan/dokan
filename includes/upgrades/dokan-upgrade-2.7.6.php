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

/**
 * Update seller capabilities
 *
 * @since 2.7.6
 *
 * @return void
 */
function dokan_update_user_capabilities_276() {
    global $wp_roles;

    if ( class_exists( 'WP_Roles' ) && ! isset( $wp_roles ) ) {
        $wp_roles = new WP_Roles();
    }

    $capabilities = array();
    $all_cap      = dokan_get_all_caps();

    foreach( $all_cap as $key=>$cap ) {
        $capabilities = array_merge( $capabilities, $cap );
    }

    foreach ( $capabilities as $key => $capability ) {
        $wp_roles->add_cap( 'seller', $capability );
        $wp_roles->add_cap( 'administrator', $capability );
        $wp_roles->add_cap( 'shop_manager', $capability );
    }
}

dokan_update_table_structure_276();
dokan_update_user_capabilities_276();
