<?php
/**
 * Plugin Name: Dokan Stripe Connect — E2E Test Helpers
 * Description: TEST-ONLY REST routes for the Stripe Connect e2e suite. Triggers an
 *              API Dokan refund (method=1) so the gateway's `process_3ds_refund`
 *              runs the Stripe refund + vendor transfer reversal — there is no
 *              public REST endpoint to create a Dokan refund, and the gateway has
 *              no WC `process_refund`. NOT for production use.
 *
 * @package Dokan\Tests
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'dokan-test/v1',
			'/refund',
			[
				'methods'             => 'POST',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function ( WP_REST_Request $request ) {
					if ( ! function_exists( 'dokan_pro' ) || empty( dokan_pro()->refund ) ) {
						return new WP_Error( 'dokan_test_no_refund_mgr', 'Dokan Pro refund manager unavailable', [ 'status' => 500 ] );
					}

					$order_id = absint( $request->get_param( 'order_id' ) );
					$order    = wc_get_order( $order_id );

					if ( ! $order instanceof WC_Order ) {
						return new WP_Error( 'dokan_test_no_order', 'Order not found', [ 'status' => 404 ] );
					}

					// Mark completed so the refund is approvable per the Withdraw order-status setting.
					if ( ! in_array( $order->get_status(), [ 'completed', 'processing' ], true ) ) {
						$order->update_status( 'completed', 'E2E: ready for refund' );
					}

					$item_qtys       = [];
					$item_totals     = [];
					$item_tax_totals = [];

					$collect = function ( $item_id, $item ) use ( &$item_totals, &$item_tax_totals ) {
						$item_totals[ $item_id ] = wc_format_decimal( $item->get_total(), 2 );
						$taxes                   = $item->get_taxes();
						if ( ! empty( $taxes['total'] ) ) {
							foreach ( $taxes['total'] as $rate_id => $amount ) {
								$item_tax_totals[ $item_id ][ $rate_id ] = wc_format_decimal( $amount, 2 );
							}
						}
					};

					foreach ( $order->get_items() as $item_id => $item ) {
						$item_qtys[ $item_id ] = $item->get_quantity();
						$collect( $item_id, $item );
					}
					foreach ( $order->get_items( 'shipping' ) as $ship_id => $ship ) {
						$collect( $ship_id, $ship );
					}

					// Optional partial refund: refund `amount` against the first line item.
					$amount = $request->get_param( 'amount' );
					if ( $amount !== null && $amount !== '' ) {
						$first_item_id = array_key_first( $order->get_items() );
						$args = [
							'order_id'        => $order_id,
							'refund_amount'   => wc_format_decimal( $amount, 2 ),
							'refund_reason'   => 'e2e stripe connect partial refund',
							'item_qtys'       => [],
							'item_totals'     => [ $first_item_id => wc_format_decimal( $amount, 2 ) ],
							'item_tax_totals' => [],
							'restock_items'   => 'false',
							'method'          => '1',
						];
					} else {
						$args = [
							'order_id'        => $order_id,
							'refund_amount'   => wc_format_decimal( $order->get_total(), 2 ),
							'refund_reason'   => 'e2e stripe connect full refund',
							'item_qtys'       => $item_qtys,
							'item_totals'     => $item_totals,
							'item_tax_totals' => $item_tax_totals,
							'restock_items'   => 'true',
							'method'          => '1', // 1 = API refund → process_3ds_refund (Stripe refund + transfer reversal).
						];
					}

					$result = dokan_pro()->refund->create( $args );

					if ( is_wp_error( $result ) ) {
						return new WP_Error( 'dokan_test_refund_failed', $result->get_error_message(), [ 'status' => 400 ] );
					}

					return rest_ensure_response(
						[
							'ok'            => true,
							'order_id'      => $order_id,
							'refund_amount' => (float) $order->get_total(),
						]
					);
				},
			]
		);
	}
);
