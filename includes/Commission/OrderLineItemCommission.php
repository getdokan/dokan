<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Item;
use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Vendor\Coupon;
use WeDevs\Dokan\Vendor\DokanOrderLineItemCouponInfo;

/**
 * Class OrderLineItemCommission - Calculate order line item commission
 *
 * @since DOKAN_SINCE
 */
class OrderLineItemCommission {

    private WC_Order_Item $item;
    const VENDOR_ID_META_KEY = '_dokan_vendor_id';
    private WC_Order $order;

    /**
     * OrderLineItemCommission constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WC_Order_Item $item
     * @param \WC_Order      $order
     */
    public function __construct( WC_Order_Item $item, WC_Order $order ) {
        $this->item  = $item;
        $this->order = $order;
    }

    /**
     * Calculate order line item commission.
     *
     * @since DOKAN_SINCE
     *
     * @param $auto_save
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission|null
     */
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
         * Prepare coupon info for commission calculation.
         *
         * @since DOKAN_SINCE
         *
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
                'coupon_discounts' => $dokan_coupon_infos,
            ],
            $auto_save
        );
    }

    public function retrieve() {
        $order_items = $this->order->get_items();
        $commission_data = new Commission();

        foreach ( $order_items as $order_item ) {
            $commission_meta = $order_item->get_meta( 'dokan_commission_meta', true );

            $commission_data->set_admin_commission( $commission_data->get_admin_commission() + floatval( $commission_meta['admin_commission'] ) );
            $commission_data->set_net_admin_commission( $commission_data->get_net_admin_commission() + floatval( $commission_meta['admin_net_commission'] ) );
            $commission_data->set_admin_discount( $commission_data->get_admin_discount() + floatval( $commission_meta['admin_discount'] ) );
            $commission_data->set_admin_subsidy( $commission_data->get_admin_subsidy() + floatval( $commission_meta['admin_subsidy'] ) );
            $commission_data->set_vendor_discount( $commission_data->get_vendor_discount() + floatval( $commission_meta['vendor_discount'] ) );
            $commission_data->set_vendor_earning( $commission_data->get_vendor_earning() + floatval( $commission_meta['vendor_earning'] ) );
            $commission_data->set_net_vendor_earning( $commission_data->get_net_vendor_earning() + floatval( $commission_meta['vendor_net_earning'] ) );
        }

        return $commission_data;
    }
}
