<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Item;
use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Strategies\OrderItem;
use WeDevs\Dokan\Vendor\Coupon;

/**
 * Class OrderLineItemCommission - Calculate order line item commission
 *
 * @since 4.0.0
 */
class OrderLineItemCommission extends AbstractCommissionCalculator {
    /**
     * Order line item.
     *
     * @since 4.0.0
     *
     * @var \WC_Order_Item_Product $item
     */
    protected $item;

    /**
     * Order line item commission meta key.
     *
     * @since 4.0.0
     *
     * @var string
     */
    const VENDOR_ID_META_KEY = '_dokan_vendor_id';

    /**
     * @var \WC_Order $order
     */
    protected WC_Order $order;

    /**
     * @var int $vendor_id
     */
    protected int $vendor_id;

    /**
     * @var array $coupon_infos
     */
    protected array $coupon_infos = [];

    /**
     * Get the line item.
     *
     * @param \WC_Order_Item_Product $item
     * @param \WC_Order              $order
     */
    public function get_item(): WC_Order_Item {
        return $this->item;
    }

    /**
     * Set order item to calculate commission.
     *
     *
     * @param WC_Order_Item $item
     * @return void
     */
    public function set_item( WC_Order_Item $item ): void {
        $this->item = $item;

        // phpcs:ignore Universal.Operators.DisallowShortTernary.Found
        $this->coupon_infos = $this->item->get_meta( Coupon::DOKAN_COUPON_META_KEY, true ) ?: [];
    }

    /**
     * Get the order of the associated line item to calculate the commission.
     *
     * @return \WC_Order
     */
    public function get_order(): WC_Order {
        return $this->order;
    }

    /**
     * @return array
     */
    protected function get_coupon_infos(): array {
        return empty( $this->coupon_infos ) ? [] : $this->coupon_infos;
    }

    /**
     * Set order to calculate commission.
     *
     * @param WC_Order $order
     * @return void
     */
    public function set_order( WC_Order $order ): void {
        $this->order = $order;
        $this->vendor_id = (int) $this->order->get_meta( self::VENDOR_ID_META_KEY );
    }

    /**
     * Calculate order line item commission.
     *
     * @since 4.0.0
     *
     * @return OrderLineItemCommission |null
     */
    public function calculate(): OrderLineItemCommission {
        if ( ! $this->item ) {
            throw new \Exception( esc_html__( 'Order item is required for order item commission calculation.', 'dokan-lite' ) );
        }

        if ( ! $this->order ) {
            throw new \Exception( esc_html__( 'Order is required for order item commission calculation.', 'dokan-lite' ) );
        }

        $item_price = apply_filters( 'dokan_earning_by_order_item_price', $this->item->get_total(), $this->item, $this->order );

        $total_quantity = $this->item->get_quantity();

        /** @var \WeDevs\Dokan\Commission\Strategies\AbstractStrategy */
        $strategy = apply_filters(
            'dokan_order_line_item_commission_strategies',
            new OrderItem( $this->item, $this->vendor_id )
        );

        $strategy->save_settings_to_order_item( $this->item );

        /**
         * @var \WeDevs\Dokan\Commission\Model\Setting $settings
         */
        $settings = $strategy->get_settings();

        $commission_data = dokan_get_container()->get( Calculator::class )
            ->set_settings( $settings )
            ->set_subtotal( $item_price )
            ->set_total( $this->item->get_total() )
            ->set_quantity( $total_quantity )
            ->set_discount( new CouponInfo( $this->get_coupon_infos() ) )
            ->calculate();

        $commission_data = $this->adjust_refunds( $commission_data );

        $this->set_commission_data( $commission_data );

        return $this;
    }

    /**
     * Set the commission data to this class.
     *
     * @param Commission $commission
     * @return self
     */
    protected function set_commission_data( Commission $commission ): self {
        $this->set_admin_net_commission( $commission->get_admin_net_commission() );
        $this->set_vendor_discount( $commission->get_vendor_discount() );
        $this->set_vendor_net_earning( $commission->get_vendor_net_earning() );
        $this->set_admin_discount( $commission->get_admin_discount() );
        $this->set_settings( $commission->get_settings() );

        return $this;
    }

    /**
     * Calculate and get the vendor earning & admin commission in refunded item.
     *
     * @param WC_Order_Item $refund_item
     * @return Commission
     */
    public function calculate_for_refund_item( WC_Order_Item $refund_item ): Commission {
        $order_item = $this->get_item();
        $item_total = $order_item->get_total();
        $refund_item_total = $refund_item->get_total();

        $calculator = dokan_get_container()->get( Calculator::class );

        $refund_commission = $calculator->calculate_for_refund(
            $this->get_vendor_net_earning(),
            $this->get_admin_net_commission(),
            $item_total,
            $refund_item_total,
        );

        return $refund_commission;
    }

    /**
     * Check if the refund should be adjusted.
     *
     * @since 4.0.0
     *
     * @return Commission
     */
    public function adjust_refunds( Commission $commission ): Commission {
        if ( ! $this->get_should_adjust_refund() ) {
            return $commission;
        }

        $refund_amount = $this->order->get_total_refunded_for_item( $this->item->get_id() );

        /**
         * If Admin provide discount 20 for 100, then item_total = 80.
         * Then vendor earning and admin commission in refund amount should be proportional to 80 not 100.
        */
        $item_total = $this->item->get_total();

        $vendor_earning = $commission->get_vendor_net_earning();
        $admin_commission = $commission->get_admin_net_commission();

        $calculator = dokan_get_container()->get( Calculator::class );

        $refund_commission = $calculator->calculate_for_refund(
            $vendor_earning,
            $admin_commission,
            $item_total,
            $refund_amount
        );

        $admin_commission_after_refund = $admin_commission - $refund_commission->get_admin_net_commission();
        $vendor_earning_after_refund = $vendor_earning - $refund_commission->get_vendor_net_earning();

        $commission->set_admin_net_commission( $admin_commission_after_refund )
            ->set_vendor_net_earning( $vendor_earning_after_refund );

        return $commission;
    }

    /**
     * Retrieve commission data from order item meta.
     *
     * @since 4.0.0
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
