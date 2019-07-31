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

function dokan_update_user_capabilities_276() {
    global $wp_roles;

    if ( class_exists( 'WP_Roles' ) && ! isset( $wp_roles ) ) {
        $wp_roles = new WP_Roles();
    }

    $caps = array(
        'publish_posts'             => true,
        'edit_posts'                => true,
        'delete_published_posts'    => true,
        'edit_published_posts'      => true,
        'delete_posts'              => true,
        'manage_categories'         => true,
        'moderate_comments'         => true,
        'unfiltered_html'           => true,
        'upload_files'              => true,
        'edit_shop_orders'          => true,
        'edit_product'              => true,
        'read_product'              => true,
        'delete_product'            => true,
        'edit_products'             => true,
        'publish_products'          => true,
        'read_private_products'     => true,
        'delete_products'           => true,
        'delete_products'           => true,
        'delete_private_products'   => true,
        'delete_published_products' => true,
        'delete_published_products' => true,
        'edit_private_products'     => true,
        'edit_published_products'   => true,
        'manage_product_terms'      => true,
        'delete_product_terms'      => true,
        'assign_product_terms'      => true,
    );

    foreach ( $caps as $cap => $val ) {
        $wp_roles->add_cap( 'seller', $cap );
    }

}


dokan_update_table_structure_276();
dokan_update_user_capabilities_276();
