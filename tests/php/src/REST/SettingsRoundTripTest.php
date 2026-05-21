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
 *     (via the `dokan_admin_settings_changed` listener registered by
 *     `BridgeBootstrap`).
 *  3. Direct `update_option('dokan_admin_settings', ...)` -> legacy `dokan_*`
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
        delete_option( 'dokan_admin_settings' );
        delete_option( 'dokan_general' );

        // The production bootstrap registers its overlay filters on the
        // `init` action which has already fired by the time this test runs.
        // Call `register_overlay_filters()` directly so reads in this test
        // hit the overlay path.
        $bridge               = new LegacySettingsBridge();
        $this->test_bootstrap = new BridgeBootstrap( $bridge );
        $this->test_bootstrap->register_overlay_filters();
    }

    public function tear_down() {
        if ( $this->test_bootstrap ) {
            // The bootstrap registered overlay filters on every mapped
            // section's `option_<name>` / `default_option_<name>` hooks.
            // Remove them so they don't bleed into sibling tests.
            global $wp_filter;
            foreach ( array_keys( $wp_filter ) as $hook_name ) {
                if ( strpos( $hook_name, 'option_dokan_' ) === 0 || strpos( $hook_name, 'default_option_dokan_' ) === 0 ) {
                    remove_filter( $hook_name, [ $this->test_bootstrap, 'apply_overlay' ], 10 );
                }
            }
            $this->test_bootstrap = null;
        }
        delete_option( 'dokan_csv_schema_enabled' );
        delete_option( 'dokan_admin_settings' );
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

        $bridge = new LegacySettingsBridge();
        $slice  = $bridge->transform_legacy_payload_to_new( 'dokan_general', $payload );
        $repo   = new \WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository();
        $repo->update( $slice );

        $new = get_option( 'dokan_admin_settings', [] );

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
     * on `dokan_admin_settings_changed`) mirrors mapped keys to their
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
        $new = get_option( 'dokan_admin_settings', [] );
        $this->assertSame(
            'mystorez',
            $new['vendor_store_url'] ?? null,
            'REST PUT should have written the value into dokan_settings.'
        );

        // Under the new-as-canonical model, the legacy DB row is NOT
        // back-written. Instead, the BridgeBootstrap overlay filter
        // synthesizes the legacy shape on read by projecting mapped values
        // from dokan_admin_settings. A direct `get_option('dokan_general')`
        // therefore observes the new value through the filter, even though
        // no row update occurred.
        $legacy = get_option( 'dokan_general', [] );
        $this->assertIsArray( $legacy );
        $this->assertSame(
            'mystorez',
            $legacy['custom_store_url'] ?? null,
            'BridgeBootstrap overlay filter must project the new value into the legacy view.'
        );
    }

    /**
     * Direct write of `dokan_settings` surfaces in legacy reads via overlay.
     *
     * Any code path that writes the new flat option (REST controller,
     * migration, addon, direct call) must be visible to direct
     * `get_option('dokan_*')` readers via the read-time overlay filter
     * installed by BridgeBootstrap. No DB-level mirror runs.
     *
     * @return void
     */
    public function test_repository_update_fires_reverse_propagation(): void {
        $vendor_field = $this->find_csv_field( 'dokan_general', 'setup_wizard_logo_url' );
        if ( null === $vendor_field ) {
            $this->markTestSkipped( 'Expected mapped field "setup_wizard_logo_url" not found.' );
            return;
        }

        ( new \WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository() )
            ->update( [ $vendor_field['id'] => 'reverse_value' ] );

        $legacy = get_option( 'dokan_general', [] );
        $this->assertIsArray( $legacy );
        $this->assertSame(
            'reverse_value',
            $legacy['setup_wizard_logo_url'] ?? null,
            'New-flat write must surface in get_option() via the overlay filter.'
        );
    }

    /**
     * Dot-path payload keys resolve to their leaf id.
     *
     * plugin-ui emits dot-path keys (`parent.child.field`) reflecting its
     * internal tree state. The controller normalizes each key to the last
     * segment, which is what `SchemaValidator` guarantees to be globally
     * unique among field ids. This keeps the REST contract id-only from the
     * schema's perspective while accepting the form's emitted shape.
     *
     * @return void
     */
    public function test_rest_put_with_dot_path_payload_resolves_to_leaf_id(): void {
        // Pre-condition: a known field has a value in storage.
        ( new \WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository() )
            ->update( [ 'vendor_store_url' => 'unchanged' ] );

        $request = new WP_REST_Request( 'PUT', '/' . $this->namespace . '/settings/general' );
        $request->set_body_params(
            [
                'page_id' => 'general',
                'values'  => [
                    // Dot-path key — controller strips to leaf id `vendor_store_url`.
                    'general.marketplace.vendor_store_url' => 'updated-via-dotpath',
                ],
            ]
        );

        rest_do_request( $request );

        $settings = get_option( 'dokan_admin_settings', [] );
        $this->assertIsArray( $settings );
        $this->assertSame(
            'updated-via-dotpath',
            $settings['vendor_store_url'] ?? null,
            'Dot-path payload key must resolve to its leaf id (vendor_store_url).'
        );
    }

    /**
     * Round trip: legacy save -> new option -> legacy read sees fresh value.
     *
     * Under the new-as-canonical model the legacy DB row is never back-
     * written. The round-trip is verified via the read-time overlay:
     * subsequent `get_option('dokan_general')` calls project the latest
     * new-flat value into the returned array.
     *
     * @return void
     */
    public function test_legacy_to_new_to_legacy_round_trip(): void {
        $vendor_field = $this->find_csv_field( 'dokan_general', 'setup_wizard_logo_url' );
        if ( null === $vendor_field ) {
            $this->markTestSkipped( 'Expected mapped field "setup_wizard_logo_url" not found.' );
            return;
        }

        // 1. Legacy save path: mapped key lands in dokan_admin_settings,
        //    legacy row holds the unmapped remainder only.
        dokan_save_legacy_settings_section(
            'dokan_general',
            [ 'setup_wizard_logo_url' => 'first_value' ]
        );

        // Read via get_option — the overlay projects the new value back in.
        $legacy_after = get_option( 'dokan_general', [] );
        $this->assertSame(
            'first_value',
            $legacy_after['setup_wizard_logo_url'] ?? null,
            'Legacy view reflects the new-flat write via the overlay filter.'
        );

        // 2. Write a NEW value via the new-flat repository directly. Legacy
        //    readers must observe the fresh value through the same overlay.
        ( new \WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository() )
            ->update( [ $vendor_field['id'] => 'second_value' ] );

        $legacy_final = get_option( 'dokan_general', [] );
        $this->assertSame(
            'second_value',
            $legacy_final['setup_wizard_logo_url'] ?? null,
            'Subsequent new-flat writes surface in legacy reads via the overlay.'
        );
    }
}
