<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Refund;
use WeDevs\Dokan\Commission\Model\Commission;

/**
 * Class OrderRefundCommission - Calculate the vendor earning and admin commission portions of an order refund.
 *
 * The line-item portions are prorated from the order's commission
 * (see Calculator::calculate_for_refund()), while refunded tax, shipping
 * and gateway fees are routed to whichever party received them originally.
 *
 * @since 5.0.10
 *
 * @package WeDevs\Dokan\Commission
 */
class OrderRefundCommission {

    const SELLER = OrderCommission::SELLER;
    const ADMIN  = OrderCommission::ADMIN;

    /**
     * The refund being calculated.
     *
     * @var WC_Order_Refund|null
     */
    private ?WC_Order_Refund $refund = null;

    /**
     * The refunded (parent of the refund) order.
     *
     * @var WC_Order|null
     */
    private ?WC_Order $order = null;

    /**
     * Whether the refund commission has been calculated.
     *
     * @var bool
     */
    protected bool $is_calculated = false;

    /**
     * Prorated line-item commission portions of the refund.
     *
     * @var Commission|null
     */
    protected ?Commission $refund_commission = null;

    /**
     * Set the refund to calculate for.
     *
     * @since 5.0.10
     *
     * @param WC_Order_Refund $refund
     *
     * @return self
     */
    public function set_refund( WC_Order_Refund $refund ): self {
        $this->refund        = $refund;
        $this->is_calculated = false;

        return $this;
    }

    /**
     * Get the refund.
     *
     * @since 5.0.10
     *
     * @return WC_Order_Refund|null
     */
    public function get_refund(): ?WC_Order_Refund {
        return $this->refund;
    }

    /**
     * Set the refunded order explicitly.
     *
     * Optional; when omitted the order is resolved from the refund's parent ID.
     *
     * @since 5.0.10
     *
     * @param WC_Order $order
     *
     * @return self
     */
    public function set_order( WC_Order $order ): self {
        $this->order         = $order;
        $this->is_calculated = false;

        return $this;
    }

    /**
     * Get the refunded order.
     *
     * @since 5.0.10
     *
     * @return WC_Order|null
     */
    public function get_order(): ?WC_Order {
        if ( ! $this->order && $this->refund ) {
            $order = wc_get_order( $this->refund->get_parent_id() );

            $this->order = $order instanceof WC_Order ? $order : null;
        }

        return $this->order;
    }

    /**
     * Calculate the commission portions of the refund.
     *
     * @since 5.0.10
     *
     * @throws \Exception If the refund or its parent order is not resolvable.
     *
     * @return self
     */
    public function calculate(): self {
        if ( ! $this->refund ) {
            throw new \Exception( esc_html__( 'A refund is required for refund commission calculation.', 'dokan-lite' ) );
        }

        $order = $this->get_order();

        if ( ! $order ) {
            throw new \Exception( esc_html__( 'The refunded order could not be found for refund commission calculation.', 'dokan-lite' ) );
        }

        $this->refund_commission = new Commission();

        if ( ! $this->has_sub_orders() ) {
            $order_commission = dokan_get_container()->get( OrderCommission::class );
            $order_commission->set_should_adjust_refund( false );
            $order_commission->set_order( $order );

            $this->refund_commission = $order_commission->calculate_for_refund( $this->refund );
        }

        $this->is_calculated = true;

        return $this;
    }

    /**
     * Get the vendor's prorated net earning in the refund (line items only).
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_vendor_net_earning(): float {
        $this->ensure_calculated();

        return $this->refund_commission->get_vendor_net_earning();
    }

    /**
     * Get the admin's prorated net commission in the refund (line items only).
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_admin_net_commission(): float {
        $this->ensure_calculated();

        return $this->refund_commission->get_admin_net_commission();
    }

    /**
     * Get the admin's prorated net earning in the refund.
     *
     * Populated instead of commission/vendor earning for admin-earning
     * order types (subscriptions, advertisements, etc.).
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_admin_net_earning(): float {
        $this->ensure_calculated();

        return $this->refund_commission->get_admin_net_earning();
    }

    /**
     * Get the refunded tax (product tax + shipping tax) allocated to the vendor.
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_vendor_tax_refund(): float {
        $this->ensure_calculated();

        return $this->get_tax_refund_for( self::SELLER );
    }

    /**
     * Get the refunded tax (product tax + shipping tax) allocated to the admin.
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_admin_tax_refund(): float {
        $this->ensure_calculated();

        return $this->get_tax_refund_for( self::ADMIN );
    }

    /**
     * Get the refunded shipping allocated to the vendor.
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_vendor_shipping_refund(): float {
        $this->ensure_calculated();

        return $this->get_shipping_refund_for( self::SELLER );
    }

    /**
     * Get the refunded shipping allocated to the admin.
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_admin_shipping_refund(): float {
        $this->ensure_calculated();

        return $this->get_shipping_refund_for( self::ADMIN );
    }

    /**
     * Get the gateway fee returned to the vendor for the refunded portion.
     *
     * Defaults to 0 via the `dokan_refund_gateway_fee` filter; supplied by the
     * associated payment gateway when it returns its fee on refund.
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_vendor_gateway_fee_refund(): float {
        $this->ensure_calculated();

        return $this->get_gateway_fee_refund_for( self::SELLER );
    }

    /**
     * Get the gateway fee returned to the admin for the refunded portion.
     *
     * Defaults to 0 via the `dokan_refund_gateway_fee` filter; supplied by the
     * associated payment gateway when it returns its fee on refund.
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_admin_gateway_fee_refund(): float {
        $this->ensure_calculated();

        return $this->get_gateway_fee_refund_for( self::ADMIN );
    }

    /**
     * Get the total amount the vendor gives back for this refund.
     *
     * Prorated line-item earning plus refunded tax/shipping allocated to the
     * vendor, minus any gateway fee the payment gateway returns to the vendor
     * (0 unless the gateway supplies it via `dokan_refund_gateway_fee`).
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_vendor_total_refund(): float {
        if ( $this->has_sub_orders() ) {
            return 0;
        }

        $total = $this->get_vendor_net_earning() + $this->get_vendor_tax_refund() + $this->get_vendor_shipping_refund() - $this->get_vendor_gateway_fee_refund();

        return floatval( $total );
    }

    /**
     * Get the total amount the admin gives back for this refund.
     *
     * Prorated line-item commission (plus admin net earning for admin-earning
     * order types) plus refunded tax/shipping allocated to the admin, minus any
     * gateway fee the payment gateway returns to the admin (0 unless the
     * gateway supplies it via `dokan_refund_gateway_fee`).
     *
     * @since 5.0.10
     *
     * @return float
     */
    public function get_admin_total_refund(): float {
        if ( $this->has_sub_orders() ) {
            return 0;
        }

        $total = $this->get_admin_net_commission() + $this->get_admin_net_earning() + $this->get_admin_tax_refund() + $this->get_admin_shipping_refund() - $this->get_admin_gateway_fee_refund();

        return floatval( $total );
    }

    /**
     * Whether the refunded order is a parent order holding sub-orders.
     *
     * Parent orders are excluded from commission adjustment; the vendor
     * sub-orders carry the actual earnings.
     *
     * @since 5.0.10
     *
     * @return bool
     */
    protected function has_sub_orders(): bool {
        $order = $this->get_order();

        return $order && $order->get_meta( 'has_sub_order' );
    }

    /**
     * Ensure the refund commission has been calculated.
     *
     * @since 5.0.10
     *
     * @return void
     */
    protected function ensure_calculated(): void {
        if ( ! $this->is_calculated ) {
            $this->calculate();
        }
    }

    /**
     * Get the refunded tax allocated to the given recipient.
     *
     * @since 5.0.10
     *
     * @param string $recipient Either self::SELLER or self::ADMIN.
     *
     * @return float
     */
    protected function get_tax_refund_for( string $recipient ): float {
        if ( $this->has_sub_orders() ) {
            return 0;
        }

        $order      = $this->get_order();
        $tax_refund = 0;

        $refunded = $this->get_refunded_tax_totals();

        if ( $recipient === dokan()->fees->get_tax_fee_recipient( $order ) ) {
            $tax_refund += $refunded['tax'];
        }

        if ( $recipient === dokan()->fees->get_shipping_tax_fee_recipient( $order ) ) {
            $tax_refund += $refunded['shipping_tax'];
        }

        return $tax_refund;
    }

    /**
     * Get the refunded shipping allocated to the given recipient.
     *
     * @since 5.0.10
     *
     * @param string $recipient Either self::SELLER or self::ADMIN.
     *
     * @return float
     */
    protected function get_shipping_refund_for( string $recipient ): float {
        if ( $this->has_sub_orders() || $recipient !== dokan()->fees->get_shipping_fee_recipient( $this->get_order() ) ) {
            return 0;
        }

        $shipping_refund = 0;

        foreach ( $this->refund->get_items( 'shipping' ) as $item ) {
            $shipping_refund += floatval( $item->get_total() );
        }

        return abs( $shipping_refund );
    }

    /**
     * Get the gateway fee returned for the refunded portion, when paid by the given recipient.
     *
     * Most payment gateways keep their processing fee when a payment is
     * refunded, so this defaults to 0. Gateways that do return the fee on
     * refund (e.g. Paystack) should hook `dokan_refund_gateway_fee` and supply
     * the returned amount; the prorated share
     * ( order_gateway_fee × |refund_total| / order_total ) is provided as a
     * convenience.
     *
     * @since 5.0.10
     *
     * @param string $recipient Either self::SELLER or self::ADMIN.
     *
     * @return float
     */
    protected function get_gateway_fee_refund_for( string $recipient ): float {
        if ( $this->has_sub_orders() ) {
            return 0;
        }

        $prorated_fee = 0.0;
        $borne_fee    = $this->get_gateway_fee_borne_by( $recipient );
        $order_total  = floatval( $this->get_order()->get_total() );

        if ( $borne_fee > 0 && $order_total > 0 ) {
            $prorated_fee = $borne_fee * ( abs( floatval( $this->refund->get_total() ) ) / $order_total );
        }

        /**
         * Filter the gateway fee amount returned to the given recipient for this refund.
         *
         * All gateways keep the processing fee on refund except a few (e.g.
         * Paystack), so the default is 0 and the refund gateway-fee logic is
         * handled by the associated payment gateway integration.
         *
         * The filter fires for both recipients ('seller' and 'admin') and also
         * when no gateway fee meta is stored on the order, so the gateway
         * integration decides both the amount and who receives it. The
         * prorated share is based on the fee borne by the recipient: the
         * `dokan_gateway_fee` meta when the recipient matches
         * `dokan_gateway_fee_paid_by`, plus the admin's separately stored
         * portion (`dokan_admin_gateway_fee` meta) for the admin recipient —
         * and 0 when the recipient bore no fee.
         *
         * @since 5.0.10
         *
         * @param float            $gateway_fee_refund The gateway fee amount returned for this refund. Default 0.
         * @param float            $prorated_fee       The recipient's prorated share of the stored gateway fee for the refunded portion.
         * @param \WC_Order_Refund $refund             The refund being calculated.
         * @param \WC_Order        $order              The refunded order.
         * @param string           $recipient          The party being calculated for ('seller' or 'admin').
         */
        return floatval( apply_filters( 'dokan_refund_gateway_fee', 0.0, $prorated_fee, $this->refund, $this->get_order(), $recipient ) );
    }

    /**
     * Get the refunded tax and shipping-tax totals from the refund's tax items.
     *
     * @since 5.0.10
     *
     * @return array{tax: float, shipping_tax: float}
     */
    protected function get_refunded_tax_totals(): array {
        $tax_refund          = 0;
        $shipping_tax_refund = 0;

        foreach ( $this->refund->get_items( 'tax' ) as $tax_item ) {
            $tax_data = $tax_item->get_data();

            $tax_refund          += floatval( $tax_data['tax_total'] );
            $shipping_tax_refund += floatval( $tax_data['shipping_tax_total'] );
        }

        return [
            'tax'          => abs( $tax_refund ),
            'shipping_tax' => abs( $shipping_tax_refund ),
        ];
    }

    /**
     * Get the gateway fee borne by the given recipient.
     *
     * Mirrors OrderCommission::get_vendor_gateway_fee() and
     * get_admin_gateway_fee(): the `dokan_gateway_fee` meta belongs to the
     * `dokan_gateway_fee_paid_by` party, while the admin may bear its own
     * separately stored portion (`dokan_admin_gateway_fee` meta) even when the
     * seller pays the vendor share — e.g. Paystack split payments distribute
     * the fee between the vendor and the admin.
     *
     * @since 5.0.10
     *
     * @param string $recipient Either self::SELLER or self::ADMIN.
     *
     * @return float
     */
    protected function get_gateway_fee_borne_by( string $recipient ): float {
        $gateway_fee = $this->get_dokan_gateway_fee();

        if ( ! empty( $gateway_fee['fee'] ) && $recipient === $gateway_fee['paid_by'] ) {
            return floatval( $gateway_fee['fee'] );
        }

        if ( self::ADMIN === $recipient ) {
            return floatval( $this->get_order()->get_meta( 'dokan_admin_gateway_fee', true ) );
        }

        return 0;
    }

    /**
     * Get the order's gateway fee and who paid it.
     *
     * @since 5.0.10
     *
     * @return array{fee: float, paid_by: string}
     */
    protected function get_dokan_gateway_fee(): array {
        $order               = $this->get_order();
        $gateway_fee         = $order->get_meta( 'dokan_gateway_fee', true );
        $gateway_fee_paid_by = $order->get_meta( 'dokan_gateway_fee_paid_by', true );

        if ( ! empty( $gateway_fee ) && empty( $gateway_fee_paid_by ) ) {
            /**
             * @since 3.7.15 dokan_gateway_fee_paid_by meta key returns empty value if gateway fee is paid by admin
             */
            $gateway_fee_paid_by = 'dokan-stripe-connect' === $order->get_payment_method() ? self::ADMIN : self::SELLER;
        }

        return [
            'fee'     => floatval( $gateway_fee ),
            'paid_by' => $gateway_fee_paid_by,
        ];
    }
}
