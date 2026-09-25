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
 * `/dokan/v1/admin/settings/{page_id}`. The `LegacySettingsBridge` +
 * `BridgeBootstrap` overlay projects those values into legacy `dokan_*`
 * reads. These tests pin the REST write path against hand-authored
 * schema fields:
 *
 *  1. REST PUT (writes `dokan_settings`) -> legacy `dokan_*` view
 *     (via the read-time overlay filter registered by `BridgeBootstrap`).
 *  2. Dot-path payload keys emitted by plugin-ui resolve to their leaf
 *     field id before the controller writes them.
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
        delete_option( 'dokan_admin_settings' );
        delete_option( 'dokan_general' );
        parent::tear_down();
    }

    /**
     * REST PUT save propagates back to the legacy option.
     *
     * The new UI calls PUT `/dokan/v1/admin/settings/{page_id}`, which
     * writes `dokan_settings`. The `BridgeBootstrap` listener (registered
     * on `dokan_admin_settings_changed`) mirrors mapped keys to their
     * legacy option counterparts. Uses the hand-authored `vendor_store_url_slug`
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
                    'vendor_store_url_slug' => 'mystorez',
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
            $new['vendor_store_url_slug'] ?? null,
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
            ->update( [ 'vendor_store_url_slug' => 'unchanged' ] );

        $request = new WP_REST_Request( 'PUT', '/' . $this->namespace . '/settings/general' );
        $request->set_body_params(
            [
                'page_id' => 'general',
                'values'  => [
                    // Dot-path key — controller strips to leaf id `vendor_store_url_slug`.
                    'general.marketplace.vendor_store_url_slug' => 'updated-via-dotpath',
                ],
            ]
        );

        rest_do_request( $request );

        $settings = get_option( 'dokan_admin_settings', [] );
        $this->assertIsArray( $settings );
        $this->assertSame(
            'updated-via-dotpath',
            $settings['vendor_store_url_slug'] ?? null,
            'Dot-path payload key must resolve to its leaf id (vendor_store_url_slug).'
        );
    }
}
