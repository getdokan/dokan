<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Test\Helpers\SetupWizardRedirectInterrupt;
use WeDevs\Dokan\Test\Helpers\TestableSellerSetupWizard;
use WeDevs\Dokan\Vendor\SetupWizard;

/**
 * Contract tests for the setup wizard REST save path
 * (`PUT /dokan/v1/vendor-onboarding/store`).
 *
 * The load-bearing one is the differential: the same store-step input driven
 * through the legacy wizard `$_POST` pipeline and through REST must land the
 * identical owned keys in `dokan_profile_settings`.
 *
 * @group setup-wizard
 */
class VendorOnboardingControllerTest extends DokanTestCase {

    /**
     * Route under test.
     *
     * @var string
     */
    protected $route = '/dokan/v1/vendor-onboarding/store';

    /**
     * Fires on every dokan_store_profile_saved with the raw args.
     *
     * @var array
     */
    protected $seam_b_calls = [];

    /**
     * How many times the Seam A filter ran.
     *
     * @var int
     */
    protected $seam_a_calls = 0;

    public function set_up() {
        parent::set_up();

        $_POST = [];

        // The payment step describes only the methods the admin enabled, and saves nothing else.
        update_option( 'dokan_withdraw', [ 'withdraw_methods' => [ 'paypal' => 'paypal', 'bank' => 'bank' ] ] );

        $this->seam_b_calls = [];
        $this->seam_a_calls = 0;

        add_action(
            'dokan_store_profile_saved',
            function ( ...$args ) {
                $this->seam_b_calls[] = $args;
            },
            10,
            3
        );

        add_filter(
            'dokan_store_profile_settings_args',
            function ( $args ) {
                $this->seam_a_calls++;
                return $args;
            }
        );
    }

    public function tear_down() {
        $_POST = [];
        parent::tear_down();
    }

    /**
     * The address/map/email payload both save paths receive.
     */
    protected function owned_field_values(): array {
        return [
            'address'    => [
                'street_1' => '123 Golden Street',
                'street_2' => 'Suite 7',
                'city'     => 'Dhaka',
                'zip'      => '1207',
                'country'  => 'US',
                'state'    => 'CA',
            ],
            'store_map'  => [
                'location'     => '23.7461,90.3742',
                'find_address' => 'Dhanmondi, Dhaka',
            ],
            'show_email' => 'yes',
        ];
    }

    protected function dispatch_put( array $values ) {
        return $this->put_request( $this->route, [ 'values' => $values ] );
    }

    protected function get_profile_meta( int $vendor_id ) {
        return get_user_meta( $vendor_id, 'dokan_profile_settings', true );
    }

    /**
     * Expose the map field so the REST payload can carry location/find_address
     * — the same admin gate the legacy view checks.
     */
    protected function enable_map_provider(): void {
        update_option(
            'dokan_appearance',
            [
                'map_api_source' => 'google_maps',
                'gmap_api_key'   => 'test-map-key',
            ]
        );
    }

    /**
     * THE differential: legacy `$_POST` pipeline on one vendor, REST PUT on
     * another, identical starting rows → identical owned keys, byte for byte.
     *
     * @test
     */
    public function rest_save_matches_legacy_save_on_owned_keys() {
        $this->enable_map_provider();

        // Legacy pipeline on seller 1 — redirect interrupted the way the golden master does.
        add_filter(
            'wp_redirect',
            function ( $location ) {
                throw new SetupWizardRedirectInterrupt( $location ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Control-flow signal, never rendered.
            }
        );

        wp_set_current_user( $this->seller_id1 );
        $wizard = new TestableSellerSetupWizard();
        $wizard->prime( $this->seller_id1 );

        $values = $this->owned_field_values();
        $_POST  = [
            '_wpnonce'     => wp_create_nonce( 'dokan-seller-setup' ),
            'address'      => $values['address'],
            'location'     => $values['store_map']['location'],
            'find_address' => $values['store_map']['find_address'],
            'show_email'   => '1',
        ];

        try {
            $wizard->dokan_setup_store_save();
            $this->fail( 'The legacy save should have redirected.' );
        } catch ( SetupWizardRedirectInterrupt $interrupt ) {
            $_POST = [];
        }

        // REST pipeline on seller 2.
        wp_set_current_user( $this->seller_id2 );
        $response = $this->dispatch_put( $values );
        $this->assertSame( 200, $response->get_status() );

        $legacy_row = $this->get_profile_meta( $this->seller_id1 );
        $rest_row   = $this->get_profile_meta( $this->seller_id2 );

        foreach ( [ 'address', 'location', 'find_address', 'show_email', 'profile_completion' ] as $owned_key ) {
            $this->assertSame(
                $legacy_row[ $owned_key ],
                $rest_row[ $owned_key ],
                "Owned key '{$owned_key}' diverged between the legacy and REST save paths."
            );
        }

        // Both paths ran the same seam contract: one seam B each, zero seam A.
        $this->assertCount( 2, $this->seam_b_calls );
        $this->assertSame( 0, $this->seam_a_calls );
    }

    /**
     * The legacy wizard action fires on REST saves with the REAL hydrated
     * instance and the schema-declared `$_POST` bag, and the superglobal is
     * restored afterwards — the contract Pro's StoreCategory relies on.
     *
     * @test
     */
    public function legacy_wizard_action_fires_hydrated_with_post_bag() {
        // A stand-in for Pro's category field: non_meta (mapper skips it) + a legacy_post_key for the bag.
        add_filter(
            'dokan_setup_wizard_schema',
            function ( $elements ) {
                $elements[] = [
                    'id'              => 'test_store_categories',
                    'type'            => 'field',
                    'variant'         => 'text',
                    'section_id'      => 'store_details',
                    'non_meta'        => true,
                    'legacy_post_key' => 'dokan_store_categories',
                ];
                return $elements;
            }
        );

        $captured = [];
        add_action(
            'dokan_seller_wizard_store_field_save',
            function ( $wizard ) use ( &$captured ) {
                $captured['is_wizard'] = $wizard instanceof SetupWizard;
                $captured['store_id']  = $wizard->store_id;
                // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Asserting the compat bag verbatim; sanitizing would defeat the assertion.
                $captured['bag_value'] = $_POST['dokan_store_categories'] ?? null;
            }
        );

        $_POST = [ 'sentinel' => 'kept' ];

        wp_set_current_user( $this->seller_id1 );
        $values                          = $this->owned_field_values();
        $values['test_store_categories'] = '42';
        unset( $values['store_map'] );

        $response = $this->dispatch_put( $values );

        $this->assertSame( 200, $response->get_status() );
        $this->assertTrue( $captured['is_wizard'] );
        $this->assertSame( $this->seller_id1, $captured['store_id'] );
        $this->assertSame( '42', $captured['bag_value'] );

        // The overlay is scoped: the superglobal is restored once the action returns.
        $this->assertSame( [ 'sentinel' => 'kept' ], $_POST ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Asserting the superglobal was restored.

        // non_meta keeps the stand-in out of the profile row under both its id and its POST key.
        $row = $this->get_profile_meta( $this->seller_id1 );
        $this->assertArrayNotHasKey( 'test_store_categories', $row );
        $this->assertArrayNotHasKey( 'dokan_store_categories', $row );
    }

    /**
     * @test
     */
    public function incomplete_address_is_rejected_with_field_errors() {
        wp_set_current_user( $this->seller_id1 );
        $row_before = $this->get_profile_meta( $this->seller_id1 );

        $response = $this->dispatch_put(
            [
                'address' => [ 'street_1' => '123 Golden Street' ],
            ]
        );

        $this->assertSame( 400, $response->get_status() );

        $data = $response->get_data();
        $this->assertSame( 'dokan_rest_validation_failed', $data['code'] );
        $this->assertNotEmpty( $data['data']['errors']['address'] );

        $this->assertSame( $row_before, $this->get_profile_meta( $this->seller_id1 ) );
        $this->assertCount( 0, $this->seam_b_calls );
    }

    /**
     * The payment step: gateway values fold into the nested `payment` array
     * (declaration dropped, untouched gateways preserved), Seam B fires (the
     * legacy payment save never did), and the legacy payment action gets the
     * nested `settings` bag Pro's handlers read.
     *
     * @test
     */
    public function payment_save_persists_gateways_and_replays_legacy_action() {
        wp_set_current_user( $this->seller_id1 );

        // A pre-existing gateway entry must survive a save that doesn't touch it.
        $meta                         = (array) $this->get_profile_meta( $this->seller_id1 );
        $meta['payment']['dokan_custom'] = [ 'value' => 'keep-me' ];
        update_user_meta( $this->seller_id1, 'dokan_profile_settings', $meta );

        $captured = [];
        add_action(
            'dokan_seller_wizard_payment_field_save',
            function ( $wizard ) use ( &$captured ) {
                $captured['store_id'] = $wizard->store_id;
                // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Asserting the compat bag verbatim; sanitizing would defeat the assertion.
                $captured['bag'] = $_POST['settings'] ?? null;
            }
        );

        $response = $this->put_request(
            '/dokan/v1/vendor-onboarding/payment',
            [
                'values' => [
                    'payment_methods' => [
                        'paypal' => [ 'email' => 'golden.vendor@example.com' ],
                        'bank'   => [
                            'ac_name'        => 'John Doe',
                            'ac_type'        => 'personal',
                            'ac_number'      => '12345678',
                            'routing_number' => 'BANK1234',
                            'bank_name'      => '',
                            'bank_addr'      => '',
                            'iban'           => '',
                            'swift'          => '',
                            'declaration'    => true,
                        ],
                    ],
                ],
            ]
        );
        $this->assertSame( 200, $response->get_status() );

        $row = $this->get_profile_meta( $this->seller_id1 );

        $this->assertSame( 'golden.vendor@example.com', $row['payment']['paypal']['email'] );
        $this->assertSame( 'John Doe', $row['payment']['bank']['ac_name'] );
        // Stored in the legacy 'on' shape the dashboard form, its validation and the withdraw-log export all read.
        $this->assertSame( 'on', $row['payment']['bank']['declaration'] );
        $this->assertSame( [ 'value' => 'keep-me' ], $row['payment']['dokan_custom'] );

        // Bank wins the completion weight; the improvement over legacy: Seam B fired (vendor cache invalidates).
        $this->assertSame( 15, $row['profile_completion']['bank'] );
        $this->assertCount( 1, $this->seam_b_calls );
        $this->assertSame( 0, $this->seam_a_calls );

        $this->assertSame( $this->seller_id1, $captured['store_id'] );
        $this->assertSame( 'golden.vendor@example.com', $captured['bag']['paypal']['email'] );
    }

    /**
     * Nothing on the payment step is mandatory — it can be finished later from
     * the dashboard — so a half-filled bank form saves as-is.
     *
     * @test
     */
    public function payment_partial_bank_is_accepted() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->put_request(
            '/dokan/v1/vendor-onboarding/payment',
            [
                'values' => [
                    'payment_methods' => [
                        'bank' => [ 'ac_name' => 'John Doe' ],
                    ],
                ],
            ]
        );

        $this->assertSame( 200, $response->get_status() );

        $bank = $this->get_profile_meta( $this->seller_id1 )['payment']['bank'] ?? [];
        $this->assertSame( 'John Doe', $bank['ac_name'] ?? null );
        $this->assertEmpty( $bank['ac_number'] ?? null );
    }

    /**
     * A malformed value is still rejected — the shape checks survive the
     * relaxed required-field rules.
     *
     * @test
     */
    public function payment_malformed_email_is_rejected() {
        wp_set_current_user( $this->seller_id1 );
        $row_before = $this->get_profile_meta( $this->seller_id1 );

        $response = $this->put_request(
            '/dokan/v1/vendor-onboarding/payment',
            [
                'values' => [
                    'payment_methods' => [
                        'paypal' => [ 'email' => 'not-an-email' ],
                    ],
                ],
            ]
        );

        $this->assertSame( 400, $response->get_status() );
        $this->assertNotEmpty( $response->get_data()['data']['errors']['payment_methods'] );
        $this->assertSame( $row_before, $this->get_profile_meta( $this->seller_id1 ) );
    }

    /**
     * @test
     */
    public function permissions_gate_on_dokandar_only() {
        wp_set_current_user( 0 );
        $this->assertSame( 401, $this->get_request( $this->route )->get_status() );

        wp_set_current_user( $this->customer_id );
        $this->assertSame( 403, $this->get_request( $this->route )->get_status() );

        wp_set_current_user( $this->seller_id1 );
        $this->assertSame( 200, $this->get_request( $this->route )->get_status() );
    }

    /**
     * @test
     */
    public function get_returns_the_wizard_schema_with_values() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->route );

        $this->assertSame( 200, $response->get_status() );

        $by_id = [];
        foreach ( $response->get_data() as $element ) {
            $by_id[ $element['id'] ] = $element;
        }

        $this->assertSame( 'page', $by_id['setup_store']['type'] );
        $this->assertSame( 'vendor_address', $by_id['address']['variant'] );
        $this->assertArrayHasKey( 'street_1', $by_id['address']['value'] );

        // No map key configured in this environment → the map field is gated out, like the legacy view.
        $this->assertArrayNotHasKey( 'store_map', $by_id );

        // Server-side hooks stay on the server, as on the Store settings response.
        $this->assertArrayNotHasKey( 'validation_func', $by_id['address'] );
    }

    /**
     * A staff user to act for seller 1, holding only what Pro's Vendor Staff
     * module always grants (`dokandar`) plus the given dashboard capabilities.
     *
     * @param string[] $caps Extra capabilities.
     *
     * @return int Staff user ID.
     */
    protected function create_staff( array $caps = [] ): int {
        $staff_id = self::factory()->user->create( [ 'role' => 'subscriber' ] );
        $staff    = new \WP_User( $staff_id );

        foreach ( array_merge( [ 'vendor_staff', 'dokandar' ], $caps ) as $cap ) {
            $staff->add_cap( $cap );
        }

        update_user_meta( $staff_id, '_vendor_id', $this->seller_id1 );

        return $staff_id;
    }

    /**
     * Staff save into their Vendor's store, so each step needs the dashboard
     * capability that guards the same fields; the Vendor needs only `dokandar`.
     *
     * @test
     */
    public function staff_need_the_matching_dashboard_capability_per_step() {
        $store   = [ 'address' => $this->owned_field_values()['address'] ];
        $payment = [ 'payment_methods' => [ 'paypal' => [ 'email' => 'staff@example.com' ] ] ];

        wp_set_current_user( $this->create_staff() );
        $this->assertSame( 403, $this->put_request( $this->route, [ 'values' => $store ] )->get_status() );
        $this->assertSame( 403, $this->put_request( '/dokan/v1/vendor-onboarding/payment', [ 'values' => $payment ] )->get_status() );
        $this->assertSame( 403, $this->get_request( '/dokan/v1/vendor-onboarding/payment' )->get_status() );

        wp_set_current_user( $this->create_staff( [ 'dokan_view_store_settings_menu' ] ) );
        $this->assertSame( 200, $this->put_request( $this->route, [ 'values' => $store ] )->get_status() );
        $this->assertSame( 403, $this->put_request( '/dokan/v1/vendor-onboarding/payment', [ 'values' => $payment ] )->get_status() );

        wp_set_current_user( $this->create_staff( [ 'dokan_view_store_payment_menu' ] ) );
        $this->assertSame( 200, $this->put_request( '/dokan/v1/vendor-onboarding/payment', [ 'values' => $payment ] )->get_status() );
        $this->assertSame( 'staff@example.com', $this->get_profile_meta( $this->seller_id1 )['payment']['paypal']['email'] );

        wp_set_current_user( $this->seller_id1 );
        $this->assertSame( 200, $this->put_request( '/dokan/v1/vendor-onboarding/payment', [ 'values' => $payment ] )->get_status() );
    }

    /**
     * Only the gateways and field keys the step declares reach `payment`.
     *
     * @test
     */
    public function payment_save_keeps_only_declared_gateways_and_fields() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->put_request(
            '/dokan/v1/vendor-onboarding/payment',
            [
                'values' => [
                    'payment_methods' => [
                        'paypal'        => [
                            'email'       => 'golden.vendor@example.com',
                            'not_a_field' => 'x',
                        ],
                        'bank'          => [
                            'ac_name'   => 'John Doe',
                            'ac_number' => [ 'not', 'a', 'string' ],
                        ],
                        'mangopay'      => [ 'user_id' => '999' ],
                        'made_up_rails' => [ 'k' => 'v' ],
                    ],
                ],
            ]
        );

        $this->assertSame( 200, $response->get_status() );

        $payment = $this->get_profile_meta( $this->seller_id1 )['payment'];

        $this->assertSame( [ 'email' => 'golden.vendor@example.com' ], $payment['paypal'] );
        $this->assertSame( 'John Doe', $payment['bank']['ac_name'] );
        $this->assertArrayNotHasKey( 'ac_number', $payment['bank'] );
        $this->assertArrayNotHasKey( 'mangopay', $payment );
        $this->assertArrayNotHasKey( 'made_up_rails', $payment );
    }

    /**
     * Saving the payment step again must not add its weight again, nor re-add
     * the address weight the store step already counted.
     *
     * @test
     */
    public function payment_save_counts_the_payment_weight_once() {
        wp_set_current_user( $this->seller_id1 );

        update_user_meta(
            $this->seller_id1,
            'dokan_profile_settings',
            [
                'address'            => $this->owned_field_values()['address'],
                'profile_completion' => [
                    'address'       => 10,
                    'progress'      => 10,
                    'progress_vals' => [
                        'address_val'        => 10,
                        'payment_method_val' => 30,
                    ],
                ],
            ]
        );

        $payment = [ 'payment_methods' => [ 'paypal' => [ 'email' => 'golden.vendor@example.com' ] ] ];

        foreach ( [ 1, 2 ] as $save ) {
            $this->assertSame( 200, $this->put_request( '/dokan/v1/vendor-onboarding/payment', [ 'values' => $payment ] )->get_status() );
            $this->assertSame( 40, $this->get_profile_meta( $this->seller_id1 )['profile_completion']['progress'], "after payment save $save" );
        }
    }

    /**
     * With withdraw settings never saved the option defaults to a plain list,
     * and the step must still describe PayPal.
     *
     * @test
     */
    public function payment_step_lists_paypal_when_withdraw_settings_were_never_saved() {
        delete_option( 'dokan_withdraw' );
        wp_set_current_user( $this->seller_id1 );

        $gateways = [];
        foreach ( $this->get_request( '/dokan/v1/vendor-onboarding/payment' )->get_data() as $element ) {
            if ( 'payment_methods' === $element['id'] ) {
                $gateways = wp_list_pluck( $element['gateways'], 'id' );
            }
        }

        $this->assertContains( 'paypal', $gateways );
    }

    /**
     * A payload that leaves a `legacy_post_key` field out replays its current
     * value, so a legacy handler never reads the missing key as "cleared".
     *
     * @test
     */
    public function omitted_legacy_post_fields_replay_their_current_value() {
        wp_set_current_user( $this->seller_id1 );

        add_filter(
            'dokan_setup_wizard_schema',
            function ( $elements, $vendor_id, $step ) {
                if ( 'store' === $step ) {
                    $elements[] = [
                        'id'              => 'legacy_terms',
                        'type'            => 'field',
                        'variant'         => 'text',
                        'section_id'      => 'store_details',
                        'non_meta'        => true,
                        'legacy_post_key' => 'legacy_terms_post',
                        'value'           => 'current-terms',
                    ];
                }

                return $elements;
            },
            10,
            3
        );

        $seen = null;
        add_action(
            'dokan_seller_wizard_store_field_save',
            function () use ( &$seen ) {
                // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Asserting the compat bag verbatim.
                $seen = $_POST['legacy_terms_post'] ?? null;
            }
        );

        $this->assertSame( 200, $this->dispatch_put( [ 'address' => $this->owned_field_values()['address'] ] )->get_status() );
        $this->assertSame( 'current-terms', $seen );
    }
}
