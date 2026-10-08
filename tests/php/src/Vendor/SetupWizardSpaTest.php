<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Test\Helpers\TestableSellerSetupWizard;

/**
 * The seams the React wizard's single page load depends on.
 *
 * The browser only ever sees the result of these: one bootstrap pass that
 * registers every step, one step order that both the PHP rail and the SPA
 * count, and one payload per step. Each is pinned here because a drift shows
 * up as a wizard that skips a step or renders an empty one.
 *
 * @group setup-wizard
 */
class SetupWizardSpaTest extends DokanTestCase {

    /**
     * @var TestableSellerSetupWizard
     */
    protected $wizard;

    /**
     * `$_GET['step']` as each enqueue pass saw it.
     *
     * @var array
     */
    protected $contexts = [];

    public function set_up() {
        parent::set_up();

        // The container singleton hooks the same action; tests drive their own instance.
        remove_action( 'dokan_setup_wizard_enqueue_scripts', [ dokan()->seller_wizard, 'frontend_enqueue_scripts' ] );
        remove_action( 'dokan_setup_wizard_enqueue_scripts', [ dokan()->seller_wizard, 'bootstrap_wizard_shell' ], PHP_INT_MAX );

        $this->contexts = [];

        // These seams only run for the React wizard, so opt this site in.
        update_option( 'dokan_appearance', [ 'vendor_setup_wizard' => 'latest' ] );
        wp_cache_delete( 'dokan_appearance', 'options' );

        // Stand-ins for the built bundle: enqueue_react_step() only needs the handles to exist.
        wp_register_script( 'dokan-vendor-setup-wizard', 'https://example.org/wizard.js', [], '1.0', false );
        wp_register_style( 'dokan-vendor-setup-wizard', 'https://example.org/wizard.css', [], '1.0' );

        wp_set_current_user( $this->seller_id1 );

        $this->wizard = new TestableSellerSetupWizard();
        $this->wizard->prime( $this->seller_id1, 'introduction' );
    }

    public function tear_down() {
        wp_deregister_script( 'dokan-vendor-setup-wizard' );
        wp_deregister_style( 'dokan-vendor-setup-wizard' );
        delete_option( 'dokan_appearance' );
        unset( $_GET['step'] );

        parent::tear_down();
    }

    /**
     * The shell only bootstraps in React mode, which needs the built bundle.
     */
    protected function require_react_mode(): void {
        if ( ! file_exists( DOKAN_DIR . '/assets/js/vendor-setup-wizard.asset.php' ) ) {
            $this->markTestSkipped( 'The React bundle is not built in this checkout.' );
        }
    }

    /**
     * The inline data the wizard bootstrapped, as one string.
     */
    protected function bootstrapped_script(): string {
        $data = wp_scripts()->get_data( 'dokan-vendor-setup-wizard', 'before' );

        return is_array( $data ) ? implode( "\n", array_filter( $data ) ) : (string) $data;
    }

    /**
     * The shell object the SPA boots from.
     */
    protected function bootstrapped_shell(): array {
        preg_match( '/window\.dokanSetupWizard\.shell = (\{.*?\});/s', $this->bootstrapped_script(), $matches );

        return isset( $matches[1] ) ? (array) json_decode( $matches[1], true ) : [];
    }

    /**
     * @test
     */
    public function step_order_describes_every_registered_step() {
        $order    = $this->wizard->step_order();
        $step_args = wp_list_pluck( $order, 'stepArg' );

        // Whatever the withdraw settings add, the wizard opens on the intro and ends on the ready screen.
        $this->assertSame( 'introduction', reset( $step_args ) );
        $this->assertSame( 'next_steps', end( $step_args ) );

        foreach ( $order as $entry ) {
            $this->assertArrayHasKey( 'key', $entry );
            $this->assertArrayHasKey( 'url', $entry );
            $this->assertStringContainsString( 'step=' . $entry['stepArg'], $entry['url'] );
            $this->assertStringContainsString( '_admin_sw_nonce=', $entry['url'] );
        }

        // The intro is un-numbered and centred; the ready screen is numbered and centred; a form step is neither.
        $by_step = array_combine( $step_args, $order );
        $this->assertFalse( $by_step['introduction']['numbered'] );
        $this->assertTrue( $by_step['introduction']['centred'] );
        $this->assertTrue( $by_step['next_steps']['numbered'] );
        $this->assertTrue( $by_step['next_steps']['centred'] );
        $this->assertTrue( $by_step['store']['numbered'] );
        $this->assertFalse( $by_step['store']['centred'] );
    }

    /**
     * One nonce serves every step link, so the rail can't mint a fresh one per row.
     *
     * @test
     */
    public function step_links_share_one_nonce() {
        $nonces = [];

        foreach ( $this->wizard->step_order() as $entry ) {
            preg_match( '/_admin_sw_nonce=([^&]+)/', $entry['url'], $matches );
            $nonces[] = $matches[1] ?? '';
        }

        $this->assertCount( 1, array_unique( $nonces ) );
        $this->assertNotEmpty( $nonces[0] );
    }

    /**
     * @test
     */
    public function a_step_declares_the_payload_key_it_bootstrapped_under() {
        $this->wizard->set_current_step( 'introduction' );
        $this->wizard->enqueue_react_step( [ 'step' => 'intro' ] );

        $this->assertSame( [ 'introduction' => 'intro' ], $this->wizard->payload_keys() );

        // The order picks the declared key up, so nothing has to hardcode it.
        $intro = current(
            array_filter(
                $this->wizard->step_order(),
                static function ( $entry ) {
                    return 'introduction' === $entry['stepArg'];
                }
            )
        );

        $this->assertSame( 'intro', $intro['key'] );
    }

    /**
     * The enqueue action can reach the same step twice; the payload must land once.
     *
     * @test
     */
    public function a_step_registers_only_once() {
        $this->wizard->set_current_step( 'introduction' );
        $this->wizard->enqueue_react_step(
            [
                'step'     => 'intro',
                'siteName' => 'first-pass',
            ]
        );
        $this->wizard->enqueue_react_step(
            [
                'step'     => 'intro',
                'siteName' => 'second-pass',
            ]
        );

        $script = $this->bootstrapped_script();

        $this->assertSame( 1, substr_count( $script, 'window.dokanSetupWizard.steps["intro"]' ) );
        $this->assertStringContainsString( 'first-pass', $script );
        $this->assertStringNotContainsString( 'second-pass', $script );
    }

    /**
     * @test
     */
    public function the_step_payload_filter_can_tune_a_step() {
        add_filter(
            'dokan_setup_wizard_step_payload',
            function ( $payload, $step ) {
                if ( 'intro' === $step ) {
                    $payload['skippable'] = false;
                }

                return $payload;
            },
            10,
            2
        );

        $this->wizard->set_current_step( 'introduction' );
        $this->wizard->enqueue_react_step( [ 'step' => 'intro' ] );

        $this->assertStringContainsString( '"skippable":false', $this->bootstrapped_script() );
    }

    /**
     * A step nobody built a React payload for still belongs to the flow: it keeps
     * its own key and a real URL, which is what the SPA navigates to.
     *
     * @test
     */
    public function a_step_without_a_payload_keeps_its_key_and_url() {
        add_filter(
            'dokan_seller_wizard_steps',
            function ( $steps ) {
                return dokan_array_insert_after(
                    $steps,
                    [
                        'third_party' => [
                            'name'    => 'Third party',
                            'view'    => '__return_null',
                            'handler' => '',
                        ],
                    ],
                    'store'
                );
            }
        );

        $wizard = new TestableSellerSetupWizard();
        $wizard->prime( $this->seller_id1, 'third_party' );

        $entry = current(
            array_filter(
                $wizard->step_order(),
                static function ( $item ) {
                    return 'third_party' === $item['stepArg'];
                }
            )
        );

        $this->assertSame( 'third_party', $entry['key'] );
        $this->assertStringContainsString( 'step=third_party', $entry['url'] );

        // Lite owns no payload for it, so the React shell has nothing to mount.
        $this->assertSame( [], $wizard->step_payload() );
    }

    /**
     * @test
     */
    public function every_step_but_the_one_being_viewed_is_bootstrapped_in_its_own_context() {
        add_action(
            'dokan_setup_wizard_enqueue_scripts',
            function () {
                // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Reading the forged step context the bootstrap pass sets.
                $this->contexts[] = isset( $_GET['step'] ) ? sanitize_key( wp_unslash( $_GET['step'] ) ) : '(none)';
            }
        );

        $_GET['step'] = 'store';
        $this->wizard->set_current_step( 'store' );
        $this->wizard->bootstrap_steps();

        $expected = array_values( array_diff( wp_list_pluck( $this->wizard->step_order(), 'stepArg' ), [ 'store' ] ) );

        // The viewed step is served by the outer pass, so it never appears in the loop.
        $this->assertSame( $expected, $this->contexts );
        $this->assertNotContains( 'store', $this->contexts );

        // ...and the wizard's own state comes back untouched.
        $this->assertSame( 'store', $this->wizard->current_step() );
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput -- Asserting the superglobal was restored verbatim.
        $this->assertSame( 'store', $_GET['step'] );
    }

    /**
     * @test
     */
    public function the_bootstrap_pass_restores_an_absent_step_arg() {
        unset( $_GET['step'] );

        $this->wizard->set_current_step( 'introduction' );
        $this->wizard->bootstrap_steps();

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Asserting the superglobal was restored.
        $this->assertArrayNotHasKey( 'step', $_GET );
    }

    /**
     * Markup printed while assets were enqueued is replayed once, inside the body.
     *
     * @test
     */
    public function deferred_output_is_deduped_and_replayed_once() {
        $this->wizard->capture_output( '<script id="tmpl-a"></script>' );
        $this->wizard->capture_output( '<script id="tmpl-a"></script>' );
        $this->wizard->capture_output( '   ' );
        $this->wizard->capture_output( '<script id="tmpl-b"></script>' );

        ob_start();
        $this->wizard->flush_deferred_output();
        $first = ob_get_clean();

        $this->assertSame( 1, substr_count( $first, 'tmpl-a' ) );
        $this->assertSame( 1, substr_count( $first, 'tmpl-b' ) );

        ob_start();
        $this->wizard->flush_deferred_output();

        $this->assertSame( '', ob_get_clean() );
    }

    /**
     * @test
     */
    public function the_shell_carries_the_order_and_the_landing_step() {
        $this->require_react_mode();

        $this->wizard->set_current_step( 'store' );
        $this->wizard->enqueue_react_step( [ 'step' => 'store' ] );
        $this->wizard->bootstrap_wizard_shell();

        $shell = $this->bootstrapped_shell();

        $this->assertSame( 'store', $shell['initialStep'] );
        $this->assertSame(
            wp_list_pluck( $this->wizard->step_order(), 'stepArg' ),
            wp_list_pluck( $shell['order'], 'stepArg' )
        );
    }

    /**
     * The landing step falls back to the step key while a step is still unregistered,
     * so the SPA hands it a page load instead of mounting nothing.
     *
     * @test
     */
    public function the_shell_falls_back_to_the_step_key() {
        $this->require_react_mode();

        $this->wizard->set_current_step( 'next_steps' );
        $this->wizard->bootstrap_wizard_shell();

        $this->assertSame( 'next_steps', $this->bootstrapped_shell()['initialStep'] );
    }
}
