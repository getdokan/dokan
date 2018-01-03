<?php
/**
 * Save admin fee as meta for existing sub-orders
 */
function dokan_update_order_meta_273(){
    $args = array(
        'post_type' => 'shop_order',
        'posts_per_page' => -1,
        'post_status' => 'any',
        'meta_query' => array(
            array(
                'key'     => 'has_sub_order',
                'compare' => 'NOT EXISTS',
            ),
            array(
                'key'     => '_dokan_admin_fee',
                'compare' => 'NOT EXISTS',
            ),
	)
    );
    
    $query = new WP_Query( $args );
    
    foreach (  $query->posts as $sub_order ) {
        $order = wc_get_order( $sub_order->ID );
        $admin_fee = dokan_get_admin_commission_by( $order, dokan_get_seller_id_by_order( $sub_order->ID ) );
        update_post_meta( $sub_order->ID , '_dokan_admin_fee', $admin_fee );
    }
}

dokan_update_order_meta_273();