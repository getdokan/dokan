<?php

namespace WeDevs\Dokan\Order;

use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Commission\OrderRefundCommission;
use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Cache;

class RefundHandler implements Hookable {
    /**
     * Register necessary WordPress hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        // @todo Enable the bellow action after refactoring the Pro Refund class.
        add_action( 'woocommerce_order_refunded', [ $this, 'handle_refund' ], 10, 2 );
        add_filter( 'dokan_refund_should_insert_into_vendor_balance', [ $this, 'exclude_cod_payment' ], 10, 3 );
        add_filter( 'dokan_vendor_earning_in_refund', [ $this, 'get_vendor_earning_in_refund' ], 10, 2 );
        add_action( 'dokan_refund_adjust_vendor_balance', [ $this, 'insert_into_balance_table' ], 10, 4 );
        // phpcs:ignore Squiz.PHP.CommentedOutCode.Found
        // add_action( 'dokan_refund_adjust_dokan_orders', [ $this, 'update_order_amounts' ], 10, 3 );
        add_action( 'dokan_refund_after_dokan_orders_updated', [ $this, 'clear_order_caches' ], 10, 3 );
    }

    /**
     * Handle refund logic for Dokan orders.
     *
     * @since 4.0.0
     *
     * @param int $order_id  The ID of the original order.
     * @param int $refund_id The ID of the refund.
     *
     * @return void
     */
    public function handle_refund( int $order_id, int $refund_id ): void {
        // Refund will be handle by the pro if exists.
        if ( dokan()->is_pro_exists() ) {
            return;
        }

        $order_type_detector = new OrderType();
        $refund_order = wc_get_order( $refund_id );
        $order  = wc_get_order( $order_id );

        // Bail if either order could not be resolved; downstream calls are strictly typed and would throw.
        if ( ! $refund_order instanceof \WC_Order_Refund || ! $order instanceof \WC_Order ) {
            return;
        }

        if ( $order_type_detector->get_type( $refund_order ) === OrderType::DOKAN_PARENT_ORDER_REFUND ) {
            return;
        }

        $vendor_refund = apply_filters( 'dokan_vendor_earning_in_refund', $refund_order, $order );

        // Without Pro, no gateway integration adjusts the payout amount, so both amounts are the same.
        do_action( 'dokan_refund_adjust_vendor_balance', $vendor_refund, $refund_order, $order, $vendor_refund );

        do_action( 'dokan_refund_adjust_dokan_orders', $vendor_refund, $refund_order, $order );
    }

    /**
     * Get the vendor earning amount in the refund.
     *
     * @param \WC_Order_Refund $refund_order
     * @param \WC_Order $order
     *
     * @return float
     */
    public function get_vendor_earning_in_refund( $refund_order, $order ): float {
        // Guard against invalid orders; set_refund()/set_order() are strictly typed and would throw.
        if ( ! $refund_order instanceof \WC_Order_Refund || ! $order instanceof \WC_Order ) {
            return 0.0;
        }

        $refund_commission = dokan_get_container()->get( OrderRefundCommission::class );

        $refund_commission->set_refund( $refund_order );
        $refund_commission->set_order( $order );

        return $refund_commission->get_vendor_total_refund();
    }

    /**
     * Check the COD payment settings.
     *
     * @param bool $ret
     * @param \WC_Order_Refund $refund_order
     * @param \WC_Order $order
     * @return bool
     */
    public function exclude_cod_payment( $ret, $refund_order, $order ) {
        // return if $order is not an instance of WC_Order
        if ( ! $order ) {
            return $ret;
        }

        $order_id   = $order->get_id();
        $new_status = $order->get_status();

        $exclude_cod_option = 'on' === dokan_get_option( 'exclude_cod_payment', 'dokan_withdraw', 'off' );

        /**
         * Calculate the default logic (Is it COD and is the option ON?)
         */
        $should_exclude_cod_payment = $exclude_cod_option && 'cod' === $order->get_payment_method();

        /**
         * Apply the filter so other plugins (like wePOS) can override this.
         * Use the exact same filter name for consistency across the whole system.
         *
         * @since 4.2.9
         * @param bool     $should_exclude_cod_payment Whether to exclude the payment.
         * @param WC_Order $order                      The main WooCommerce order object.
         * @param int      $order_id                   The ID of the main order.
         * @param string   $new_status                 The new status of the order.
         * @param bool     $exclude_cod_option         The value of the 'exclude COD' setting.
         * @param WC_Order $refund_order               The specific refund order object.
         */
        $should_exclude_cod_payment = apply_filters(
            'dokan_order_refund_should_exclude_from_vendor_balance',
            $should_exclude_cod_payment,
            $order,
            $order_id,
            $new_status,
            $exclude_cod_option,
            $refund_order,
        );

        if ( $should_exclude_cod_payment ) {
            return false;
        }

        return $ret;
    }

    /**
     * Get the refunded tax amount for the vendor.
     *
     * @since 4.0.0
     * @deprecated 5.0.10 Use OrderRefundCommission::get_vendor_tax_refund() instead.
     *
     * @param \WC_Order_Refund $refund_order The refund object.
     * @param \WC_Order        $order  The original order object.
     *
     * @return float
     */
    protected function get_tax_refund( \WC_Order_Refund $refund_order, \WC_Order $order ): float {
        wc_deprecated_function( __METHOD__, '5.0.10', OrderRefundCommission::class . '::get_vendor_tax_refund' );

        $refund_commission = dokan_get_container()->get( OrderRefundCommission::class );

        return $refund_commission->set_refund( $refund_order )->set_order( $order )->get_vendor_tax_refund();
    }

    /**
     * Get the refunded shipping amount for the vendor.
     *
     * @since 4.0.0
     * @deprecated 5.0.10 Use OrderRefundCommission::get_vendor_shipping_refund() instead.
     *
     * @param \WC_Order_Refund $refund_order The refund object.
     * @param \WC_Order        $order  The original order object.
     *
     * @return float
     */
    protected function get_shipping_refund( \WC_Order_Refund $refund_order, \WC_Order $order ): float {
        wc_deprecated_function( __METHOD__, '5.0.10', OrderRefundCommission::class . '::get_vendor_shipping_refund' );

        $refund_commission = dokan_get_container()->get( OrderRefundCommission::class );

        return $refund_commission->set_refund( $refund_order )->set_order( $order )->get_vendor_shipping_refund();
    }

    /**
     * Insert a refund record into the Dokan vendor balance table.
     *
     * @since 4.0.0
     *
     * @param float            $vendor_payout_refund  The vendor refund amount after the gateway fee is deducted.
     * @param \WC_Order_Refund $refund_order          The refund order object.
     * @param \WC_Order        $order                 The original order object.
     * @param float|null       $vendor_earning_refund The vendor refund amount before the gateway fee deduction.
     *                                                Falls back to $vendor_payout_refund when the action is fired
     *                                                with three arguments (e.g. older Dokan Pro versions).
     *
     * @return void
     */
    public function insert_into_balance_table( $vendor_payout_refund, $refund_order, $order, $vendor_earning_refund = null ) {
        global $wpdb;

        $vendor_earning_refund = $vendor_earning_refund ?? $vendor_payout_refund;

        $seller_id = dokan_get_seller_id_by_order( $order );

        if ( ! $seller_id ) {
            dokan_log(
                sprintf(
                    // translators: 1: Order ID, 2: Refund ID, 3: Refund Amount
                    __( 'Dokan refund adjustment error: Seller not found, Order ID: %1$d, Refund ID: %2$d, Refund Amount: %3$f ', 'dokan-lite' ),
                    $order->get_id(),
                    $refund_order->get_id(),
                    $vendor_earning_refund
                )
            );

            return;
        }

        $vendor_earning_refund = apply_filters( 'dokan_vendor_refund_amount_before_insert', $vendor_earning_refund, $order, $refund_order );

        if ( ! apply_filters( 'dokan_refund_should_insert_into_vendor_balance', $vendor_earning_refund > 0, $refund_order, $order ) ) {
			return;
        }

        $refund_reason = $refund_order->get_reason();

        if ( $refund_reason ) {
            $refund_reason = __( 'Refunded by Dokan', 'dokan-lite' );
        }

        $wpdb->insert(
            $wpdb->dokan_vendor_balance,
            [
                'vendor_id'     => $seller_id,
                'trn_id'        => $order->get_id(),
                'trn_type'      => 'dokan_refund',
                'perticulars'   => $refund_reason,
                'debit'         => 0,
                'credit'        => $vendor_earning_refund,
                'status'        => 'approved',
                'trn_date'      => current_time( 'mysql' ),
                'balance_date'  => current_time( 'mysql' ),
            ],
            [ '%d', '%d', '%s', '%s', '%f', '%f', '%s', '%s', '%s' ]
        );
    }

    /**
	 * Update order table with new refund amount
	 *
     * @param float $vendor_refund
	 * @param \WC_Order_Refund $refund_order
	 * @param \WC_Order $order
	 */
	public function update_order_amounts( $vendor_refund, $refund_order, $order ) {
		global $wpdb;

		$order_data = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $wpdb->dokan_orders WHERE order_id = %d",
                $order->get_id()
            )
		);

		if ( isset( $order_data->order_total, $order_data->net_amount ) ) {
			$new_total_amount = $order_data->order_total - abs( $refund_order->get_total() );
			$new_net_amount = $order_data->net_amount - $vendor_refund;

			// Prevent negative net amount
			$new_net_amount = ( $new_net_amount < 0 ) ? 0.00 : $new_net_amount;

			$wpdb->update(
                $wpdb->dokan_orders,
                [
					'order_total' => $new_total_amount,
					'net_amount' => $new_net_amount,
                ],
                [
					'order_id' => $order->get_id(),
                ],
                [
					'%f',
					'%f',
                ],
                [
					'%d',
                ]
			);
		}

        do_action( 'dokan_refund_after_dokan_orders_updated', $vendor_refund, $refund_order, $order );
	}

	/**
	 * Clear order related caches
	 *
	 * @param float $vendor_refund
     * @param \WC_Order_Refund $refund_order
     * @param \WC_Order $order
	 */
	public function clear_order_caches( $vendor_refund, $refund_order, $order ) {
        $order_id = $order->get_id();
		// Clear seller earning cache
		$cache_key = "get_earning_from_order_table_{$order_id}_seller";
		Cache::delete( $cache_key );

		// Clear admin earning cache
		$cache_key = "get_earning_from_order_table_{$order_id}_admin";
		Cache::delete( $cache_key );
	}
}
