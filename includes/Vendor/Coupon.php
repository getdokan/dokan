<?php

namespace WeDevs\Dokan\Vendor;

use WC_Coupon;

class Coupon {

    public function __construct() {
        add_filter( 'woocommerce_coupon_get_discount_amount', [ $this, 'apply_line_item_coupon_discount' ], 12, 5 );
        add_action( 'woocommerce_checkout_create_order_line_item', [ $this, 'add_coupon_info_to_order_item' ], 10, 4 );
        add_action( 'woocommerce_removed_coupon', [ $this, 'remove_coupon_info_from_cart_item' ] );
        add_action( 'woocommerce_before_order_item_object_save', [ $this, 'coupon_applied' ], 10, 2 );
    }

    /**
     * Add coupon info to cart item
     *
     * @param $item
     * @param $order_id
     *
     * @return void
     */

    public function coupon_applied( $item ) {
        error_log( 'item-type: ' . $item->get_type() );
        if ( $item->get_type() === 'coupon' ) {
            // get discount amount from coupon
            $discount_amount = $item->get_discount();
            $coupon_code = $item->get_code();
            $order = wc_get_order( $item->get_order_id() );
            $order_items = $order->get_items();
            foreach ( $order_items as $order_item ) {
                $product_id = $order_item->get_product_id();
                $product = wc_get_product( $product_id );
                // check if coupon is valid for product
                if ( ! $this->is_coupon_valid( $product, $coupon_code ) ) {
                    continue;
                }
                $product_price = $product->get_price();
                $product_quantity = $order_item->get_quantity();
                $total_product_price = $product_price * $product_quantity;

                if ( $discount_amount > $total_product_price ) {
                    $discount_amount = $total_product_price;
                }
                $coupon_info = [
                    'discount' => $discount_amount,
                    'coupon_code' => $coupon_code,
                    'per_item' => $discount_amount / $product_quantity,
                    'product_id' => $product_id,
                ];
                // get order item meta data
                $order_item_meta = $order_item->get_meta( '_dokan_coupon_info' );
                if ( ! empty( $order_item_meta ) ) {
                    $order_item_meta[ $coupon_code ] = $coupon_info;
                } else {
                    $order_item_meta = [ $coupon_code => $coupon_info ];
                }
                $order_item->update_meta_data( '_dokan_coupon_info', $order_item_meta );
                $order_item->save();
            }
        }
    }

    /**
     * Check coupon validity
     *
     * @param $product
     * @param $coupon_code
     *
     * @return bool
     */

    public function is_coupon_valid( $product, $coupon_code ): bool {
        $valid = false;
        $coupon = new WC_Coupon( $coupon_code );
        if ( $coupon->is_valid_for_product( $product ) ) {
            $valid = true;
        }
        return $valid;
    }

    /**
     * Apply line item coupon discount
     *
     * @param $discount
     * @param $price_to_discount
     * @param $item_object
     * @param $dummy_bool
     * @param WC_Coupon $coupon
     *
     * @return mixed
     */
    public function apply_line_item_coupon_discount( $discount, $price_to_discount, $item_object, $dummy_bool, WC_Coupon $coupon ) {
        $item_object = WC()->cart->cart_contents[ $item_object['key'] ];
        $coupon_info = $item_object['dokan_coupon_info'] ?? [];

        $coupon_info[ $coupon->get_code() ] = [
            'discount' => $discount,
            'coupon_code' => $coupon->get_code(),
            'per_item' => $discount / $item_object['quantity'],
            'product_id' => $item_object['product_id'],
        ];

        $item_object['dokan_coupon_info'] = $coupon_info;
        WC()->cart->cart_contents[ $item_object['key'] ] = $item_object;
        return $discount;
    }

    /**
     * Add coupon info to order item
     *
     * @param $item
     * @param $cart_item_key
     * @param $values
     *
     * @return void
     */
    public function add_coupon_info_to_order_item( $item, $cart_item_key, $values ) {
        if ( ! empty( $values['dokan_coupon_info'] ) ) {
            $coupon_info = $values['dokan_coupon_info'];
            $total_discount = 0;
            $limit_reached = '';
            // Adjust coupon discount greater than product price
            foreach ( $coupon_info as $key => $coupon ) {
                $total_discount += $coupon['discount'];
                $product = wc_get_product( $coupon['product_id'] );
                $total_product_price = $product->get_price() * $values['quantity'];
                if ( $limit_reached === 'exit' ) {
                    $coupon_info[ $key ]['discount'] = 0;
                }
                if ( $total_discount > $total_product_price && $limit_reached !== 'exit' ) {
                    $remain_discount = $total_discount - $total_product_price;
                    $coupon_info[ $key ]['discount'] = $coupon['discount'] - $remain_discount;
                    $limit_reached = 'exit';
                }
            }
            $item->add_meta_data( '_dokan_coupon_info', $coupon_info, true );
        }
    }

    /**
     * Remove coupon info from cart item
     *
     * @param $coupon_code
     *
     * @return void
     */
    public function remove_coupon_info_from_cart_item( $coupon_code ) {
        $cart = WC()->cart;
        $cart_contents = $cart->cart_contents;

        foreach ( $cart_contents as $cart_item_key => $cart_item ) {
            $coupon_info = $cart_item['dokan_coupon_info'] ?? [];
            if ( isset( $coupon_info[ $coupon_code ] ) ) {
                unset( $coupon_info[ $coupon_code ] );

                $cart_contents[ $cart_item_key ]['dokan_coupon_info'] = $coupon_info;
            }
        }

        $cart->set_cart_contents( $cart_contents );
    }
}
