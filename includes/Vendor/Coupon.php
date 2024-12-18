<?php

namespace WeDevs\Dokan\Vendor;

use WC_Coupon;

class Coupon {

    public function __construct() {
        add_filter( 'woocommerce_coupon_get_discount_amount', [ $this, 'apply_line_item_coupon_discount' ], 12, 5 );
        add_action( 'woocommerce_checkout_create_order_line_item', [ $this, 'add_coupon_info_to_order_item' ], 10, 4 );
        add_action( 'woocommerce_removed_coupon', [ $this, 'remove_coupon_info_from_cart_item' ] );
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
