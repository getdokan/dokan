<?php

/**
 * Monitors a new order and attempts to create sub-orders
 *
 * If an order contains products from multiple vendor, we can't show the order
 * to each seller dashboard. That's why we need to divide the main order to
 * some sub-orders based on the number of sellers.
 *
 * @param int $parent_order_id
 *
 * @deprecated 3.8.0
 *
 * @return void
 */
function dokan_create_sub_order( $parent_order_id ) {
    wc_deprecated_function( 'dokan_create_sub_order', '3.7.13', 'dokan()->order->create_sub_order()' );
}

/**
 * Creates a sub order
 *
 * @param int   $parent_order
 * @param int   $seller_id
 * @param array $seller_products
 *
 * @deprecated 3.8.0
 *
 * @return void
 */
function dokan_create_seller_order( $parent_order, $seller_id, $seller_products ) {
    wc_deprecated_function( 'dokan_create_sub_order', '3.7.13', 'dokan()->order->create_sub_order()' );
}

/**
 * Create coupons for a sub-order if neccessary
 *
 * @param WC_Order $parent_order
 * @param int      $order_id
 * @param array    $product_ids
 *
 * @return void
 */
function dokan_create_sub_order_coupon( $parent_order, $order_id, $product_ids ) {
    $used_coupons = $parent_order->get_used_coupons();

    if ( ! count( $used_coupons ) ) {
        return;
    }

    if ( $used_coupons ) {
        foreach ( $used_coupons as $coupon_code ) {
            $coupon = new WC_Coupon( $coupon_code );

            if ( $coupon && ! is_wp_error( $coupon ) && array_intersect( $product_ids, $coupon->product_ids ) ) {

                // we found some match
                $item_id = wc_add_order_item(
                    $order_id, [
                        'order_item_name' => $coupon_code,
                        'order_item_type' => 'coupon',
                    ]
                );

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
 * @param int      $order_id
 * @param array    $seller_products
 *
 * @throws Exception
 *
 * @return mixed
 */
function dokan_create_sub_order_shipping( $parent_order, $order_id, $seller_products ) {
    // Get all shipping methods for parent order
    $shipping_methods        = $parent_order->get_shipping_methods();
    $order_seller_id         = dokan_get_seller_id_by_order( $order_id );
    $applied_shipping_method = [];

    if ( $shipping_methods ) {
        foreach ( $shipping_methods as $key => $value ) {
            $product_id                                 = $value['_product_ids'];
            $product_author                             = get_post_field( 'post_author', $product_id );
            $applied_shipping_method[ $product_author ] = $value;
        }
    }

    $shipping_method = $applied_shipping_method[ $order_seller_id ];
    $shipping_method = apply_filters( 'dokan_shipping_method', $shipping_method, $order_id, $parent_order );

    // bail out if no shipping methods found
    if ( ! $shipping_method ) {
        return;
    }

    $shipping_products = [];
    $packages          = [];

    // emulate shopping cart for calculating the shipping method
    foreach ( $seller_products as $product_item ) {
        $product = wc_get_product( $product_item['product_id'] );

        if ( $product->needs_shipping() ) {
            $shipping_products[] = [
                'product_id'        => $product_item['product_id'],
                'variation_id'      => $product_item['variation_id'],
                'variation'         => '',
                'quantity'          => $product_item['qty'],
                'data'              => $product,
                'line_total'        => $product_item['line_total'],
                'line_tax'          => $product_item['line_tax'],
                'line_subtotal'     => $product_item['line_subtotal'],
                'line_subtotal_tax' => $product_item['line_subtotal_tax'],
            ];
        }
    }

    if ( $shipping_products ) {
        $package = [
            'contents'        => $shipping_products,
            'contents_cost'   => array_sum( wp_list_pluck( $shipping_products, 'line_total' ) ),
            'applied_coupons' => [],
            'seller_id'       => $order_seller_id,
            'destination'     => [
                'country'   => dokan_get_prop( $parent_order, 'shipping_country' ),
                'state'     => dokan_get_prop( $parent_order, 'shipping_state' ),
                'postcode'  => dokan_get_prop( $parent_order, 'shipping_postcode' ),
                'city'      => dokan_get_prop( $parent_order, 'shipping_city' ),
                'address'   => dokan_get_prop( $parent_order, 'shipping_address_1' ),
                'address_2' => dokan_get_prop( $parent_order, 'shipping_address_2' ),
            ],
        ];

        $wc_shipping = WC_Shipping::instance();
        $pack        = $wc_shipping->calculate_shipping_for_package( $package );

        if ( array_key_exists( $shipping_method['method_id'], $pack['rates'] ) ) {
            $method = $pack['rates'][ $shipping_method['method_id'] ];
            $cost   = wc_format_decimal( $method->cost );

            // we assumed that the key will be always 1, if different conditinos appear in future, we'll update the script
            $tax = wc_format_decimal( $method->taxes[1] );

            $item_id = wc_add_order_item(
                $order_id, [
                    'order_item_name' => $method->label,
                    'order_item_type' => 'shipping',
                ]
            );

            if ( $item_id ) {
                wc_add_order_item_meta( $item_id, 'method_id', $method->id );
                wc_add_order_item_meta( $item_id, 'cost', $cost );
            }

            return [
                'cost' => $cost,
                'tax'  => $tax,
            ];
        }
    }

    return 0;
}
