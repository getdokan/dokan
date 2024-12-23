<?php

namespace WeDevs\Dokan\Vendor;

use WC_Coupon;
use WC_Discounts;
use WC_Order;
use WC_Cart;
use WC_Order_Item_Product;

class Coupon {

    public const DOKAN_COUPON_META_KEY = '_dokan_coupon_info';

    public function __construct() {
        add_action( 'woocommerce_checkout_create_order_line_item', [ $this, 'add_coupon_info_to_order_item' ], 10, 4 );
        add_action( 'woocommerce_removed_coupon', [ $this, 'remove_coupon_info_from_cart_item' ] );
        add_filter( 'woocommerce_coupon_get_apply_quantity', [ $this, 'intercept_wc_coupon' ], 15, 4 );
        add_action( 'dokan_wc_coupon_applied', [ $this, 'save_item_coupon_discount' ], 10, 3 );
    }

    /*
     * Apply line item coupon discount
     *
     * @param int $apply_quantity
     * @param object $item
     * @param WC_Coupon $coupon
     * @param WC_Discounts $discounts
     *
     * @return int
     * @throws \Exception
     */
    public function intercept_wc_coupon( $apply_quantity, $item, $coupon, $discounts ): int {
        remove_filter( 'woocommerce_coupon_get_apply_quantity', [ $this, 'intercept_wc_coupon' ], 15 );
        $discounts = clone $discounts;
        $discounts->apply_coupon( $coupon );

        do_action( 'dokan_wc_coupon_applied', $coupon, $discounts, $item, $apply_quantity, $this );

        add_filter( 'woocommerce_coupon_get_apply_quantity', [ $this, 'intercept_wc_coupon' ], 15, 4 );

        return $apply_quantity;
    }

    /*
    * Apply line item coupon discount
    *
    * @param WC_Coupon $coupon
    * @param WC_Discounts $discounts
    * @param object $item
    *
    * @return void
    */
    public function save_item_coupon_discount( $coupon, $discounts, $item ) {
        $object_to_apply_coupon = $discounts->get_object();

        if ( $object_to_apply_coupon instanceof WC_Cart ) {
            $this->save_coupon_data_to_cart_item( $coupon, $discounts, $item );
        }

        if ( $object_to_apply_coupon instanceof WC_Order ) {
            $order = wc_get_order( $object_to_apply_coupon->get_id() );
            $this->save_coupon_data_to_order_item( $coupon, $discounts, $item, $order );
        }
    }

    /**
    * @param WC_Coupon $coupon
    * @param WC_Discounts $discounts
    * @param object $item
    *
    * @return void
    */
    protected function save_coupon_data_to_cart_item( $coupon, $discounts, $item ) {
        $coupon_codes = WC()->cart->get_applied_coupons();

        $item_key = $item->object['key'];

        $item_object = WC()->cart->cart_contents[ $item_key ];
        $coupon_info = $item_object[ static::DOKAN_COUPON_META_KEY ] ?? [];

        $coupon_info = array_filter(
            $coupon_info, function ( $coupon_temp ) use ( $coupon_codes ) {
				return in_array( $coupon_temp['coupon_code'], $coupon_codes, true );
			}
        );

        $item_wise_discounts = $discounts->get_discounts();

        if ( isset( $item_wise_discounts[ $coupon->get_code() ][ $item_key ] ) ) {
            $discount_amount = $item_wise_discounts[ $coupon->get_code() ][ $item_key ];

            $coupon_info[ $coupon->get_code() ] = [
                'discount' => $discount_amount,
                'coupon_code' => $coupon->get_code(),
                'per_item' => $discount_amount / $item_object['quantity'],
                'product_id' => $item_object['product_id'],
            ];
        }

        $item_object[ static::DOKAN_COUPON_META_KEY ] = $coupon_info;
        WC()->cart->cart_contents[ $item_object['key'] ] = $item_object;
    }

    /**
     * Save coupon data to order item
     *
     * @param WC_Coupon $coupon
     * @param WC_Discounts $discounts
     * @param object $item
     * @param WC_Order $order
     *
     * @return void
     * @throws \Exception
     */
    protected function save_coupon_data_to_order_item( $coupon, $discounts, $item, $order ) {
        $coupon_codes = $order->get_coupon_codes();

        /** @var WC_Order_Item_Product $item */
        $order_item = $item->object;
        $item_key = $order_item->get_id();

        $coupon_info = $order_item->get_meta( static::DOKAN_COUPON_META_KEY );

        if ( ! is_array( $coupon_info ) ) {
            $coupon_info = [];
        }

        $coupon_info = array_filter(
            $coupon_info, function ( $coupon_temp ) use ( $coupon_codes ) {
				return in_array( $coupon_temp['coupon_code'], $coupon_codes, true );
			}
        );

        $item_wise_discounts = $discounts->get_discounts();

        if ( isset( $item_wise_discounts[ $coupon->get_code() ][ $item_key ] ) ) {
            $discount_amount = $item_wise_discounts[ $coupon->get_code() ][ $item_key ];

            $coupon_info[ $coupon->get_code() ] = [
                'discount' => $discount_amount,
                'coupon_code' => $coupon->get_code(),
                'per_item' => $discount_amount / $order_item->get_quantity(),
                'product_id' => $order_item->get_product_id(),
            ];
        }

        wc_update_order_item_meta( $order_item->get_id(), static::DOKAN_COUPON_META_KEY, $coupon_info );
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
        if ( ! empty( $values[ static::DOKAN_COUPON_META_KEY ] ) ) {
            $total_discount = 0;
            $limit_reached = '';
            $coupon_info = $values[ static::DOKAN_COUPON_META_KEY ];
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
            $item->add_meta_data( static::DOKAN_COUPON_META_KEY, $coupon_info, true );
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
            $coupon_info = $cart_item[ static::DOKAN_COUPON_META_KEY ] ?? [];
            if ( isset( $coupon_info[ $coupon_code ] ) ) {
                unset( $coupon_info[ $coupon_code ] );

                $cart_contents[ $cart_item_key ][ static::DOKAN_COUPON_META_KEY ] = $coupon_info;
            }
        }

        $cart->set_cart_contents( $cart_contents );
    }
}
