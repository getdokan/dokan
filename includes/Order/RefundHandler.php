<?php

namespace WeDevs\Dokan\Order;

use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Commission\OrderCommission;
use WeDevs\Dokan\Contracts\Hookable;

class RefundHandler implements Hookable {
    /**
     * Register necessary WordPress hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        // @todo Enable the bellow action after refactoring the Pro Refund class.

        add_action( 'woocommerce_order_refunded', [ $this, 'handle_refund' ], 10, 2 );
    }

    /**
     * Handle refund logic for Dokan orders.
     *
     * @since DOKAN_SINCE
     *
     * @param int $order_id  The ID of the original order.
     * @param int $refund_id The ID of the refund.
     *
     * @return void
     */
    public function handle_refund( int $order_id, int $refund_id ): void {
        $order_type_detector = new OrderType();
        $refund = wc_get_order( $refund_id );
        $order  = wc_get_order( $order_id );

        if ( $order_type_detector->get_type( $refund ) === OrderType::DOKAN_PARENT_ORDER_REFUND ) {
            return;
        }

        $commission = dokan_get_container()->get( OrderCommission::class );
        $commission->set_order( $order );
        $commission->calculate();

        $refund_commission = $commission->calculate_for_refund( $refund );
        $vendor_refund     = $refund_commission->get_vendor_net_earning();

        $vendor_refund += $this->get_tax_refund( $refund, $order );
        $vendor_refund += $this->get_shipping_refund( $refund, $order );

        $refund_amount = apply_filters( 'dokan_vendor_refund_amount', $vendor_refund, $order, $refund );

        $seller_id = dokan_get_seller_id_by_order( $order_id );
        $refund_reason = $refund->get_reason() ?: __( 'Refunded by Dokan', 'dokan-lite' );

        $this->insert_into_balance_table( $seller_id, $order, $refund_amount, $refund_reason );

        $order_total_after_refund    = $order->get_total() - $refund->get_total();
        $vendor_earning_after_refund = $commission->get_vendor_net_earning();

        $this->update_dokan_order_table( $order_total_after_refund, $vendor_earning_after_refund, $order_id );
    }

    /**
     * Get the refunded tax amount for the vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WC_Order_Refund $refund The refund object.
     * @param \WC_Order        $order  The original order object.
     *
     * @return float
     */
    protected function get_tax_refund( \WC_Order_Refund $refund, \WC_Order $order ): float {
        $tax_refund          = 0;
        $shipping_tax_refund = 0;

        foreach ( $refund->get_items( 'tax' ) as $tax_item ) {
            $tax_data = $tax_item->get_data();
            $tax_refund += floatval( $tax_data['tax_total'] );
            $shipping_tax_refund += floatval( $tax_data['shipping_tax_total'] );
        }

        $vendor_tax_refund = 0;

        if ( 'seller' === dokan()->fees->get_tax_fee_recipient( $order ) ) {
            $vendor_tax_refund += $tax_refund;
        }

        if ( 'seller' === dokan()->fees->get_shipping_tax_fee_recipient( $order ) ) {
            $vendor_tax_refund += $shipping_tax_refund;
        }

        return abs( $vendor_tax_refund );
    }

    /**
     * Get the refunded shipping amount for the vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WC_Order_Refund $refund The refund object.
     * @param \WC_Order        $order  The original order object.
     *
     * @return float
     */
    protected function get_shipping_refund( \WC_Order_Refund $refund, \WC_Order $order ): float {
        $shipping_refund = 0;

        if ( 'seller' !== dokan()->fees->get_shipping_fee_recipient( $order->get_id() ) ) {
            return 0;
        }

        foreach ( $refund->get_items( 'shipping' ) as $item ) {
            $shipping_refund += $item->get_total();
        }

        return abs( $shipping_refund );
    }

    /**
     * Insert a refund record into the Dokan vendor balance table.
     *
     * @since DOKAN_SINCE
     *
     * @param int         $seller_id     The vendor ID.
     * @param \WC_Order   $order         The original order object.
     * @param float       $vendor_refund The amount to refund the vendor.
     * @param string      $refund_reason The reason for the refund.
     *
     * @return void
     */
    protected function insert_into_balance_table( $seller_id, $order, $vendor_refund, $refund_reason ) {
        global $wpdb;

        if ( $vendor_refund <= 0 ) {
            return;
        }

        $wpdb->insert(
            $wpdb->dokan_vendor_balance,
            [
                'vendor_id'     => $seller_id,
                'trn_id'        => $order->get_id(),
                'trn_type'      => 'dokan_refund',
                'perticulars'   => $refund_reason,
                'debit'         => 0,
                'credit'        => $vendor_refund,
                'status'        => 'approved',
                'trn_date'      => current_time( 'mysql' ),
                'balance_date'  => current_time( 'mysql' ),
            ],
            [ '%d', '%d', '%s', '%s', '%f', '%f', '%s', '%s', '%s' ]
        );
    }

    /**
     * Update the Dokan orders table with the new totals after a refund.
     *
     * @since DOKAN_SINCE
     *
     * @param float $order_total_after_refund    Order total after refund.
     * @param float $vendor_earning_after_refund Vendor earning after refund.
     * @param int   $order_id                    The order ID.
     *
     * @return void
     */
    protected function update_dokan_order_table( float $order_total_after_refund, float $vendor_earning_after_refund, $order_id ) {
        global $wpdb;

        $order_data = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $wpdb->dokan_orders WHERE order_id = %d",
                $order_id
            )
        );

        if ( isset( $order_data->order_total, $order_data->net_amount ) ) {
            $wpdb->update(
                $wpdb->dokan_orders,
                [
                    'order_total' => $order_total_after_refund,
                    'net_amount'  => $vendor_earning_after_refund,
                ],
                [ 'order_id' => $order_id ],
                [ '%f', '%f' ],
                [ '%d' ]
            );
        }
    }
}
