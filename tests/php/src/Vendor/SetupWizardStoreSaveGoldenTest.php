<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Test\Helpers\SetupWizardRedirectInterrupt;
use WeDevs\Dokan\Test\Helpers\TestableSellerSetupWizard;

/**
 * Golden master for the vendor setup wizard store-step save.
 *
 * Originally pinned the legacy `dokan_setup_store_save()` wholesale-write
 * behaviour; now pins the WizardStoreSaver contract (plugin-internal-tasks#2130).
 * The accepted deltas from legacy live in this file as reviewed edits:
 *
 *   - engine defaults are NO LONGER materialized into meta (the legacy write
 *     persisted every `popluate_store_data()` default, e.g. the literal
 *     `payment.paypal = [ 'email' ]`)
 *   - `dokan_vendor_shop_data` filter output is NO LONGER persisted
 *   - seam B's $prev arg is the normalized array ([] instead of '' when the
 *     meta row was absent)
 *
 * Unchanged, and pinned forever: owned keys byte-identical, Seam A
 * (`dokan_store_profile_settings_args`) never fires, seam order, foreign-key
 * survival, the legacy `$_POST['error_*']` channel, and the complete-address
 * re-save progress double-count (parity, not endorsement).
 */
class SetupWizardStoreSaveGoldenTest extends DokanTestCase {

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

    /**
     * Hook-firing order tags.
     *
     * @var array
     */
    protected $sequence = [];

    public function set_up() {
        parent::set_up();

        $_POST = [];

        $this->seam_b_calls = [];
        $this->seam_a_calls = 0;
        $this->sequence     = [];

        // The handler ends in wp_safe_redirect() + exit — the filter throws first so the test survives.
        add_filter(
            'wp_redirect',
            function ( $location ) {
                throw new SetupWizardRedirectInterrupt( $location ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Control-flow signal, never rendered.
            }
        );

        add_action(
            'dokan_store_profile_saved',
            function ( ...$args ) {
                $this->seam_b_calls[] = $args;
                $this->sequence[]     = 'seam_b';
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

        add_action(
            'dokan_seller_wizard_store_field_save',
            function () {
                $this->sequence[] = 'wizard_action';
            }
        );
    }

    public function tear_down() {
        $_POST = [];
        parent::tear_down();
    }

    /**
     * Build a primed wizard for a vendor, exactly as a page load would.
     */
    protected function make_wizard( int $vendor_id ): TestableSellerSetupWizard {
        $wizard = new TestableSellerSetupWizard();
        $wizard->prime( $vendor_id );

        return $wizard;
    }

    /**
     * Run the save handler; returns the redirect target, or null when the
     * handler bailed (nonce/validation) without redirecting.
     */
    protected function run_store_save( TestableSellerSetupWizard $wizard ): ?string {
        try {
            $wizard->dokan_setup_store_save();
        } catch ( SetupWizardRedirectInterrupt $interrupt ) {
            return $interrupt->getMessage();
        }

        return null;
    }

    /**
     * The store-step POST a real browser submit produces.
     */
    protected function valid_store_post(): array {
        return [
            '_wpnonce'     => wp_create_nonce( 'dokan-seller-setup' ),
            'address'      => [
                'street_1' => '123 Golden Street',
                'street_2' => 'Suite 7',
                'city'     => 'Dhaka',
                'zip'      => '1207',
                'country'  => 'US',
                'state'    => 'CA',
            ],
            'location'     => '23.7461,90.3742',
            'find_address' => 'Dhanmondi, Dhaka',
            'show_email'   => '1',
        ];
    }

    protected function get_profile_meta( int $vendor_id ) {
        return get_user_meta( $vendor_id, 'dokan_profile_settings', true );
    }

    /**
     * @test
     */
    public function complete_store_save_persists_owned_keys_and_redirects() {
        wp_set_current_user( $this->seller_id1 );
        $wizard = $this->make_wizard( $this->seller_id1 );
        $_POST  = $this->valid_store_post();

        $location = $this->run_store_save( $wizard );

        $this->assertNotNull( $location, 'A valid save must redirect to the next step.' );
        $this->assertStringContainsString( '_admin_sw_nonce', $location );

        $meta = $this->get_profile_meta( $this->seller_id1 );

        $this->assertSame(
            [
                'street_1' => '123 Golden Street',
                'street_2' => 'Suite 7',
                'city'     => 'Dhaka',
                'zip'      => '1207',
                'country'  => 'US',
                'state'    => 'CA',
            ],
            $meta['address']
        );
        $this->assertSame( '23.7461,90.3742', $meta['location'] );
        $this->assertSame( 'Dhanmondi, Dhaka', $meta['find_address'] );
        $this->assertSame( 'yes', $meta['show_email'] );

        // ACCEPTED DELTA: engine defaults the vendor never posted stay out of the row.
        $this->assertArrayNotHasKey( 'enable_tnc', $meta );
        $this->assertArrayNotHasKey( 'store_seo', $meta );
        $this->assertArrayNotHasKey( 'icon', $meta );

        // Registration seeded progress 20; a complete address adds address_val (10) and appends the key last.
        $this->assertSame(
            [
                'store_name'    => 10,
                'phone'         => 10,
                'next_todo'     => 'banner_val',
                'progress'      => 30,
                'progress_vals' => [
                    'banner_val'          => 15,
                    'profile_picture_val' => 15,
                    'store_name_val'      => 10,
                    'address_val'         => 10,
                    'phone_val'           => 10,
                    'map_val'             => 15,
                    'payment_method_val'  => 15,
                    'social_val'          => [
                        'fb'       => 4,
                        'twitter'  => 2,
                        'youtube'  => 2,
                        'linkedin' => 2,
                    ],
                ],
                'address'       => 10,
            ],
            $meta['profile_completion']
        );
    }

    /**
     * ACCEPTED DELTA (was: wholesale_write_materializes_engine_defaults).
     * The slice write persists ONLY the owned keys — the legacy path used to
     * materialize every engine default here, including the literal
     * `payment.paypal = [ 'email' ]`.
     *
     * @test
     */
    public function slice_write_persists_only_owned_keys_from_empty_meta() {
        delete_user_meta( $this->seller_id1, 'dokan_profile_settings' );

        wp_set_current_user( $this->seller_id1 );
        $wizard = $this->make_wizard( $this->seller_id1 );
        $_POST  = $this->valid_store_post();

        $this->run_store_save( $wizard );

        // The whole row IS the owned slice — nothing materialized, no completion seed to award from.
        $this->assertSame(
            [
                'address'      => [
                    'street_1' => '123 Golden Street',
                    'street_2' => 'Suite 7',
                    'city'     => 'Dhaka',
                    'zip'      => '1207',
                    'country'  => 'US',
                    'state'    => 'CA',
                ],
                'location'     => '23.7461,90.3742',
                'find_address' => 'Dhanmondi, Dhaka',
                'show_email'   => 'yes',
            ],
            $this->get_profile_meta( $this->seller_id1 )
        );

        // ACCEPTED DELTA: seam B's $prev is now the normalized array — legacy passed the raw '' when the row was absent.
        $this->assertCount( 1, $this->seam_b_calls );
        $this->assertSame( [], $this->seam_b_calls[0][2] );
    }

    /**
     * ACCEPTED DELTA (was: vendor_shop_data_filter_output_is_persisted).
     * Read-side `dokan_vendor_shop_data` injections (Pro's taxonomy-derived
     * categories, subscription info, …) no longer leak into the meta row.
     *
     * @test
     */
    public function vendor_shop_data_filter_output_is_no_longer_persisted() {
        add_filter(
            'dokan_vendor_shop_data',
            function ( $shop_info ) {
                $shop_info['golden_synthetic_key'] = 'injected';
                return $shop_info;
            }
        );

        wp_set_current_user( $this->seller_id1 );
        $wizard = $this->make_wizard( $this->seller_id1 );
        $_POST  = $this->valid_store_post();

        $this->run_store_save( $wizard );

        $meta = $this->get_profile_meta( $this->seller_id1 );
        $this->assertArrayNotHasKey( 'golden_synthetic_key', $meta );
    }

    /**
     * @test
     */
    public function foreign_top_level_keys_survive_a_store_save() {
        $meta                     = (array) $this->get_profile_meta( $this->seller_id1 );
        $meta['vendor_biography'] = '<p>Golden bio</p>';
        $meta['order_min_max']    = [
            'enable_vendor_min_max_amount' => 'on',
            'min_amount_to_order'          => '5',
        ];
        update_user_meta( $this->seller_id1, 'dokan_profile_settings', $meta );

        wp_set_current_user( $this->seller_id1 );
        $wizard = $this->make_wizard( $this->seller_id1 );
        $_POST  = $this->valid_store_post();

        $this->run_store_save( $wizard );

        $saved = $this->get_profile_meta( $this->seller_id1 );

        $this->assertSame( '<p>Golden bio</p>', $saved['vendor_biography'] );
        $this->assertSame(
            [
                'enable_vendor_min_max_amount' => 'on',
                'min_amount_to_order'          => '5',
            ],
            $saved['order_min_max']
        );
    }

    /**
     * The seam contract: Seam B fires once with (id, merged, prev) BEFORE the
     * wizard action; Seam A never fires; dokan_store_name is not mirrored.
     *
     * @test
     */
    public function store_save_fires_seam_b_only_and_never_mirrors_store_name() {
        $store_name_before = get_user_meta( $this->seller_id1, 'dokan_store_name', true );
        $meta_before       = $this->get_profile_meta( $this->seller_id1 );

        wp_set_current_user( $this->seller_id1 );
        $wizard = $this->make_wizard( $this->seller_id1 );
        $_POST  = $this->valid_store_post();

        $this->run_store_save( $wizard );

        $this->assertCount( 1, $this->seam_b_calls );
        $this->assertSame( $this->seller_id1, $this->seam_b_calls[0][0] );
        $this->assertSame( '123 Golden Street', $this->seam_b_calls[0][1]['address']['street_1'] );
        $this->assertSame( $meta_before, $this->seam_b_calls[0][2] );

        $this->assertSame( 0, $this->seam_a_calls, 'dokan_store_profile_settings_args must NOT fire on the wizard path.' );
        $this->assertSame( [ 'seam_b', 'wizard_action' ], $this->sequence );

        $this->assertSame( $store_name_before, get_user_meta( $this->seller_id1, 'dokan_store_name', true ) );
    }

    /**
     * Validation failure writes `$_POST['error_*']` flags (the legacy error
     * channel the views re-read), skips the write, and does not redirect.
     *
     * @test
     */
    public function validation_failure_skips_write_and_flags_post_error_keys() {
        $meta_before = $this->get_profile_meta( $this->seller_id1 );

        wp_set_current_user( $this->seller_id1 );
        $wizard = $this->make_wizard( $this->seller_id1 );

        $_POST = $this->valid_store_post();
        unset( $_POST['address']['city'] );

        $location = $this->run_store_save( $wizard );

        $this->assertNull( $location );
        // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotValidated, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Asserting the legacy $_POST error channel verbatim.
        $this->assertSame( 'error', $_POST['error_address[city]'] );
        $this->assertSame( $meta_before, $this->get_profile_meta( $this->seller_id1 ) );
        $this->assertCount( 0, $this->seam_b_calls );
    }

    /**
     * @test
     */
    public function invalid_nonce_is_a_silent_noop() {
        $meta_before = $this->get_profile_meta( $this->seller_id1 );

        wp_set_current_user( $this->seller_id1 );
        $wizard = $this->make_wizard( $this->seller_id1 );

        $_POST             = $this->valid_store_post();
        $_POST['_wpnonce'] = 'not-a-nonce';

        $location = $this->run_store_save( $wizard );

        $this->assertNull( $location );
        $this->assertArrayNotHasKey( 'error_address[city]', $_POST ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Asserting the legacy $_POST error channel stayed untouched.
        $this->assertSame( $meta_before, $this->get_profile_meta( $this->seller_id1 ) );
        $this->assertCount( 0, $this->seam_b_calls );
    }

    /**
     * Re-saving a complete address adds address_val to progress AGAIN — the
     * legacy math has no idempotence guard. Pinned, not endorsed.
     *
     * @test
     */
    public function resaving_a_complete_address_double_counts_progress() {
        wp_set_current_user( $this->seller_id1 );

        $_POST = $this->valid_store_post();
        $this->run_store_save( $this->make_wizard( $this->seller_id1 ) );
        $first = $this->get_profile_meta( $this->seller_id1 );

        $_POST = $this->valid_store_post();
        $this->run_store_save( $this->make_wizard( $this->seller_id1 ) );
        $second = $this->get_profile_meta( $this->seller_id1 );

        $this->assertSame( 30, $first['profile_completion']['progress'] );
        $this->assertSame( 40, $second['profile_completion']['progress'] );
    }
}
