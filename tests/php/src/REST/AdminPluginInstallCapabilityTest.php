<?php

namespace WeDevs\Dokan\Test\REST;

use ReflectionMethod;
use WeDevs\Dokan\Admin\SetupWizard;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;

/**
 * Capability tests for the admin paths that install plugins.
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
 * @covers \WeDevs\Dokan\REST\AdminExtensionsController::check_install_permission
 * @covers \WeDevs\Dokan\REST\AdminOnboardingController::install_required_plugins
 * @covers \WeDevs\Dokan\Admin\SetupWizard::user_can_install_plugin
 * @covers \WeDevs\Dokan\Admin\SetupWizard::install_plugin
 */
class AdminPluginInstallCapabilityTest extends DokanTestCase {

    /**
     * Plugin id used for the install attempts.
     *
     * @var string
     */
    protected const PLUGIN_ID = 'classic-editor';

    /**
     * Slug the extensions route is asked for; deliberately not a real plugin.
     *
     * @var string
     */
    protected const UNINSTALLED_SLUG = 'dokan-l11-not-a-real-plugin';

    /**
     * Role granted install_plugins but not activate_plugins.
     *
     * @var string
     */
    protected const INSTALLER_ONLY_ROLE = 'dokan_test_installer_only';

    /**
     * Shop manager user id — holds manage_woocommerce, not install_plugins.
     *
     * @var int
     */
    protected int $shop_manager_id;

    /**
     * Set up the fixtures and seal off every route to the network.
     */
    public function set_up() {
        parent::set_up();

        // is_plugin_active()/get_plugins() are admin-only includes, and the sinks below call them directly.
        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        // Belt and braces: tear_down() unhooks the deferred installer, but a fatal or an exit
        // inside a test would fire `shutdown` first. Blocking HTTP makes "no test ever reaches
        // wordpress.org" hold regardless of hook ordering.
        add_filter( 'pre_http_request', [ $this, 'block_http_requests' ] );

        // Both controllers are in the REST class map, so DokanTestCase's rest_api_init already registered their routes.
        $this->shop_manager_id = $this->factory()->user->create( [ 'role' => 'shop_manager' ] );
    }

    /**
     * A shop manager holds manage_woocommerce but must not reach the install route.
     */
    public function test_shop_manager_cannot_install_extensions() {
        wp_set_current_user( $this->shop_manager_id );

        $this->assertTrue( current_user_can( 'manage_woocommerce' ), 'Precondition: shop managers hold manage_woocommerce.' );
        $this->assertFalse( current_user_can( 'install_plugins' ), 'Precondition: shop managers do not hold install_plugins.' );

        $response = $this->post_request( 'admin/extensions/install', [ 'slug' => self::UNINSTALLED_SLUG ] );

        $this->assertSame( 403, $response->get_status(), 'The install route must reject a shop manager.' );
    }

    /**
     * An administrator still passes the install route's permission gate.
     *
     * Dispatches the real route so the assertion also proves the permission callback is
     * still wired in register_routes(). plugins_api() is short-circuited to an error, so
     * the request stops at the first thing past the gate instead of downloading anything:
     * reaching that 400 is only possible once the 403 gate has been cleared.
     */
    public function test_admin_can_install_extensions() {
        wp_set_current_user( $this->admin_id );

        add_filter( 'plugins_api', [ $this, 'block_plugins_api' ] );

        $response = $this->post_request( 'admin/extensions/install', [ 'slug' => self::UNINSTALLED_SLUG ] );

        $this->assertSame( 400, $response->get_status(), 'Administrators must clear the permission gate and reach the handler.' );
        $this->assertSame(
            'dokan_rest_plugin_info_failed',
            $response->get_data()['code'] ?? '',
            'The 400 must come from the stubbed plugins_api lookup, not from the permission layer.'
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
        wp_set_current_user( $this->create_installer_only_user() );

        $this->assertTrue( current_user_can( 'install_plugins' ), 'Precondition: this user may install.' );
        $this->assertFalse( current_user_can( 'activate_plugins' ), 'Precondition: this user may not activate.' );

        $response = $this->post_request( 'admin/onboarding', $this->onboarding_payload() );

        $this->assertSame( 200, $response->get_status() );
        $this->assertFalse(
            get_option( 'woocommerce_setup_background_installing_' . self::PLUGIN_ID ),
            'The install queues an activation, so install_plugins without activate_plugins must not be enough.'
        );
    }

    /**
     * The wizard's own sink is guarded, not just the onboarding route that shares it.
     *
     * The Recommended step calls install_plugin() directly through
     * dokan_setup_recommended_save(), so the guard has to hold when the method is reached
     * outside the REST layer.
     */
    public function test_setup_wizard_does_not_queue_install_for_shop_manager() {
        wp_set_current_user( $this->shop_manager_id );

        $wizard = new SetupWizard();
        $wizard->install_plugin( self::PLUGIN_ID, [ 'repo-slug' => self::PLUGIN_ID ] );

        $this->assertFalse(
            get_option( 'woocommerce_setup_background_installing_' . self::PLUGIN_ID ),
            'The wizard sink must not queue an install for a user without the plugin capabilities.'
        );
    }

    /**
     * The same wizard sink still works for an administrator.
     */
    public function test_setup_wizard_queues_install_for_admin() {
        wp_set_current_user( $this->admin_id );

        $wizard = new SetupWizard();
        $wizard->install_plugin( self::PLUGIN_ID, [ 'repo-slug' => self::PLUGIN_ID ] );

        $this->assertNotFalse(
            get_option( 'woocommerce_setup_background_installing_' . self::PLUGIN_ID ),
            'An administrator must still be able to queue the wizard install.'
        );
    }

    /**
     * The Recommended step is hidden from anyone who cannot complete an install.
     *
     * Adding activate_plugins to the predicate changes this display path as well as the
     * authorization ones, so pin the visibility down in all three directions.
     */
    public function test_recommended_step_visibility_follows_the_plugin_capabilities() {
        wp_set_current_user( $this->admin_id );
        $this->assertTrue( $this->should_show_recommended_step(), 'Administrators keep the Recommended step.' );

        wp_set_current_user( $this->shop_manager_id );
        $this->assertFalse( $this->should_show_recommended_step(), 'Shop managers must not be offered plugin installs.' );

        wp_set_current_user( $this->create_installer_only_user() );
        $this->assertFalse(
            $this->should_show_recommended_step(),
            'The step installs and activates, so install_plugins alone must not reveal it.'
        );
    }

    /**
     * Invoke the wizard's protected visibility predicate for the current user.
     */
    protected function should_show_recommended_step(): bool {
        // Constructed per call: the wizard reads capabilities in its constructor.
        $method = new ReflectionMethod( SetupWizard::class, 'should_show_recommended_step' );
        $method->setAccessible( true );

        return (bool) $method->invoke( new SetupWizard() );
    }

    /**
     * Create a user granted install_plugins but denied activate_plugins.
     *
     * DokanTestCase::tear_down() rebuilds the WP_Roles singleton from the rolled-back
     * option, so the role does not need removing here and cannot leak between tests.
     */
    protected function create_installer_only_user(): int {
        add_role(
            self::INSTALLER_ONLY_ROLE,
            'Installer Only',
            [
                'read'               => true,
                'manage_woocommerce' => true,
                'install_plugins'    => true,
            ]
        );

        return $this->factory()->user->create( [ 'role' => self::INSTALLER_ONLY_ROLE ] );
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

    /**
     * Fail any outbound HTTP request made during a test.
     *
     * @return WP_Error
     */
    public function block_http_requests() {
        return new WP_Error( 'dokan_test_http_blocked', 'Outbound HTTP is blocked in this test case.' );
    }

    /**
     * Short-circuit plugins_api() so the install route never queries wordpress.org.
     *
     * @return WP_Error
     */
    public function block_plugins_api() {
        return new WP_Error( 'dokan_test_plugins_api_blocked', 'plugins_api is stubbed in this test case.' );
    }

    /**
     * Tear down the test case.
     */
    public function tear_down() {
        // install_plugin() defers the real download to shutdown; drop it so no test ever hits wordpress.org.
        remove_all_actions( 'shutdown' );

        // Clear the queue flag too, or a later test would hit install_plugin()'s "already queued" early return.
        delete_option( 'woocommerce_setup_background_installing_' . self::PLUGIN_ID );

        wp_set_current_user( 0 );

        parent::tear_down();
    }
}
