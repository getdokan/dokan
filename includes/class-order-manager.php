<?php

/**
 * Order Management API
 *
 * @since 2.8
 */
class Dokan_Order_Manager {

    function __construct() {

        // on order status change
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_change' ), 10, 3 );
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_sub_order_change' ), 99, 3 );

        add_action( 'woocommerce_checkout_update_order_meta', array( $this, 'new_order_created' ) );

        add_filter( 'woocommerce_coupon_is_valid', array( $this, 'ensure_vendor_coupon' ), 10, 3 );
    }

    /**
     * Update the child order status when a parent order status is changed
     *
     * @global object $wpdb
     *
     * @param int $order_id
     * @param string $old_status
     * @param string $new_status
     *
     * @return void
     */
    function on_order_status_change( $order_id, $old_status, $new_status ) {
        global $wpdb;

        // make sure order status contains "wc-" prefix
        if ( stripos( $new_status, 'wc-' ) === false ) {
            $new_status = 'wc-' . $new_status;
        }

        // insert on dokan sync table
        $wpdb->update( $wpdb->prefix . 'dokan_orders',
            array( 'order_status' => $new_status ),
            array( 'order_id' => $order_id ),
            array( '%s' ),
            array( '%d' )
        );

        // if any child orders found, change the orders as well
        $sub_orders = get_children( array( 'post_parent' => $order_id, 'post_type' => 'shop_order' ) );

        if ( $sub_orders ) {
            foreach ($sub_orders as $order_post) {
                $order = new WC_Order( $order_post->ID );
                $order->update_status( $new_status );
            }
        }
    }

    /**
     * Mark the parent order as complete when all the child order are completed
     *
     * @param int $order_id
     * @param string $old_status
     * @param string $new_status
     *
     * @return void
     */
    function on_sub_order_change( $order_id, $old_status, $new_status ) {
        $order_post = get_post( $order_id );

        // we are monitoring only child orders
        if ( $order_post->post_parent === 0 ) {
            return;
        }

        // get all the child orders and monitor the status
        $parent_order_id = $order_post->post_parent;
        $sub_orders      = get_children( array( 'post_parent' => $parent_order_id, 'post_type' => 'shop_order' ) );

        // return if any child order is not completed
        $all_complete = true;

        if ( $sub_orders ) {
            foreach ($sub_orders as $sub) {
                $order = new WC_Order( $sub->ID );
                if ( dokan_get_prop( $order, 'status' ) != 'completed' ) {
                    $all_complete = false;
                }
            }
        }

        // seems like all the child orders are completed
        // mark the parent order as complete
        if ( $all_complete ) {
            $parent_order = new WC_Order( $parent_order_id );
            $parent_order->update_status( 'wc-completed', __( 'Mark parent order completed when all child orders are completed.', 'dokan-lite' ) );
        }
    }

    /**
     * Monitors a new order and attempts to create sub-orders
     *
     * If an order contains products from multiple vendor, we can't show the order
     * to each seller dashboard. That's why we need to divide the main order to
     * some sub-orders based on the number of sellers.
     *
     * @param int $parent_order_id
     *
     * @return void
     */
    function new_order_created( $parent_order_id ) {
        $parent_order = wc_get_order( $parent_order_id );

        dokan_log( sprintf( 'New Order #%d created. Init sub order.', $parent_order_id ) );

        if ( $parent_order->get_meta( 'has_sub_order' ) == true ) {

            $args = array(
                'post_parent' => $parent_order_id,
                'post_type'   => 'shop_order',
                'numberposts' => -1,
                'post_status' => 'any'
            );

            $child_orders = get_children( $args );

            foreach ( $child_orders as $child ) {
                wp_delete_post( $child->ID, true );
            }
        }

        $vendors = dokan_get_sellers_by( $parent_order_id );

        // return if we've only ONE seller
        if ( count( $vendors ) == 1 ) {
            dokan_log( '1 vendor only, skipping sub order');

            $temp      = array_keys( $vendors );
            $seller_id = reset( $temp );

            wp_update_post( array( 'ID' => $parent_order_id, 'post_author' => $seller_id ) );

            $admin_fee = dokan_get_admin_commission_by( $parent_order, $seller_id );

            $parent_order->update_meta_data( '_dokan_admin_fee', $admin_fee );
            $parent_order->save();
            return;
        }

        // flag it as it has a suborder
        $parent_order->update_meta_data( 'has_sub_order', true );
        $parent_order->save();

        dokan_log( sprintf( 'Got %s vendors, starting sub order.', count( $vendors ) ) );

        // seems like we've got multiple sellers
        foreach ($vendors as $seller_id => $seller_products ) {
            $this->create_sub_order( $parent_order, $seller_id, $seller_products );
        }

        dokan_log( sprintf( 'Completed sub order for #%d.', $parent_order_id ) );
    }

    /**
     * Creates a sub order
     *
     * @param int $parent_order
     * @param int $seller_id
     * @param array $seller_products
     */
    function create_sub_order( $parent_order, $seller_id, $seller_products ) {

        dokan_log( 'Creating sub order for vendor: #' . $seller_id );

        $bill_ship = array(
            'billing_country', 'billing_first_name', 'billing_last_name', 'billing_company',
            'billing_address_1', 'billing_address_2', 'billing_city', 'billing_state', 'billing_postcode',
            'billing_email', 'billing_phone', 'shipping_country', 'shipping_first_name', 'shipping_last_name',
            'shipping_company', 'shipping_address_1', 'shipping_address_2', 'shipping_city',
            'shipping_state', 'shipping_postcode'
        );

        try {
            $order = new WC_Order();
            $order->set_status( $parent_order->get_status() );
            $order->set_parent_id( $parent_order->get_id() );

            // save billing and shipping address
            foreach ( $bill_ship as $key ) {
                if ( is_callable( array( $order, "set_{$key}" ) ) ) {
                    $order->{"set_{$key}"}( $parent_order->{"set_{$key}"} );
                }
            }

            $order_id = $order->save();
        } catch (Exception $e) {
            return new WP_Error( 'dokan-suborder-error', $e->getMessage() );
        }

        if ( $order_id && !is_wp_error( $order_id ) ) {

            wp_update_post( array( 'post_author' => $seller_id, 'ID' => $order_id ) );

            dokan_log( 'Created sub order : #' . $order_id );

            $order       = wc_get_order( $order_id );
            $items_tax   = array();

            $cart_subtotal      = 0;
            $cart_total         = 0;
            $fee_total          = 0;
            $shipping_total     = 0;
            $cart_subtotal_tax  = 0;
            $cart_total_tax     = 0;

            $product_ids = array_map(function($item) {
                return $item->get_product_id();
            }, $seller_products );

            // now insert line items
            $this->create_line_items( $order_id, $seller_products );

            // do shipping
            $shipping = $this->create_shipping( $parent_order, $order_id, $seller_products );

            // do tax
            $this->create_taxes( $order_id, $parent_order, $seller_products );

            // add coupons if any
            $this->create_coupon( $parent_order, $order_id, $product_ids );
            $discount = dokan_sub_order_get_total_coupon( $order_id );

            // Sum line item costs.
            foreach ( $order->get_items() as $item ) {
                $cart_subtotal     += $item->get_subtotal();
                $cart_total        += $item->get_total();
                $cart_subtotal_tax += $item->get_subtotal_tax();
                $cart_total_tax    += $item->get_total_tax();
            }

            // calculate the total
            // $order_in_total = round( $cart_total + $fee_total + $shipping_total + $this->get_cart_tax() + $this->get_shipping_tax(), wc_get_price_decimals() );

            /***************************************************/
            $order->set_created_via( 'dokan' );
            $order->set_cart_hash( $parent_order->get_cart_hash() );
            $order->set_customer_id( $parent_order->get_customer_id() );
            $order->set_currency( $parent_order->get_currency() );
            $order->set_prices_include_tax( $parent_order->get_prices_include_tax() );
            $order->set_customer_ip_address( $parent_order->get_customer_ip_address() );
            $order->set_customer_user_agent( $parent_order->get_customer_user_agent() );
            $order->set_customer_note( $parent_order->get_customer_note() );
            $order->set_payment_method( $parent_order->get_payment_method() );
            $order->set_payment_method_title( $parent_order->get_payment_method_title() );

            $order->set_shipping_total( $shipping['cost'] );
            $order->set_shipping_tax( $shipping['tax'] );

            $order->set_discount_total( $discount );
            $order->set_discount_tax( 0 );

            $order->set_cart_tax( $order_tax );
            $order->set_total( $order_in_total );
            /***************************************************/

            $order->save();

            do_action( 'dokan_checkout_update_order_meta', $order_id, $seller_id );
        } // if order
    }

    /**
     * Create sub order line items
     *
     * @param  integer $order_id
     * @param  array $products
     *
     * @return void
     */
    public function create_line_items( $order_id, $products ) {
        foreach ( $products as $item ) {
            $order_total   += (float) $item->get_total();
            $order_tax     += (float) $item->get_total_tax();

            $item_id = wc_add_order_item( $order_id, array(
                'order_item_name' => $item->get_name(),
                'order_item_type' => 'line_item'
            ) );

            if ( $item_id ) {
                $item_meta_data = $item->get_data();
                $meta_key_map   = dokan_get_order_item_meta_map();

                foreach ( $item->get_extra_data_keys() as $meta_key ) {
                    wc_add_order_item_meta( $item_id, $meta_key_map[$meta_key], $item_meta_data[$meta_key] );
                }
            }
        }
    }

    public function create_taxes( $order_id, $parent_order, $products ) {
        $seller_order = wc_get_order( $order_id );
        $items_tax    = array();

        foreach ( $products as $item ) {
            $items_tax[] = $item->get_taxes();
            $order_tax   += (float) $item->get_total_tax();
        }

        foreach ( $parent_order->get_items( array( 'tax' ) ) as $tax ) {
            $item_id = wc_add_order_item( $order_id, array(
                'order_item_name' => $tax->get_name(),
                'order_item_type' => 'tax'
            ) );

            $seller_shipping = $seller_order->get_items( 'shipping' );
            $seller_shipping = reset( $seller_shipping );

            $tax_metas = array(
                'rate_id'             => $tax->get_rate_id(),
                'label'               => $tax->get_label(),
                'compound'            => $tax->get_compound(),
                'tax_amount'          => wc_format_decimal( array_sum( $items_tax[$tax->get_rate_id()] ) ),
                'shipping_tax_amount' => is_bool( $seller_shipping ) ? '' : $seller_shipping->get_total_tax()
            );

            foreach ( $tax_metas as $meta_key => $meta_value ) {
                wc_add_order_item_meta( $item_id, $meta_key, $meta_value );
            }

        }
    }

    /**
     * Create shipping for a sub-order if neccessary
     *
     * @param WC_Order $parent_order
     * @param int $order_id
     * @param array $product_ids
     *
     * @return array
     */
    function create_shipping( $parent_order, $order_id, $products ) {

        dokan_log( sprintf( '#%d - Creating Shipping.', $order_id ) );

        // Get all shipping methods for parent order
        $shipping_methods = $parent_order->get_shipping_methods();
        $order_seller_id  = get_post_field( 'post_author', $order_id );

        $applied_shipping_method = '';

        if ( $shipping_methods ) {
            foreach ( $shipping_methods as $method_item_id => $shipping_object ) {
                $shipping_seller_id = wc_get_order_item_meta( $method_item_id, 'seller_id', true );

                if ( $order_seller_id == $shipping_seller_id ) {
                    $applied_shipping_method = $shipping_object;
                }
            }
        }

        $shipping_method = apply_filters( 'dokan_shipping_method', $applied_shipping_method, $order_id, $parent_order );

        // bail out if no shipping methods found
        if ( ! $shipping_method ) {
            dokan_log( sprintf( '#%d - No shipping method found. Aborting.', $order_id ) );
            return;
        }

        $shipping_products = array();
        $packages          = array();

        // emulate shopping cart for calculating the shipping method
        foreach ( $products as $product_item ) {
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
            dokan_log( sprintf( '#%d - Shipping products found. Calculating...', $order_id ) );

            $package = array(
                'contents'        => $shipping_products,
                'contents_cost'   => array_sum( wp_list_pluck( $shipping_products, 'line_total' ) ),
                'applied_coupons' => array(),
                'seller_id'       => $order_seller_id,
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

                $method   = $pack['rates'][$shipping_method['method_id']];
                $cost     = wc_format_decimal( $method->cost );

                $item_id = wc_add_order_item( $order_id, array(
                    'order_item_name'       => $method->label,
                    'order_item_type'       => 'shipping'
                ) );

                $formatted_tax = array_map( 'wc_format_decimal', $method->taxes );

                if ( $item_id ) {
                    $taxes =  array(
                        'total' => $formatted_tax,
                    );
                    wc_add_order_item_meta( $item_id, 'method_id', $method->id );
                    wc_add_order_item_meta( $item_id, 'cost', $cost );
                    wc_add_order_item_meta( $item_id, 'total_tax', $method->get_shipping_tax() );
                    wc_add_order_item_meta( $item_id, 'taxes', $taxes );

                    foreach ( $method->get_meta_data() as $key => $value ) {
                        wc_add_order_item_meta( $item_id, $key, $value );
                    }
                }

                return array( 'cost' => $cost, 'tax' => $method->get_shipping_tax() );
            };
        }

        return array( 'cost' => 0, 'tax' => 0 );
    }

    /**
     * Create coupons for a sub-order if neccessary
     *
     * @param WC_Order $parent_order
     * @param int $order_id
     * @param array $product_ids
     *
     * @return void
     */
    function create_coupon( $parent_order, $order_id, $product_ids ) {
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
     * Ensure vendor coupon
     *
     * For consistancy, restrict coupons in cart if only
     * products from that vendor exists in the cart. Also, a coupon
     * should be restricted with a product.
     *
     * For example: When entering a coupon created by admin is applied, make
     * sure a product of the admin is in the cart. Otherwise it wouldn't be
     * possible to distribute the coupon in sub orders.
     *
     * @param  boolean $valid
     * @param  \WC_Coupon $coupon
     *
     * @return boolean|Execption
     */
    public function ensure_vendor_coupon( $valid, $coupon ) {
        $coupon_id         = $coupon->get_id();
        $vendor_id         = get_post_field( 'post_author', $coupon_id );
        $available_vendors = array();

        // a coupon must be bound with a product
        if ( count( $coupon->get_product_ids() ) == 0 ) {
            throw new Exception( __( 'A coupon must be restricted with a vendor product.', 'dokan-lite' ) );

        }

        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id = $item['data']->get_id();

            $available_vendors[] = get_post_field( 'post_author', $product_id );
        }

        if ( ! in_array( $vendor_id, $available_vendors ) ) {
            return false;
        }

        return true;
    }
}
