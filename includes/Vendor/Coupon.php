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

    /**
     * Intercept coupon application to apply line item coupon discount.
     *
     * @param int $apply_quantity Number of items the coupon applies to.
     * @param object $item The cart or order item object.
     * @param WC_Coupon $coupon The coupon being applied.
     * @param WC_Discounts $discounts Discount object.
     *
     * @return int
     */
    public function intercept_wc_coupon( int $apply_quantity, $item, WC_Coupon $coupon, WC_Discounts $discounts ): int {
        remove_filter( 'woocommerce_coupon_get_apply_quantity', [ $this, 'intercept_wc_coupon' ], 15 );

        $discounts_clone = clone $discounts;
        $discounts_clone->apply_coupon( $coupon );

        do_action( 'dokan_wc_coupon_applied', $coupon, $discounts_clone, $item, $apply_quantity, $this );

        add_filter( 'woocommerce_coupon_get_apply_quantity', [ $this, 'intercept_wc_coupon' ], 15, 4 );

        return $apply_quantity;
    }

    /**
     * Save coupon discount data for an item.
     *
     * @param WC_Coupon $coupon The coupon being applied.
     * @param WC_Discounts $discounts Discount object.
     * @param object $item The cart or order item object.
     *
     * @return void
     */
    public function save_item_coupon_discount( WC_Coupon $coupon, WC_Discounts $discounts, $item ): void {
        $object_to_apply_coupon = $discounts->get_object();

        if ( $object_to_apply_coupon instanceof WC_Cart ) {
            $this->save_coupon_data_to_cart_item( $coupon, $discounts, $item );
        } elseif ( $object_to_apply_coupon instanceof WC_Order ) {
            $order = wc_get_order( $object_to_apply_coupon->get_id() );
            $this->save_coupon_data_to_order_item( $coupon, $discounts, $item, $order );
        }
    }

    /**
     * Save coupon data to a cart item.
     *
     * @param WC_Coupon $coupon The coupon being applied.
     * @param WC_Discounts $discounts Discount object.
     * @param object $item The cart item object.
     *
     * @return void
     */
    protected function save_coupon_data_to_cart_item( WC_Coupon $coupon, WC_Discounts $discounts, $item ): void {
        $cart = WC()->cart;
        $coupon_codes = $cart->get_applied_coupons();
        $item_key = $item->object['key'];
        $item_object = $cart->cart_contents[ $item_key ];

        $coupon_info = $item_object[ self::DOKAN_COUPON_META_KEY ] ?? [];
        $coupon_info = array_filter(
            $coupon_info,
            function ( $coupon_temp ) use ( $coupon_codes ) {
                return in_array( $coupon_temp['coupon_code'], $coupon_codes, true );
            }
        );

        $item_wise_discounts = $discounts->get_discounts();

        if ( isset( $item_wise_discounts[ $coupon->get_code() ][ $item_key ] ) ) {
            $discount_amount = $item_wise_discounts[ $coupon->get_code() ][ $item_key ];

            $coupon_info[ $coupon->get_code() ] = [
                'discount'    => $discount_amount,
                'coupon_code' => $coupon->get_code(),
                'per_item'    => $discount_amount / $item_object['quantity'],
                'product_id'  => $item_object['product_id'],
            ];
        }

        $item_object[ self::DOKAN_COUPON_META_KEY ] = $coupon_info;
        $cart->cart_contents[ $item_object['key'] ] = $item_object;
    }

    /**
     * Save coupon data to an order item.
     *
     * @param WC_Coupon $coupon The coupon being applied.
     * @param WC_Discounts $discounts Discount object.
     * @param object $item The order item object.
     * @param WC_Order $order The order object.
     *
     * @return void
     * @throws \Exception
     */
    protected function save_coupon_data_to_order_item( WC_Coupon $coupon, WC_Discounts $discounts, $item, WC_Order $order ): void {
        $coupon_codes = $order->get_coupon_codes();

        /** @var WC_Order_Item_Product $order_item */
        $order_item = $item->object;
        $item_key = $order_item->get_id();

        $coupon_info = $order_item->get_meta( self::DOKAN_COUPON_META_KEY );

        if ( ! is_array( $coupon_info ) ) {
            $coupon_info = [];
        }

        $coupon_info = array_filter(
            $coupon_info,
            function ( $coupon_temp ) use ( $coupon_codes ) {
                return in_array( $coupon_temp['coupon_code'], $coupon_codes, true );
            }
        );

        $item_wise_discounts = $discounts->get_discounts();

        if ( isset( $item_wise_discounts[ $coupon->get_code() ][ $item_key ] ) ) {
            $discount_amount = $item_wise_discounts[ $coupon->get_code() ][ $item_key ];

            $coupon_info[ $coupon->get_code() ] = [
                'discount'    => $discount_amount,
                'coupon_code' => $coupon->get_code(),
                'per_item'    => $discount_amount / $order_item->get_quantity(),
                'product_id'  => $order_item->get_product_id(),
            ];
        }

        wc_update_order_item_meta( $order_item->get_id(), self::DOKAN_COUPON_META_KEY, $coupon_info );

        // apply coupon sub order
        if ( $order->get_meta( 'has_sub_order' ) ) {
            $this->process_coupon_into_child_orders( $order, $coupon );
        }
    }

    /**
    * Process coupon for child orders.
    *
    * @param WC_Order $order
    * @param WC_Coupon $coupon
    *
    * @return void
    * @throws \Exception
    */
    public function process_coupon_into_child_orders( WC_Order $order, WC_Coupon $coupon ): void {
        $sub_orders = dokan()->order->get_child_orders( $order->get_id() );
        foreach ( $sub_orders as $sub_order ) {
            // Check if the coupon is already applied
            $used_coupons = $sub_order->get_coupon_codes();
            $coupon_code = $coupon->get_code();
            if ( in_array( $coupon_code, $used_coupons, true ) ) {
                continue;
            }

            // Apply the coupon
            $coupon = new WC_Coupon( $coupon_code );
            $discount = new WC_Discounts( $sub_order );
            $discount->apply_coupon( $coupon );
            // Add the coupon to the order
            $sub_order->apply_coupon( $coupon_code );
            // Recalculate totals
            $sub_order->calculate_totals();
            $sub_order->save();
        }
    }

    /**
     * Add coupon info to an order item during checkout.
     *
     * @param WC_Order_Item_Product $item The order item object.
     * @param string $cart_item_key The cart item key.
     * @param array $values Cart item values.
     */
    public function add_coupon_info_to_order_item( $item, $cart_item_key, $values ): void {
        if ( ! empty( $values[ self::DOKAN_COUPON_META_KEY ] ) ) {
            $total_discount = 0;
            $limit_reached = false;
            $coupon_info = $values[ self::DOKAN_COUPON_META_KEY ];

            foreach ( $coupon_info as $key => $coupon ) {
                $total_discount += $coupon['discount'];
                $product = wc_get_product( $coupon['product_id'] );
                $total_product_price = $product->get_price() * $values['quantity'];

                if ( $limit_reached ) {
                    $coupon_info[ $key ]['discount'] = 0;
                }

                if ( $total_discount > $total_product_price && $limit_reached === false ) {
                    $remain_discount = $total_discount - $total_product_price;
                    $coupon_info[ $key ]['discount'] = $coupon['discount'] - $remain_discount;
                    $limit_reached = true;
                }
            }

            $item->add_meta_data( self::DOKAN_COUPON_META_KEY, $coupon_info, true );
        }
    }

    /**
     * Remove coupon info from a cart item when a coupon is removed.
     *
     * @param string $coupon_code The coupon code being removed.
     */
    public function remove_coupon_info_from_cart_item( string $coupon_code ): void {
        $cart = WC()->cart;
        $cart_contents = $cart->cart_contents;

        foreach ( $cart_contents as $cart_item_key => $cart_item ) {
            $coupon_info = $cart_item[ self::DOKAN_COUPON_META_KEY ] ?? [];

            if ( isset( $coupon_info[ $coupon_code ] ) ) {
                unset( $coupon_info[ $coupon_code ] );
                $cart_contents[ $cart_item_key ][ self::DOKAN_COUPON_META_KEY ] = $coupon_info;
            }
        }

        $cart->set_cart_contents( $cart_contents );
    }
}
