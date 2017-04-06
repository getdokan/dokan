<?php

/**
 * Monitors a new order and attempts to create sub-orders
 *
 * If an order contains products from multiple vendor, we can't show the order
 * to each seller dashboard. That's why we need to divide the main order to
 * some sub-orders based on the number of sellers.
 *
 * @param int $parent_order_id
 * @return void
 * 
 * @hooked woocommerce_checkout_update_order_meta - 10
 */
function dokan_create_sub_order( $parent_order_id ) {

    if ( get_post_meta( $parent_order_id, 'has_sub_order' ) == true ) {
        $args = array(
            'post_parent' => $parent_order_id,
            'post_type'   => 'shop_order',
            'numberposts' => -1,
            'post_status' => 'any'
        );
        $child_orders = get_children( $args );

        foreach ( $child_orders as $child ) {
            wp_delete_post( $child->ID );
        }
    }

    $parent_order = new WC_Order( $parent_order_id );
    var_dump($parent_order->get_id());
    $sellers      = dokan_get_sellers_by( $parent_order_id );

    // return if we've only ONE seller and seller as author
    if ( count( $sellers ) == 1 ) {
        $temp      = array_keys( $sellers );
        $seller_id = reset( $temp );
        wp_update_post( array( 'ID' => $parent_order_id, 'post_author' => $seller_id ) );
        return;
    }

    // flag it as it has a suborder
    update_post_meta( $parent_order_id, 'has_sub_order', true );
    var_dump($sellers);
    // seems like we've got multiple sellers
    foreach ( $sellers as $seller_id => $seller_products ) {
        dokan_create_seller_order( $parent_order, $seller_id, $seller_products );
    }
}

/**
 * Creates a sub order
 *
 * @param int $parent_order
 * @param int $seller_id
 * @param array $seller_products
 */
function dokan_create_seller_order( $parent_order, $seller_id, $seller_products ) {
    
    var_dump($parent_order);die();
    $order_data = apply_filters( 'woocommerce_new_order_data', array(
        'post_type'     => 'shop_order',
        'post_title'    => sprintf( __( 'Order &ndash; %s', 'dokan-lite' ), strftime( _x( '%b %d, %Y @ %I:%M %p', 'Order date parsed by strftime', 'dokan-lite' ) ) ),
        'post_status'   => 'wc-pending',
        'ping_status'   => 'closed',
        'post_excerpt'  => isset( $posted['order_comments'] ) ? $posted['order_comments'] : '',
        'post_author'   => $seller_id,
        'post_parent'   => dokan_cmp_get_prop( $parent_order, 'id' ),
        'post_password' => uniqid( 'order_' )   // Protects the post just in case
    ) );

    $order_id = wp_insert_post( $order_data );

    if ( $order_id && !is_wp_error( $order_id ) ) {

        $order_total = $order_tax = 0;
        $product_ids = array();

        do_action( 'woocommerce_new_order', $order_id );

        // now insert line items
        foreach ( $seller_products as $item ) {
            $order_total   += (float) $item['line_total'];
            $order_tax     += (float) $item['line_tax'];
            $product_ids[] = $item['product_id'];

            $item_id = wc_add_order_item( $order_id, array(
                'order_item_name' => $item['name'],
                'order_item_type' => 'line_item'
            ) );

            if ( $item_id ) {
                foreach ( $item['item_meta'] as $meta_key => $meta_value ) {
                    wc_add_order_item_meta( $item_id, $meta_key, $meta_value[0] );
                }
            }
        }

        $bill_ship = array(
            '_billing_country', '_billing_first_name', '_billing_last_name', '_billing_company',
            '_billing_address_1', '_billing_address_2', '_billing_city', '_billing_state', '_billing_postcode',
            '_billing_email', '_billing_phone', '_shipping_country', '_shipping_first_name', '_shipping_last_name',
            '_shipping_company', '_shipping_address_1', '_shipping_address_2', '_shipping_city',
            '_shipping_state', '_shipping_postcode'
        );

        // save billing and shipping address
        foreach ($bill_ship as $val) {
            $order_key = ltrim( $val, '_' );
            update_post_meta( $order_id, $val, dokan_cmp_get_prop( $parent_order, $order_key ) );
        }

        // do shipping
        $shipping_values = dokan_create_sub_order_shipping( $parent_order, $order_id, $seller_products );
        $shipping_cost   = $shipping_values['cost'];
        $shipping_tax    = $shipping_values['tax'];

        // add coupons if any
        dokan_create_sub_order_coupon( $parent_order, $order_id, $product_ids );
        $discount = dokan_sub_order_get_total_coupon( $order_id );

        // calculate the total
        $order_in_total = $order_total + $shipping_cost + $order_tax + $shipping_tax;
        //$order_in_total = $order_total + $shipping_cost + $order_tax - $discount;

        // set order meta
        update_post_meta( $order_id, '_payment_method',         $parent_order->payment_method );
        update_post_meta( $order_id, '_payment_method_title',   $parent_order->payment_method_title );

        update_post_meta( $order_id, '_order_shipping',         wc_format_decimal( $shipping_cost ) );
        update_post_meta( $order_id, '_order_discount',         wc_format_decimal( $discount ) );
        update_post_meta( $order_id, '_cart_discount',          wc_format_decimal( $discount ) );
        update_post_meta( $order_id, '_order_tax',              wc_format_decimal( $order_tax ) );
        update_post_meta( $order_id, '_order_shipping_tax',     wc_format_decimal( $shipping_tax ) );
        update_post_meta( $order_id, '_order_total',            wc_format_decimal( $order_in_total ) );
        update_post_meta( $order_id, '_order_key',              apply_filters('woocommerce_generate_order_key', uniqid('order_') ) );
        update_post_meta( $order_id, '_customer_user',          $parent_order->customer_user );
        update_post_meta( $order_id, '_order_currency',         get_post_meta( $parent_order->id, '_order_currency', true ) );
        update_post_meta( $order_id, '_prices_include_tax',     $parent_order->prices_include_tax );
        update_post_meta( $order_id, '_customer_ip_address',    get_post_meta( $parent_order->id, '_customer_ip_address', true ) );
        update_post_meta( $order_id, '_customer_user_agent',    get_post_meta( $parent_order->id, '_customer_user_agent', true ) );

        do_action( 'dokan_checkout_update_order_meta', $order_id, $seller_id );
    } // if order
}