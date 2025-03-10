<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;

/**
 * Class OrderCommission - Calculate order commission
 *
 * @since   DOKAN_SINCE
 *
 * @package WeDevs\Dokan\Commission
 */
class OrderCommission {

    private WC_Order $order;

    const SELLER = 'seller';
    const ADMIN  = 'admin';
    private $vendor_discount      = 0;
    private $admin_discount       = 0;
    private $admin_net_commission = 0;
    private $admin_commission     = 0;
    private $admin_subsidy        = 0;
    private $vendor_net_earnign   = 0;
    private $vendor_earnign       = 0;

    /**
     * OrderCommission constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WC_Order $order
     */
    public function __construct( WC_Order $order ) {
        $this->order = $order;
    }

    /**
     * Calculate order commission.
     *
     * @since DOKAN_SINCE
     *
     * @param bool $auto_save_commission_into_line_item
     *
     * @return void
     */
    public function calculate( $auto_save_commission_into_line_item = false ) {
        foreach ( $this->order->get_items() as $item_id => $item ) {
            $line_item_commission = new OrderLineItemCommission( $item, $this->order );
            $commission           = $line_item_commission->calculate( $auto_save_commission_into_line_item );

            $this->admin_commission     += $commission->get_admin_commission();
            $this->admin_net_commission += $commission->get_net_admin_commission();
            $this->admin_discount       += $commission->get_admin_discount();
            $this->admin_subsidy        += $commission->get_admin_subsidy();

            $this->vendor_discount    += $commission->get_vendor_discount();
            $this->vendor_earnign     += $commission->get_vendor_earning();
            $this->vendor_net_earnign += $commission->get_net_vendor_earning();
        }
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
        return $this->vendor_net_earnign;
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
}
