<?php
/**
 * Plugin Name: Dokan PayPal Marketplace — E2E Vendor-Subscription Helpers
 * Description: TEST-ONLY REST routes for the PP-SUB area of the PayPal Marketplace e2e suite.
 *              Two routes, both in the existing `dokan-test-paypal/v1` namespace:
 *
 *                POST /subscription-purchase-unit — the purchase unit the module would send to
 *                                                   PayPal for a vendor-subscription order, plus
 *                                                   the fee/shipping/tax recipients the module's
 *                                                   own filters resolve for that order.
 *                POST /subscription-paypal-plan   — run the module's real PayPal catalog-product
 *                                                   and billing-plan creation for a pack, then
 *                                                   read the identifiers it stored.
 *
 *              Deliberately a SEPARATE FILE from dokan-paypal-marketplace-test-helpers.php and
 *              from dokan-paypal-marketplace-currency-test-helpers.php. Several agents extend this
 *              suite concurrently and all three files are bind-mounted into the running site, so
 *              appending to a shared file risks a lost write. The namespace is shared, the file is
 *              not. `dokan_paypal_test_can_manage()` / `dokan_paypal_test_helper()` come from the
 *              base helper file; permission callbacks are resolved by name at request time, by
 *              which point every mu-plugin has loaded, so the load order between the files does
 *              not matter.
 *
 *              WHY these routes exist at all:
 *
 *              PP-SUB-03 / PP-SUB-04 ask what the module SENDS to PayPal for a pack purchase and
 *              who it books the fees to. Reaching either through the product's own entry point
 *              (`VendorSubscription::handle_subscription_product()`) means a live
 *              `POST /v1/billing/subscriptions`, which only completes after a buyer approves the
 *              purchase in PayPal's own popup — not drivable. `make_subscription_purchase_unit_data()`
 *              is `public static` and performs no I/O, and the two recipient filters are pure, so
 *              calling them is the entire product code path minus the transport.
 *
 *              PP-SUB-06 asks for the PayPal product and plan identifiers a pack maps to. Those
 *              are created by `Helper::create_product_in_paypal()` / `Helper::create_plan_in_paypal()`,
 *              which the module normally invokes from `woocommerce_process_product_meta_product_pack`
 *              — an admin post.php save with a `product_pack` type that no REST route can produce.
 *              Both calls are partner-app calls authenticated with client credentials only (no buyer
 *              session), so they are genuinely reachable; this route runs them exactly as the
 *              product does, including the "only create the catalog product when the pack has no id
 *              stored yet" guard from VendorSubscription.php:97-104.
 *
 *              NOT for production use.
 *
 * @package Dokan\Tests
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'rest_api_init',
	function () {

		// --------------------------------------------------------------
		// /subscription-purchase-unit
		//
		// Returns three separate things about ONE order, because the module inverts the normal
		// money flow for a vendor-subscription order in three separate places and a spec that
		// checked only one of them would miss the other two:
		//
		//   1. `OrderManager::make_subscription_purchase_unit_data()` hardcodes the payee to
		//      `Helper::get_partner_id()` (Order/OrderManager.php:296-298) — the admin partner,
		//      never a vendor merchant id.
		//   2. `VendorSubscription::get_merchant_id_for_subscription_product()` filters
		//      `dokan_paypal_marketplace_merchant_id` to the partner id for any subscription
		//      product (Subscriptions/VendorSubscription.php:117-124).
		//   3. `Hooks::tax_fee_recipient()` / `Hooks::shipping_fee_recipient()` return 'admin' for
		//      a PayPal order carrying `_dokan_vendor_subscription_order = yes`, and 'seller' for
		//      every other PayPal order (Hooks.php:30-77).
		//
		// The filter seeds are SENTINELS rather than realistic values on purpose: if a filter never
		// ran, the sentinel comes back unchanged and the spec can tell "the module chose seller"
		// apart from "nothing was applied at all".
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/subscription-purchase-unit',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$manager = '\WeDevs\DokanPro\Modules\PayPalMarketplace\Order\OrderManager';
					$helper  = dokan_paypal_test_helper();

					if ( ! $helper || ! class_exists( $manager ) ) {
						return new WP_Error( 'dokan_test_no_paypal', 'PayPal Marketplace module not loaded', [ 'status' => 500 ] );
					}

					$order_id = absint( $request->get_param( 'order_id' ) );
					$order    = $order_id ? wc_get_order( $order_id ) : null;

					if ( ! $order ) {
						return new WP_Error( 'dokan_test_bad_order', 'A valid order_id is required', [ 'status' => 404 ] );
					}

					$merchant_seed = (string) ( $request->get_param( 'merchant_id_seed' ) ?: 'UNFILTERED-VENDOR-MERCHANT' );
					$filtered      = [];

					foreach ( (array) $request->get_param( 'product_ids' ) as $product_id ) {
						$product_id = absint( $product_id );
						if ( ! $product_id ) {
							continue;
						}
						$filtered[ (string) $product_id ] = apply_filters( 'dokan_paypal_marketplace_merchant_id', $merchant_seed, $product_id );
					}

					$purchase_unit = $manager::make_subscription_purchase_unit_data( $order );

					return rest_ensure_response(
						[
							'ok'                     => true,
							'order_id'               => $order_id,
							'partner_id'             => (string) $helper::get_partner_id(),
							'purchase_unit'          => $purchase_unit,
							'payee_merchant_id'      => isset( $purchase_unit['payee']['merchant_id'] ) ? (string) $purchase_unit['payee']['merchant_id'] : null,
							'merchant_id_seed'       => $merchant_seed,
							'merchant_id_filtered'   => $filtered,
							// Seeded with a sentinel, not 'seller' — see the header note.
							'tax_fee_recipient'      => apply_filters( 'dokan_tax_fee_recipient', 'UNFILTERED', $order_id ),
							'shipping_fee_recipient' => apply_filters( 'dokan_shipping_fee_recipient', 'UNFILTERED', $order_id ),
							'gateway_fee_paid_by'    => (string) $order->get_meta( 'dokan_gateway_fee_paid_by' ),
							'is_subscription_order'  => (string) $order->get_meta( '_dokan_vendor_subscription_order' ),
							'payment_method'         => $order->get_payment_method(),
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /subscription-paypal-plan — LIVE PayPal calls.
		//
		// Mirrors the product path: create the catalog product only when the pack carries no
		// `_dokan_paypal_marketplace_subscription_product_id` yet (VendorSubscription.php:97-104),
		// then create the billing plan for the pack + order the way
		// `handle_recurring_subscription_purchase()` does (VendorSubscription.php:318).
		//
		// Errors are returned as strings instead of being thrown: `create_plan_in_paypal()` returns
		// a WP_Error for a pack PayPal rejects, and the spec has to be able to print PayPal's own
		// wording — a bare 500 here would say only "something failed".
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/subscription-paypal-plan',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$helper    = dokan_paypal_test_helper();
					$processor = '\WeDevs\DokanPro\Modules\PayPalMarketplace\Subscriptions\Processor';

					if ( ! $helper || ! class_exists( $processor ) ) {
						return new WP_Error( 'dokan_test_no_paypal', 'PayPal Marketplace module not loaded', [ 'status' => 500 ] );
					}

					$product_id = absint( $request->get_param( 'product_id' ) );
					$product    = $product_id ? wc_get_product( $product_id ) : null;
					$order_id   = absint( $request->get_param( 'order_id' ) );
					$order      = $order_id ? wc_get_order( $order_id ) : null;

					if ( ! $product || ! $order ) {
						return new WP_Error( 'dokan_test_bad_payload', 'A valid product_id and order_id are required', [ 'status' => 404 ] );
					}

					$result = [
						'ok'                 => true,
						'product_id'         => $product_id,
						'order_id'           => $order_id,
						'product_type'       => $product->get_type(),
						'product_title'      => $product->get_title(),
						'catalog_error'      => null,
						'plan_error'         => null,
						'paypal_product'     => null,
						'catalog_product_id' => null,
						'plan_id'            => null,
					];

					$stored_catalog_id = (string) get_post_meta( $product_id, '_dokan_paypal_marketplace_subscription_product_id', true );

					if ( '' === $stored_catalog_id ) {
						$created = $helper::create_product_in_paypal( $product );

						if ( is_wp_error( $created ) ) {
							$result['catalog_error'] = $helper::get_error_message( $created );
						} else {
							$stored_catalog_id = (string) $created;
						}
					}

					$result['catalog_product_id'] = '' === $stored_catalog_id ? null : $stored_catalog_id;

					if ( '' !== $stored_catalog_id ) {
						// Read the catalog product back from PayPal so the spec can check that the
						// stored id resolves to THIS pack and not to a leftover from another run.
						$fetched = $processor::init()->get_product( $stored_catalog_id );

						if ( ! is_wp_error( $fetched ) ) {
							$result['paypal_product'] = [
								'id'          => $fetched['id'] ?? null,
								'name'        => $fetched['name'] ?? null,
								'description' => $fetched['description'] ?? null,
								'type'        => $fetched['type'] ?? null,
							];
						} else {
							$result['catalog_error'] = $helper::get_error_message( $fetched );
						}
					}

					$plan = $helper::create_plan_in_paypal( $product, $order );

					if ( is_wp_error( $plan ) ) {
						$result['plan_error'] = $helper::get_error_message( $plan );
					} else {
						$result['plan_id'] = (string) $plan;
					}

					// Re-read: create_plan_in_paypal() saves the plan id on its OWN order instance,
					// so the one held above is stale from that point on.
					$saved_order                   = wc_get_order( $order_id );
					$result['stored_catalog_meta'] = (string) get_post_meta( $product_id, '_dokan_paypal_marketplace_subscription_product_id', true );
					$result['stored_plan_meta']    = $saved_order ? (string) $saved_order->get_meta( '_dokan_paypal_marketplace_subscription_plan_id' ) : '';

					return rest_ensure_response( $result );
				},
			]
		);
	}
);
