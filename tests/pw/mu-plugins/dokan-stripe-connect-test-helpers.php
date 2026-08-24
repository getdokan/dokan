<?php
/**
 * Plugin Name: Dokan Stripe Connect — E2E Test Helpers
 * Description: TEST-ONLY REST routes (namespace `dokan-test-connect/v1`) for the Stripe
 *              Connect e2e suite: configure the gateway + module, seed/clear a connected
 *              vendor (`dokan_connected_vendor_id` scalar meta), inject webhook events
 *              into the module's EventFactory, and trigger a Dokan API refund
 *              (method=1 → the module's `dokan_refund_request_created` handler runs the
 *              Stripe refund + transfer reversal). NOT for production use.
 *
 *              Mirrors dokan-stripe-express-test-helpers.php, re-pointed at the Stripe
 *              CONNECT gateway (`dokan-stripe-connect`) and module (`stripe`). There is
 *              deliberately no "restore express" route here: the Express helper's own
 *              /configure-stripe-express already flips the modules the other way, and the
 *              suite calls that.
 *
 * @package Dokan\Tests
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'dokan_stripe_connect_test_can_manage' ) ) {
    function dokan_stripe_connect_test_can_manage() {
        return current_user_can( 'manage_woocommerce' );
    }
}

/**
 * Re-read the module's cached gateway settings after the option row is written.
 *
 * RetrieveSettings is a singleton that loads `woocommerce_dokan-stripe-connect_settings`
 * once per request in boot(). Without this re-boot, every Helper::is_ready() /
 * get_secret_key() call later in the SAME request still sees the pre-write values, so a
 * fresh environment reports "not ready" immediately after being configured.
 */
if ( ! function_exists( 'dokan_stripe_connect_test_reload_settings' ) ) {
    function dokan_stripe_connect_test_reload_settings() {
        if ( class_exists( '\WeDevs\DokanPro\Modules\Stripe\Settings\RetrieveSettings' ) ) {
            \WeDevs\DokanPro\Modules\Stripe\Settings\RetrieveSettings::instance()->boot();
        }
    }
}

add_action(
    'rest_api_init',
    function () {
        // ------------------------------------------------------------------
        // /configure-stripe-connect — idempotent per-file gateway + module config.
        // Activate the `stripe` module, deactivate the conflicting `stripe_express`
        // module, write the gateway settings from the posted test keys, enable the
        // dokan-stripe-connect withdraw method. Returns readiness flags.
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-connect/v1',
            '/configure-stripe-connect',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_connect_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    $result = [ 'ok' => true ];

                    if ( ! function_exists( 'dokan_pro' ) || empty( dokan_pro()->module ) ) {
                        return rest_ensure_response(
                            [
                                'ok'      => true,
                                'skipped' => 'dokan_pro_absent',
                            ]
                        );
                    }

                    // 1) Modules — Connect ON, Express OFF (they conflict: only one
                    // Stripe gateway can own the checkout at a time).
                    dokan_pro()->module->activate_modules( [ 'stripe' ], true );
                    if ( method_exists( dokan_pro()->module, 'deactivate_modules' ) ) {
                        dokan_pro()->module->deactivate_modules( [ 'stripe_express' ] );
                    }
                    // Enforce the active-modules option directly. activate_modules() and
                    // deactivate_modules() both read get_active_modules() WITHOUT force, so on a
                    // fresh environment the conflicting module is not reliably removed. Reconcile
                    // the option here, preserving every other active module.
                    $active_modules = array_values( array_unique( (array) get_option( 'dokan_pro_active_modules', [] ) ) );
                    $active_modules = array_values( array_diff( $active_modules, [ 'stripe_express' ] ) );
                    if ( ! in_array( 'stripe', $active_modules, true ) ) {
                        $active_modules[] = 'stripe';
                    }
                    update_option( 'dokan_pro_active_modules', $active_modules );

                    $result['stripe_active']         = in_array( 'stripe', $active_modules, true );
                    $result['stripe_express_active'] = in_array( 'stripe_express', $active_modules, true );

                    // 2) Gateway settings — MERGE so title/description survive.
                    $pub    = (string) $request->get_param( 'publishable' );
                    $sec    = (string) $request->get_param( 'secret' );
                    $client = (string) $request->get_param( 'client_id' );
                    if ( '' !== $pub && '' !== $sec ) {
                        $settings = get_option( 'woocommerce_dokan-stripe-connect_settings', [] );
                        if ( ! is_array( $settings ) ) {
                            $settings = [];
                        }
                        $merge = [
                            'enabled'              => 'yes',
                            'testmode'             => 'yes',
                            'test_publishable_key' => $pub,
                            'test_secret_key'      => $sec,
                            'saved_cards'          => 'yes',
                        ];
                        // Helper::is_ready() requires a client id on top of the key pair.
                        // Without it the gateway never appears at checkout.
                        if ( '' !== $client ) {
                            $merge['test_client_id'] = $client;
                        }
                        $settings = array_merge( $settings, $merge );
                        update_option( 'woocommerce_dokan-stripe-connect_settings', $settings );
                        dokan_stripe_connect_test_reload_settings();
                        $result['gateway_configured'] = true;
                    }

                    // 3) Withdraw method — surfaces the vendor connect UI.
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

                    // 4) Arbitrary gateway-settings overrides (key => value), merged into the
                    // settings array. Tests change settings THIS way rather than through the WC
                    // settings screen — e.g. seller_pays_the_processing_fee, enable_3d_secure,
                    // allow_non_connected_sellers.
                    $overrides = $request->get_param( 'settings' );
                    if ( is_array( $overrides ) && ! empty( $overrides ) ) {
                        $s = get_option( 'woocommerce_dokan-stripe-connect_settings', [] );
                        if ( ! is_array( $s ) ) {
                            $s = [];
                        }
                        $s = array_merge( $s, $overrides );
                        update_option( 'woocommerce_dokan-stripe-connect_settings', $s );
                        dokan_stripe_connect_test_reload_settings();
                        $result['settings_overridden'] = array_keys( $overrides );
                    }

                    // Readiness (best-effort) — needs valid keys AND a client id.
                    if ( class_exists( '\WeDevs\DokanPro\Modules\Stripe\Helper' ) ) {
                        $result['api_ready'] = \WeDevs\DokanPro\Modules\Stripe\Helper::is_ready();
                    }

                    return rest_ensure_response( $result );
                },
            ]
        );

        // ------------------------------------------------------------------
        // /seed-connect-vendor — write the connected-account meta so a vendor renders as
        // connected and (with a REAL acct_) can receive transfers, WITHOUT driving the
        // Stripe OAuth flow. Connect stores a plain scalar account id, unlike Express's
        // account_info array.
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-connect/v1',
            '/seed-connect-vendor',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_connect_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    $vendor_id  = absint( $request->get_param( 'vendor_id' ) );
                    $account_id = (string) $request->get_param( 'account_id' );
                    if ( ! $vendor_id || '' === $account_id ) {
                        return new WP_Error( 'dokan_test_bad_params', 'vendor_id and account_id are required', [ 'status' => 400 ] );
                    }

                    update_user_meta( $vendor_id, 'dokan_connected_vendor_id', $account_id );

                    // A vendor is "connected" through TWO metas, and the module reads them in
                    // different places:
                    //   dokan_connected_vendor_id  → the transfer destination (IntentController)
                    //   _stripe_connect_access_key → the checkout guard (Validation.php:134), the
                    //                                withdraw method, and the webhook account lookup
                    // A real OAuth connect writes both together (RegisterWithdrawMethods.php:219),
                    // so seeding only the first produces a vendor that can RECEIVE money but is
                    // still refused at the classic checkout. Both are written here for that reason.
                    //
                    // The platform secret key is the default access key: these are custom accounts
                    // under this same platform, so it is a key that genuinely works for them, and
                    // WebhookHandler::handle_events() uses the value as an API key rather than only
                    // checking that it exists. A placeholder string would pass the guard and then
                    // fail the first real Stripe call.
                    $access_key = $request->get_param( 'access_key' );
                    if ( null === $access_key || '' === $access_key ) {
                        $access_key = class_exists( '\WeDevs\DokanPro\Modules\Stripe\Helper' )
                            ? \WeDevs\DokanPro\Modules\Stripe\Helper::get_secret_key()
                            : '';
                    }
                    if ( '' !== $access_key ) {
                        update_user_meta( $vendor_id, '_stripe_connect_access_key', (string) $access_key );
                    }

                    return rest_ensure_response(
                        [
                            'ok'             => true,
                            'vendor_id'      => $vendor_id,
                            'account_id'     => $account_id,
                            'access_key_set' => '' !== $access_key,
                        ]
                    );
                },
            ]
        );

        // ------------------------------------------------------------------
        // /clear-connect-vendor — undo seed-connect-vendor.
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-connect/v1',
            '/clear-connect-vendor',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_connect_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    $vendor_id = absint( $request->get_param( 'vendor_id' ) );
                    if ( ! $vendor_id ) {
                        return new WP_Error( 'dokan_test_bad_params', 'vendor_id is required', [ 'status' => 400 ] );
                    }
                    delete_user_meta( $vendor_id, 'dokan_connected_vendor_id' );
                    delete_user_meta( $vendor_id, '_stripe_connect_access_key' );
                    return rest_ensure_response(
                        [
                            'ok'        => true,
                            'vendor_id' => $vendor_id,
                        ]
                    );
                },
            ]
        );

        // ------------------------------------------------------------------
        // /connect-webhook — inject a Stripe event DIRECTLY into the module's EventFactory,
        // bypassing the live ?wc-api=dokan_stripe endpoint's Event::retrieve() re-fetch.
        // Drives out-of-order and duplicate-delivery cases with a synthetic object.
        // Returns whether handle() threw, and whether it was a PHP \Error (an uncatchable
        // fatal in production).
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-connect/v1',
            '/connect-webhook',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_connect_test_can_manage',
                'callback'            => function ( WP_REST_Request $request ) {
                    if ( ! class_exists( '\WeDevs\DokanPro\Modules\Stripe\DokanStripe' ) || ! class_exists( '\Stripe\Event' ) ) {
                        return new WP_Error( 'dokan_test_no_stripe_connect', 'Stripe Connect module / SDK not loaded', [ 'status' => 500 ] );
                    }

                    $type        = $request->get_param( 'type' );
                    $data_object = $request->get_param( 'data_object' );
                    $account     = $request->get_param( 'account' );
                    if ( empty( $type ) || ! is_array( $data_object ) ) {
                        return new WP_Error( 'dokan_test_bad_payload', 'type (string) and data_object (object) are required', [ 'status' => 400 ] );
                    }

                    $supported = \WeDevs\DokanPro\Modules\Stripe\Helper::get_supported_webhook_events();
                    if ( ! array_key_exists( $type, $supported ) ) {
                        return new WP_Error(
                            'dokan_test_unsupported_event',
                            sprintf( 'Event type %s is not in get_supported_webhook_events()', $type ),
                            [ 'status' => 400 ]
                        );
                    }

                    // Set the platform secret key so retrieves inside the handler resolve.
                    if ( class_exists( '\WeDevs\DokanPro\Modules\Stripe\Helper' ) && class_exists( '\Stripe\Stripe' ) ) {
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
                        \WeDevs\DokanPro\Modules\Stripe\DokanStripe::events()->get( $event )->handle();
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
        // `dokan_refund_request_created`, which the Connect module's Refund class handles
        // (Stripe refund + transfer reversal). Optional partial `amount`.
        // ------------------------------------------------------------------
        register_rest_route(
            'dokan-test-connect/v1',
            '/refund',
            [
                'methods'             => 'POST',
                'permission_callback' => 'dokan_stripe_connect_test_can_manage',
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
                    $collect         = function ( $item_id, $item ) use ( &$item_totals, &$item_tax_totals ) {
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

                    $amount = $request->get_param( 'amount' );
                    if ( null !== $amount && '' !== $amount ) {
                        $first_item_id = array_key_first( $order->get_items() );
                        $args          = [
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
                            'method'          => '1',
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
