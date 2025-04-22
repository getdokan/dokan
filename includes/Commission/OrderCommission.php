<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WeDevs\Dokan\Commission\Model\Commission;

/**
 * Class OrderCommission - Calculate order commission
 *
 * @since   DOKAN_SINCE
 *
 * @package WeDevs\Dokan\Commission
 */
class OrderCommission extends AbstractCommissionCalculator {

    private ?WC_Order $order;

    const SELLER = 'seller';
    const ADMIN  = 'admin';
    private $vendor_discount      = 0;
    private $admin_discount       = 0;
    private $admin_net_commission = 0;
    private $admin_commission     = 0;
    private $admin_subsidy        = 0;
    private $vendor_net_earning   = 0;
    private $vendor_earnign       = 0;

    protected $is_calculated = false;

    /**
     * Get order.
     *
     * @since DOKAN_SINCE
     *
     * @return \WC_Order|null
     */
    public function get_order(): ?WC_Order {
        return $this->order;
    }

	/**
	 * Set order.
	 *
	 * @since DOKAN_SINCE
	 *
	 * @param \WC_Order $order
	 *
	 * @return void
	 */
	public function set_order( WC_Order $order ) {
		$this->order = $order;
	}

    /**
     * Calculate order commission.
     *
     * @since DOKAN_SINCE
     *
     * @return Model\Commission|\Exception
     */
    public function calculate(): Model\Commission {
        if ( ! $this->order ) {
            throw new \Exception( esc_html__( 'Order is required for order commission calculation.', 'dokan-lite' ) );
        }

        $this->reset_order_commission_data();

        foreach ( $this->order->get_items() as $item_id => $item ) {
            try {
                $line_item_commission = dokan_get_container()->get( OrderLineItemCommission::class );
                $line_item_commission->set_order( $this->order );
                $line_item_commission->set_item( $item );
                $commission = $line_item_commission->calculate();

                $this->admin_net_commission += $commission->get_net_admin_commission();
                $this->admin_discount       += $commission->get_admin_discount();

                $this->vendor_net_earning += $commission->get_vendor_earning();
                $this->vendor_discount    += $commission->get_vendor_discount();
            } catch ( \Exception $exception ) {
                // TODO: Handle exception.
            }
        }

        $this->is_calculated = true;

        return $this->populate_commission_data();
    }

    /**
     * Retrieve order commission.
     *
     * @since DOKAN_SINCE
     * @throws \Exception If the order is not set.
     *
     * @return Model\Commission|\Exception
     */
    public function get(): Model\Commission {
        if ( ! $this->is_calculated) {
            return $this->calculate();
        }

        return $this->populate_commission_data();
    }

    /**
     * Populate commission data.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    protected function populate_commission_data() {
        $commission = new Commission();
        $commission->set_net_admin_commission( $this->get_admin_commission() )
            ->set_admin_discount( $this->admin_discount )
            ->set_vendor_discount( $this->vendor_discount )
            ->set_vendor_earning( $this->get_vendor_discount() );

        return $commission;
    }

    /**
     * Get admin discount.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_admin_discount() {
        return $this->admin_discount;
    }

    /**
     * Get admin net commission.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_admin_net_commission() {
        return $this->admin_net_commission;
    }

    /**
     * Get admin commission.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int|string
     */
    public function get_admin_shipping_fee() {
        if ( self::ADMIN === dokan()->fees->get_shipping_fee_recipient( $this->order ) ) {
            return $this->order->get_shipping_total() - $this->order->get_total_shipping_refunded();
        }

        return 0;
    }

    /**
     * Get admin commission.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_admin_commission() {
        return $this->admin_commission;
    }

    /**
     * Get admin subsidy.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_admin_tax_fee() {
        if ( self::ADMIN === dokan()->fees->get_tax_fee_recipient( $this->order->get_id() ) ) {
            return ( ( floatval( $this->order->get_total_tax() ) - floatval( $this->order->get_total_tax_refunded() ) ) - ( floatval( $this->order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $this->order ) ) ) );
        }

        return 0;
    }

    /**
     * Get admin shipping tax fee.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_admin_shipping_tax_fee() {
        if ( self::ADMIN === dokan()->fees->get_shipping_tax_fee_recipient( $this->order ) ) {
            return ( floatval( $this->order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $this->order ) ) );
        }

        return 0;
    }

    /**
     * Get admin subsidy.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_admin_subsidy() {
        return $this->admin_subsidy;
    }

    /**
     * Get admin gateway fee.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_admin_gateway_fee() {
        $gateway_fee = $this->get_dokan_gateway_fee();

        if ( ! empty( $gateway_fee['fee'] ) && self::ADMIN === $gateway_fee['paid_by'] ) {
            return floatval( $gateway_fee['fee'] );
        }

        return 0;
    }

    /**
     * Get vendor discount.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_vendor_discount() {
        return $this->vendor_discount;
    }

    /**
     * Get vendor net earning.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_vendor_net_earning() {
        return $this->vendor_net_earning;
    }

    /**
     * Get vendor shipping fee.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_vendor_shipping_fee() {
        if ( self::SELLER === dokan()->fees->get_shipping_fee_recipient( $this->order ) ) {
            return $this->order->get_shipping_total() - $this->order->get_total_shipping_refunded();
        }

        return 0;
    }

    /**
     * Get vendor shipping tax fee.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_vendor_shipping_tax_fee() {
        if ( self::SELLER === dokan()->fees->get_shipping_tax_fee_recipient( $this->order ) ) {
            return ( floatval( $this->order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $this->order ) ) );
        }

        return 0;
    }

    /**
     * Get vendor tax fee.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_vendor_tax_fee() {
        if ( self::SELLER === dokan()->fees->get_tax_fee_recipient( $this->order->get_id() ) ) {
            return ( ( floatval( $this->order->get_total_tax() ) - floatval( $this->order->get_total_tax_refunded() ) ) - ( floatval( $this->order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $this->order ) ) ) );
        }

        return 0;
    }

    /**
     * Get vendor gateway fee.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_vendor_earning() {
        return $this->vendor_earnign;
    }

    /**
     * Get dokan gateway fee.
     *
     * @since DOKAN_SINCE
     *
     * @return float/int
     */
    public function get_total_admin_fees() {
        return $this->get_admin_shipping_fee() + $this->get_admin_tax_fee() + $this->get_admin_shipping_tax_fee() - $this->get_admin_gateway_fee();
    }

    /**
     * Get total vendor fees.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_total_vendor_fees() {
        return $this->get_vendor_shipping_fee() + $this->get_vendor_tax_fee() + $this->get_vendor_shipping_tax_fee() - $this->get_vendor_gateway_fee();
    }

    /**
     * Get admin total earning.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_admin_total_earning() {
        return $this->get_admin_net_commission() + $this->get_total_admin_fees();
    }

    /**
     * Get vendor total earning.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_vendor_total_earning() {
        return $this->get_vendor_net_earning() + $this->get_total_vendor_fees();
    }

    /**
     * Get dokan gateway fee.
     *
     * @since DOKAN_SINCE
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
            'fee'     => $gateway_fee,
            'paid_by' => $gateway_fee_paid_by,
        ];
    }

    /**
     * Get vendor gateway fee.
     *
     * @since DOKAN_SINCE
     *
     * @return float|int
     */
    public function get_vendor_gateway_fee() {
        $gateway_fee = $this->get_dokan_gateway_fee();

        if ( ! empty( $gateway_fee['fee'] ) && self::SELLER === $gateway_fee['paid_by'] ) {
            return floatval( $gateway_fee['fee'] );
        }

        return 0;
    }

    /**
     * Get data.
     *
     * @since DOKAN_SINCE
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
        ];
    }

    /**
     * Additional adjustments.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Commission $commission_data
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function additional_adjustments( Commission $commission_data ): Commission {
        return $commission_data;
    }

    protected function reset_order_commission_data() {
        $this->admin_commission     = 0;
        $this->admin_net_commission = 0;
        $this->admin_discount       = 0;
        $this->admin_subsidy        = 0;

        $this->vendor_discount    = 0;
        $this->vendor_earnign     = 0;
        $this->vendor_net_earning = 0;
    }
}
