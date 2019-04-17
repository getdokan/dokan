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

        // create sub-orders
        add_action( 'woocommerce_checkout_update_order_meta', array( $this, 'maybe_split_orders' ) );

        // prevent non-vendor coupons from being added
        add_filter( 'woocommerce_coupon_is_valid', array( $this, 'ensure_vendor_coupon' ), 10, 3 );

        if ( is_admin() ) {
            add_action( 'woocommerce_process_shop_order_meta', 'dokan_sync_insert_order' );
        }

        // restore order stock if it's been reduced by twice
        add_action( 'woocommerce_reduce_order_stock', array( $this, 'restore_reduced_order_stock' ) );
    }

    /**
     * Update the child order status when a parent order status is changed
     *
     * @global object $wpdb
     *
     * @param integer $order_id
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
            foreach ( $sub_orders as $order_post ) {
                $order = wc_get_order( $order_post->ID );
                $order->update_status( $new_status );
            }
        }

        // update on vendor-balance table
       $wpdb->update( $wpdb->prefix . 'dokan_vendor_balance',
            array( 'status' => $new_status ),
            array( 'trn_id' => $order_id, 'trn_type' => 'dokan_orders' ),
            array( '%s' ),
            array( '%d', '%s' )
        );
    }

    /**
     * Mark the parent order as complete when all the child order are completed
     *
     * @param integer $order_id
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
                $order = wc_get_order( $sub->ID );

                if ( $order->get_status() != 'completed' ) {
                    $all_complete = false;
                }
            }
        }

        // seems like all the child orders are completed
        // mark the parent order as complete
        if ( $all_complete ) {
            $parent_order = wc_get_order( $parent_order_id );
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
    function maybe_split_orders( $parent_order_id ) {
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
            dokan_log( '1 vendor only, skipping sub order.');

            $temp      = array_keys( $vendors );
            $seller_id = reset( $temp );

            // record admin commision
            $admin_fee = dokan_get_admin_commission_by( $parent_order, $seller_id );
            $parent_order->update_meta_data( '_dokan_admin_fee', $admin_fee );
            $parent_order->update_meta_data( '_dokan_vendor_id', $seller_id );
            $parent_order->save();

			// if the request is made from rest api then insert the order data to the sync table
			if ( defined( 'REST_REQUEST' ) ) {
				do_action( 'dokan_checkout_update_order_meta', $parent_order_id, $seller_id );
			}

            return;
        }

        // flag it as it has a suborder
        $parent_order->update_meta_data( 'has_sub_order', true );
        $parent_order->save();

        dokan_log( sprintf( 'Got %s vendors, starting sub order.', count( $vendors ) ) );

        // seems like we've got multiple sellers
        foreach ( $vendors as $seller_id => $seller_products ) {
            $this->create_sub_order( $parent_order, $seller_id, $seller_products );
        }

        dokan_log( sprintf( 'Completed sub order for #%d.', $parent_order_id ) );
    }

    /**
     * Creates a sub order
     *
     * @param integer $parent_order
     * @param integer $seller_id
     * @param array $seller_products
     *
     * @return void
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

            // save billing and shipping address
            foreach ( $bill_ship as $key ) {
                if ( is_callable( array( $order, "set_{$key}" ) ) ) {
                    $order->{"set_{$key}"}( $parent_order->{"get_{$key}"}() );
                }
            }

            // now insert line items
            $this->create_line_items( $order, $seller_products );

            // do shipping
            $this->create_shipping( $order, $parent_order );

            // do tax
            $this->create_taxes( $order, $parent_order, $seller_products );

            // add coupons if any
            $this->create_coupons( $order, $parent_order, $seller_products );

            // save other details
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

            // record admin fee
            $admin_fee = dokan_get_admin_commission_by( $order, $seller_id );
            $order->update_meta_data( '_dokan_admin_fee', $admin_fee );
            $order->update_meta_data( '_dokan_vendor_id', $seller_id );

            // finally, let the order re-calculate itself and save
            $order->calculate_totals();

            $order->set_status( $parent_order->get_status() );
            $order->set_parent_id( $parent_order->get_id() );

            $order_id = $order->save();

            // update total_sales count for sub-order
            wc_update_total_sales_counts( $order_id );

            dokan_log( 'Created sub order : #' . $order_id );

            do_action( 'dokan_checkout_update_order_meta', $order_id, $seller_id );

        } catch (Exception $e) {
            return new WP_Error( 'dokan-suborder-error', $e->getMessage() );
        }
    }

    /**
     * Create sub order line items
     *
     * @param  \WC_Order $order_id
     * @param  array $products
     *
     * @return void
     */
    public function create_line_items( $order, $products ) {

        foreach ( $products as $item ) {
            $product_item = new WC_Order_Item_Product();

            $product_item->set_name( $item->get_name() );
            $product_item->set_product_id( $item->get_product_id() );
            $product_item->set_variation_id( $item->get_variation_id() );
            $product_item->set_quantity( $item->get_quantity() );
            $product_item->set_tax_class( $item->get_tax_class() );
            $product_item->set_subtotal( $item->get_subtotal() );
            $product_item->set_subtotal_tax( $item->get_subtotal_tax() );
            $product_item->set_total_tax( $item->get_total_tax() );
            $product_item->set_total( $item->get_total() );
            $product_item->set_taxes( $item->get_taxes() );

            $metadata = $item->get_meta_data();
            if ( $metadata ) {
                foreach ( $metadata as $meta ) {
                    $product_item->add_meta_data( $meta->key, $meta->value );
                }
            }

            $order->add_item( $product_item );
        }

        $order->save();

        do_action( 'dokan_after_create_line_items', $order );
    }

    /**
     * Create tax line items
     *
     * @param  \WC_Order $order
     * @param  \WC_Order $parent_order
     * @param  array $products
     *
     * @return void
     */
    public function create_taxes( $order, $parent_order, $products ) {
        $shipping  = $order->get_items( 'shipping' );
        $tax_total = 0;

        foreach ( $products as $item ) {
            $tax_total += $item->get_total_tax();
        }

        foreach ( $parent_order->get_taxes() as $tax ) {
            $seller_shipping = reset( $shipping );

            $item = new WC_Order_Item_Tax();
            $item->set_props( array(
                'rate_id'            => $tax->get_rate_id(),
                'label'              => $tax->get_label(),
                'compound'           => $tax->get_compound(),
                'rate_code'          => WC_Tax::get_rate_code( $tax->get_rate_id() ),
                'tax_total'          => $tax_total,
                'shipping_tax_total' => is_bool( $seller_shipping ) ? '' : $seller_shipping->get_total_tax()
            ) );

            $order->add_item( $item );
        }

        $order->save();
    }

    /**
     * Create shipping for a sub-order if neccessary
     *
     * @param \WC_Order $order
     * @param \WC_Order $parent_order
     *
     * @return void
     */
    function create_shipping( $order, $parent_order ) {

        dokan_log( sprintf( '#%d - Creating Shipping.', $order->get_id() ) );

        // Get all shipping methods for parent order
        $shipping_methods = $parent_order->get_shipping_methods();
        $order_seller_id  = dokan_get_seller_id_by_order( $order->get_id() );

        $applied_shipping_method = '';

        if ( $shipping_methods ) {
            foreach ( $shipping_methods as $method_item_id => $shipping_object ) {
                $shipping_seller_id = wc_get_order_item_meta( $method_item_id, 'seller_id', true );

                if ( $order_seller_id == $shipping_seller_id ) {
                    $applied_shipping_method = $shipping_object;
                    break;
                }
            }
        }

        $shipping_method = apply_filters( 'dokan_shipping_method', $applied_shipping_method, $order->get_id(), $parent_order );

        // bail out if no shipping methods found
        if ( ! $shipping_method ) {
            dokan_log( sprintf( '#%d - No shipping method found. Aborting.', $order->get_id() ) );
            return;
        }

        if ( is_a( $shipping_method, 'WC_Order_Item_Shipping' ) ) {
            $item = new WC_Order_Item_Shipping();

            dokan_log( sprintf( '#%d - Adding shipping item.', $order->get_id() ) );

            $item->set_props( array(
                'method_title' => $shipping_method->get_name(),
                'method_id'    => $shipping_method->get_method_id(),
                'total'        => $shipping_method->get_total(),
                'taxes'        => $shipping_method->get_taxes(),
            ) );

            $metadata = $shipping_method->get_meta_data();

            if ( $metadata ) {
                foreach ( $metadata as $meta ) {
                    $item->add_meta_data( $meta->key, $meta->value );
                }
            }

            $order->add_item( $item );
            $order->set_shipping_total( $shipping_method->get_total() );
            $order->save();
        }
    }

    /**
     * Create coupons for a sub-order if neccessary
     *
     * @param \WC_Order $order
     * @param \WC_Order $parent_order
     * @param array $products
     *
     * @return void
     */
    function create_coupons( $order, $parent_order, $products ) {
        $used_coupons = $parent_order->get_items( 'coupon' );
        $product_ids = array_map(function($item) {
            return $item->get_product_id();
        }, $products );

        if ( ! $used_coupons ) {
            return;
        }

        foreach ( $used_coupons as $item ) {
            $coupon = new WC_Coupon( $item->get_code() );

            if ( $coupon && !is_wp_error( $coupon ) && array_intersect( $product_ids, $coupon->get_product_ids() ) ) {

                $new_item = new WC_Order_Item_Coupon();
                $new_item->set_props( array(
                    'code'         => $item->get_code(),
                    'discount'     => $item->get_discount(),
                    'discount_tax' => $item->get_discount_tax(),
                ) );

                $new_item->add_meta_data( 'coupon_data', $coupon->get_data() );

                $order->add_item( $new_item );
            }
        }

        $order->save();
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

        return $valid;
    }


    /**
     * Restore order stock if it's been reduced by twice
     *
     * @param  object $order
     *
     * @return void
     */
    public function restore_reduced_order_stock( $order ) {
        // seems in rest request, there is no such issue like (stock reduced by twice), so return early
        if ( defined( 'REST_REQUEST' ) ) {
            return;
        }

        $has_sub_order = wp_get_post_parent_id( $order->get_id() );

        // seems it's not a parent order so return early
        if ( ! $has_sub_order ) {
            return;
        }

        // Loop over all items.
        foreach ( $order->get_items() as $item ) {
            if ( ! $item->is_type( 'line_item' ) ) {
                continue;
            }

            // Only reduce stock once for each item.
            $product            = $item->get_product();
            $item_stock_reduced = $item->get_meta( '_reduced_stock', true );

            if ( ! $item_stock_reduced || ! $product || ! $product->managing_stock() ) {
                continue;
            }

            $item_name = $product->get_formatted_name();
            $new_stock = wc_update_product_stock( $product, $item_stock_reduced, 'increase' );

            if ( is_wp_error( $new_stock ) ) {
                /* translators: %s item name. */
                $order->add_order_note( sprintf( __( 'Unable to restore stock for item %s.', 'dokan-lite' ), $item_name ) );
                continue;
            }

            $item->delete_meta_data( '_reduced_stock' );
            $item->save();
        }
    }
}
