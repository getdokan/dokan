<?php
/**
 * Plugin Name: Dokan Stripe Express — E2E Test Helpers
 * Description: TEST-ONLY REST routes (namespace `dokan-test-express/v1`) for the Stripe
 *              Express e2e suite: configure the gateway + module, seed/clear a connected
 *              vendor (account_info array meta), inject webhook events into the module's
 *              WebhookEvents factory, trigger a Dokan API refund (method=1 → the module's
 *              `dokan_refund_request_created` handler runs the Stripe refund + transfer
 *              reversal), toggle vendor-subscription, and enable product advertisement.
 *              NOT for production use. Mirrors dokan-stripe-connect-test-helpers.php but
 *              re-pointed to the Stripe EXPRESS gateway/module.
 *
 * @package Dokan\Tests
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'dokan_stripe_express_test_can_manage' ) ) {
    function dokan_stripe_express_test_can_manage() {
        return current_user_can( 'manage_woocommerce' );
    }
}

/**
 * Build the minimal "connected & activated" Express account_info array from a real
 * (or placeholder) connected account id. `is_connected()` reads charges_enabled +
 * payouts_enabled; `is_activated()` reads charges_enabled + (transfers||payouts).
 * A REAL `acct_…` (in the same Stripe test platform as the keys) is required for the
 * vendor Transfer::create to succeed — a placeholder only renders the connected UI.
 */
if ( ! function_exists( 'dokan_stripe_express_test_account_info' ) ) {
    function dokan_stripe_express_test_account_info( $account_id, array $overrides = [] ) {
        return array_merge(
            [
                'account_id'        => (string) $account_id,
                'trashed_account_id' => '',
                'capabilities'      => [
					'card_payments' => 'active',
					'transfers' => 'active',
				],
                'charges_enabled'   => true,
                'payouts_enabled'   => true,
                'transfers_enabled' => true,
                'details_submitted' => true,
                'country'           => 'US',
                'default_currency'  => 'usd',
                'type'              => 'express',
                'email'             => 'seeded-vendor@example.test',
                'metadata'          => [
					'platform' => 'dokan',
					'gateway' => 'Stripe Express',
				],
            ],
            $overrides
        );
    }
}

/**
 * Resolve the mode-correct account_info user-meta key. The module prefixes with
 * `test_` ONLY when the "Test Mode" checkbox is on (NOT for sandbox mode). The suite
 * standardises on testmode=yes, so the key is `_dokan_stripe_express_test_account_info`.
 */
if ( ! function_exists( 'dokan_stripe_express_test_account_meta_key' ) ) {
    function dokan_stripe_express_test_account_meta_key() {
        if ( class_exists( '\WeDevs\DokanPro\Modules\StripeExpress\Support\UserMeta' ) ) {
            return \WeDevs\DokanPro\Modules\StripeExpress\Support\UserMeta::get_stripe_account_info_key();
        }
        // Fallback for the suite's testmode=yes config.
        return '_dokan_stripe_express_test_account_info';
    }
}

add_action(
    'rest_api_init',
    function () {
        // ------------------------------------------------------------------
        // /configure-stripe-express — idempotent per-shard gateway+module config.
        // Activate stripe_express (+ product_subscription for the @pro subscription
        // specs), deactivate the legacy `stripe` (Connect) module (they conflict),
        // write the gateway settings from the posted test keys, enable the
        // dokan_stripe_express withdraw method. Returns readiness flags.
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-express/v1',
            '/configure-stripe-express',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_express_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    $result = [ 'ok' => true ];

                    if ( ! function_exists( 'dokan_pro' ) || empty( dokan_pro()->module ) ) {
                        return rest_ensure_response(
                            [
								'ok' => true,
								'skipped' => 'dokan_pro_absent',
							]
                        );
                    }

                    // 1) Modules — Express ON (+ vendor subscription), Connect OFF.
                    dokan_pro()->module->activate_modules( [ 'stripe_express', 'product_subscription' ], true );
                    if ( method_exists( dokan_pro()->module, 'deactivate_modules' ) ) {
                        dokan_pro()->module->deactivate_modules( [ 'stripe' ] );
                    }
                    // Directly enforce the active-modules option as the source of truth. Module::activate_modules()
                    // reads get_active_modules() WITHOUT force, and Module::deactivate_modules() does the same, so on
                    // a fresh CI environment (license/cache state) the legacy `stripe` (Connect) module is not reliably
                    // removed. Reconcile the option here so Express is ON and the conflicting Connect module is OFF,
                    // preserving every other active module.
                    $active_modules = array_values( array_unique( (array) get_option( 'dokan_pro_active_modules', [] ) ) );
                    $active_modules = array_values( array_diff( $active_modules, [ 'stripe' ] ) );
                    foreach ( [ 'stripe_express', 'product_subscription' ] as $needed_module ) {
                        if ( ! in_array( $needed_module, $active_modules, true ) ) {
                            $active_modules[] = $needed_module;
                        }
                    }
                    update_option( 'dokan_pro_active_modules', $active_modules );

                    $result['stripe_express_active'] = in_array( 'stripe_express', $active_modules, true );
                    $result['stripe_active']         = in_array( 'stripe', $active_modules, true );

                    // 2) Gateway settings — MERGE so title/description survive.
                    $pub = (string) $request->get_param( 'publishable' );
                    $sec = (string) $request->get_param( 'secret' );
                    if ( '' !== $pub && '' !== $sec ) {
                        $settings = get_option( 'woocommerce_dokan_stripe_express_settings', [] );
                        if ( ! is_array( $settings ) ) {
                            $settings = [];
                        }
                        $merge = [
                            'enabled'              => 'yes',
                            'testmode'             => 'yes',
                            'sandbox_mode'         => 'no',
                            'test_publishable_key' => $pub,
                            'test_secret_key'      => $sec,
                            'saved_cards'          => 'yes',
                            'capture'              => 'no',
                        ];
                        // Optional known webhook secret so signature tests are deterministic.
                        $whk = $request->get_param( 'webhook_secret' );
                        if ( null !== $whk && '' !== $whk ) {
                            $merge['test_webhook_key'] = (string) $whk;
                        }
                        $settings = array_merge( $settings, $merge );
                        update_option( 'woocommerce_dokan_stripe_express_settings', $settings );
                        $result['gateway_configured'] = true;
                    }

                    // 3) Withdraw method — surfaces the vendor onboarding UI.
                    $wd = get_option( 'dokan_withdraw', [] );
                    if ( ! is_array( $wd ) ) {
                        $wd = [];
                    }
                    if ( empty( $wd['withdraw_methods'] ) || ! is_array( $wd['withdraw_methods'] ) ) {
                        $wd['withdraw_methods'] = [];
                    }
                    $wd['withdraw_methods']['dokan_stripe_express'] = 'dokan_stripe_express';
                    update_option( 'dokan_withdraw', $wd );
                    $result['withdraw_method_enabled'] = true;

                    // 4) Optional gateway DESCRIPTION (stored-XSS test injects + restores a payload).
                    $desc = $request->get_param( 'description' );
                    if ( null !== $desc ) {
                        $s = get_option( 'woocommerce_dokan_stripe_express_settings', [] );
                        if ( ! is_array( $s ) ) {
                            $s = [];
                        }
                        $s['description'] = (string) $desc;
                        update_option( 'woocommerce_dokan_stripe_express_settings', $s );
                        $result['description_set'] = true;
                    }

                    // 5) Arbitrary gateway-settings overrides (key => value), merged into the settings array.
                    // Tests change settings THIS way (not via the WC React settings UI, whose Save button stays
                    // disabled until the form is dirtied) — e.g. sellers_pay_processing_fee, capture, disburse_mode.
                    $overrides = $request->get_param( 'settings' );
                    if ( is_array( $overrides ) && ! empty( $overrides ) ) {
                        $s = get_option( 'woocommerce_dokan_stripe_express_settings', [] );
                        if ( ! is_array( $s ) ) {
                            $s = [];
                        }
                        $s = array_merge( $s, $overrides );
                        update_option( 'woocommerce_dokan_stripe_express_settings', $s );
                        $result['settings_overridden'] = array_keys( $overrides );
                    }

                    // Readiness (best-effort) — needs valid keys.
                    if ( class_exists( '\WeDevs\DokanPro\Modules\StripeExpress\Support\Helper' ) ) {
                        $result['api_ready'] = \WeDevs\DokanPro\Modules\StripeExpress\Support\Helper::is_api_ready();
                    }

                    return rest_ensure_response( $result );
                },
            ]
        );

        // ------------------------------------------------------------------
        // /seed-express-vendor — write the connected-account array meta so a vendor
        // renders the "connected" UI and (with a REAL acct_) can receive transfers,
        // WITHOUT driving the Stripe-hosted onboarding. PHP-native (correct nesting).
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-express/v1',
            '/seed-express-vendor',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_express_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    $vendor_id  = absint( $request->get_param( 'vendor_id' ) );
                    $account_id = (string) $request->get_param( 'account_id' );
                    if ( ! $vendor_id || '' === $account_id ) {
                        return new WP_Error( 'dokan_test_bad_params', 'vendor_id and account_id are required', [ 'status' => 400 ] );
                    }
                    $overrides_param = $request->get_param( 'overrides' );
                    $overrides       = is_array( $overrides_param ) ? $overrides_param : [];
                    $info      = dokan_stripe_express_test_account_info( $account_id, $overrides );
                    $key       = dokan_stripe_express_test_account_meta_key();
                    update_user_meta( $vendor_id, $key, $info );

                    return rest_ensure_response(
                        [
                            'ok'         => true,
                            'vendor_id'  => $vendor_id,
                            'meta_key'   => $key,
                            'account_id' => $account_id,
                        ]
                    );
                },
            ]
        );

        // ------------------------------------------------------------------
        // /clear-express-vendor — undo seed-express-vendor (delete both mode keys).
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-express/v1',
            '/clear-express-vendor',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_express_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    $vendor_id = absint( $request->get_param( 'vendor_id' ) );
                    if ( ! $vendor_id ) {
                        return new WP_Error( 'dokan_test_bad_params', 'vendor_id is required', [ 'status' => 400 ] );
                    }
                    delete_user_meta( $vendor_id, '_dokan_stripe_express_test_account_info' );
                    delete_user_meta( $vendor_id, '_dokan_stripe_express_account_info' );
                    return rest_ensure_response(
                        [
							'ok' => true,
							'vendor_id' => $vendor_id,
						]
                    );
                },
            ]
        );

        // ------------------------------------------------------------------
        // /express-webhook — inject a Stripe event DIRECTLY into the module's
        // WebhookEvents factory (bypassing the live ?wc-api endpoint's Event::retrieve
        // re-fetch + signature check). Drives dispute / lifecycle / payout / out-of-order
        // events with a synthetic object. Returns whether handle() threw (and whether
        // it was a PHP \Error = uncatchable-in-prod fatal).
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-express/v1',
            '/express-webhook',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_express_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    if ( ! class_exists( '\WeDevs\DokanPro\Modules\StripeExpress\Utilities\Factories\WebhookEvents' ) || ! class_exists( '\Stripe\Event' ) ) {
                        return new WP_Error( 'dokan_test_no_stripe_express', 'Stripe Express module / SDK not loaded', [ 'status' => 500 ] );
                    }

                    $type        = $request->get_param( 'type' );
                    $data_object = $request->get_param( 'data_object' );
                    $account     = $request->get_param( 'account' );
                    if ( empty( $type ) || ! is_array( $data_object ) ) {
                        return new WP_Error( 'dokan_test_bad_payload', 'type (string) and data_object (object) are required', [ 'status' => 400 ] );
                    }

                    // Set the platform secret key so retrieves inside the handler resolve.
                    if ( class_exists( '\WeDevs\DokanPro\Modules\StripeExpress\Support\Settings' ) && class_exists( '\Stripe\Stripe' ) ) {
                        \Stripe\Stripe::setApiKey( \WeDevs\DokanPro\Modules\StripeExpress\Support\Settings::get_secret_key() );
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
                        \WeDevs\DokanPro\Modules\StripeExpress\Utilities\Factories\WebhookEvents::handle( $event );
                    } catch ( \Throwable $e ) {
                        $threw = true;
                        $fatal = $e instanceof \Error;
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

        // ------------------------------------------------------------------
        // /refund — trigger a Dokan API refund (method=1) → fires
        // `dokan_refund_request_created`, which the Express module's Controllers\Refund
        // handles (Stripe refund + transfer reversal). Optional partial `amount`.
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-express/v1',
            '/refund',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_express_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    if ( ! function_exists( 'dokan_pro' ) || empty( dokan_pro()->refund ) ) {
                        return new WP_Error( 'dokan_test_no_refund_mgr', 'Dokan Pro refund manager unavailable', [ 'status' => 500 ] );
                    }
                    $order_id = absint( $request->get_param( 'order_id' ) );
                    $order    = wc_get_order( $order_id );
                    if ( ! $order instanceof WC_Order ) {
                        return new WP_Error( 'dokan_test_no_order', 'Order not found', [ 'status' => 404 ] );
                    }
                    if ( ! in_array( $order->get_status(), [ 'completed', 'processing' ], true ) ) {
                        $order->update_status( 'completed', 'E2E: ready for refund' );
                    }

                    $item_qtys       = [];
                    $item_totals     = [];
                    $item_tax_totals = [];
                    $collect = function ( $item_id, $item ) use ( &$item_totals, &$item_tax_totals ) {
                        $item_totals[ $item_id ] = wc_format_decimal( $item->get_total(), 2 );
                        $taxes = $item->get_taxes();
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

                    $amount = $request->get_param( 'amount' );
                    if ( $amount !== null && $amount !== '' ) {
                        $first_item_id = array_key_first( $order->get_items() );
                        $args = [
                            'order_id'        => $order_id,
                            'refund_amount'   => wc_format_decimal( $amount, 2 ),
                            'refund_reason'   => 'e2e stripe express partial refund',
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
                            'refund_reason'   => 'e2e stripe express full refund',
                            'item_qtys'       => $item_qtys,
                            'item_totals'     => $item_totals,
                            'item_tax_totals' => $item_tax_totals,
                            'restock_items'   => 'true',
                            'method'          => '1',
                        ];
                    }

                    $result = dokan_pro()->refund->create( $args );
                    if ( is_wp_error( $result ) ) {
                        return new WP_Error( 'dokan_test_refund_failed', $result->get_error_message(), [ 'status' => 400 ] );
                    }
                    return rest_ensure_response(
                        [
							'ok' => true,
							'order_id' => $order_id,
							'refund_amount' => (float) $order->get_total(),
						]
                    );
                },
            ]
        );

        // ------------------------------------------------------------------
        // Vendor-subscription feature toggles + rewrite flush (gateway-agnostic).
        // ------------------------------------------------------------------
        foreach ( [
			'enable-vendor-subscription' => 'on',
			'disable-vendor-subscription' => 'off',
		] as $route => $value ) {
            register_rest_route(
                'dokan-test-express/v1',
                '/' . $route,
                [
                    'methods'             => 'POST',
                    'permission_callback' => 'dokan_stripe_express_test_can_manage',
                    'callback'            => function () use ( $value ) {
                        $opt = get_option( 'dokan_product_subscription', [] );
                        if ( ! is_array( $opt ) ) {
                            $opt = [];
                        }
                        $opt['enable_pricing'] = $value;
                        update_option( 'dokan_product_subscription', $opt );
                        return rest_ensure_response(
                            [
								'ok' => true,
								'enable_pricing' => $value,
							]
                        );
                    },
                ]
            );
        }

        register_rest_route(
            'dokan-test-express/v1',
            '/flush-rewrites',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_express_test_can_manage',
                'callback'            => function () {
                    flush_rewrite_rules( true );
                    return rest_ensure_response( [ 'ok' => true ] );
                },
            ]
        );

        // ------------------------------------------------------------------
        // Product Advertisement (SE-PADV) — activate module + enable per-product ad
        // purchase + create the admin-owned base product.
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-express/v1',
            '/enable-product-advertisement',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_express_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    if ( ! function_exists( 'dokan_pro' ) || empty( dokan_pro()->module ) ) {
                        return new WP_Error( 'dokan_test_no_module_mgr', 'Dokan Pro module manager unavailable', [ 'status' => 500 ] );
                    }
                    dokan_pro()->module->activate_modules( [ 'product_advertising' ], true );
                    if ( ! class_exists( '\WeDevs\DokanPro\Modules\ProductAdvertisement\Helper' ) ) {
                        return new WP_Error( 'dokan_test_no_padv_helper', 'Product Advertisement module did not load', [ 'status' => 500 ] );
                    }
                    $cost = $request->get_param( 'cost' );
                    $cost = ( $cost === null || $cost === '' ) ? '15' : wc_format_decimal( $cost, 2 );
                    $opt  = get_option( 'dokan_product_advertisement', [] );
                    if ( ! is_array( $opt ) ) {
                        $opt = [];
                    }
                    $opt['per_product_enabled'] = 'on';
                    $opt['cost']                = $cost;
                    update_option( 'dokan_product_advertisement', $opt );
                    if ( empty( \WeDevs\DokanPro\Modules\ProductAdvertisement\Helper::get_advertisement_base_product() ) ) {
                        \WeDevs\DokanPro\Modules\ProductAdvertisement\Helper::create_advertisement_base_product();
                    }
                    return rest_ensure_response(
                        [
                            'ok'              => true,
                            'active'          => dokan_pro()->module->is_active( 'product_advertising' ),
                            'cost'            => $cost,
                            'base_product_id' => \WeDevs\DokanPro\Modules\ProductAdvertisement\Helper::get_advertisement_base_product(),
                        ]
                    );
                },
            ]
        );

        register_rest_route(
            'dokan-test-express/v1',
            '/is-product-advertised',
            [
                'methods'             => 'GET',
                'permission_callback' => 'dokan_stripe_express_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    if ( ! class_exists( '\WeDevs\DokanPro\Modules\ProductAdvertisement\Helper' ) ) {
                        return new WP_Error( 'dokan_test_no_padv_helper', 'Product Advertisement module not active', [ 'status' => 500 ] );
                    }
                    $product_id = absint( $request->get_param( 'product_id' ) );
                    if ( ! $product_id ) {
                        return new WP_Error( 'dokan_test_no_product', 'product_id is required', [ 'status' => 400 ] );
                    }
                    return rest_ensure_response(
                        [
                            'ok'         => true,
                            'product_id' => $product_id,
                            'advertised' => (bool) \WeDevs\DokanPro\Modules\ProductAdvertisement\Helper::is_product_advertised( $product_id ),
                        ]
                    );
                },
            ]
        );
    }
);
