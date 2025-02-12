<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;

class OrderCommission {

    private WC_Order $order;

    const SELLER             = 'seller';
    const ADMIN              = 'admin';

    private $vendor_discount      = 0;
    private $admin_discount       = 0;
    private $admin_net_commission = 0;
    private $admin_commission     = 0;
    private $admin_subsidy        = 0;
    private $vendor_net_earnign   = 0;
    private $vendor_earnign       = 0;

    public function __construct( WC_Order $order ) {
        $this->order = $order;
    }

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

    public function get_admin_discount() {
        return $this->admin_discount;
    }

    public function get_admin_net_commission() {
        return $this->admin_net_commission;
    }

    public function get_admin_shipping_fee() {
        if ( self::ADMIN === dokan()->fees->get_shipping_fee_recipient( $this->order ) ) {
            return $this->order->get_shipping_total() - $this->order->get_total_shipping_refunded();
        }

        return 0;
    }

    public function get_admin_commission() {
        return $this->admin_commission;
    }

    public function get_admin_tax_fee() {
        if ( self::ADMIN === dokan()->fees->get_tax_fee_recipient( $this->order->get_id() ) ) {
            return ( ( floatval( $this->order->get_total_tax() ) - floatval( $this->order->get_total_tax_refunded() ) ) - ( floatval( $this->order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $this->order ) ) ) );
        }

        return 0;
    }

    public function get_admin_shipping_tax_fee() {
        if ( self::ADMIN === dokan()->fees->get_shipping_tax_fee_recipient( $this->order ) ) {
            return ( floatval( $this->order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $this->order ) ) );
        }

        return 0;
    }

    public function get_admin_subsidy() {
        return $this->admin_subsidy;
    }

    public function get_admin_gateway_fee() {
        $gateway_fee = $this->get_dokan_gateway_fee();

        if ( ! empty( $gateway_fee['fee'] ) && self::ADMIN === $gateway_fee['paid_by'] ) {
            return floatval( $gateway_fee['fee'] );
        }

        return 0;
    }


    public function get_vendor_discount() {
        return $this->vendor_discount;
    }

    public function get_vendor_net_earning() {
        return $this->vendor_net_earnign;
    }

    public function get_vendor_shipping_fee() {
        if ( self::SELLER === dokan()->fees->get_shipping_fee_recipient( $this->order ) ) {
            return $this->order->get_shipping_total() - $this->order->get_total_shipping_refunded();
        }

        return 0;
    }

    public function get_vendor_shipping_tax_fee() {
        if ( self::SELLER === dokan()->fees->get_shipping_tax_fee_recipient( $this->order ) ) {
            return ( floatval( $this->order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $this->order ) ) );
        }

        return 0;
    }

    public function get_vendor_tax_fee() {
        if ( self::SELLER === dokan()->fees->get_tax_fee_recipient( $this->order->get_id() ) ) {
            return ( ( floatval( $this->order->get_total_tax() ) - floatval( $this->order->get_total_tax_refunded() ) ) - ( floatval( $this->order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $this->order ) ) ) );
        }

        return 0;
    }

    public function get_vendor_earning() {
        return $this->vendor_earnign;
    }

    public function get_total_admin_fees() {
        return $this->get_admin_shipping_fee() + $this->get_admin_tax_fee() + $this->get_admin_shipping_tax_fee() - $this->get_admin_gateway_fee();
    }

    public function get_total_vendor_fees() {
        return $this->get_vendor_shipping_fee() + $this->get_vendor_tax_fee() + $this->get_vendor_shipping_tax_fee() - $this->get_vendor_gateway_fee();
    }

    public function get_admin_total_earning() {
        return $this->get_admin_net_commission() + $this->get_total_admin_fees();
    }

    public function get_vendor_total_earning() {
        return $this->get_vendor_net_earning() + $this->get_total_vendor_fees();
    }

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

    public function get_vendor_gateway_fee() {
        $gateway_fee = $this->get_dokan_gateway_fee();

        if ( ! empty( $gateway_fee['fee'] ) && self::SELLER === $gateway_fee['paid_by'] ) {
            return floatval( $gateway_fee['fee'] );
        }

        return 0;
    }
}
