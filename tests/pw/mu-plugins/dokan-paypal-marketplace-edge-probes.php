<?php
/**
 * Plugin Name: Dokan PayPal Marketplace — E2E Edge-Case Probes
 * Description: TEST-ONLY support for the PayPal Marketplace edge-case spec
 *              (paypalMarketplaceEdge.spec.ts). Two probes, BOTH COMPLETELY INERT until the
 *              spec writes the option that arms them, and neither of them touches product code:
 *
 *              1. A real third-party registration of the module's own
 *                 `dokan_paypal_marketplace_validate_cart_items` filter (Helper.php:1349).
 *                 PP-EDG-05 exists to prove that documented extension point works; without a
 *                 registered filter the case can only assert nothing at all.
 *
 *              2. A `pre_http_request` recorder that captures the EXACT JSON body the module
 *                 sends to PayPal's create-order endpoint and short-circuits the call.
 *                 PP-EDG-10 / PP-EDG-11 are about the amount strings that go OUT, and nothing
 *                 in the module writes them anywhere observable: `Processor::make_request()`
 *                 logs neither the request nor the body, and the only dump of
 *                 `$create_order_data` (PayPal.php:315) happens exclusively on failure, into
 *                 wc-logs, which is inside the container and not mounted on the host. Stubbing
 *                 the TRANSPORT — and only the transport — leaves every line of the payload
 *                 builder running for real while no money and no live PayPal order is involved.
 *
 *              Safety properties, deliberate:
 *                - Both probes read an option that does not exist by default, so a normal run
 *                  behaves exactly as if this file were absent.
 *                - The interceptor is bounded by a WALL-CLOCK DEADLINE, not a boolean, so a
 *                  test that dies mid-way cannot leave the site intercepting PayPal forever.
 *                - While armed, any PayPal call other than the two it emulates is failed loudly
 *                  rather than allowed through, so a stray capture or refund cannot escape to
 *                  PayPal inside an intercepted window.
 *
 *              NOT for production use.
 *
 * @package Dokan\Tests
 */

defined( 'ABSPATH' ) || exit;

/** Product id whose presence in the cart must make the gateway unavailable. 0/absent = off. */
const DOKAN_E2E_PAYPAL_REJECT_OPTION = 'dokan_e2e_paypal_reject_cart_product';

/** Unix timestamp until which outbound PayPal calls are intercepted. Absent/past = off. */
const DOKAN_E2E_PAYPAL_INTERCEPT_OPTION = 'dokan_e2e_paypal_intercept_until';

/** Where the captured outbound request is stored for the spec to read. */
const DOKAN_E2E_PAYPAL_OUTBOUND_OPTION = 'dokan_e2e_paypal_last_outbound';

/** Where the captured webhook-signature verification request is stored for the spec to read. */
const DOKAN_E2E_PAYPAL_VERIFY_OPTION = 'dokan_e2e_paypal_last_verify';

/**
 * PP-EDG-05 — a genuine consumer of `dokan_paypal_marketplace_validate_cart_items`.
 *
 * Runs late (priority 99) so it observes, and can override, whatever the module itself decided.
 * It rejects ONE specific product rather than returning a blanket false, because "the filter can
 * reject a specific item" is the actual contract under test: a blanket false would pass equally
 * against a filter that was never called with the cart in scope.
 */
add_filter(
	'dokan_paypal_marketplace_validate_cart_items',
	function ( $is_valid ) {
		$blocked = absint( get_option( DOKAN_E2E_PAYPAL_REJECT_OPTION, 0 ) );

		if ( ! $blocked || ! function_exists( 'WC' ) || ! WC()->cart instanceof WC_Cart ) {
			return $is_valid;
		}

		foreach ( WC()->cart->get_cart() as $item ) {
			if ( isset( $item['data'] ) && $blocked === absint( $item['data']->get_id() ) ) {
				return false;
			}
		}

		return $is_valid;
	},
	99
);

/**
 * Is the outbound interceptor armed right now?
 *
 * A deadline rather than a flag: `update_option( …, time() + 120 )` self-heals, a boolean does
 * not. A test that is killed between arming and disarming would otherwise leave every later
 * PayPal call on this site stubbed, and the specs that DO talk to PayPal would then fail with an
 * error that names neither this file nor the test that armed it.
 */
if ( ! function_exists( 'dokan_e2e_paypal_intercept_armed' ) ) {
	function dokan_e2e_paypal_intercept_armed() {
		return time() < (int) get_option( DOKAN_E2E_PAYPAL_INTERCEPT_OPTION, 0 );
	}
}

/** Build a response array shaped the way `wp_remote_*` consumers expect. */
if ( ! function_exists( 'dokan_e2e_paypal_fake_response' ) ) {
	function dokan_e2e_paypal_fake_response( array $body, array $headers = array() ) {
		return array(
			'headers'  => $headers,
			'body'     => wp_json_encode( $body ),
			'response' => array(
				'code'    => 201,
				'message' => 'Created',
			),
			'cookies'  => array(),
			'filename' => null,
		);
	}
}

/**
 * PP-EDG-10 / PP-EDG-11 — record what the module transmits, and stop it at the wire.
 *
 * `pre_http_request` is WordPress's own short-circuit: returning anything other than false
 * replaces the HTTP response without the request ever leaving the host. The module's code path
 * is untouched — `PayPal::process_payment()` still splits the order, still calls
 * `OrderManager::make_purchase_unit_data()` for every sub order, and still hands the encoded
 * payload to `Processor::create_order()`.
 */
add_filter(
	'pre_http_request',
	function ( $pre, $args, $url ) {
		if ( false !== $pre || ! dokan_e2e_paypal_intercept_armed() ) {
			return $pre;
		}

		$url = (string) $url;

		if ( false === strpos( $url, 'paypal.com' ) ) {
			return $pre;
		}

		// The OAuth token call. Emulated so the payload builder can be exercised without a live
		// PayPal round trip; the spec deletes the cached-token transient on both sides of the
		// window so this fake token can never be reused by a test that talks to PayPal for real.
		if ( false !== strpos( $url, '/v1/oauth2/token' ) ) {
			return dokan_e2e_paypal_fake_response(
				array(
					'access_token' => 'e2e-intercepted-token',
					'token_type'   => 'Bearer',
					'app_id'       => 'APP-E2E',
					'expires_in'   => 60,
				)
			);
		}

		// Webhook signature verification. `Processor::verify_webhook_request()`
		// (Utilities/Processor.php:432-441) POSTs the transmission headers plus the event body to
		// PayPal and treats anything other than `verification_status === 'SUCCESS'` as a failed
		// signature. Nothing in the module records that request — it logs only on WP_Error — so
		// the body is captured here, which is the only way a spec can prove the verification was
		// attempted at all, and with the headers the delivery actually carried.
		//
		// The canned answer is deliberately FAILURE, not SUCCESS: the case this serves is "a
		// forged or unverifiable event must not mutate anything", and a stub answering SUCCESS
		// would wave every forged event through and assert the opposite of the contract. The
		// catch-all below would otherwise refuse this call with a WP_Error, which is
		// indistinguishable from PayPal being unreachable; an explicit FAILURE exercises the
		// module's real reject branch instead.
		if ( false !== strpos( $url, '/v1/notifications/verify-webhook-signature' ) ) {
			update_option(
				DOKAN_E2E_PAYPAL_VERIFY_OPTION,
				wp_json_encode(
					array(
						'url'         => $url,
						'body'        => is_string( $args['body'] ?? null ) ? $args['body'] : wp_json_encode( $args['body'] ?? null ),
						'recorded_at' => time(),
					)
				),
				false
			);

			return dokan_e2e_paypal_fake_response( array( 'verification_status' => 'FAILURE' ) );
		}

		// Create-order: `POST /v2/checkout/orders` exactly (a capture is
		// `/v2/checkout/orders/<id>/capture`, which must NOT be treated as a create).
		if ( preg_match( '#/v2/checkout/orders/?$#', $url ) && 'POST' === strtoupper( (string) ( $args['method'] ?? 'POST' ) ) ) {
			update_option(
				DOKAN_E2E_PAYPAL_OUTBOUND_OPTION,
				wp_json_encode(
					array(
						'url'         => $url,
						'body'        => is_string( $args['body'] ?? null ) ? $args['body'] : wp_json_encode( $args['body'] ?? null ),
						'recorded_at' => time(),
					)
				),
				false
			);

			$fake_id = 'E2E' . strtoupper( wp_generate_password( 14, false, false ) );

			// `Processor::create_order()` accepts the response only when status is CREATED and
			// links[1] is the `approve` link, and `PayPal::process_payment()` then reads
			// `links[1]['href']` and `paypal_debug_id`. Emulating all three keeps the module on
			// its success path, so nothing here is exercising an error branch by accident.
			return dokan_e2e_paypal_fake_response(
				array(
					'id'     => $fake_id,
					'status' => 'CREATED',
					'links'  => array(
						array(
							'href'   => 'https://example.test/e2e/self',
							'rel'    => 'self',
							'method' => 'GET',
						),
						array(
							'href'   => 'https://example.test/e2e/approve',
							'rel'    => 'approve',
							'method' => 'GET',
						),
					),
				),
				array( 'paypal-debug-id' => 'e2e-intercepted' )
			);
		}

		// Anything else aimed at PayPal while the window is open is refused rather than allowed
		// through: an intercepted test has a fake access token in play, so letting a capture,
		// refund or payout leave the host would produce a real PayPal failure that looks like a
		// product bug.
		return new WP_Error(
			'dokan_e2e_paypal_intercepted',
			'Blocked by the e2e PayPal interceptor (paypalMarketplaceEdge.spec.ts): ' . $url
		);
	},
	1,
	3
);
