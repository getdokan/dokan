<?php
/**
 * Plugin Name: Dokan PayPal Marketplace — E2E Currency Helpers
 * Description: TEST-ONLY REST routes for the PP-CUR area of the PayPal Marketplace e2e suite.
 *              Two routes plus one opt-in filter, all in the existing
 *              `dokan-test-paypal/v1` namespace:
 *
 *                GET  /currency-support  — the module's own currency allow lists, the gateway's
 *                                          runtime `enabled` flag and `is_valid_for_use()`.
 *                POST /purchase-units    — the outgoing PayPal amount strings for an order,
 *                                          built by the product's own
 *                                          `OrderManager::make_purchase_unit_data()`.
 *
 *              Deliberately a SEPARATE FILE from dokan-paypal-marketplace-test-helpers.php.
 *              Several agents extend this suite concurrently and both files are bind-mounted
 *              into the running site, so appending to the shared file risks a lost write. The
 *              namespace is shared, the file is not.
 *
 *              WHY these routes exist at all — the three PP-CUR amount cases (PP-CUR-05/06/07)
 *              ask what the module SENDS to PayPal. Reaching that string any other way would
 *              mean a live `POST /v2/checkout/orders`, which needs the money path this suite has
 *              never yet proven, and would answer a currency question with a network result.
 *              `make_purchase_unit_data()` is `public static` and performs no I/O, so calling it
 *              is the whole product code path minus the transport.
 *
 *              NOT for production use.
 *
 * @package Dokan\Tests
 */

defined( 'ABSPATH' ) || exit;

/**
 * Opt-in currency injection for PP-CUR-09.
 *
 * `dokan_paypal_supported_currencies` is applied in TWO places with DIFFERENTLY-SHAPED data
 * (Helper.php:338 hands it a flat LIST of codes for the advanced-card currencies; Helper.php:417
 * hands it a MAP keyed by code). One callback cannot satisfy both shapes, so this one adds by KEY
 * — the shape `get_supported_currencies()` needs, because that is the list gateway availability is
 * decided from at PayPal.php:171. The consequence for the other consumer is what PP-CUR-09
 * measures; it is not smoothed over here.
 *
 * Gated on an option so the filter is inert until a test opts in, and the test clears the option
 * in an afterEach. A filter left permanently registered would change gateway availability for
 * every other spec sharing this site.
 */
add_filter(
	'dokan_paypal_supported_currencies',
	function ( $currencies ) {
		$extra = (string) get_option( 'dokan_e2e_paypal_extra_currency', '' );

		if ( '' === $extra || ! is_array( $currencies ) ) {
			return $currencies;
		}

		$currencies[ $extra ] = $extra . ' (e2e injected)';

		return $currencies;
	},
	99
);

if ( ! function_exists( 'dokan_paypal_currency_test_gateway' ) ) {
	/**
	 * The live gateway instance, or null when the module is not loaded.
	 *
	 * Read off the module container rather than constructed with `new`: the constructor calls
	 * `init_hooks()`, so a fresh instance would register `woocommerce_update_options_*` and
	 * `admin_footer` a second time on the same request.
	 *
	 * Every hop below is a MAGIC property served by the ChainableContainer trait, which defines
	 * `__get()` and NOT `__isset()` (includes/Traits/ChainableContainer.php:43). `??` and
	 * `empty()` both consult `__isset()` first, so the obvious
	 * `dokan_pro()->module->paypal_marketplace ?? null` resolves to null on a perfectly healthy
	 * site — measured live on 2026-07-31, and it silently reported `is_valid_for_use: null` for a
	 * gateway that was loaded and working. Plain access plus an `is_object()` check is the only
	 * form that reads these containers correctly.
	 */
	function dokan_paypal_currency_test_gateway() {
		if ( ! function_exists( 'dokan_pro' ) ) {
			return null;
		}

		$modules = dokan_pro()->module;

		if ( ! is_object( $modules ) ) {
			return null;
		}

		$module = $modules->paypal_marketplace;

		if ( ! is_object( $module ) ) {
			return null;
		}

		$gateway = $module->gateway_paypal;

		return ( $gateway instanceof WC_Payment_Gateway ) ? $gateway : null;
	}
}

add_action(
	'rest_api_init',
	function () {

		// --------------------------------------------------------------
		// /currency-support — the module's currency allow lists, verbatim.
		//
		// `supported_currencies` is returned as the MAP the product builds, and its keys are
		// returned separately as `supported_codes`. Both are exposed on purpose: the module
		// decides availability with `array_key_exists()` (PayPal.php:171), so a spec that tested
		// membership with a value search would report a false negative for every currency in the
		// list. Handing the spec both shapes removes the guess.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/currency-support',
			[
				'methods'             => 'GET',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function () {
					$helper = dokan_paypal_test_helper();

					if ( ! $helper ) {
						return rest_ensure_response(
							[
								'ok'      => true,
								'skipped' => 'paypal_marketplace_module_absent',
							]
						);
					}

					$supported = (array) $helper::get_supported_currencies();
					$gateway   = dokan_paypal_currency_test_gateway();
					$settings  = get_option( 'woocommerce_dokan_paypal_marketplace_settings', [] );

					return rest_ensure_response(
						[
							'ok'                    => true,
							'store_currency'        => get_woocommerce_currency(),
							'supported_currencies'  => $supported,
							'supported_codes'       => array_keys( $supported ),
							// Same filter name, different shape — see the header note.
							'ucc_non_us_currencies' => (array) $helper::get_advanced_credit_card_debit_card_non_us_supported_currencies(),
							'ucc_us_currencies'     => (array) $helper::get_advanced_credit_card_debit_card_us_supported_currencies(),
							// The RUNTIME flag. PayPal.php:110-111 assigns `enabled = 'no'` on an
							// unsupported currency without touching the stored option, so this and
							// `option_enabled` below can legitimately disagree — PP-CUR-03.
							'gateway_enabled_runtime' => $gateway ? (string) $gateway->enabled : null,
							'option_enabled'        => is_array( $settings ) ? ( $settings['enabled'] ?? null ) : null,
							'is_valid_for_use'      => $gateway ? (bool) $gateway->is_valid_for_use() : null,
							'injected_currency'     => (string) get_option( 'dokan_e2e_paypal_extra_currency', '' ),
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /purchase-units — the outgoing PayPal amount strings for one WooCommerce order.
		//
		// Mirrors PayPal::process_payment() at PaymentMethods/PayPal.php:262-276 exactly: split
		// the order if it has not been split, fall back to the parent when there are no sub
		// orders, then build one purchase unit per sub order. The split and the amount building
		// are both PRODUCT code (`dokan()->order->maybe_split_orders()` and
		// `OrderManager::make_purchase_unit_data()`); only the loop between them lives here, and
		// only because the surrounding method also performs the live PayPal call this suite is
		// not allowed to make for a currency assertion.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/purchase-units',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$manager = '\WeDevs\DokanPro\Modules\PayPalMarketplace\Order\OrderManager';

					if ( ! class_exists( $manager ) ) {
						return new WP_Error( 'dokan_test_no_paypal', 'PayPal Marketplace OrderManager not loaded', [ 'status' => 500 ] );
					}

					$order_id = absint( $request->get_param( 'order_id' ) );
					$order    = $order_id ? wc_get_order( $order_id ) : null;

					if ( ! $order ) {
						return new WP_Error( 'dokan_test_bad_order', 'A valid order_id is required', [ 'status' => 404 ] );
					}

					if ( ! $order->get_meta( 'has_sub_order' ) ) {
						dokan()->order->maybe_split_orders( $order_id );
						// Re-read: the splitter writes `has_sub_order` / `_dokan_vendor_id` on its
						// own instance, so the one held here is stale from this point on.
						$order = wc_get_order( $order_id );
					}

					$sub_orders = dokan()->order->get_child_orders( $order_id );

					if ( ! count( $sub_orders ) ) {
						$sub_orders = [ $order ];
					}

					$units = [];

					foreach ( $sub_orders as $sub_order ) {
						$units[] = [
							'sub_order_id'  => $sub_order->get_id(),
							'seller_id'     => (int) dokan_get_seller_id_by_order( $sub_order->get_id() ),
							'order_total'   => (string) $sub_order->get_total(),
							'purchase_unit' => $manager::make_purchase_unit_data( $sub_order ),
						];
					}

					return rest_ensure_response(
						[
							'ok'             => true,
							'order_id'       => $order_id,
							// The currency STORED ON THE ORDER, which is snapshotted at creation.
							// `make_purchase_unit_data()` reads `get_woocommerce_currency()`
							// instead (Order/OrderManager.php:161), so the two are returned
							// separately rather than assumed equal — PP-CUR-10.
							'order_currency' => $order->get_currency(),
							'order_total'    => (string) $order->get_total(),
							'store_currency' => get_woocommerce_currency(),
							'sub_order_ids'  => array_map(
								function ( $sub_order ) {
									return $sub_order->get_id();
								},
								$sub_orders
							),
							'units'          => $units,
						]
					);
				},
			]
		);
	}
);
