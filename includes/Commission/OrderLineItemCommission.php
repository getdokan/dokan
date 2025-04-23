<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Item;
use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Settings\DefaultSetting;
use WeDevs\Dokan\Commission\Strategies\DefaultStrategy;
use WeDevs\Dokan\Commission\Strategies\GlobalStrategy;
use WeDevs\Dokan\Commission\Strategies\OrderItem;
use WeDevs\Dokan\Commission\Strategies\Product;
use WeDevs\Dokan\Commission\Strategies\Vendor;
use WeDevs\Dokan\Vendor\Coupon;
use WeDevs\Dokan\Vendor\DokanOrderLineItemCouponInfo;

/**
 * Class OrderLineItemCommission - Calculate order line item commission
 *
 * @since DOKAN_SINCE
 */
class OrderLineItemCommission extends AbstractCommissionCalculator {

    protected WC_Order_Item $item;
    const VENDOR_ID_META_KEY = '_dokan_vendor_id';
    protected WC_Order $order;
    protected int $vendor_id;

    /**
     * @var array $coupon_infos
     */
    protected array $coupon_infos = [];

    public function get_item(): WC_Order_Item {
        return $this->item;
    }

    public function set_item( WC_Order_Item $item ): void {
        $this->item = $item;

        // phpcs:ignore Universal.Operators.DisallowShortTernary.Found
        $this->coupon_infos = $this->item->get_meta( Coupon::DOKAN_COUPON_META_KEY, true ) ?: [];
    }

    public function get_order(): WC_Order {
        return $this->order;
    }

    /**
     * @return array
     */
    protected function get_coupon_infos(): array {
        return empty( $this->coupon_infos ) ? [] : $this->coupon_infos;
    }

    public function set_order( WC_Order $order ): void {
        $this->order = $order;
        $this->vendor_id = (int) $this->order->get_meta( self::VENDOR_ID_META_KEY );
    }

    /**
     * Calculate order line item commission.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission|null
     */
    public function calculate(): Commission {
        if ( ! $this->item ) {
            throw new \Exception( esc_html__( 'Order item is required for order item commission calculation.', 'dokan-lite' ) );
        }

        if ( ! $this->order ) {
            throw new \Exception( esc_html__( 'Order is required for order item commission calculation.', 'dokan-lite' ) );
        }

        $refund_amount = $this->order->get_total_refunded_for_item( $this->item->get_id() );
        $refund_qty = $this->order->get_qty_refunded_for_item( $this->item->get_id() );

        $item_price = apply_filters( 'dokan_earning_by_order_item_price', $this->item->get_subtotal(), $this->item, $this->order );
        $item_price = $refund_amount ? floatval( $item_price ) - floatval( $refund_amount ) : $item_price;

        $total_quantity = $this->item->get_quantity() +  $refund_qty;

        $strategy = apply_filters(
            'dokan_order_line_item_commission_strategies',
            new OrderItem( $this->item, $item_price, $total_quantity, $this->vendor_id )
        );

        /**
         * @var \WeDevs\Dokan\Commission\Model\Setting $settings
         */
        $settings = $strategy->get_settings();

        $this->set_price( $item_price );
        $this->set_quantity( $total_quantity );

        $commission_data = dokan_get_container()->get( Calculator::class )
            ->set_settings( $settings )
            ->set_subtotal( $item_price )
            ->set_quantity( $total_quantity )
            ->set_discount( new CouponInfo( $this->get_coupon_infos() ) )
            ->calculate();

        $parameters = $commission_data->get_parameters() ?? [];
        $percentage = $settings->get_percentage();
        $type       = $settings->get_type();
        $flat       = $settings->get_flat();

        // Saving commission data to line items for further reuse.
        ( new \WeDevs\Dokan\Commission\Settings\OrderItem(
            [
                'id'    => $this->item->get_id(),
                'price' => $item_price,
            ]
        ) )->save(
            [
                'commission_source'   => $settings->get_source(),
                'type'       => $type,
                'percentage' => $percentage,
                'flat'       => $flat,
                'meta_data'  => $commission_data->get_data()  ,
            ]
        );

        return $commission_data;
    }

    /**
     * Retrieve commission data from order item meta.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     *
     * @throw \Exception
     */
    public function get(): Commission {
        if ( ! $this->item ) {
            throw new \Exception( esc_html__( 'Order item is required to get order item commission.', 'dokan-lite' ) );
        }

        return $this->calculate();
    }
}
