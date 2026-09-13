<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * @group rest-api
 * @group onboarding
 */
class AdminSetupGuideControllerTest extends DokanTestCase {

    /**
     * @var WP_REST_Server
     */
    protected $server;

    /**
     * @var string
     */
    protected $route = '/dokan/v1/admin/setup-guide';

    /**
     * Setup test environment.
     *
     * @return void
     */
    public function set_up(): void {
        parent::set_up();

        global $wp_rest_server;
        $wp_rest_server = new WP_REST_Server();
        $this->server   = $wp_rest_server;
        do_action( 'rest_api_init' );

        $admin_id = self::factory()->user->create( [ 'role' => 'administrator' ] );
        get_user_by( 'id', $admin_id )->add_cap( 'manage_woocommerce' );
        wp_set_current_user( $admin_id );
    }

    /**
     * A step POST saves flat values into the single dokan_admin_settings option,
     * normalizing plugin-ui dot-path keys to the canonical leaf id.
     *
     * @return void
     */
    public function test_post_step_saves_flat_canonical_values(): void {
        $request = new WP_REST_Request( 'POST', $this->route . '/basic' );
        $request->set_body_params(
            [
                'values' => [
                    // dot-path key (plugin-ui internal tree state)
                    'basic.basic_section.shipping_fee_recipient' => 'admin',
                    // plain canonical id
                    'product_tax_fee_recipient'                  => 'admin',
                    // not part of this step — must be ignored
                    'minimum_withdraw_limit'                     => '999',
                ],
            ]
        );

        $response = $this->server->dispatch( $request );
        $this->assertSame( 200, $response->get_status() );

        $stored = get_option( SettingsRepository::OPTION_KEY, [] );
        $this->assertSame( 'admin', $stored['shipping_fee_recipient'] );
        $this->assertSame( 'admin', $stored['product_tax_fee_recipient'] );
        // Whitelisted out — a basic-step POST cannot touch a withdraw field.
        $this->assertNotSame( '999', $stored['minimum_withdraw_limit'] ?? null );
    }

    /**
     * An unknown step id returns 404.
     *
     * @return void
     */
    public function test_post_unknown_step_returns_404(): void {
        $request = new WP_REST_Request( 'POST', $this->route . '/does-not-exist' );
        $request->set_body_params( [ 'values' => [] ] );

        $response = $this->server->dispatch( $request );
        $this->assertSame( 404, $response->get_status() );
    }
}
