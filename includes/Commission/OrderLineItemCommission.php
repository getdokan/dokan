<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Item;
use WeDevs\Dokan\Vendor\Coupon;
use WeDevs\Dokan\Vendor\DokanOrderLineItemCouponInfo;

class OrderLineItemCommission {

    private WC_Order_Item $item;

    const VENDOR_ID_META_KEY = '_dokan_vendor_id';
    private WC_Order $order;

    public function __construct( WC_Order_Item $item, WC_Order $order ) {
        $this->item  = $item;
        $this->order = $order;
    }

    public function calculate( $auto_save = false ) {
        $vendor_id             = (int) $this->order->get_meta( self::VENDOR_ID_META_KEY );
        $line_item_commissions = [];

        $product_id = $this->item->get_variation_id() ? $this->item->get_variation_id() : $this->item->get_product_id();
        $refund     = $this->order->get_total_refunded_for_item( $this->item->get_id() );

        // TODO: need decission for this filter.
        //$item_price = apply_filters( 'dokan_earning_by_order_item_price', $item->get_subtotal(), $item, $this->order );

        $item_price = $this->item->get_subtotal();
        $item_price = $refund ? floatval( $item_price ) - floatval( $refund ) : $item_price;

        $dokan_coupon_info = $this->item->get_meta( Coupon::DOKAN_COUPON_META_KEY, true );
        /**
         * @var DokanOrderLineItemCouponInfo[] $dokan_coupon_infos
         */
        $dokan_coupon_infos = [];
        if ( ! empty( $dokan_coupon_info ) && is_array( $dokan_coupon_info ) ) {
            foreach ( $dokan_coupon_info as $coupon_code => $coupon_meta ) {
                $coupon_line_item = new DokanOrderLineItemCouponInfo();
                $coupon_line_item->set_coupon_info( $coupon_meta );

                $dokan_coupon_infos[] = $coupon_line_item;
            }
        }

        return dokan()->commission->get_commission(
            [
                'order_item_id'  => $this->item->get_id(),
                'product_id'     => $product_id,
                'total_amount'   => $item_price,
                'total_quantity' => $this->item->get_quantity(),
                'vendor_id'      => $vendor_id,
            ],
            $auto_save
        )->with_coupon_discounts( $dokan_coupon_infos, $this->item->get_total() );
    }
}
