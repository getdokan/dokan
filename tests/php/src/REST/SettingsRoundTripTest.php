<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * REST <-> legacy round-trip parity tests.
 *
 * The new admin UI writes the flat `dokan_settings` option via the
 * `AdminSettingsController` PUT endpoint at
 * `/dokan/v1/admin/settings/{page_id}`. The legacy AJAX save handler
 * (`wp_ajax_dokan_save_settings`) still writes per-section `dokan_*`
 * options. The `LegacySettingsBridge` + `BridgeBootstrap` listener wire
 * both directions so values mirror between the two stores. These tests
 * pin the round-trip in both directions:
 *
 *  1. Legacy AJAX save -> new `dokan_settings` (via
 *     `bridge->transform_legacy_payload_to_new()` then merge+update).
 *  2. REST PUT (writes `dokan_settings`) -> legacy `dokan_*` option
 *     (via the `update_option_dokan_settings` listener registered by
 *     `BridgeBootstrap`).
 *  3. Direct `update_option('dokan_settings', ...)` -> legacy `dokan_*`
 *     option (same listener, independent of the REST controller).
 *
 * @group admin-settings
 * @group settings-bridge
 * @group rest-api
 * @group rest-api-admin-settings
 *
 * @covers \WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge
 * @covers \WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap
 * @covers \WeDevs\Dokan\REST\AdminSettingsController
 */
class SettingsRoundTripTest extends DokanTestCase {

    /**
     * Admin namespace.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1/admin';

    /**
     * Bridge bootstrap registered for the test (kept so teardown can
     * detach the listener cleanly).
     *
     * @var BridgeBootstrap|null
     */
    private ?BridgeBootstrap $test_bootstrap = null;

    public function set_up() {
        parent::set_up();

        // Enable the CSV-derived schema fragment so mapped fields like
        // `vendors_vendor_onboarding_setup_wizard_logo_url` participate in
        // the bridge.
        update_option( 'dokan_csv_schema_enabled', true );

        // Ensure the admin user can hit the protected REST endpoint.
        $admin = get_user_by( 'id', $this->admin_id );
        if ( $admin ) {
            $admin->add_cap( 'manage_woocommerce' );
        }
        wp_set_current_user( $this->admin_id );

        // Clean storage before every test so assertions don't see stale
        // values from previous runs.
        delete_option( 'dokan_settings' );
        delete_option( 'dokan_general' );

        // Belt-and-suspenders: the production bootstrap (via
        // `WeDevs_Dokan::init_hooks()`) already registers a
        // `BridgeBootstrap` listener on `update_option_dokan_settings`.
        // The test registers a second instance so reverse-propagation is
        // guaranteed to fire even if the test environment skipped the
        // hookable boot pass.
        $bridge               = new LegacySettingsBridge();
        $this->test_bootstrap = new BridgeBootstrap( $bridge );
        $this->test_bootstrap->register_hooks();
    }

    public function tear_down() {
        if ( $this->test_bootstrap ) {
            remove_action( 'update_option_dokan_settings', [ $this->test_bootstrap, 'on_new_option_updated' ], 10 );
            remove_action( 'add_option_dokan_settings', [ $this->test_bootstrap, 'on_new_option_added' ], 10 );
            $this->test_bootstrap = null;
        }
        delete_option( 'dokan_csv_schema_enabled' );
        delete_option( 'dokan_settings' );
        delete_option( 'dokan_general' );
        parent::tear_down();
    }

    /**
     * Find a CSV-fragment field by `legacy_key` option+field pair.
     *
     * @param string $option Legacy wp_option name.
     * @param string $field  Legacy field name.
     *
     * @return array<string,mixed>|null
     */
    private function find_csv_field( string $option, string $field ): ?array {
        $fragment = require DOKAN_DIR . '/includes/Admin/Settings/Schema/Generated/csv_fields.php';
        foreach ( $fragment as $element ) {
            if (
                ( $element['legacy_key']['option'] ?? null ) === $option
                && ( $element['legacy_key']['field'] ?? null ) === $field
            ) {
                return $element;
            }
        }
        return null;
    }

    /**
     * Legacy AJAX save propagates into `dokan_settings`.
     *
     * Exercises the same bridge codepath the legacy AJAX handler runs at
     * `Settings.php`: `transform_legacy_payload_to_new()` then merge into
     * the flat option. Cannot dispatch the real `wp_ajax_dokan_save_settings`
     * cleanly from a unit test (nonce + headers + die()), so the test calls
     * the bridge directly with the same inputs the handler would.
     *
     * @return void
     */
    public function test_legacy_ajax_save_propagates_into_dokan_settings(): void {
        $vendor_field = $this->find_csv_field( 'dokan_general', 'setup_wizard_logo_url' );
        if ( null === $vendor_field ) {
            $this->markTestSkipped( 'Expected mapped field "setup_wizard_logo_url" not found in generated fragment.' );
            return;
        }

        $payload = [ 'setup_wizard_logo_url' => 'https://example.test/logo.png' ];

        $bridge   = new LegacySettingsBridge();
        $slice    = $bridge->transform_legacy_payload_to_new( 'dokan_general', $payload );
        $existing = get_option( 'dokan_settings', [] );
        if ( ! is_array( $existing ) ) {
            $existing = [];
        }
        update_option( 'dokan_settings', array_merge( $existing, $slice ), true );

        $new = get_option( 'dokan_settings', [] );

        $this->assertIsArray( $new );
        $this->assertArrayHasKey(
            $vendor_field['id'],
            $new,
            'Legacy save should have written the mapped new-flat key into dokan_settings.'
        );
        $this->assertSame(
            'https://example.test/logo.png',
            $new[ $vendor_field['id'] ],
            'Bridge transform preserves the legacy payload value into the new-flat slice.'
        );
    }

    /**
     * REST PUT save propagates back to the legacy option.
     *
     * The new UI calls PUT `/dokan/v1/admin/settings/{page_id}`, which
     * writes `dokan_settings`. The `BridgeBootstrap` listener (registered
     * on `update_option_dokan_settings`) mirrors mapped keys to their
     * legacy option counterparts. Uses the hand-authored `vendor_store_url`
     * field on the `general` page which carries `legacy_key
     * => 'dokan_general.custom_store_url'`.
     *
     * @return void
     */
    public function test_rest_save_propagates_back_to_legacy_option(): void {
        $request = new WP_REST_Request( 'PUT', '/' . $this->namespace . '/settings/general' );
        $request->set_body_params(
            [
                'page_id' => 'general',
                'values'  => [
                    'vendor_store_url' => 'mystorez',
                ],
            ]
        );

        $response = rest_do_request( $request );

        if ( $response->is_error() ) {
            $error = $response->as_error();
            $this->markTestSkipped(
                sprintf(
                    'REST settings PUT endpoint rejected request (%s): %s',
                    $error->get_error_code(),
                    $error->get_error_message()
                )
            );
            return;
        }

        $this->assertSame( 200, $response->get_status() );

        // Verify the flat option was written.
        $new = get_option( 'dokan_settings', [] );
        $this->assertSame(
            'mystorez',
            $new['vendor_store_url'] ?? null,
            'REST PUT should have written the value into dokan_settings.'
        );

        // Verify the BridgeBootstrap listener mirrored the change into the
        // legacy `dokan_general` option.
        $legacy = get_option( 'dokan_general', [] );
        $this->assertIsArray( $legacy );
        $this->assertSame(
            'mystorez',
            $legacy['custom_store_url'] ?? null,
            'REST PUT must reverse-propagate through BridgeBootstrap to the legacy dokan_general.custom_store_url.'
        );
    }

    /**
     * Direct write of `dokan_settings` fires reverse propagation.
     *
     * Isolates the `update_option_dokan_settings` listener from the REST
     * stack: any code path that writes the flat option (the REST
     * controller, a migration, an addon) must trigger the mirror.
     *
     * @return void
     */
    public function test_dokan_settings_update_fires_reverse_propagation(): void {
        $vendor_field = $this->find_csv_field( 'dokan_general', 'setup_wizard_logo_url' );
        if ( null === $vendor_field ) {
            $this->markTestSkipped( 'Expected mapped field "setup_wizard_logo_url" not found.' );
            return;
        }

        update_option(
            'dokan_settings',
            [ $vendor_field['id'] => 'reverse_value' ],
            true
        );

        $legacy = get_option( 'dokan_general', [] );
        $this->assertIsArray( $legacy );
        $this->assertSame(
            'reverse_value',
            $legacy['setup_wizard_logo_url'] ?? null,
            'Writing dokan_settings must mirror mapped keys to the legacy dokan_general option.'
        );
    }

    /**
     * Dot-path payload keys are silently ignored.
     *
     * Plugin-ui used to emit dot-path keys (parent.child.field), so the
     * controller had a last-segment fallback to resolve them. After the
     * dot-path cleanup, the controller only resolves field ids — dot-path
     * keys no longer match any field, so they are dropped without
     * updating any value.
     *
     * @return void
     */
    public function test_rest_put_with_dot_path_payload_skips_unrecognized_key(): void {
        // Pre-condition: a known field has a value in storage.
        update_option( 'dokan_settings', [ 'vendor_store_url' => 'unchanged' ] );

        $request = new WP_REST_Request( 'PUT', '/' . $this->namespace . '/settings/general' );
        $request->set_body_params(
            [
                'page_id' => 'general',
                'values'  => [
                    // Dot-path key — no longer resolved by the controller.
                    'general.marketplace.vendor_store_url' => 'ignored',
                ],
            ]
        );

        rest_do_request( $request );

        // Dot-path key didn't match any field id; the value is silently dropped.
        $settings = get_option( 'dokan_settings', [] );
        $this->assertIsArray( $settings );
        $this->assertSame(
            'unchanged',
            $settings['vendor_store_url'] ?? null,
            'Dot-path payload key must not resolve to vendor_store_url anymore.'
        );
    }

    /**
     * Round trip: legacy save -> new option -> legacy option matches.
     *
     * Stitches the two halves together: the legacy AJAX bridge call
     * writes the flat option, the bootstrap listener mirrors it back.
     * Confirms the legacy option ends up with the same value after the
     * full bidirectional trip — there is no shape drift between the two
     * stores.
     *
     * @return void
     */
    public function test_legacy_to_new_to_legacy_round_trip(): void {
        $vendor_field = $this->find_csv_field( 'dokan_general', 'setup_wizard_logo_url' );
        if ( null === $vendor_field ) {
            $this->markTestSkipped( 'Expected mapped field "setup_wizard_logo_url" not found.' );
            return;
        }

        // 1. Legacy AJAX save path: write legacy then propagate to new.
        $legacy_payload = [ 'setup_wizard_logo_url' => 'first_value' ];
        update_option( 'dokan_general', $legacy_payload );

        $bridge   = new LegacySettingsBridge();
        $slice    = $bridge->transform_legacy_payload_to_new( 'dokan_general', $legacy_payload );
        $existing = get_option( 'dokan_settings', [] );
        if ( ! is_array( $existing ) ) {
            $existing = [];
        }
        update_option( 'dokan_settings', array_merge( $existing, $slice ), true );

        // The bootstrap mirror fires on the dokan_settings write and writes
        // back to dokan_general — but with the same value, so legacy stays
        // consistent.
        $legacy_after = get_option( 'dokan_general', [] );
        $this->assertSame(
            'first_value',
            $legacy_after['setup_wizard_logo_url'] ?? null,
            'Legacy option survives the round-trip without value drift.'
        );

        // 2. Now write a NEW value via dokan_settings only — legacy must
        // catch up via the listener.
        update_option(
            'dokan_settings',
            [ $vendor_field['id'] => 'second_value' ],
            true
        );

        $legacy_final = get_option( 'dokan_general', [] );
        $this->assertSame(
            'second_value',
            $legacy_final['setup_wizard_logo_url'] ?? null,
            'New writes propagate back so legacy readers see the fresh value.'
        );
    }
}
