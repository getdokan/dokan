<?php

namespace WeDevs\Dokan\Order;

use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Commission\OrderCommission;
use WeDevs\Dokan\Commission\OrderRefundCommission;
use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Cache;

class RefundHandler implements Hookable {

    /**
     * Marks a refund whose vendor balance adjustment has already been applied.
     *
     * @since DOKAN_SINCE
     */
    const BALANCE_ADJUSTED_META_KEY = '_dokan_vendor_balance_adjusted';

    /**
     * Register necessary WordPress hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
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
        /**
         * Whether something other than this handler already adjusted the vendor balance.
         *
         * Dokan Pro adjusts the refunds its own flow creates, so those must be skipped here
         * to avoid debiting a vendor twice. Refunds created anywhere else -- REST, WP-CLI,
         * a gateway webhook -- never reach that flow and still need handling.
         *
         * The default is `dokan()->is_pro_exists()`, so a Pro release too old to answer this
         * filter leaves Lite standing down exactly as before. Lite and Pro are versioned
         * independently, and debiting twice is worse than the leak this closes.
         *
         * @since DOKAN_SINCE
         *
         * @param bool $handled_externally Whether the refund is already accounted for.
         * @param int  $refund_id          The ID of the refund.
         * @param int  $order_id           The ID of the order being refunded.
         */
        if ( apply_filters( 'dokan_refund_is_handled_externally', dokan()->is_pro_exists(), $refund_id, $order_id ) ) {
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

        // The balance entry is keyed by order, not by refund, so a repeated event for the
        // same refund would credit the vendor twice and drive the balance negative.
        if ( $refund_order->get_meta( self::BALANCE_ADJUSTED_META_KEY ) ) {
            return;
        }

        $vendor_refund = apply_filters( 'dokan_vendor_earning_in_refund', $refund_order, $order );

        // Same on both sides: only Pro's own flow produces a gateway-adjusted payout figure.
        do_action( 'dokan_refund_adjust_vendor_balance', $vendor_refund, $refund_order, $order, $vendor_refund );

        do_action( 'dokan_refund_adjust_dokan_orders', $vendor_refund, $refund_order, $order );

        $refund_order->update_meta_data( self::BALANCE_ADJUSTED_META_KEY, dokan_current_datetime()->format( 'Y-m-d H:i:s' ) );
        $refund_order->save();
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

        // Commission is allocated per refunded item, so a refund carrying none resolves to
        // zero and would leave the vendor holding the full earning. Prorate those instead.
        if ( ! $refund_order->get_items( [ 'line_item', 'fee', 'shipping' ] ) ) {
            return $this->get_prorated_vendor_earning_in_refund( $refund_order, $order );
        }

        $refund_commission = dokan_get_container()->get( OrderRefundCommission::class );

        $refund_commission->set_refund( $refund_order );
        $refund_commission->set_order( $order );

        return $refund_commission->get_vendor_total_refund();
    }

    /**
     * Vendor share of a refund that carries no line items.
     *
     * WooCommerce creates item-less refunds on several common paths: wc_order_fully_refunded()
     * on every transition to `wc-refunded`, the wc/v2 REST route, and most gateway webhooks.
     * There is nothing to allocate commission against, so the vendor's earning for the order
     * is prorated by the share of the order total being refunded.
     *
     * The earning is recalculated with refund adjustment disabled, because the order tables
     * are already rewritten by the time `woocommerce_order_refunded` runs.
     *
     * @since DOKAN_SINCE
     *
     * @param \WC_Order_Refund $refund_order The refund object.
     * @param \WC_Order        $order        The original order object.
     *
     * @return float
     */
    protected function get_prorated_vendor_earning_in_refund( \WC_Order_Refund $refund_order, \WC_Order $order ): float {
        $order_total  = (float) $order->get_total();
        $refund_total = abs( (float) $refund_order->get_total() );

        if ( $order_total <= 0 || $refund_total <= 0 ) {
            return 0.0;
        }

        try {
            $commission = dokan_get_container()->get( OrderCommission::class );
            $commission->set_order( $order );
            $commission->set_should_adjust_refund( false );
            $commission->calculate();

            $vendor_earning = (float) $commission->get_vendor_earning();
        } catch ( \Exception $e ) {
            dokan_log( sprintf( 'Dokan: prorated refund earning failed for order %d. %s', $order->get_id(), $e->getMessage() ) );

            return 0.0;
        }

        $refund_ratio = min( 1.0, $refund_total / $order_total );

        return round( $vendor_earning * $refund_ratio, wc_get_price_decimals() );
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
