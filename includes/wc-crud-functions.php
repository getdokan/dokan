<?php

/**
* Map meta data for new item meta keys
*
* @since 2.5.8
*
* @return void
**/
function dokan_get_order_item_meta_map() {
    return apply_filters( 'dokan_get_order_item_meta_keymap', array(
        'product_id'   => '_product_id',
        'variation_id' => '_variation_id',
        'quantity'     => '_qty',
        'tax_class'    => '_tax_class',
        'subtotal'     => '_line_subtotal',
        'subtotal_tax' => '_line_subtotal_tax',
        'total'        => '_line_total',
        'total_tax'    => '_line_tax',
        'taxes'        => '_line_tax_data'
    ) );
}


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

    $parent_order         = new WC_Order( $parent_order_id );
    $sellers              = dokan_get_sellers_by( $parent_order_id );

    // return if we've only ONE seller
    if ( count( $sellers ) == 1 ) {
        $temp = array_keys( $sellers );
        $seller_id = reset( $temp );
        wp_update_post( array( 'ID' => $parent_order_id, 'post_author' => $seller_id ) );
        return;
    }

    // flag it as it has a suborder
    update_post_meta( $parent_order_id, 'has_sub_order', true );

    // seems like we've got multiple sellers
    foreach ($sellers as $seller_id => $seller_products ) {
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

    $order_data = apply_filters( 'woocommerce_new_order_data', array(
        'post_type'     => 'shop_order',
        'post_title'    => sprintf( __( 'Order &ndash; %s', 'dokan-lite' ), strftime( _x( '%b %d, %Y @ %I:%M %p', 'Order date parsed by strftime', 'dokan-lite' ) ) ),
        'post_status'   => 'wc-pending',
        'ping_status'   => 'closed',
        'post_excerpt'  => isset( $posted['order_comments'] ) ? $posted['order_comments'] : '',
        'post_author'   => $seller_id,
        'post_parent'   => $parent_order->get_id(),
        'post_password' => uniqid( 'order_' )   // Protects the post just in case
    ) );

    $order_id = wp_insert_post( $order_data );

    if ( $order_id && !is_wp_error( $order_id ) ) {

        $order_total = $order_tax = 0;
        $product_ids = array();

        do_action( 'woocommerce_new_order', $order_id );

        // now insert line items
        foreach ( $seller_products as $item ) {
            $order_total   += (float) $item->get_total();
            $order_tax     += (float) $item->get_total_tax();
            $product_ids[] = $item->get_product_id();

            $item_id = wc_add_order_item( $order_id, array(
                'order_item_name' => $item->get_name(),
                'order_item_type' => 'line_item'
            ) );

            if ( $item_id ) {
                $item_meta_data = $item->get_data();
                $meta_key_map = dokan_get_order_item_meta_map();
                foreach ( $item->get_extra_data_keys() as $meta_key ) {
                    wc_add_order_item_meta( $item_id, $meta_key_map[$meta_key], $item_meta_data[$meta_key] );
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
        foreach ( $bill_ship as $val ) {
            $order_key = 'get_' . ltrim( $val, '_' );
            update_post_meta( $order_id, $val, $parent_order->$order_key() );
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
        update_post_meta( $order_id, '_payment_method',         $parent_order->get_payment_method() );
        update_post_meta( $order_id, '_payment_method_title',   $parent_order->get_payment_method_title() );

        update_post_meta( $order_id, '_order_shipping',         wc_format_decimal( $shipping_cost ) );
        update_post_meta( $order_id, '_order_discount',         wc_format_decimal( $discount ) );
        update_post_meta( $order_id, '_cart_discount',          wc_format_decimal( $discount ) );
        update_post_meta( $order_id, '_order_tax',              wc_format_decimal( $order_tax ) );
        update_post_meta( $order_id, '_order_shipping_tax',     wc_format_decimal( $shipping_tax ) );
        update_post_meta( $order_id, '_order_total',            wc_format_decimal( $order_in_total ) );
        update_post_meta( $order_id, '_order_key',              apply_filters('woocommerce_generate_order_key', uniqid('order_') ) );
        update_post_meta( $order_id, '_customer_user',          $parent_order->get_customer_id() );
        update_post_meta( $order_id, '_order_currency',         get_post_meta( $parent_order->get_id(), '_order_currency', true ) );
        update_post_meta( $order_id, '_prices_include_tax',     $parent_order->get_prices_include_tax() );
        update_post_meta( $order_id, '_customer_ip_address',    get_post_meta( $parent_order->get_id(), '_customer_ip_address', true ) );
        update_post_meta( $order_id, '_customer_user_agent',    get_post_meta( $parent_order->get_id(), '_customer_user_agent', true ) );

        do_action( 'dokan_checkout_update_order_meta', $order_id, $seller_id );
    } // if order
}


/**
 * Create coupons for a sub-order if neccessary
 *
 * @param WC_Order $parent_order
 * @param int $order_id
 * @param array $product_ids
 * @return type
 */
function dokan_create_sub_order_coupon( $parent_order, $order_id, $product_ids ) {
    $used_coupons = $parent_order->get_used_coupons();

    if ( ! count( $used_coupons ) ) {
        return;
    }

    if ( $used_coupons ) {
        foreach ($used_coupons as $coupon_code) {
            $coupon = new WC_Coupon( $coupon_code );

            if ( $coupon && !is_wp_error( $coupon ) && array_intersect( $product_ids, $coupon->get_product_ids() ) ) {

                // we found some match
                $item_id = wc_add_order_item( $order_id, array(
                    'order_item_name' => $coupon_code,
                    'order_item_type' => 'coupon'
                ) );

                // Add line item meta
                if ( $item_id ) {
                    wc_add_order_item_meta( $item_id, 'discount_amount', isset( WC()->cart->coupon_discount_amounts[ $coupon_code ] ) ? WC()->cart->coupon_discount_amounts[ $coupon_code ] : 0 );
                }
            }
        }
    }
}

/**
 * Create shipping for a sub-order if neccessary
 *
 * @param WC_Order $parent_order
 * @param int $order_id
 * @param array $product_ids
 * @return type
 */
function dokan_create_sub_order_shipping( $parent_order, $order_id, $seller_products ) {

    // take only the first shipping method
    $shipping_methods = $parent_order->get_shipping_methods();

    $shipping_method = is_array( $shipping_methods ) ? reset( $shipping_methods ) : array();

    $shipping_method = apply_filters( 'dokan_shipping_method', $shipping_method, $order_id, $parent_order );

    // bail out if no shipping methods found
    if ( !$shipping_method ) {
        return;
    }

    $shipping_products = array();
    $packages = array();

    // emulate shopping cart for calculating the shipping method
    foreach ( $seller_products as $product_item ) {
        $product = wc_get_product( $product_item->get_product_id() );

        if ( $product->needs_shipping() ) {
            $shipping_products[] = array(
                'product_id'        => $product_item->get_product_id(),
                'variation_id'      => $product_item->get_variation_id(),
                'variation'         => '',
                'quantity'          => $product_item->get_quantity(),
                'data'              => $product,
                'line_total'        => $product_item->get_total(),
                'line_tax'          => $product_item->get_total_tax(),
                'line_subtotal'     => $product_item->get_subtotal(),
                'line_subtotal_tax' => $product_item->get_subtotal_tax(),
            );
        }
    }

    if ( $shipping_products ) {
        $package = array(
            'contents'        => $shipping_products,
            'contents_cost'   => array_sum( wp_list_pluck( $shipping_products, 'line_total' ) ),
            'applied_coupons' => array(),
            'destination'     => array(
                'country'   => $parent_order->get_shipping_country(),
                'state'     => $parent_order->get_shipping_state(),
                'postcode'  => $parent_order->get_shipping_postcode(),
                'city'      => $parent_order->get_shipping_city(),
                'address'   => $parent_order->get_shipping_address_1(),
                'address_2' => $parent_order->get_shipping_address_2()
            )
        );

        $wc_shipping = WC_Shipping::instance();
        $pack = $wc_shipping->calculate_shipping_for_package( $package );

        if ( array_key_exists( $shipping_method['method_id'], $pack['rates'] ) ) {

            $method = $pack['rates'][$shipping_method['method_id']];
            $cost = wc_format_decimal( $method->cost );
            // we assumed that the key will be always 1, if different conditinos appear in future, we'll update the script
            $tax  = wc_format_decimal( $method->taxes[1] );

            $item_id = wc_add_order_item( $order_id, array(
                'order_item_name'       => $method->label,
                'order_item_type'       => 'shipping'
            ) );

            if ( $item_id ) {
                wc_add_order_item_meta( $item_id, 'method_id', $method->id );
                wc_add_order_item_meta( $item_id, 'cost', $cost );
            }

            return array( 'cost' => $cost, 'tax' => $tax );
        };
    }

    return 0;
}
