<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Refund;
use WeDevs\Dokan\Commission\Contracts\OrderCommissionInterface;
use WeDevs\Dokan\Commission\Model\Commission;

/**
 * Class OrderCommission - Calculate order commission
 *
 * @since   4.0.0
 *
 * @package WeDevs\Dokan\Commission
 */
class OrderCommission extends AbstractCommissionCalculator implements OrderCommissionInterface {

    private ?WC_Order $order;

    const SELLER = 'seller';
    const ADMIN = 'admin';

    protected $is_calculated = false;

    /**
     * @var Commission[] $admin_net_commission
     */
    protected $commission_by_line_item = [];

    /**
     * Get order.
     *
     * @since 4.0.0
     *
     * @return \WC_Order|null
     */
    public function get_order(): ?WC_Order {
        return $this->order;
    }

    /**
     * Set order.
     *
     * @since 4.0.0
     *
     * @param  \WC_Order  $order
     *
     * @return void
     */
    public function set_order( WC_Order $order ): self {
        $this->order = $order;

        return $this;
    }

    /**
     * Calculate order commission.
     *
     * @since 4.0.0
     *
     * @return Model\Commission|\Exception
     */
    public function calculate(): self {
        if ( ! $this->order ) {
            throw new \Exception( esc_html__( 'Order is required for order commission calculation.', 'dokan-lite' ) );
        }

        $this->reset_order_commission_data();

        $admin_net_commission = 0;
        $admin_discount       = 0;
        $vendor_net_earning   = 0;
        $vendor_discount      = 0;

        foreach ( $this->order->get_items() as $item_id => $item ) {
            try {
                $line_item_commission = dokan_get_container()->get( OrderLineItemCommission::class );
                $line_item_commission->set_should_adjust_refund( $this->get_should_adjust_refund() );
                $line_item_commission->set_order( $this->order );
                $line_item_commission->set_item( $item );

                $commission = $line_item_commission->calculate();

                $admin_net_commission += $commission->get_admin_net_commission();
                $admin_discount       += $commission->get_admin_discount();

                $vendor_net_earning += $commission->get_vendor_net_earning();
                $vendor_discount    += $commission->get_vendor_discount();

                $this->commission_by_line_item[ $item_id ] = $commission;
            } catch ( \Exception $exception ) {
                // TODO: Handle exception.
                dokan_log(
                    sprintf(
                        'Error calculating commission for order item %s: %s',
                        $item_id,
                        $exception->getMessage()
                    ),
                    'error'
                );
            }
        }
        $this->set_admin_net_commission( $admin_net_commission )
            ->set_admin_discount( $admin_discount )
            ->set_vendor_net_earning( $vendor_net_earning )
            ->set_vendor_discount( $vendor_discount );

        $this->is_calculated = true;

        return $this;
    }

    /**
     * Calculate commission for refund.
     *
     * @since 4.0.0
     *
     * @param  \WC_Order_Refund  $refund
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function calculate_for_refund( WC_Order_Refund $refund ): Commission {
        $should_reset_adjust_refund = false;

        if ( $this->get_should_adjust_refund() ) {
            $this->set_should_adjust_refund( false );
            $this->calculate();
            $should_reset_adjust_refund = true;
        }

        $this->ensure_commissions_are_calculated();

        $refund_commission = new Commission();

        foreach ( $refund->get_items() as $item_id => $refund_item ) {
            try {
                $order_item_id          = $refund_item->get_meta( '_refunded_item_id', true );
                $order_item_commission  = $this->get_commission_for_line_item( $order_item_id );
                $item_refund_commission = $order_item_commission->calculate_for_refund_item( $refund_item );

                $refund_commission->set_admin_net_commission(
                    $refund_commission->get_admin_net_commission() + $item_refund_commission->get_admin_net_commission()
                );
                $refund_commission->set_vendor_net_earning(
                    $refund_commission->get_vendor_net_earning() + $item_refund_commission->get_vendor_net_earning()
                );
            } catch ( \Exception $exception ) {
                // translators: 1: Refund item ID, 2: Error message
                dokan_log(
                    sprintf(
                        // translators: 1: Refund item ID, 2: Error message
                        __( 'Refund item ID %1$s error: %2$s', 'dokan-lite' ), $order_item_id,
                        $exception->getMessage()
                    ), 'error'
                );
            }
        }

        if ( $should_reset_adjust_refund ) {
            $this->set_should_adjust_refund( true );
            $this->calculate();
        }

        return $refund_commission;
    }

    /**
     * Retrieve order commission.
     *
     * @since 4.0.0
     * @return OrderCommission
     * @throws \Exception If the order is not set.
     */
    public function get(): OrderCommission {
        $this->ensure_commissions_are_calculated();

        return $this;
    }

    /**
     * Get admin commission.
     *
     * @since 4.0.0
     *
     * @return float
     */
    public function get_admin_shipping_fee(): float {
        if ( self::ADMIN === dokan()->fees->get_shipping_fee_recipient( $this->order ) ) {
            return floatval( $this->order->get_shipping_total() ) - floatval( $this->get_shipping_refunded() );
        }

        return 0;
    }

    /**
     * Get admin subsidy.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_admin_tax_fee() {
        if ( self::ADMIN === dokan()->fees->get_tax_fee_recipient( $this->order->get_id() ) ) {
            return ( ( floatval( $this->order->get_total_tax() ) - floatval( $this->get_tax_refunded() ) ) - ( floatval( $this->order->get_shipping_tax() ) - floatval( $this->get_total_shipping_tax_refunded() ) ) );
        }

        return 0;
    }

    /**
     * Get admin shipping tax fee.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_admin_shipping_tax_fee() {
        if ( self::ADMIN === dokan()->fees->get_shipping_tax_fee_recipient( $this->order ) ) {
            return ( floatval( $this->order->get_shipping_tax() ) - floatval( $this->get_total_shipping_tax_refunded() ) );
        }

        return 0;
    }

    /**
     * Get admin gateway fee.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_admin_gateway_fee(): float {
        $gateway_fee = $this->get_dokan_gateway_fee();

        if ( ! empty( $gateway_fee['fee'] ) && self::ADMIN === $gateway_fee['paid_by'] ) {
            return floatval( $gateway_fee['fee'] );
        }

        // if order has admin gateway fee, return it
        $admin_gateway_fee = $this->order->get_meta( 'dokan_admin_gateway_fee', true );
        if ( ! empty( $admin_gateway_fee ) ) {
            return floatval( $admin_gateway_fee );
        }

        return 0;
    }

    /**
     * Get vendor shipping fee.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_vendor_shipping_fee(): float {
        if ( self::SELLER === dokan()->fees->get_shipping_fee_recipient( $this->order ) ) {
            return floatval( $this->order->get_shipping_total() ) - floatval( $this->get_shipping_refunded() );
        }

        return 0;
    }

    /**
     * Get vendor shipping tax fee.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_vendor_shipping_tax_fee(): float {
        if ( self::SELLER === dokan()->fees->get_shipping_tax_fee_recipient( $this->order ) ) {
            return ( floatval( $this->order->get_shipping_tax() ) - floatval( $this->get_total_shipping_tax_refunded() ) );
        }

        return 0;
    }

    /**
     * Get vendor tax fee.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_vendor_tax_fee(): float {
        if ( self::SELLER === dokan()->fees->get_tax_fee_recipient( $this->order->get_id() ) ) {
            return ( ( floatval( $this->order->get_total_tax() ) - floatval( $this->get_tax_refunded() ) ) - ( floatval( $this->order->get_shipping_tax() ) - floatval( $this->get_total_shipping_tax_refunded() ) ) );
        }

        return 0;
    }

    /**
     * Get vendor gateway fee.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_vendor_earning(): float {
        return $this->get_vendor_net_earning() + $this->get_total_vendor_fees();
    }

    /**
     * Vendor payout subtotal based on customer's actual payment.
     *
     * Returns the vendor’s payable subtotal (excludes admin subsidy) and caps it
     * to the amount actually paid by the customer (net of refunds) to avoid overpay during payment.
     *
     * Formula:
     * - admin < 0 → vendor_adj = vendor - abs(admin)
     * - admin ≥ 0 → vendor_adj = vendor
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_vendor_earning_subtotal(): float {

        $admin_commission = $this->get_admin_commission();

        // If admin commission is negative, it means admin has subsidized the vendor.
        if ( $admin_commission < 0 ) {
            return $this->get_vendor_earning() - abs( $admin_commission );
        }

        return $this->get_vendor_earning();
    }

    /**
     * Get dokan gateway fee.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_total_admin_fees(): float {
        return $this->get_admin_shipping_fee() + $this->get_admin_tax_fee() + $this->get_admin_shipping_tax_fee() - $this->get_admin_gateway_fee() + $this->get_admin_order_fees();
    }

    /**
     * Get total vendor fees.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_total_vendor_fees(): float {
        return $this->get_vendor_shipping_fee() + $this->get_vendor_tax_fee() + $this->get_vendor_shipping_tax_fee() - $this->get_vendor_gateway_fee() + $this->get_vendor_order_fees();
    }


    /**
     * Get dokan gateway fee.
     *
     * @since 4.0.0
     *
     * @return array
     */
    private function get_dokan_gateway_fee() {
        $gateway_fee         = $this->order->get_meta( 'dokan_gateway_fee', true );
        $gateway_fee_paid_by = $this->order->get_meta( 'dokan_gateway_fee_paid_by', true );

        if ( ! empty( $processing_fee ) && empty( $gateway_fee_paid_by ) ) {
            /**
             * @since 3.7.15 dokan_gateway_fee_paid_by meta key returns empty value if gateway fee is paid admin
             */
            $gateway_fee_paid_by = $this->order->get_payment_method() === 'dokan-stripe-connect' ? 'admin' : 'seller';
        }

        return [
            'fee'     => floatval( $gateway_fee ),
            'paid_by' => $gateway_fee_paid_by,
        ];
    }

    /**
     * Get vendor gateway fee.
     *
     * @since 4.0.0
     *
     * @return float|int
     */
    public function get_vendor_gateway_fee(): float {
        $gateway_fee = $this->get_dokan_gateway_fee();

        if ( ! empty( $gateway_fee['fee'] ) && self::SELLER === $gateway_fee['paid_by'] ) {
            return floatval( $gateway_fee['fee'] );
        }

        return 0;
    }

    /**
     * Get data.
     *
     * @since 4.0.0
     *
     * @return array
     */
    public function get_data() {
        return [
            'admin_commission'     => $this->get_admin_commission(),
            'admin_net_commission' => $this->get_admin_net_commission(),
            'admin_discount'       => $this->get_admin_discount(),
            'admin_subsidy'        => $this->get_admin_subsidy(),
            'vendor_discount'      => $this->get_vendor_discount(),
            'vendor_earning'       => $this->get_vendor_earning(),
            'vendor_net_earning'   => $this->get_vendor_net_earning(),
            'admin_order_fees'     => $this->get_admin_order_fees(),
            'vendor_order_fees'    => $this->get_vendor_order_fees(),
            'order_fees_recipient' => $this->get_order_fee_recipient(),
        ];
    }

    /**
     * Additional adjustments.
     *
     * @since 4.0.0
     *
     * @param  \WeDevs\Dokan\Commission\Model\Commission  $commission_data
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function additional_adjustments( Commission $commission_data ): Commission {
        return $commission_data;
    }

    /**
     * Reset the commission related data.
     *
     * @return void
     */
    protected function reset_order_commission_data() {
        $this->admin_net_commission = 0;
        $this->admin_discount       = 0;

        $this->vendor_discount    = 0;
        $this->vendor_net_earning = 0;
        $this->is_calculated      = false;
    }

    /**
     * Retrieve the commission object for a specific line item.
     *
     * @param  int  $item_id  Line item ID.
     *
     * @return OrderLineItemCommission|null The commission object or null if not found.
     */
    public function get_commission_for_line_item( int $item_id ): ?OrderLineItemCommission {
        $commissions = $this->get_all_line_item_commissions();

        return $commissions[ $item_id ] ?? null;
    }

    /**
     * Retrieve all calculated commissions by line item.
     *
     * Ensures commission calculations are performed before returning.
     *
     * @return Commission[] Associative array of item ID => Commission.
     */
    public function get_all_line_item_commissions(): array {
        $this->ensure_commissions_are_calculated();

        return $this->commission_by_line_item;
    }

    /**
     * Ensure commission calculations have been performed.
     *
     * Triggers calculation if not already done.
     */
    protected function ensure_commissions_are_calculated(): void {
        if ( ! $this->is_calculated ) {
            $this->calculate();
        }
    }

    /**
     * Get the total admin commission.
     *
     * This includes the net commission plus any additional admin fees.
     *
     * @since 4.0.0
     *
     * @return float
     */
    public function get_admin_commission(): float {
        return $this->get_admin_net_commission() + $this->get_total_admin_fees();
    }

    /**
     * Get the total earning for the admin.
     *
     * @since 4.0.0
     * @return float
     * @deprecated 4.0.0 Use get_admin_commission() instead.
     */
    public function get_admin_total_earning(): float {
        return $this->get_admin_commission();
    }

    /**
     * Get the total earning for the vendor.
     *
     * @since 4.0.0
     * @return float
     * @deprecated 4.0.0 Use get_vendor_earning() instead.
     */
    public function get_vendor_total_earning(): float {
        return $this->get_vendor_earning();
    }

    /**
     * Get the total shipping refunded.
     *
     * @return float
     */
    protected function get_shipping_refunded(): float {
        return $this->get_should_adjust_refund() ? $this->order->get_total_shipping_refunded() : 0.0;
    }

    /**
     * Get the tax refunded.
     *
     * @return float
     */
    protected function get_tax_refunded(): float {
        do_action( 'dokan_order_commission_tax_refunded_before', $this->order, $this );
        $tax_refund = $this->get_should_adjust_refund() ? $this->order->get_total_tax_refunded() : 0.0;

        do_action( 'dokan_order_commission_tax_refunded_after', $this->order, $this );

        return $tax_refund;
    }

    /**
     * Get the total shipping tax refunded.
     *
     * @return float
     */
    protected function get_total_shipping_tax_refunded(): float {
        return $this->get_should_adjust_refund() ? dokan()->fees->get_total_shipping_tax_refunded( $this->order ) : 0.0;
    }

    /**
     * Get the order fee for admin.
     *
     * @since 4.1.0
     *
     * @return float
     */
    protected function get_admin_order_fees(): float {
        if ( self::ADMIN === $this->get_order_fee_recipient() ) {
            return $this->order->get_total_fees() - $this->get_order_fee_refunded();
        }

        return 0.0;
    }

    /**
     * Get the order fee for vendor.
     *
     * @since 4.1.0
     *
     * @return float
     */
    protected function get_vendor_order_fees(): float {
        if ( self::SELLER === $this->get_order_fee_recipient() ) {
            return $this->order->get_total_fees() - $this->get_order_fee_refunded();
        }

        return 0.0;
    }

    /**
     * Get order fee recipient.
     *
     * @since 4.1.0
     *
     * @return string
     */
    protected function get_order_fee_recipient(): string {
        $recipient = self::ADMIN;
        // check order is a manual order then fee recipient is seller.
        if ( 'vendor' === $this->order->get_meta( '_wc_order_attribution_source_type', true ) ) {
            $recipient = self::SELLER;
        }

        return apply_filters( 'dokan_order_commission_order_fee_recipient', $recipient, $this->order, $this );
    }

    /**
     * Get the refunded order fee.
     *
     * @return float
     */
    protected function get_order_fee_refunded(): float {
        $total_refunded_fees = 0.0;
        if ( ! $this->get_should_adjust_refund() ) {
            return $total_refunded_fees;
        }

        $fee_items = $this->order->get_items( 'fee' );

        if ( ! empty( $fee_items ) ) {
            foreach ( $fee_items as $item_id => $item ) {
                $refunded_amount      = $this->order->get_total_refunded_for_item( $item_id, 'fee' );
                $total_refunded_fees += (float) $refunded_amount;
            }
        }

        return $total_refunded_fees;
    }
}
