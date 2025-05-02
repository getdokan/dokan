<?php

namespace WeDevs\Dokan\Vendor;

use WC_Coupon;
use WC_Discounts;
use WC_Order;
use WC_Cart;
use WC_Order_Item_Product;
use WC_Order_Item_Coupon;
use WC_Data;
use Exception;

class Coupon {

    public const DOKAN_COUPON_META_KEY = '_dokan_coupon_info';

    public function __construct() {
        add_action( 'woocommerce_checkout_create_order_line_item', [ $this, 'add_coupon_info_to_order_item' ], 10, 4 );
        add_action( 'woocommerce_removed_coupon', [ $this, 'remove_coupon_info_from_cart_item' ] );
        add_filter( 'woocommerce_coupon_get_apply_quantity', [ $this, 'intercept_wc_coupon' ], 15, 4 );
        add_action( 'dokan_wc_coupon_applied', [ $this, 'save_item_coupon_discount' ], 10, 3 );
        add_action( 'woocommerce_before_delete_order_item', [ $this, 'remove_coupon_info_from_order_item' ] );
    }

    /**
     * Removes coupon information from an order item when a coupon is deleted.
     *
     * This function:
     * - Retrieves the coupon code from the order item.
     * - Removes the coupon discount from all applicable items in the order.
     * - If the order has sub-orders, it ensures the coupon is also removed from all child orders.
     * - If it's a sub-order, it removes the coupon from relevant items in the parent order.
     *
     * @param int $item_id The ID of the order item representing the coupon.
     *
     * @return void
     *
     * @throws Exception If there is an issue initializing the WC_Order_Item_Coupon object.
     */
    public function remove_coupon_info_from_order_item( $item_id ) {
        $data = new WC_Order_Item_Coupon( $item_id );
        if ( ! $data->get_order_id() ) {
            return;
        }

        $removed_coupon = $data->get_code();
        $order = wc_get_order( $data->get_order_id() );
        $order_items = $order->get_items();

        $product_ids = $this->remove_coupon_discount_from_items( $removed_coupon, $order_items );
        // Remove coupon with child orders
		if ( $order->get_meta( 'has_sub_order' ) ) {
			$this->remove_coupon_from_child_orders( $order, $removed_coupon );
		} else {
			// Remove coupon from child order items
			$parent_order = wc_get_order( $order->get_parent_id() );
			if ( $parent_order ) {
                $parent_items = array_filter(
                    $parent_order->get_items(),
                    function ( $order_item ) use ( $product_ids ) {
                        return in_array( $order_item->get_product_id(), $product_ids, true );
                    }
                );
                $this->remove_coupon_discount_from_items( $removed_coupon, $parent_items );
			}
		}
    }

    /**
     * Get Product IDs from order items and remove coupon discount from items.
     *
     * @param $removed_coupon
     * @param $order_items
     *
     * @return array
     *
     * @throws Exception
     */
    private function remove_coupon_discount_from_items( $removed_coupon, $order_items ): array {
        $product_ids = [];
		foreach ( $order_items as $order_item ) {
			$item = $order_item->get_meta( self::DOKAN_COUPON_META_KEY, true );

			if ( isset( $item[ $removed_coupon ] ) ) {
				unset( $item[ $removed_coupon ] );
				wc_update_order_item_meta( $order_item->get_id(), self::DOKAN_COUPON_META_KEY, $item );
				$product_ids[] = $order_item->get_product_id();
			}
		}
		return $product_ids;
    }

    /**
     * Intercepts coupon application to handle line-item coupon discounts.
     *
     * WooCommerce removes the coupon from the order and recalculates totals. For reference, see:
     * @see https://github.com/woocommerce/woocommerce/blob/8abd6e97ca598381cb07287a2e7b735799cb55d5/plugins/woocommerce/includes/abstracts/abstract-wc-order.php#L1339
     *
     * WooCommerce does not provide a direct hook to retrieve coupon amounts per line item. However,
     * the `get_discounts` method of the `WC_Discounts` class allows access to this information.
     * This implementation utilizes the following steps to calculate line-item discounts:
     *
     * 1. Remove the interfering WC hook used by Dokan hook.
     * 2. Reapply the coupon to the order or cart.
     * 3. Trigger the Dokan action to apply the coupon to the order or cart.
     * 4. Reattach the interfering WC hook used by Dokan hook.
     *
     * @param int $apply_quantity The number of items to which the coupon applies.
     * @param object $item The cart or order item object.
     * @param WC_Coupon $coupon The coupon being applied.
     * @param WC_Discounts $discounts The discount object managing the coupon.
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
     * @throws Exception
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
        $item_key = $item->object['key'];
        $item_object = $cart->cart_contents[ $item_key ];
        $coupon_info = $item_object[ self::DOKAN_COUPON_META_KEY ] ?? [];

        $item_wise_discounts = $discounts->get_discounts();

        if ( isset( $item_wise_discounts[ $coupon->get_code() ][ $item_key ] ) ) {
            $discount_amount = $item_wise_discounts[ $coupon->get_code() ][ $item_key ];

            $coupon_info[ $coupon->get_code() ] = [
                'discount'                         => $discount_amount,
                'coupon_code'                      => $coupon->get_code(),
                'per_qty_amount'                   => $item_object['quantity'] > 0 ? ( $discount_amount / $item_object['quantity'] ) : 0,
                'quantity'                         => $item_object['quantity'],
                'admin_coupons_enabled_for_vendor' => $coupon->get_meta( 'admin_coupons_enabled_for_vendor', true ),
                'coupon_commissions_type'          => $coupon->get_meta( 'coupon_commissions_type', true ),
                'admin_shared_coupon_type'         => $coupon->get_meta( 'admin_shared_coupon_type', true ),
                'admin_shared_coupon_amount'       => $coupon->get_meta( 'admin_shared_coupon_amount', true ),
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
     * @throws Exception
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
                'discount'                         => $discount_amount,
                'coupon_code'                      => $coupon->get_code(),
                'per_qty_amount'                   => $order_item->get_quantity() > 0 ? $discount_amount / $order_item->get_quantity() : 0,
                'quantity'                         => $order_item->get_quantity(),
                'admin_coupons_enabled_for_vendor' => $coupon->get_meta( 'admin_coupons_enabled_for_vendor', true ),
                'coupon_commissions_type'          => $coupon->get_meta( 'coupon_commissions_type', true ),
                'admin_shared_coupon_type'         => $coupon->get_meta( 'admin_shared_coupon_type', true ),
                'admin_shared_coupon_amount'       => $coupon->get_meta( 'admin_shared_coupon_amount', true ),
            ];
        }

        wc_update_order_item_meta( $order_item->get_id(), self::DOKAN_COUPON_META_KEY, $coupon_info );
        do_action( 'dokan_after_coupon_info_data_updated_on_order_item_meta', $order_item, $coupon_info );

        // apply coupon sub order
        if ( $order->get_meta( 'has_sub_order' ) ) {
            $this->apply_coupon_to_child_orders( $order, $coupon );
        }
    }

    /**
    * Process coupon for child orders.
    *
    * @param WC_Order $order
    * @param WC_Coupon $coupon
    *
    * @return void
    * @throws Exception
    */
    public function apply_coupon_to_child_orders( WC_Order $order, WC_Coupon $coupon ): void {
        $sub_orders = dokan()->order->get_child_orders( $order->get_id() );
        foreach ( $sub_orders as $sub_order ) {
            // Check if the coupon is already applied
            $used_coupons = $sub_order->get_coupon_codes();
            $coupon_code = $coupon->get_code();
            if ( in_array( $coupon_code, $used_coupons, true ) ) {
                continue;
            }
            // Add the coupon to the order
            $sub_order->apply_coupon( $coupon_code );
            $sub_order->save();
        }
    }

    /**
     * @param WC_Order $order
     * @param string $removed_coupon
     * @return void
     */
    private function remove_coupon_from_child_orders( WC_Order $order, string $removed_coupon ) {
        $sub_orders = dokan()->order->get_child_orders( $order->get_id() );
        foreach ( $sub_orders as $sub_order ) {
            $used_coupons = $sub_order->get_coupon_codes();
            if ( in_array( $removed_coupon, $used_coupons, true ) ) {
                $sub_order->remove_coupon( $removed_coupon );
                $sub_order->save();
            }
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
                $product = wc_get_product( $item->get_product_id() );
                $total_product_price = $product->get_price() * $values['quantity'];

                if ( $limit_reached ) {
                    $coupon_info[ $key ]['discount'] = 0;
                }

                if ( $total_discount > $total_product_price && $limit_reached === false ) {
                    $remain_discount = $total_discount - $total_product_price;
                    $adjusted_discount = max( $coupon['discount'] - $remain_discount, 0 );
                    $coupon_info[ $key ]['discount'] = $adjusted_discount;
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
