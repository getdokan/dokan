<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\Block;
use WeDevs\Dokan\VendorRegistration\FormRenderer;
use WeDevs\Dokan\VendorRegistration\FormSetup;

/**
 * Covers who sees the registration block and how it sits next to the old shortcodes.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class BlockTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    public function set_up() {
        parent::set_up();
        $this->use_shortcode_onboarding_page();
    }

    /**
     * Fresh block instance, so the "already rendered" count starts at zero.
     *
     * @return Block
     */
    private function block(): Block {
        return new Block( dokan_get_container()->get( FormRenderer::class ), dokan_get_container()->get( FormSetup::class ) );
    }

    /**
     * Point the global post at a new page.
     *
     * @param string $content Page content.
     *
     * @return int
     */
    private function on_page( string $content = '' ): int {
        $page_id = $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_content' => $content,
            ]
        );

        $GLOBALS['post'] = get_post( $page_id ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
        setup_postdata( $GLOBALS['post'] );

        return $page_id;
    }

    /**
     * Start from a Vendor Onboarding page that still uses the old shortcode, like an existing site.
     *
     * @return void
     */
    private function use_shortcode_onboarding_page(): void {
        $pages                      = (array) get_option( 'dokan_pages', [] );
        $pages['vendor_onboarding'] = $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_content' => '[dokan-vendor-onboarding-registration]',
            ]
        );
        update_option( 'dokan_pages', $pages );
        $this->flush_settings_caches();
        dokan_get_container()->get( \WeDevs\Dokan\VendorRegistration\FormSetup::class )->flush_cache();
    }

    public function test_visitors_get_the_form() {
        $this->on_page();

        $html = $this->block()->render( [] );

        $this->assertStringContainsString( 'Register as a Vendor', $html );
        $this->assertStringContainsString( 'dokan-vreg__form', $html );
    }

    public function test_a_second_block_shows_nothing_to_visitors_and_a_note_to_editors() {
        $this->on_page();
        $block = $this->block();
        $block->render( [] );

        $this->assertSame( '', $block->render( [] ) );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

        $this->assertStringContainsString( 'already has a Vendor Registration Form block', $block->render( [] ) );
    }

    public function test_vendors_get_a_dashboard_link_instead_of_the_form() {
        $this->on_page();

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'seller' ] ) );
        $html = $this->block()->render( [] );

        $this->assertStringContainsString( 'You are already a vendor.', $html );
        $this->assertStringContainsString( esc_url( dokan_get_navigation_url() ), $html );
        $this->assertStringNotContainsString( 'dokan-vreg__form', $html );
    }

    public function test_any_logged_in_non_vendor_gets_the_become_a_vendor_view() {
        $this->on_page();

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );

        $this->assertStringContainsString( 'name="dokan_vreg_become_vendor"', $this->block()->render( [] ) );
    }

    public function test_the_customer_form_has_no_captcha() {
        $this->on_page();
        add_action(
            'register_form',
            function () {
                echo '<span class="captcha-marker"></span>';
            }
        );

        $this->assertStringContainsString( 'captcha-marker', $this->block()->render( [] ) );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'customer' ] ) );

        $this->assertStringNotContainsString( 'captcha-marker', $this->block()->render( [] ) );
    }

    public function test_a_partial_context_from_a_filter_keeps_the_defaults() {
        $this->on_page();
        add_filter(
            'dokan_vendor_registration_render_context',
            function () {
                return [
                    'view'     => 'social',
                    'platform' => 'Google',
                ];
            }
        );

        $html = $this->block()->render( [] );

        $this->assertStringContainsString( 'Signed in with Google', $html );
        $this->assertStringContainsString( 'Finish setting up your store', $html );
    }

    public function test_a_collapsed_login_box_stays_open_after_a_failed_login() {
        $this->on_page();
        $attributes = [ 'login' => [ 'position' => 'link' ] ];

        $this->assertStringContainsString( 'class="dokan-vreg__login" hidden', $this->block()->render( $attributes ) );

        $_POST['dokan_vreg_login'] = '1';

        $html = $this->block()->render( $attributes );

        $this->assertStringNotContainsString( 'class="dokan-vreg__login" hidden', $html );
        $this->assertStringContainsString( 'aria-expanded="true"', $html );
    }

    public function test_admins_get_a_preview_they_cannot_submit() {
        $this->on_page();

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        $html = $this->block()->render( [] );

        $this->assertStringContainsString( 'this is a preview', $html );
        $this->assertMatchesRegularExpression( '/name="register"[^>]*disabled/', $html );
        $this->assertStringNotContainsString( 'dokan-vreg__login-form', $html );
    }

    public function test_customers_get_the_become_a_vendor_view() {
        $this->on_page();

        wp_set_current_user(
            $this->factory()->user->create(
                [
                    'role'       => 'customer',
                    'first_name' => 'Nila',
                ]
            )
        );
        $html = $this->block()->render( [] );

        $this->assertStringContainsString( 'Become a vendor', $html );
        $this->assertStringContainsString( 'name="dokan_vreg_become_vendor"', $html );
        $this->assertStringContainsString( 'value="Nila"', $html );
        $this->assertStringNotContainsString( 'id="reg_email"', $html );
        $this->assertStringNotContainsString( 'woocommerce-register-nonce', $html );
        $this->assertStringNotContainsString( 'dokan-vreg__login-form', $html );
    }

    public function test_the_login_box_follows_its_settings() {
        $this->on_page();

        $html = $this->block()->render( [] );
        $this->assertStringContainsString( 'has-login-right', $html );
        $this->assertStringContainsString( 'Already selling with us?', $html );
        $this->assertStringContainsString( 'name="dokan_vreg_login" value="1"', $html );
        $this->assertStringContainsString( 'name="redirect" value="' . esc_url( $this->block()->get_current_url() ) . '"', $html );
        $this->assertLessThan( strpos( $html, 'dokan-vreg__login-form' ), strpos( $html, 'dokan-vreg__form' ) );

        $html = $this->block()->render( [ 'login' => [ 'position' => 'left' ] ] );
        $this->assertGreaterThan( strpos( $html, 'dokan-vreg__login-form' ), strpos( $html, 'dokan-vreg__form' ) );

        $html = $this->block()->render(
            [
                'login' => [
                    'position'     => 'link',
                    'linkText'     => 'Have an account?',
                    'showRemember' => false,
                ],
            ]
        );
        $this->assertStringContainsString( 'Have an account?', $html );
        $this->assertStringNotContainsString( 'rememberme', $html );

        $this->assertStringNotContainsString( 'dokan-vreg__login-form', $this->block()->render( [ 'login' => [ 'enabled' => false ] ] ) );
    }

    public function test_vendors_are_sent_to_their_dashboard_but_admins_stay() {
        $page_id = $this->on_page( '<!-- wp:dokan/vendor-registration /-->' );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'seller' ] ) );
        $this->assertSame( dokan_get_navigation_url(), $this->block()->get_vendor_redirect( $page_id ) );
        $this->assertSame( '', $this->block()->get_vendor_redirect( $this->on_page() ) );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        $this->assertSame( '', $this->block()->get_vendor_redirect( $page_id ) );
    }

    public function test_the_old_shortcode_is_skipped_next_to_the_block() {
        $this->on_page( '<!-- wp:dokan/vendor-registration /-->' );
        $block = $this->block();

        $this->assertSame( '', $block->skip_shortcode_next_to_block( false, 'dokan-vendor-onboarding-registration' ) );
        $this->assertFalse( $block->skip_shortcode_next_to_block( false, 'dokan-stores' ) );
    }

    public function test_the_old_shortcode_runs_without_the_block() {
        $this->on_page( '[dokan-vendor-onboarding-registration]' );

        $this->assertFalse( $this->block()->skip_shortcode_next_to_block( false, 'dokan-vendor-onboarding-registration' ) );
    }

    public function test_each_content_render_counts_its_own_blocks() {
        $this->on_page();
        $block = $this->block();

        // An SEO plugin renders the content early...
        $block->render( [] );

        // ...then the real content render starts.
        $block->reset_render_count( '' );

        $this->assertStringContainsString( 'dokan-vreg__form', $block->render( [] ) );
    }

    public function test_the_login_returns_to_the_page_being_viewed() {
        $page_id = $this->on_page();
        $this->go_to( get_permalink( $page_id ) );

        $this->assertSame( get_permalink( $page_id ), $this->block()->get_current_url() );
    }

    public function test_users_back_from_social_login_finish_through_the_customer_form() {
        $this->on_page();
        add_action(
            'register_form',
            function () {
                echo '<span class="captcha-marker"></span>';
            }
        );
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'customer' ] ) );
        add_filter(
            'dokan_vendor_registration_render_context',
            function ( $context ) {
                $context['view']             = 'social';
                $context['prefill']['email'] = 'nila@example.test';

                return $context;
            }
        );

        $html = $this->block()->render( [] );

        $this->assertStringContainsString( 'name="dokan_vreg_become_vendor"', $html );
        $this->assertStringNotContainsString( 'woocommerce-register-nonce', $html );
        $this->assertStringNotContainsString( 'captcha-marker', $html );
        $this->assertMatchesRegularExpression( '/name="email"[^>]*value="nila@example.test"[^>]*readonly="readonly"/', $html );
    }

    public function test_add_ons_can_print_around_the_form_and_under_the_login_button() {
        $this->on_page();
        $parts = [
            'dokan_vendor_registration_before_form'      => 'before-form-marker',
            'dokan_vendor_registration_after_form'       => 'after-form-marker',
            'dokan_vendor_registration_after_login_form' => 'after-login-marker',
        ];

        foreach ( $parts as $hook => $marker ) {
            add_filter(
                $hook,
                function ( $html ) use ( $marker ) {
                    return $html . '<i class="' . $marker . '"></i>';
                }
            );
        }

        $html = $this->block()->render( [] );

        $this->assertLessThan( strpos( $html, '<form method="post" class="register' ), strpos( $html, 'before-form-marker' ) );
        $this->assertGreaterThan( strpos( $html, 'dokan_vreg_sig' ), strpos( $html, 'after-form-marker' ) );
        $this->assertGreaterThan( strpos( $html, 'dokan-vreg__login-submit' ), strpos( $html, 'after-login-marker' ) );
    }

    public function test_add_ons_know_when_the_block_renders() {
        $this->on_page();
        $inside = [];

        add_action(
            'dokan_vendor_reg_form_end',
            function () use ( &$inside ) {
                $inside[] = did_action( 'dokan_vendor_registration_before_render' ) > did_action( 'dokan_vendor_registration_after_render' );
            }
        );

        $this->block()->render( [] );

        $this->assertSame( [ true ], $inside );
        $this->assertSame( did_action( 'dokan_vendor_registration_before_render' ), did_action( 'dokan_vendor_registration_after_render' ) );
    }

    public function test_the_social_layout_is_a_class_on_the_block() {
        $this->on_page();

        $this->assertStringContainsString( 'is-social-brand', $this->block()->render( [] ) );
        $this->assertStringContainsString( 'is-social-icons', $this->block()->render( [ 'styles' => [ 'socialLayout' => 'icons' ] ] ) );
        $this->assertStringContainsString( 'is-social-brand', $this->block()->render( [ 'styles' => [ 'socialLayout' => 'bogus' ] ] ) );
    }
}
