<?php
/**
 * Injects seller name on cart and other areas
 *
 * @param array $item_data
 * @param array $cart_item
 * @return array
 */
function dokan_product_seller_info( $item_data, $cart_item ) {
    
    $seller_id =  get_post_field( 'post_author', $cart_item['data']->get_id() );
    $seller_info = dokan_get_store_info( $seller_id );

    $item_data[] = array(
        'name'  => __( 'Vendor', 'dokan-lite' ),
        'value' => $seller_info['store_name']
    );

    return $item_data;
}

add_filter( 'woocommerce_get_item_data', 'dokan_product_seller_info', 10, 2 );


/**
 * Adds a seller tab in product single page
 *
 * @param array $tabs
 * @return array
 */
function dokan_seller_product_tab( $tabs) {

    $tabs['seller'] = array(
        'title'    => __( 'Vendor Info', 'dokan-lite' ),
        'priority' => 90,
        'callback' => 'dokan_product_seller_tab'
    );

    return $tabs;
}

add_filter( 'woocommerce_product_tabs', 'dokan_seller_product_tab' );


/**
 * Prints seller info in product single page
 *
 * @global WC_Product $product
 * @param type $val
 */
function dokan_product_seller_tab( $val ) {
    global $product;

    $author_id  = get_post_field( 'post_author', $product->get_id() );
    $author     = get_user_by( 'id', $author_id );
    $store_info = dokan_get_store_info( $author->ID );

    dokan_get_template_part('global/product-tab', '', array(
        'author' => $author,
        'store_info' => $store_info,
    ) );
}


/**
 * Show sub-orders on a parent order if available
 *
 * @param WC_Order $parent_order
 * @return void
 */
function dokan_order_show_suborders( $parent_order ) {

    $sub_orders = get_children( array(
        'post_parent' => dokan_get_prop( $parent_order, 'id'),
        'post_type'   => 'shop_order',
        'post_status' => array( 'wc-pending', 'wc-completed', 'wc-processing', 'wc-on-hold', 'wc-cancelled'  )
    ) );

    if ( ! $sub_orders ) {
        return;
    }

    $statuses = wc_get_order_statuses();

    dokan_get_template_part( 'sub-orders', '', array( 'sub_orders' => $sub_orders, 'statuses' => $statuses ) );
}

add_action( 'woocommerce_order_details_after_order_table', 'dokan_order_show_suborders' );

/**
 * Default seller image
 *
 * @return string
 */
function dokan_get_no_seller_image() {
    $image = DOKAN_PLUGIN_ASSEST. '/images/no-seller-image.png';

    return apply_filters( 'dokan_no_seller_image', $image );
}

/**
 * Override Customer Orders array
 *
 * @param post_arg_query array()
 *
 * @return array() post_arg_query
 */
function dokan_get_customer_main_order( $customer_orders ) {
    $customer_orders['post_parent'] = 0;
    return $customer_orders;
}

add_filter( 'woocommerce_my_account_my_orders_query', 'dokan_get_customer_main_order');
