<?php
/**
 * Plugin Name: Dokan PayPal Marketplace — E2E Test Helpers
 * Description: TEST-ONLY REST routes (namespace `dokan-test-paypal/v1`) for the PayPal
 *              Marketplace e2e suite: report gateway readiness, configure the gateway +
 *              module + withdraw method, seed/clear a connected vendor (six mode-swapped
 *              user metas), inject webhook events straight into the module's EventFactory,
 *              and trigger a Dokan API refund. NOT for production use.
 *
 *              Mirrors dokan-stripe-express-test-helpers.php, with three deliberate
 *              differences that are load-bearing:
 *
 *              1. Every option write MERGES. The Express helper force-removes the legacy
 *                 `stripe` module from `dokan_pro_active_modules`; doing the symmetric
 *                 thing here would deactivate `stripe_express` and silently skip the whole
 *                 Stripe suite on the same CI worker. Nothing is ever removed here.
 *              2. Vendor seeding writes SIX metas, not one. `PayPal::is_available()` calls
 *                 `Helper::validate_cart_items()`, which requires BOTH a merchant id and
 *                 the separate `..._enable_for_receive_payment` meta. Seeding only the
 *                 merchant id yields a vendor that looks connected while the gateway never
 *                 appears at checkout — every availability test then passes for the wrong
 *                 reason.
 *              3. Meta keys are resolved through `Helper::…_key()` accessors rather than
 *                 written as literals, so the sandbox/live swap is exercised, not assumed.
 *
 * @package Dokan\Tests
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'dokan_paypal_test_can_manage' ) ) {
	function dokan_paypal_test_can_manage() {
		return current_user_can( 'manage_woocommerce' );
	}
}

/**
 * The module Helper, or null when the module is not loaded. Every route degrades to a
 * reported skip rather than a fatal when this is null, so a Lite-lane run stays green.
 */
if ( ! function_exists( 'dokan_paypal_test_helper' ) ) {
	function dokan_paypal_test_helper() {
		$class = '\WeDevs\DokanPro\Modules\PayPalMarketplace\Helper';

		return class_exists( $class ) ? $class : null;
	}
}

/**
 * The six mode-swapped vendor meta keys that together make a vendor "connected".
 * Returned as key => meta_key for the CURRENT mode unless $test_mode is forced.
 */
if ( ! function_exists( 'dokan_paypal_test_vendor_meta_keys' ) ) {
	function dokan_paypal_test_vendor_meta_keys( $test_mode = null ) {
		$helper = dokan_paypal_test_helper();
		if ( ! $helper ) {
			return [];
		}

		return [
			'merchant_id'             => $helper::get_seller_merchant_id_key( $test_mode ),
			'enable_for_receive'      => $helper::get_seller_enabled_for_received_payment_key( $test_mode ),
			'payments_receivable'     => $helper::get_seller_payments_receivable_key( $test_mode ),
			'primary_email_confirmed' => $helper::get_seller_primary_email_confirmed_key( $test_mode ),
			'enable_for_ucc'          => $helper::get_seller_enable_for_ucc_key( $test_mode ),
			'marketplace_settings'    => $helper::get_seller_marketplace_settings_key( $test_mode ),
		];
	}
}

/**
 * Normalise a vendor-id payload into a list of ints.
 *
 * Accepts an int, a list, or the CSV form a GET query string can carry (`?vendor_ids=3,5`),
 * because the UCC cart gate is all-or-nothing across every seller in the cart and a
 * multi-vendor case must be able to ask about both vendors in one call.
 */
if ( ! function_exists( 'dokan_paypal_test_vendor_id_list' ) ) {
	function dokan_paypal_test_vendor_id_list( $raw ) {
		if ( null === $raw || '' === $raw ) {
			return [];
		}
		if ( is_string( $raw ) ) {
			$raw = explode( ',', $raw );
		}

		$ids = array_values( array_filter( array_map( 'absint', (array) $raw ) ) );

		return array_values( array_unique( $ids ) );
	}
}

/**
 * The unbranded-card (UCC / Advanced Card) gate, reported as RESOLVED PRODUCT VALUES.
 *
 * Every boolean below is the product's own answer — `Helper::is_ucc_enabled()` and
 * `CartManager::is_ucc_enabled_for_all_seller_in_cart()` — never this file's re-implementation of
 * the same conditions. A test that recomputes the gate from raw settings proves only that its own
 * copy of the rule agrees with itself; when the product's rule changes, that test keeps passing.
 *
 * TWO HONESTY NOTES a caller must respect:
 *
 * 1. `is_ucc_enabled_for_all_seller_in_cart` is reported alongside `cart_available` and
 *    `cart_item_count` because it is only meaningful when a cart exists. WooCommerce does not
 *    build `WC()->cart` for a plain REST request (that is what `wc_load_cart()` is for), so over
 *    this route the value is normally computed against a NULL cart and comes back `false` — which
 *    is a property of the transport, not of the gateway. Worse, an EMPTY cart makes the product's
 *    foreach body never run, so the function returns whatever `Helper::is_ucc_enabled()` returned,
 *    i.e. `true` on a fully-open gate with no sellers checked at all. Assert on this field only
 *    when `cart_available` is true AND `cart_item_count` > 0; otherwise assert on `is_ucc_enabled`
 *    plus the per-vendor `vendors` block, which are both cart-independent. The cart is
 *    deliberately NOT loaded here: `wc_load_cart()` in an admin-authenticated REST request would
 *    load the ADMIN's session cart, and a gate answered against the wrong cart is a fake result.
 * 2. `vendors[*].enabled` is the raw truthiness of the meta the product itself reads
 *    (`get_user_meta( $seller_id, Helper::get_seller_enable_for_ucc_key(), true )`, the exact
 *    expression at Cart/CartManager.php:60), with the key resolved through the accessor so the
 *    sandbox/live key swap is exercised rather than assumed.
 *
 * Every product call is guarded with class_exists/method_exists and degrades to `null`, so a run
 * with the module off reports a gate it cannot see instead of fataling the route.
 */
if ( ! function_exists( 'dokan_paypal_test_ucc_state' ) ) {
	function dokan_paypal_test_ucc_state( $vendor_ids = [] ) {
		$helper  = dokan_paypal_test_helper();
		$manager = '\WeDevs\DokanPro\Modules\PayPalMarketplace\Cart\CartManager';

		if ( ! $helper ) {
			return [
				'module_active' => false,
				'skipped'       => 'paypal_marketplace_module_absent',
			];
		}

		$settings  = (array) $helper::get_settings();
		$countries = ( function_exists( 'WC' ) && is_object( WC() ) && is_object( WC()->countries ) ) ? WC()->countries : null;
		$cart      = ( function_exists( 'WC' ) && is_object( WC() ) && is_object( WC()->cart ) ) ? WC()->cart : null;

		$base_country = $countries ? (string) $countries->get_base_country() : null;

		// is_ucc_enabled() itself dereferences WC()->countries, so it is only safe to ask once
		// that object exists. Reported as null rather than false when it does not — false would
		// read as "the product says the gate is shut".
		$is_ucc_enabled = ( $countries && method_exists( $helper, 'is_ucc_enabled' ) ) ? (bool) $helper::is_ucc_enabled() : null;

		$supported_currencies = ( $base_country && method_exists( $helper, 'get_advanced_credit_card_debit_card_supported_currencies' ) )
			? array_values( (array) $helper::get_advanced_credit_card_debit_card_supported_currencies( $base_country ) )
			: [];

		$ucc_meta_key = method_exists( $helper, 'get_seller_enable_for_ucc_key' ) ? (string) $helper::get_seller_enable_for_ucc_key() : null;

		$vendors = [];
		foreach ( dokan_paypal_test_vendor_id_list( $vendor_ids ) as $vendor_id ) {
			$raw = $ucc_meta_key ? get_user_meta( $vendor_id, $ucc_meta_key, true ) : '';

			$vendors[ (string) $vendor_id ] = [
				'vendor_id' => $vendor_id,
				'meta_key'  => $ucc_meta_key,
				'raw'       => is_scalar( $raw ) ? (string) $raw : wp_json_encode( $raw ),
				// The product's own test at Cart/CartManager.php:60 is a bare truthiness check.
				'enabled'   => (bool) $raw,
			];
		}

		return [
			'module_active'           => true,
			// Raw settings rows — what a restore has to put back.
			'button_type_raw'         => array_key_exists( 'button_type', $settings ) ? (string) $settings['button_type'] : null,
			'ucc_mode_raw'            => array_key_exists( 'ucc_mode', $settings ) ? (string) $settings['ucc_mode'] : null,
			// Resolved product answers — what the gateway actually acts on.
			'button_type_resolved'    => method_exists( $helper, 'get_button_type' ) ? (string) $helper::get_button_type() : null,
			'is_ucc_mode_allowed'     => method_exists( $helper, 'is_ucc_mode_allowed' ) ? (bool) $helper::is_ucc_mode_allowed() : null,
			'is_ucc_enabled'          => $is_ucc_enabled,
			'is_ucc_enabled_for_all_seller_in_cart' => ( class_exists( $manager ) && method_exists( $manager, 'is_ucc_enabled_for_all_seller_in_cart' ) && $countries )
				? (bool) $manager::is_ucc_enabled_for_all_seller_in_cart()
				: null,
			// Provenance for the field above. See honesty note 1.
			'cart_available'          => is_object( $cart ),
			'cart_item_count'         => is_object( $cart ) ? count( (array) $cart->get_cart() ) : null,
			'base_country'            => $base_country,
			'store_currency'          => get_woocommerce_currency(),
			'ucc_supported_countries' => method_exists( $helper, 'get_advanced_credit_card_debit_card_supported_countries' )
				? array_keys( (array) $helper::get_advanced_credit_card_debit_card_supported_countries() )
				: [],
			'ucc_supported_currencies' => $supported_currencies,
			'ucc_meta_key'            => $ucc_meta_key,
			'vendors'                 => (object) $vendors,
		];
	}
}

add_action(
	'rest_api_init',
	function () {

		// --------------------------------------------------------------
		// /log-tail — read the module's own dokan_log() output, SERVER-side.
		//
		// The site under test runs inside the wp-env `tests` container and its
		// wp-content/uploads is a container volume, NOT the repo directory the host
		// sees — verified 2026-08-04: the container holds today's dokan-*.log while
		// the host's wp-content/uploads/wc-logs/ contains only .htaccess and
		// index.html. So a spec that reads wc-logs off the host filesystem examines an
		// empty directory and concludes "nothing was logged" no matter what happened.
		//
		// PP-SET-23 needs the opposite of a guess: PayPal's verbatim reason for
		// refusing the webhook URL is the ONLY thing that separates "this host is not
		// publicly reachable" (an environment limit) from "the module never registered
		// a webhook" (a defect). Hence a route rather than a file read.
		//
		// `offset` makes the read differential, so a caller sees only what its own
		// action provoked: read `size` before, pass it back as `offset` after.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/log-tail',
			[
				'methods'             => 'GET',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'args'                => [
					'source' => [
						'default'           => 'dokan',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'offset' => [
						'default'           => 0,
						'sanitize_callback' => 'absint',
					],
				],
				'callback'            => function ( $request ) {
					$dir = trailingslashit( wp_upload_dir()['basedir'] ) . 'wc-logs';
					if ( ! is_dir( $dir ) ) {
						return rest_ensure_response(
							[
								'ok'      => true,
								'skipped' => 'wc_logs_dir_absent',
								'dir'     => $dir,
								'size'    => 0,
								'text'    => '',
							]
						);
					}

					// One file per source per day, with a hash suffix; the newest match wins.
					$source = (string) $request->get_param( 'source' );
					$files  = glob( $dir . '/' . $source . '-*.log' );
					$files  = is_array( $files ) ? $files : [];
					usort(
						$files,
						function ( $a, $b ) {
							return filemtime( $b ) <=> filemtime( $a );
						}
					);

					$file = $files[0] ?? '';
					if ( '' === $file || ! is_readable( $file ) ) {
						return rest_ensure_response(
							[
								'ok'      => true,
								'skipped' => 'no_log_file_for_source',
								'dir'     => $dir,
								'source'  => $source,
								'size'    => 0,
								'text'    => '',
							]
						);
					}

					$size   = (int) filesize( $file );
					$offset = (int) $request->get_param( 'offset' );
					$text   = '';

					// A file rotated or truncated since the caller's snapshot would make the
					// offset meaningless, so it is only honoured while the file still grew.
					if ( $offset > 0 && $offset <= $size ) {
						$text = (string) file_get_contents( $file, false, null, $offset ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
					} elseif ( 0 === $offset ) {
						$text = (string) file_get_contents( $file, false, null, max( 0, $size - 65536 ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
					}

					return rest_ensure_response(
						[
							'ok'   => true,
							'file' => basename( $file ),
							'size' => $size,
							'text' => $text,
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /status — readiness introspection.
		//
		// Exists because "PayPal is not offered at checkout" is trivially true on an
		// unconfigured site, so a negative availability test passes for the wrong
		// reason. Every availability spec asserts `is_ready === true` here FIRST, then
		// asserts what it actually cares about.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/status',
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

					$active_modules   = (array) get_option( 'dokan_pro_active_modules', [] );
					$withdraw         = (array) get_option( 'dokan_withdraw', [] );
					$withdraw_methods = (array) ( $withdraw['withdraw_methods'] ?? [] );
					$settings         = (array) $helper::get_settings();

					return rest_ensure_response(
						[
							'ok'                  => true,
							'is_enabled'          => (bool) $helper::is_enabled(),
							'is_test_mode'        => (bool) $helper::is_test_mode(),
							'is_ready'            => (bool) $helper::is_ready(),
							'gateway_id'          => $helper::get_gateway_id(),
							'has_partner_id'      => '' !== (string) $helper::get_partner_id(),
							'module_active'       => in_array( 'paypal_marketplace', $active_modules, true ),
							// Asserted by the preflight: configuring PayPal must never
							// deactivate the Stripe suite's module.
							'stripe_express_active' => in_array( 'stripe_express', $active_modules, true ),
							'withdraw_method_on'  => array_key_exists( 'dokan-paypal-marketplace', $withdraw_methods ),
							'disbursement_mode'   => $settings['disbursement_mode'] ?? null,
							'button_type'         => $settings['button_type'] ?? null,
							'ucc_mode'            => $settings['ucc_mode'] ?? null,
							'store_currency'      => get_woocommerce_currency(),
							// The product's OWN unbranded-card (UCC) country list, filters applied, so a
							// spec can assert against Helper:: instead of against a constant it declared
							// itself. Keys only: the values are display names, and gate 3 of
							// Helper::is_ucc_enabled() is an array_key_exists() on this map.
							// method_exists() guard so a Helper:: that no longer exposes the map degrades to an
							// empty list the caller can assert on, instead of fataling /status for every
							// PayPal spec that reads readiness from this route.
							'ucc_supported_countries' => method_exists( $helper, 'get_advanced_credit_card_debit_card_supported_countries' )
								? array_keys( (array) $helper::get_advanced_credit_card_debit_card_supported_countries() )
								: [],
							// RESOLVED getter values, alongside the raw settings rows above. A spec that
							// reads only the raw row proves its own seeded value round-tripped; these
							// report what Helper:: actually hands the product, including the default it
							// substitutes when the row is empty (delay period 0, notice interval 7, the
							// bundled dokan-logo.png). Same method_exists() guard as the UCC map: a
							// Helper:: that drops one of these degrades to null the caller can assert on,
							// instead of fataling /status for every PayPal spec that reads readiness here.
							'disbursement_delay_period_resolved' => method_exists( $helper, 'get_disbursement_delay_period' )
								? (int) $helper::get_disbursement_delay_period()
								: null,
							'notice_interval_resolved' => method_exists( $helper, 'non_connected_sellers_display_notice_intervals' )
								? (int) $helper::non_connected_sellers_display_notice_intervals()
								: null,
							'marketplace_logo_resolved' => method_exists( $helper, 'get_marketplace_logo' )
								? (string) $helper::get_marketplace_logo()
								: null,
							'vendor_meta_keys'    => dokan_paypal_test_vendor_meta_keys(),
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /configure-paypal-marketplace — idempotent, additive setup.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/configure-paypal-marketplace',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$helper = dokan_paypal_test_helper();
					if ( ! function_exists( 'dokan_pro' ) || empty( dokan_pro()->module ) ) {
						return rest_ensure_response(
							[
								'ok'      => true,
								'skipped' => 'dokan_pro_absent',
							]
						);
					}

					$result = [ 'ok' => true ];

					// 1) Module — activate additively. Never deactivate a sibling gateway
					//    module; see the header note.
					dokan_pro()->module->activate_modules( [ 'paypal_marketplace' ], true );

					$active_modules = array_values( array_unique( (array) get_option( 'dokan_pro_active_modules', [] ) ) );
					if ( ! in_array( 'paypal_marketplace', $active_modules, true ) ) {
						$active_modules[] = 'paypal_marketplace';
					}
					update_option( 'dokan_pro_active_modules', $active_modules );

					$result['module_active']         = in_array( 'paypal_marketplace', $active_modules, true );
					$result['stripe_express_active'] = in_array( 'stripe_express', $active_modules, true );

					// 2) Gateway settings — MERGE so title/description/logo survive.
					$partner_id = (string) $request->get_param( 'partner_id' );
					$client_id  = (string) $request->get_param( 'client_id' );
					$secret     = (string) $request->get_param( 'client_secret' );

					$settings = get_option( 'woocommerce_dokan_paypal_marketplace_settings', [] );
					if ( ! is_array( $settings ) ) {
						$settings = [];
					}

					$merge = [
						'enabled'   => 'yes',
						// The sandbox toggle is `test_mode`. It is NOT `sandbox` and NOT
						// `testmode` — both of those silently never match.
						'test_mode' => 'yes',
					];

					if ( '' !== $partner_id ) {
						$merge['partner_id'] = $partner_id;
					}
					if ( '' !== $client_id ) {
						$merge['test_app_user'] = $client_id;
					}
					if ( '' !== $secret ) {
						$merge['test_app_pass'] = $secret;
					}

					// Pin a deterministic baseline so disbursement assertions are stable.
					$merge['disbursement_mode'] = (string) ( $request->get_param( 'disbursement_mode' ) ?: 'INSTANT' );

					// Free-form overrides for the settings spec's negative cases (empty
					// credential, whitespace-only, sandbox-off, and so on).
					$overrides = $request->get_param( 'settings' );
					if ( is_array( $overrides ) ) {
						$merge = array_merge( $merge, $overrides );
					}

					$settings = array_merge( $settings, $merge );
					update_option( 'woocommerce_dokan_paypal_marketplace_settings', $settings );
					$result['gateway_configured'] = true;

					// 3) Withdraw method — MERGE. Assigning over this option destroys the
					//    stock paypal/bank/dokan_custom/skrill methods.
					$withdraw = (array) get_option( 'dokan_withdraw', [] );
					$methods  = (array) ( $withdraw['withdraw_methods'] ?? [] );
					$methods['dokan-paypal-marketplace'] = 'dokan-paypal-marketplace';
					$withdraw['withdraw_methods']        = $methods;
					update_option( 'dokan_withdraw', $withdraw );
					$result['withdraw_methods'] = array_keys( $methods );

					if ( $helper ) {
						$result['is_ready']     = (bool) $helper::is_ready();
						$result['is_test_mode'] = (bool) $helper::is_test_mode();
					}

					return rest_ensure_response( $result );
				},
			]
		);

		// --------------------------------------------------------------
		// /seed-paypal-vendor — make a vendor "connected" without the hosted
		// partner-referral flow, which is captcha-gated and PayPal-side.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/seed-paypal-vendor',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$helper = dokan_paypal_test_helper();
					if ( ! $helper ) {
						return new WP_Error( 'dokan_test_no_paypal', 'PayPal Marketplace module not loaded', [ 'status' => 500 ] );
					}

					$vendor_id   = absint( $request->get_param( 'vendor_id' ) );
					$merchant_id = (string) $request->get_param( 'merchant_id' );
					if ( ! $vendor_id || '' === $merchant_id ) {
						return new WP_Error( 'dokan_test_bad_payload', 'vendor_id (int) and merchant_id (string) are required', [ 'status' => 400 ] );
					}

					$email = (string) ( $request->get_param( 'email' ) ?: 'seeded-vendor@example.test' );
					// UCC additionally needs PayPal-side PPCP_CUSTOM vetting, so it stays
					// opt-in and defaults off rather than pretending to be seedable.
					$ucc  = (bool) $request->get_param( 'ucc' );
					$keys = dokan_paypal_test_vendor_meta_keys();

					update_user_meta( $vendor_id, $keys['merchant_id'], $merchant_id );
					update_user_meta( $vendor_id, $keys['enable_for_receive'], true );
					update_user_meta( $vendor_id, $keys['payments_receivable'], true );
					update_user_meta( $vendor_id, $keys['primary_email_confirmed'], true );
					update_user_meta( $vendor_id, $keys['enable_for_ucc'], $ucc );
					update_user_meta(
						$vendor_id,
						$keys['marketplace_settings'],
						[
							'merchant_id' => $merchant_id,
							'email'       => $email,
						]
					);

					return rest_ensure_response(
						[
							'ok'          => true,
							'vendor_id'   => $vendor_id,
							'merchant_id' => $merchant_id,
							'keys'        => $keys,
							// The single assertion that proves the seed actually took.
							'receivable'  => (bool) $helper::is_seller_enable_for_receive_payment( $vendor_id ),
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /clear-paypal-vendor — remove BOTH mode variants, so a sandbox-seeded
		// vendor cannot leak into a live-mode assertion and vice versa.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/clear-paypal-vendor',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$helper = dokan_paypal_test_helper();
					if ( ! $helper ) {
						return new WP_Error( 'dokan_test_no_paypal', 'PayPal Marketplace module not loaded', [ 'status' => 500 ] );
					}

					$vendor_id = absint( $request->get_param( 'vendor_id' ) );
					if ( ! $vendor_id ) {
						return new WP_Error( 'dokan_test_bad_payload', 'vendor_id (int) is required', [ 'status' => 400 ] );
					}

					$deleted = [];
					foreach ( [ true, false ] as $mode ) {
						foreach ( dokan_paypal_test_vendor_meta_keys( $mode ) as $meta_key ) {
							delete_user_meta( $vendor_id, $meta_key );
							$deleted[] = $meta_key;
						}
					}

					return rest_ensure_response(
						[
							'ok'         => true,
							'vendor_id'  => $vendor_id,
							'deleted'    => $deleted,
							'receivable' => (bool) $helper::is_seller_enable_for_receive_payment( $vendor_id ),
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /paypal-webhook — dispatch an event straight into EventFactory, bypassing
		// WebhookHandler's signature check.
		//
		// The signature check is a LIVE outbound POST to PayPal's
		// verify-webhook-signature API with no filter, constant or test-mode bypass, so
		// a signed event cannot be forged locally. This route is the only way to reach
		// the handlers deterministically.
		//
		// IMPORTANT for spec authors: `EventFactory::__callStatic` catches \Exception
		// itself and only logs it, so `threw` here is false for most handler failures
		// and reports only \Error-class fatals and anything thrown outside that catch.
		// `threw === false` therefore does NOT prove the handler worked. Every webhook
		// spec must additionally assert a state mutation.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/paypal-webhook',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$factory = '\WeDevs\DokanPro\Modules\PayPalMarketplace\Factories\EventFactory';
					if ( ! class_exists( $factory ) ) {
						return new WP_Error( 'dokan_test_no_paypal', 'PayPal Marketplace EventFactory not loaded', [ 'status' => 500 ] );
					}

					$event_type = $request->get_param( 'event_type' );
					$resource   = $request->get_param( 'resource' );
					if ( empty( $event_type ) || ! is_array( $resource ) ) {
						return new WP_Error( 'dokan_test_bad_payload', 'event_type (string) and resource (object) are required', [ 'status' => 400 ] );
					}

					$helper     = dokan_paypal_test_helper();
					$supported  = $helper ? (array) $helper::get_supported_webhook_events() : [];
					$is_handled = array_key_exists( $event_type, $supported );

					// Handlers read only `->resource`, so an object with event_type +
					// resource is the whole contract. json_decode gives nested stdClass,
					// which is what a real PayPal payload deserialises to.
					$event = json_decode(
						wp_json_encode(
							[
								'id'            => 'WH-e2e-' . wp_generate_password( 12, false ),
								'event_type'    => $event_type,
								'resource_type' => (string) $request->get_param( 'resource_type' ),
								'resource'      => $resource,
							]
						)
					);

					$threw = false;
					$fatal = false;
					$error = null;
					try {
						$factory::handle( $event );
					} catch ( \Throwable $e ) {
						$threw = true;
						$fatal = $e instanceof \Error;
						$error = $e->getMessage();
					}

					return rest_ensure_response(
						[
							'ok'          => true,
							'event_type'  => $event_type,
							'event_id'    => $event->id,
							'is_handled'  => $is_handled,
							'handler'     => $is_handled ? $supported[ $event_type ] : null,
							'threw'       => $threw,
							'fatal'       => $fatal,
							'error'       => $error,
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /refund — Dokan API refund (method=1) so the module's refund controller runs
		// the PayPal refund. Gateway-agnostic; the shape is copied from the Express
		// helper deliberately.
		//
		// Do NOT assert on `refund_amount` below for a partial refund — it reports the
		// order total, an inaccuracy inherited from the Express helper and kept here
		// only so the two responses stay shape-compatible.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/refund',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					if ( ! function_exists( 'dokan_pro' ) || empty( dokan_pro()->refund ) ) {
						return new WP_Error( 'dokan_test_no_refund', 'Dokan Pro refund manager not available', [ 'status' => 500 ] );
					}

					$order_id = absint( $request->get_param( 'order_id' ) );
					$order    = $order_id ? wc_get_order( $order_id ) : null;
					if ( ! $order ) {
						return new WP_Error( 'dokan_test_bad_order', 'A valid order_id is required', [ 'status' => 404 ] );
					}

					$amount = $request->get_param( 'amount' );
					$amount = ( null === $amount || '' === $amount ) ? $order->get_total() : $amount;

					$args = [
						'order_id'      => $order_id,
						'seller_id'     => (int) dokan_get_seller_id_by_order( $order_id ),
						'refund_amount' => wc_format_decimal( $amount ),
						'refund_reason' => (string) ( $request->get_param( 'reason' ) ?: 'e2e refund' ),
						'item_qtys'     => '',
						'item_totals'   => '',
						'item_tax_totals' => '',
						'restock_items' => 'false',
						// method=1 is the automatic path that fires the gateway refund.
						'method'        => '1',
					];

					$threw  = false;
					$error  = null;
					$refund = null;
					try {
						$refund = dokan_pro()->refund->create( $args );
						if ( is_wp_error( $refund ) ) {
							$error = $refund->get_error_message();
						}
					} catch ( \Throwable $e ) {
						$threw = true;
						$error = $e->getMessage();
					}

					return rest_ensure_response(
						[
							'ok'            => true,
							'order_id'      => $order_id,
							'refund_amount' => $args['refund_amount'],
							'threw'         => $threw,
							'error'         => $error,
							'is_wp_error'   => is_wp_error( $refund ),
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /ucc-state — read the unbranded-card gate as the PRODUCT resolves it.
		//
		// `/status` already reports the raw `button_type` / `ucc_mode` rows; this route reports
		// what `Helper::is_ucc_enabled()` and `CartManager::is_ucc_enabled_for_all_seller_in_cart()`
		// actually ANSWER, so a card case asserts the gateway's own gate instead of its own
		// reconstruction of the five conditions. Read the honesty notes on
		// dokan_paypal_test_ucc_state() before asserting on the cart field.
		//
		// `vendor_ids` accepts `3`, `[3,5]` or the CSV `3,5` a query string can carry.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/ucc-state',
			[
				'methods'             => 'GET',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					return rest_ensure_response(
						array_merge(
							[ 'ok' => true ],
							dokan_paypal_test_ucc_state( $request->get_param( 'vendor_ids' ) )
						)
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /ucc-gate — set `ucc_mode` / `button_type` and report the PREVIOUS values.
		//
		// Exists so a card case can restore EXACTLY what it found. The three spec-local
		// `mergeGatewaySettings()` copies read the option in JS, merge, and write it back; they
		// cannot report what was there, so a restore has to re-declare the baseline as a literal
		// — and a literal baseline is a guess that silently rewrites the site when it is wrong.
		//
		// `previous.*` is null when the KEY WAS ABSENT, and passing an explicit JSON null here
		// deletes the key again. That distinction is the whole point: writing `''` where the row
		// never existed leaves `Helper::get_button_type()` returning '' instead of falling through
		// to its own default, which is a different site state than the one the test found.
		//
		// button_type is the one that breaks siblings: UCC needs 'smart', while
		// placeClassicOrder() (paypalMarketplaceCheckout.spec.ts) needs 'standard' because it
		// asserts #place_order is visible. Restore in a finally, not only at the end of a happy
		// path. Every other settings key is left untouched — this MERGES, it never assigns over
		// the option, so partner_id / test_app_* survive.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/ucc-gate',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$helper = dokan_paypal_test_helper();
					$option = 'woocommerce_' . ( $helper ? $helper::get_gateway_id() : 'dokan_paypal_marketplace' ) . '_settings';

					$settings = get_option( $option, [] );
					if ( ! is_array( $settings ) ) {
						$settings = [];
					}

					$previous = [
						'ucc_mode'    => array_key_exists( 'ucc_mode', $settings ) ? (string) $settings['ucc_mode'] : null,
						'button_type' => array_key_exists( 'button_type', $settings ) ? (string) $settings['button_type'] : null,
					];

					// WP_REST_Request::has_param() is isset()-based, so it reports false for an
					// explicit JSON null — exactly the value that means "delete this key". The
					// decoded body is inspected with array_key_exists() instead so "absent" and
					// "null" stay distinguishable, which is what makes an exact restore possible.
					$body    = (array) $request->get_json_params();
					$applied = [];

					foreach ( [ 'ucc_mode', 'button_type' ] as $key ) {
						$sent = array_key_exists( $key, $body );
						if ( ! $sent && ! $request->has_param( $key ) ) {
							continue;
						}

						$value = $sent ? $body[ $key ] : $request->get_param( $key );

						if ( null === $value ) {
							unset( $settings[ $key ] );
							$applied[ $key ] = null;
						} else {
							$settings[ $key ] = (string) $value;
							$applied[ $key ]  = (string) $value;
						}
					}

					if ( $applied ) {
						update_option( $option, $settings );
					}

					return rest_ensure_response(
						[
							'ok'       => true,
							'previous' => $previous,
							'applied'  => (object) $applied,
							'state'    => dokan_paypal_test_ucc_state( $request->get_param( 'vendor_ids' ) ),
						]
					);
				},
			]
		);

		// --------------------------------------------------------------
		// /vendor-ucc — set or clear the per-seller UCC meta and report the PREVIOUS value.
		//
		// The key is resolved through `Helper::get_seller_enable_for_ucc_key()`, never written as
		// a literal, so the sandbox/live swap is exercised rather than assumed — the same reason
		// /seed-paypal-vendor resolves all six of its keys.
		//
		// This is gate 5 of the UCC surface and it is ALL-OR-NOTHING across the cart
		// (Cart/CartManager.php:48-62): one seller without the meta removes the card form
		// entirely, so a multi-vendor case must pass BOTH vendor ids here. `vendor_ids` takes a
		// list for exactly that.
		//
		// `enabled: false` DELETES the meta rather than writing a falsy value, because the suite
		// baseline is an absent row (both vendors' meta is empty today). Both read as false to the
		// product's truthiness check, but `previous` reports what was really there, so a caller
		// that found `'1'` can put `'1'` back.
		// --------------------------------------------------------------
		register_rest_route(
			'dokan-test-paypal/v1',
			'/vendor-ucc',
			[
				'methods'             => 'POST',
				'permission_callback' => 'dokan_paypal_test_can_manage',
				'callback'            => function ( WP_REST_Request $request ) {
					$helper = dokan_paypal_test_helper();
					if ( ! $helper || ! method_exists( $helper, 'get_seller_enable_for_ucc_key' ) ) {
						return new WP_Error( 'dokan_test_no_paypal', 'PayPal Marketplace module not loaded, so the UCC meta key cannot be resolved through Helper::get_seller_enable_for_ucc_key()', [ 'status' => 500 ] );
					}

					$vendor_ids = dokan_paypal_test_vendor_id_list( $request->get_param( 'vendor_ids' ) );
					if ( ! $vendor_ids ) {
						$vendor_ids = dokan_paypal_test_vendor_id_list( $request->get_param( 'vendor_id' ) );
					}
					if ( ! $vendor_ids ) {
						return new WP_Error( 'dokan_test_bad_payload', 'vendor_id (int) or vendor_ids (int[]|csv) is required', [ 'status' => 400 ] );
					}

					// null keeps the current mode; true/false force the sandbox/live key so a spec
					// can prove the swap instead of trusting it.
					$test_mode = $request->has_param( 'test_mode' ) ? (bool) $request->get_param( 'test_mode' ) : null;
					$meta_key  = (string) $helper::get_seller_enable_for_ucc_key( $test_mode );
					$enabled   = (bool) $request->get_param( 'enabled' );

					$previous = [];
					foreach ( $vendor_ids as $vendor_id ) {
						$was = get_user_meta( $vendor_id, $meta_key, true );

						$previous[ (string) $vendor_id ] = is_scalar( $was ) ? (string) $was : wp_json_encode( $was );

						if ( $enabled ) {
							// `true` matches what the product writes at
							// WithdrawMethods/WithdrawManager.php:109.
							update_user_meta( $vendor_id, $meta_key, true );
						} else {
							delete_user_meta( $vendor_id, $meta_key );
						}
					}

					return rest_ensure_response(
						[
							'ok'         => true,
							'meta_key'   => $meta_key,
							'enabled'    => $enabled,
							'vendor_ids' => $vendor_ids,
							'previous'   => (object) $previous,
							'state'      => dokan_paypal_test_ucc_state( $vendor_ids ),
						]
					);
				},
			]
		);
	}
);
