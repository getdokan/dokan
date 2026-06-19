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

add_action(
	'rest_api_init',
	function () {
		// Turn ON the Vendor Subscription feature (dokan_product_subscription[enable_pricing]='on').
		// The subscription module returns early on init when this is off — so the vendor dashboard
		// /dashboard/subscription/ endpoint + the cancel/reactivate handlers only register when it is on.
		// Done PHP-side to avoid corrupting the serialized option array.
		register_rest_route(
			'dokan-test/v1',
			'/enable-vendor-subscription',
			[
				'methods'             => 'POST',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function () {
					$opt = get_option( 'dokan_product_subscription', [] );
					if ( ! is_array( $opt ) ) {
						$opt = [];
					}
					$opt['enable_pricing'] = 'on';
					update_option( 'dokan_product_subscription', $opt );
					return rest_ensure_response( [ 'ok' => true, 'enable_pricing' => 'on' ] );
				},
			]
		);

		// Turn the Vendor Subscription feature back OFF — used in test teardown to restore the site default so
		// later specs (run on the same worker/DB) see vendors un-gated again. Just sets the option; the module's
		// product-gating hooks stop registering on the next request (no rewrite flush needed for that).
		register_rest_route(
			'dokan-test/v1',
			'/disable-vendor-subscription',
			[
				'methods'             => 'POST',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function () {
					$opt = get_option( 'dokan_product_subscription', [] );
					if ( ! is_array( $opt ) ) {
						$opt = [];
					}
					$opt['enable_pricing'] = 'off';
					update_option( 'dokan_product_subscription', $opt );
					return rest_ensure_response( [ 'ok' => true, 'enable_pricing' => 'off' ] );
				},
			]
		);

		// Flush rewrite rules. Call AFTER enable-vendor-subscription, as a SEPARATE request, so this
		// request's bootstrap re-reads enable_pricing='on', the module registers its dashboard endpoint,
		// and the flush regenerates the rules WITH /dashboard/subscription/ included.
		register_rest_route(
			'dokan-test/v1',
			'/flush-rewrites',
			[
				'methods'             => 'POST',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function () {
					flush_rewrite_rules( true );
					return rest_ensure_response( [ 'ok' => true ] );
				},
			]
		);
	}
);

add_action(
	'rest_api_init',
	function () {
		// Activate the Product Advertising module + set the admin options the PADV purchase flow needs.
		// The advertisement base product is an admin-owned virtual product; a vendor "buys" an ad slot by adding
		// it to the cart at the per-advertisement cost (per_product_enabled='on', cost>0). The module slug is
		// 'product_advertising' (Module.php registry id, fires dokan_activated_module_product_advertising), NOT
		// 'product_advertisement' (that prefix is only the wp_option group for its settings). We also create the
		// advertisement base product here because it is normally created on settings-save (Admin\Settings) — done
		// PHP-side so the serialized 'dokan_product_advertisement' option array is not corrupted.
		register_rest_route(
			'dokan-test/v1',
			'/enable-product-advertisement',
			[
				'methods'             => 'POST',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function ( WP_REST_Request $request ) {
					if ( ! function_exists( 'dokan_pro' ) || empty( dokan_pro()->module ) ) {
						return new WP_Error( 'dokan_test_no_module_mgr', 'Dokan Pro module manager unavailable', [ 'status' => 500 ] );
					}

					// Activate the module (force=true bypasses the license gate so the test DB always loads it).
					dokan_pro()->module->activate_modules( [ 'product_advertising' ], true );

					if ( ! class_exists( '\WeDevs\DokanPro\Modules\ProductAdvertisement\Helper' ) ) {
						return new WP_Error( 'dokan_test_no_padv_helper', 'Product Advertisement module did not load', [ 'status' => 500 ] );
					}

					// Cost defaults to 15; allow an override via the request body so a spec can pin the ad fee.
					$cost = $request->get_param( 'cost' );
					$cost = ( $cost === null || $cost === '' ) ? '15' : wc_format_decimal( $cost, 2 );

					// per_product_enabled='on' + cost>0 is what lets a vendor purchase an ad slot at checkout.
					$opt = get_option( 'dokan_product_advertisement', [] );
					if ( ! is_array( $opt ) ) {
						$opt = [];
					}
					$opt['per_product_enabled'] = 'on';
					$opt['cost']                = $cost;
					update_option( 'dokan_product_advertisement', $opt );

					// The base product is normally created on settings-save; create it here if it does not exist yet.
					if ( empty( \WeDevs\DokanPro\Modules\ProductAdvertisement\Helper::get_advertisement_base_product() ) ) {
						\WeDevs\DokanPro\Modules\ProductAdvertisement\Helper::create_advertisement_base_product();
					}

					return rest_ensure_response(
						[
							'ok'                  => true,
							'module'              => 'product_advertising',
							'active'              => dokan_pro()->module->is_active( 'product_advertising' ),
							'per_product_enabled' => 'on',
							'cost'                => $cost,
							'base_product_id'     => \WeDevs\DokanPro\Modules\ProductAdvertisement\Helper::get_advertisement_base_product(),
						]
					);
				},
			]
		);

		// Read whether a product is currently advertised — used to assert PADV success after the vendor pays.
		// Mirrors Helper::is_product_advertised(), which counts active (status=1) rows for the product in the
		// advertisement table; no public REST surface exposes this, so the assertion goes through the module.
		register_rest_route(
			'dokan-test/v1',
			'/is-product-advertised',
			[
				'methods'             => 'GET',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function ( WP_REST_Request $request ) {
					if ( ! class_exists( '\WeDevs\DokanPro\Modules\ProductAdvertisement\Helper' ) ) {
						return new WP_Error( 'dokan_test_no_padv_helper', 'Product Advertisement module not active', [ 'status' => 500 ] );
					}

					$product_id = absint( $request->get_param( 'product_id' ) );
					if ( ! $product_id ) {
						return new WP_Error( 'dokan_test_no_product', 'product_id is required', [ 'status' => 400 ] );
					}

					$advertised = \WeDevs\DokanPro\Modules\ProductAdvertisement\Helper::is_product_advertised( $product_id );

					return rest_ensure_response(
						[
							'ok'         => true,
							'product_id' => $product_id,
							'advertised' => (bool) $advertised,
						]
					);
				},
			]
		);
	}
);

add_action(
	'rest_api_init',
	function () {
		// Idempotently configure Stripe Connect on THIS site: activate the stripe + product_subscription modules
		// (deactivate stripe_express), write the gateway settings from the posted test keys, and enable the
		// dokan-stripe-connect withdraw method. CI shards each run on their own fresh wp-env, and the gateway
		// config previously lived only in stripeConnect.spec.ts's pre-setup describe — so any shard that did NOT
		// run that file had an unconfigured gateway and every other Stripe spec failed. The e2e setup project calls
		// this once per shard so every shard is self-sufficient. Returns the resulting readiness flags.
		register_rest_route(
			'dokan-test/v1',
			'/configure-stripe-connect',
			[
				'methods'             => 'POST',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function ( WP_REST_Request $request ) {
					$result = [ 'ok' => true ];

					// 1) Modules — activate Stripe Connect + Vendor Subscription, deactivate Stripe Express.
					if ( function_exists( 'dokan_pro' ) && ! empty( dokan_pro()->module ) ) {
						dokan_pro()->module->activate_modules( [ 'stripe', 'product_subscription' ], true );
						if ( method_exists( dokan_pro()->module, 'deactivate_modules' ) ) {
							dokan_pro()->module->deactivate_modules( [ 'stripe_express' ] );
						}
						$result['stripe_active'] = dokan_pro()->module->is_active( 'stripe' );
					} else {
						// Dokan Pro absent (e.g. a lite run) — nothing to configure; report gracefully.
						return rest_ensure_response( [ 'ok' => true, 'skipped' => 'dokan_pro_absent' ] );
					}

					// 2) Gateway settings — MERGE into the existing option so title/description survive.
					$pub = (string) $request->get_param( 'publishable' );
					$sec = (string) $request->get_param( 'secret' );
					$cid = (string) $request->get_param( 'client_id' );
					if ( '' !== $pub && '' !== $sec ) {
						$settings = get_option( 'woocommerce_dokan-stripe-connect_settings', [] );
						if ( ! is_array( $settings ) ) {
							$settings = [];
						}
						$settings = array_merge(
							$settings,
							[
								'enabled'              => 'yes',
								'testmode'             => 'yes',
								'test_publishable_key' => $pub,
								'test_secret_key'      => $sec,
								'test_client_id'       => $cid,
								'saved_cards'          => 'yes',
							]
						);
						update_option( 'woocommerce_dokan-stripe-connect_settings', $settings );
						$result['gateway_configured'] = true;
						$result['ready']              = ( '' !== $cid ); // ready (withdraw + vendor connect) needs a client id
					}

					// 3) Withdraw method — enable dokan-stripe-connect (surfaces the vendor connect UI when ready).
					$wd = get_option( 'dokan_withdraw', [] );
					if ( ! is_array( $wd ) ) {
						$wd = [];
					}
					if ( empty( $wd['withdraw_methods'] ) || ! is_array( $wd['withdraw_methods'] ) ) {
						$wd['withdraw_methods'] = [];
					}
					$wd['withdraw_methods']['dokan-stripe-connect'] = 'dokan-stripe-connect';
					update_option( 'dokan_withdraw', $wd );
					$result['withdraw_method_enabled'] = true;

					// 4) Optional: set the gateway DESCRIPTION (used by the stored-XSS test to inject + restore a payload).
					$desc = $request->get_param( 'description' );
					if ( null !== $desc ) {
						$s = get_option( 'woocommerce_dokan-stripe-connect_settings', [] );
						if ( ! is_array( $s ) ) {
							$s = [];
						}
						$s['description'] = (string) $desc;
						update_option( 'woocommerce_dokan-stripe-connect_settings', $s );
						$result['description_set'] = true;
					}

					return rest_ensure_response( $result );
				},
			]
		);
	}
);

add_action(
	'rest_api_init',
	function () {
		// Inject a Stripe webhook event DIRECTLY into the gateway's event factory + handler, bypassing the live
		// ?wc-api=dokan_stripe endpoint's Event::retrieve() re-fetch (which would require the event to already
		// exist in Stripe). This lets the e2e suite drive dispute / subscription-lifecycle / payout / out-of-order
		// events with a synthetic-but-well-formed object and FULL control. Returns whether handle() threw (and
		// whether it was a PHP \Error = an uncatchable-in-prod fatal) so a spec can pin a handler that crashes on a
		// valid event. The faithful path (a REAL event id, posted unsigned — exploiting the missing signature
		// check R2) is helpers.ts postWebhookEvent(); the optional Stripe-CLI path is documented in the spec.
		register_rest_route(
			'dokan-test/v1',
			'/stripe-webhook',
			[
				'methods'             => 'POST',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function ( WP_REST_Request $request ) {
					if ( ! class_exists( '\WeDevs\DokanPro\Modules\Stripe\DokanStripe' ) || ! class_exists( '\Stripe\Event' ) ) {
						return new WP_Error( 'dokan_test_no_stripe', 'Stripe Connect module / SDK not loaded', [ 'status' => 500 ] );
					}

					$type        = $request->get_param( 'type' );
					$data_object = $request->get_param( 'data_object' );
					$account     = $request->get_param( 'account' );

					if ( empty( $type ) || ! is_array( $data_object ) ) {
						return new WP_Error( 'dokan_test_bad_payload', 'type (string) and data_object (object) are required', [ 'status' => 400 ] );
					}

					// Set the platform secret key so Charge/Invoice/Subscription retrieves inside the handler resolve.
					if ( class_exists( '\WeDevs\DokanPro\Modules\Stripe\Helper' ) ) {
						\Stripe\Stripe::setApiKey( \WeDevs\DokanPro\Modules\Stripe\Helper::get_secret_key() );
					}

					$event = \Stripe\Event::constructFrom(
						[
							'id'      => 'evt_e2e_' . wp_generate_password( 16, false ),
							'type'    => $type,
							'data'    => [ 'object' => $data_object ],
							'account' => $account ? $account : null,
						]
					);

					$threw = false;
					$fatal = false;
					$error = null;
					try {
						$handler = \WeDevs\DokanPro\Modules\Stripe\DokanStripe::events()->get( $event );
						if ( $handler ) {
							$handler->handle();
						}
					} catch ( \Throwable $e ) {
						$threw = true;
						$fatal = $e instanceof \Error; // \Error = method-on-null etc. = an uncatchable-in-prod PHP fatal
						$error = $e->getMessage();
					}

					return rest_ensure_response(
						[
							'ok'    => true,
							'type'  => $type,
							'threw' => $threw,
							'fatal' => $fatal,
							'error' => $error,
						]
					);
				},
			]
		);
	}
);
