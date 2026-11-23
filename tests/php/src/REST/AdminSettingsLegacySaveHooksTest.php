<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Admin\Settings as AdminSettings;
use WeDevs\Dokan\Admin\Settings\Migration\BridgeBootstrap;
use WeDevs\Dokan\Admin\Settings\Migration\LegacySettingsBridge;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * New-settings REST saves fire the legacy per-section save hooks.
 *
 * @group admin-settings
 * @group settings-bridge
 * @group rest-api
 * @group rest-api-admin-settings
 *
 * @covers \WeDevs\Dokan\Admin\Settings\Migration\LegacyMirror
 * @covers \WeDevs\Dokan\REST\AdminSettingsController
 */
class AdminSettingsLegacySaveHooksTest extends DokanTestCase {

    private ?BridgeBootstrap $test_bootstrap = null;

    public function set_up() {
        parent::set_up();

        get_user_by( 'id', $this->admin_id )->add_cap( 'manage_woocommerce' );
        wp_set_current_user( $this->admin_id );

        foreach ( [ 'dokan_admin_settings', 'dokan_general', 'dokan_withdraw', 'dokan_reverse_withdrawal' ] as $option ) {
            delete_option( $option );
        }

        // Overlay filters register on `init`, which has already fired here.
        $this->test_bootstrap = new BridgeBootstrap( new LegacySettingsBridge() );
        $this->test_bootstrap->register_overlay_filters();

        // The container keeps one Admin\Settings across tests, but each test resets hooks; re-add its listeners.
        new AdminSettings();
    }

    public function tear_down() {
        global $wp_filter;
        foreach ( array_keys( $wp_filter ) as $hook_name ) {
            if ( strpos( $hook_name, 'option_dokan_' ) === 0 || strpos( $hook_name, 'default_option_dokan_' ) === 0 ) {
                remove_filter( $hook_name, [ $this->test_bootstrap, 'apply_overlay' ], 10 );
            }
        }
        foreach ( [ 'dokan_admin_settings', 'dokan_general', 'dokan_withdraw', 'dokan_reverse_withdrawal' ] as $option ) {
            delete_option( $option );
        }
        parent::tear_down();
    }

    private function put( string $page_id, array $values ): WP_REST_Response {
        $request = new WP_REST_Request( 'PUT', '/dokan/v1/admin/settings/' . $page_id );
        $request->set_body_params(
            [
                'page_id' => $page_id,
                'values'  => $values,
            ]
        );

        return rest_do_request( $request );
    }

    public function test_after_hook_fires_once_per_legacy_section_with_legacy_arguments(): void {
        ( new SettingsRepository() )->update( [ 'vendor_store_url_slug' => 'old-slug' ] );

        $calls = [];
        $spy   = function ( $option_name, $new_value, $old_value ) use ( &$calls ) {
            $calls[] = [ $option_name, $new_value['custom_store_url'] ?? null, $old_value['custom_store_url'] ?? null ];
        };
        add_action( 'dokan_after_saving_settings', $spy, 10, 3 );

        $response = $this->put( 'marketplace', [ 'vendor_store_url_slug' => 'new-slug' ] );

        remove_action( 'dokan_after_saving_settings', $spy, 10 );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( [ [ 'dokan_general', 'new-slug', 'old-slug' ] ], $calls );
    }

    public function test_exception_in_listener_rejects_the_whole_save(): void {
        ( new SettingsRepository() )->update( [ 'minimum_withdraw_limit' => 50 ] );

        $reject = static function ( $option_name ) {
            if ( 'dokan_withdraw' === $option_name ) {
                throw new \Exception( 'Invalid withdraw settings.' );
            }
        };
        add_action( 'dokan_before_saving_settings', $reject, 5 );

        $response = $this->put(
            'transaction',
            [
                'minimum_withdraw_limit'        => 100,
                'reverse_withdrawal_due_period' => 99,
            ]
        );

        remove_action( 'dokan_before_saving_settings', $reject, 5 );

        $this->assertSame( 400, $response->get_status() );
        $this->assertSame( 'dokan_rest_validation_failed', $response->get_data()['code'] );
        $this->assertSame( 50, ( new SettingsRepository() )->get( 'minimum_withdraw_limit' ), 'A rejected save must not be stored.' );
        $this->assertNull( ( new SettingsRepository() )->get( 'reverse_withdrawal_due_period' ), 'Fields of other sections must not be stored either.' );
    }

    public function test_wp_die_in_listener_rejects_the_save(): void {
        ( new SettingsRepository() )->update( [ 'vendor_store_url_slug' => 'old-slug' ] );

        $halt = static function ( $option_name ) {
            if ( 'dokan_general' === $option_name ) {
                wp_die( 'Nonce check failed.' );
            }
        };
        add_action( 'dokan_before_saving_settings', $halt, 5 );

        $response = $this->put( 'marketplace', [ 'vendor_store_url_slug' => 'new-slug' ] );

        remove_action( 'dokan_before_saving_settings', $halt, 5 );

        $this->assertSame( 400, $response->get_status() );
        $this->assertSame( 'dokan_rest_validation_failed', $response->get_data()['code'] );
        $this->assertSame( 'old-slug', ( new SettingsRepository() )->get( 'vendor_store_url_slug' ), 'A halted save must not be stored.' );
    }

    public function test_reserved_slug_with_surrounding_whitespace_is_rejected(): void {
        $response = $this->put( 'marketplace', [ 'vendor_store_url_slug' => ' shop' ] );

        $this->assertSame( 400, $response->get_status() );
        $this->assertArrayHasKey( 'vendor_store_url_slug', $response->get_data()['data']['errors'] );
    }

    public function test_store_url_slug_change_flushes_rewrite_rules(): void {
        global $wp_rewrite;
        $wp_rewrite->set_permalink_structure( '/%postname%/' );
        ( new SettingsRepository() )->update( [ 'vendor_store_url_slug' => 'old-slug' ] );

        $response = $this->put( 'marketplace', [ 'vendor_store_url_slug' => 'qa-stores' ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertNotEmpty( preg_grep( '#^qa-stores/#', array_keys( (array) get_option( 'rewrite_rules' ) ) ) );

        $wp_rewrite->set_permalink_structure( '' );
    }
}
