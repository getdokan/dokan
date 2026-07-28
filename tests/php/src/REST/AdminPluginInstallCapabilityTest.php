<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\AdminExtensionsController;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Capability tests for the admin routes that install plugins.
 *
 * Covers the privilege escalation in audit L11 / plugin-internal-tasks#2173: these
 * paths gated on `manage_woocommerce`, which a Shop Manager holds without holding
 * `install_plugins`/`activate_plugins`, so that role could install (and via
 * onboarding install *and activate*) arbitrary wordpress.org plugins.
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-admin-rest
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\REST\AdminExtensionsController::check_permission
 * @covers \WeDevs\Dokan\REST\AdminOnboardingController::install_required_plugins
 */
class AdminPluginInstallCapabilityTest extends DokanTestCase {

    /**
     * Plugin id used for the onboarding install attempts.
     *
     * @var string
     */
    protected const PLUGIN_ID = 'classic-editor';

    /**
     * Shop manager user id — holds manage_woocommerce, not install_plugins.
     *
     * @var int
     */
    protected int $shop_manager_id;

    /**
     * Extensions controller under test.
     *
     * @var AdminExtensionsController
     */
    protected AdminExtensionsController $controller;

    public function set_up() {
        parent::set_up();

        // Both controllers are in the REST class map, so DokanTestCase's rest_api_init already registered their routes.
        $this->controller      = new AdminExtensionsController();
        $this->shop_manager_id = $this->factory()->user->create( [ 'role' => 'shop_manager' ] );
    }

    /**
     * A shop manager holds manage_woocommerce but must not reach the install route.
     */
    public function test_shop_manager_cannot_install_extensions() {
        wp_set_current_user( $this->shop_manager_id );

        $this->assertTrue( current_user_can( 'manage_woocommerce' ), 'Precondition: shop managers hold manage_woocommerce.' );
        $this->assertFalse( current_user_can( 'install_plugins' ), 'Precondition: shop managers do not hold install_plugins.' );

        $response = $this->post_request( 'admin/extensions/install', [ 'slug' => 'classic-widgets' ] );
        $this->assertSame( 403, $response->get_status(), 'The install route must reject a shop manager.' );
    }

    /**
     * An administrator may still install extensions.
     *
     * Asserted at the permission callback rather than by dispatching, because the route
     * would perform a real wordpress.org download.
     */
    public function test_admin_can_install_extensions() {
        wp_set_current_user( $this->admin_id );

        $this->assertTrue(
            $this->controller->check_permission(),
            'Administrators hold install_plugins and must keep access.'
        );
    }

    /**
     * Onboarding must not install plugins for a shop manager, but must still save.
     */
    public function test_onboarding_does_not_install_plugins_for_shop_manager() {
        wp_set_current_user( $this->shop_manager_id );

        $response = $this->post_request( 'admin/onboarding', $this->onboarding_payload() );

        $this->assertSame( 200, $response->get_status(), 'Onboarding itself stays available to shop managers.' );
        $this->assertFalse(
            get_option( 'woocommerce_setup_background_installing_' . self::PLUGIN_ID ),
            'No install may be queued for a user without install_plugins.'
        );
    }

    /**
     * Onboarding still queues the install for an administrator.
     */
    public function test_onboarding_installs_plugins_for_admin() {
        wp_set_current_user( $this->admin_id );

        $response = $this->post_request( 'admin/onboarding', $this->onboarding_payload() );

        $this->assertSame( 200, $response->get_status() );
        $this->assertNotFalse(
            get_option( 'woocommerce_setup_background_installing_' . self::PLUGIN_ID ),
            'An administrator must still be able to install the onboarding plugins.'
        );
    }

    /**
     * The install_plugins cap alone is not enough: the queued installer also activates.
     */
    public function test_onboarding_does_not_install_for_user_who_cannot_activate() {
        $role_name = 'dokan_test_installer_only';
        add_role(
            $role_name,
            'Installer Only',
            [
                'read'               => true,
                'manage_woocommerce' => true,
                'install_plugins'    => true,
            ]
        );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => $role_name ] ) );

        $this->assertTrue( current_user_can( 'install_plugins' ), 'Precondition: this user may install.' );
        $this->assertFalse( current_user_can( 'activate_plugins' ), 'Precondition: this user may not activate.' );

        $response = $this->post_request( 'admin/onboarding', $this->onboarding_payload() );

        $this->assertSame( 200, $response->get_status() );
        $this->assertFalse(
            get_option( 'woocommerce_setup_background_installing_' . self::PLUGIN_ID ),
            'The install queues an activation, so install_plugins without activate_plugins must not be enough.'
        );

        remove_role( $role_name );
    }

    /**
     * Onboarding request body carrying one plugin to install.
     */
    protected function onboarding_payload(): array {
        return [
            'onboarding'       => true,
            // Required by the endpoint schema, so the request would 400 without it.
            'marketplace_goal' => [
                'marketplace_focus' => 'physical',
                'handle_delivery'   => 'vendor',
                'top_priority'      => 'growth',
            ],
            'plugins'          => [
                [
                    'id'   => self::PLUGIN_ID,
                    'info' => [ 'repo-slug' => self::PLUGIN_ID ],
                ],
            ],
        ];
    }

    public function tear_down() {
        // install_plugin() defers the real download to shutdown; drop it so no test ever hits wordpress.org.
        remove_all_actions( 'shutdown' );

        // Clear the queue flag too, or a later test would hit install_plugin()'s "already queued" early return.
        delete_option( 'woocommerce_setup_background_installing_' . self::PLUGIN_ID );

        wp_set_current_user( 0 );

        parent::tear_down();
    }
}
