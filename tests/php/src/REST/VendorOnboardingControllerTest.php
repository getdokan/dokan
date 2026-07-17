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
                throw new SetupWizardRedirectInterrupt( $location );
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
                $captured['bag_value'] = isset( $_POST['dokan_store_categories'] ) ? $_POST['dokan_store_categories'] : null; // phpcs:ignore WordPress.Security.NonceVerification.Missing
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
        $this->assertSame( [ 'sentinel' => 'kept' ], $_POST );

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
                $captured['bag']      = isset( $_POST['settings'] ) ? $_POST['settings'] : null; // phpcs:ignore WordPress.Security.NonceVerification.Missing
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
        $this->assertArrayNotHasKey( 'declaration', $row['payment']['bank'] );
        $this->assertSame( [ 'value' => 'keep-me' ], $row['payment']['dokan_custom'] );

        // Bank wins the completion weight; the improvement over legacy: Seam B fired (vendor cache invalidates).
        $this->assertSame( 15, $row['profile_completion']['bank'] );
        $this->assertCount( 1, $this->seam_b_calls );
        $this->assertSame( 0, $this->seam_a_calls );

        $this->assertSame( $this->seller_id1, $captured['store_id'] );
        $this->assertSame( 'golden.vendor@example.com', $captured['bag']['paypal']['email'] );
    }

    /**
     * @test
     */
    public function payment_partial_bank_is_rejected() {
        wp_set_current_user( $this->seller_id1 );
        $row_before = $this->get_profile_meta( $this->seller_id1 );

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
    }
}
