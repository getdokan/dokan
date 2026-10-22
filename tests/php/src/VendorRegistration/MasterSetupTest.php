<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\Block;
use WeDevs\Dokan\VendorRegistration\FormRenderer;
use WeDevs\Dokan\VendorRegistration\FormSetup;
use WeDevs\Dokan\VendorRegistration\MyAccountForm;
use WeDevs\Dokan\VendorRegistration\Submission;
use WP_Error;

/**
 * Covers the Vendor Onboarding page's block as the master setup for forms that aren't a block.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class MasterSetupTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /** @var FormSetup */
    protected $setup;

    public function set_up() {
        parent::set_up();
        $this->use_shortcode_onboarding_page();

        $this->setup = dokan_get_container()->get( FormSetup::class );
        $this->setup->flush_cache();
    }

    public function tear_down() {
        // render_vendor_fields() unhooks Dokan's standard fields; later tests expect them.
        add_action( 'woocommerce_register_form', 'dokan_seller_reg_form_fields' );

        parent::tear_down();
    }

    /**
     * Make a page with the given content the Vendor Onboarding page.
     *
     * @param string $content Page content.
     * @param string $status  Post status.
     *
     * @return int
     */
    private function onboarding_page( string $content, string $status = 'publish' ): int {
        $page_id = $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => $status,
                'post_content' => $content,
            ]
        );

        $pages                      = (array) get_option( 'dokan_pages', [] );
        $pages['vendor_onboarding'] = $page_id;
        update_option( 'dokan_pages', $pages );
        $this->flush_settings_caches();

        return $page_id;
    }

    /**
     * A block with a required custom field and an optional phone.
     *
     * @return string
     */
    private function master_block(): string {
        return serialize_block(
            [
                'blockName'    => FormSetup::BLOCK_NAME,
                'attrs'        => [
                    'sections' => [
                        [
                            'id'   => 'store',
                            'rows' => [
                                [ 'id' => 'shop_name' ],
                                [ 'id' => 'shop_url' ],
                                [
                                    'id'       => 'phone',
                                    'required' => false,
                                ],
                            ],
                        ],
                        [
                            'id'   => 'additional',
                            'rows' => [
                                [
                                    'id'       => 'f1',
                                    'custom'   => true,
                                    'type'     => 'text',
                                    'label'    => 'Licence',
                                    'required' => true,
                                    'metaKey'  => 'dokan_vreg_licence',
                                ],
                            ],
                        ],
                    ],
                ],
                'innerBlocks'  => [],
                'innerHTML'    => '',
                'innerContent' => [],
            ]
        );
    }

    /**
     * Point the global post at a new page.
     *
     * @param string $content Page content.
     *
     * @return void
     */
    private function on_page( string $content ): void {
        $GLOBALS['post'] = get_post( $this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'publish', 'post_content' => $content ] ) ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited, WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
        setup_postdata( $GLOBALS['post'] );
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

    public function test_the_master_is_the_onboarding_pages_published_block() {
        $this->onboarding_page( '[dokan-vendor-onboarding-registration]' );
        $this->assertNull( $this->setup->get_master_setup() );

        $this->setup->flush_cache();
        $this->onboarding_page( $this->master_block(), 'draft' );
        $this->assertNull( $this->setup->get_master_setup() );

        $this->setup->flush_cache();
        $page_id = $this->onboarding_page( $this->master_block() );
        $master  = $this->setup->get_master_setup();

        $this->assertSame( $page_id, $master['page_id'] );
        $this->assertArrayHasKey( 'sections', $master['attributes'] );
    }

    public function test_old_shortcodes_elsewhere_render_the_master_block() {
        $block = dokan_get_container()->get( Block::class );
        $this->on_page( '[dokan-vendor-registration]' );

        $this->assertFalse( $block->skip_shortcode_next_to_block( false, 'dokan-vendor-registration' ) );

        $this->onboarding_page( $this->master_block() );
        $html = $block->skip_shortcode_next_to_block( false, 'dokan-vendor-registration' );

        $this->assertStringContainsString( 'dokan_vreg[dokan_vreg_licence]', $html );
        $this->assertStringContainsString( 'name="dokan_vreg_setup"', $html );
    }

    public function test_my_account_draws_the_master_fields_as_one_list() {
        $form = dokan_get_container()->get( MyAccountForm::class );

        ob_start();
        $form->render_vendor_fields();
        $this->assertSame( '', ob_get_clean() );
        $this->assertNotFalse( has_action( 'woocommerce_register_form', 'dokan_seller_reg_form_fields' ) );

        $this->onboarding_page( $this->master_block() );

        ob_start();
        $form->render_vendor_fields();
        $html = ob_get_clean();

        $this->assertStringContainsString( 'class="show_if_seller', $html );
        $this->assertStringContainsString( 'dokan_vreg[dokan_vreg_licence]', $html );
        $this->assertStringContainsString( 'value="seller"', $html );
        $this->assertStringNotContainsString( 'id="reg_email"', $html );
        $this->assertStringNotContainsString( 'dokan-vreg__step', $html );
        $this->assertFalse( has_action( 'woocommerce_register_form', 'dokan_seller_reg_form_fields' ) );
    }

    public function test_my_account_sign_ups_are_checked_and_saved_against_the_master() {
        $page_id    = $this->onboarding_page( $this->master_block() );
        $submission = dokan_get_container()->get( Submission::class );
        $_POST      = [ 'role' => 'seller' ];

        $required = $submission->filter_required_fields(
            [
                'phone' => 'Phone',
                'fname' => 'First',
            ]
        );

        $this->assertArrayNotHasKey( 'phone', $required );
        $this->assertContains( 'dokan_vreg_required_f1', $submission->validate( new WP_Error() )->get_error_codes() );

        $user_id                 = $this->factory()->user->create( [ 'role' => 'seller' ] );
        $_POST['dokan_vreg']     = [ 'dokan_vreg_licence' => 'TL-5' ];
        $submission->save( $user_id );

        $this->assertSame( 'TL-5', get_user_meta( $user_id, 'dokan_vreg_licence', true ) );
        $this->assertSame( $page_id, (int) get_user_meta( $user_id, Submission::SIGNUP_PAGE_META, true ) );
    }

    public function test_become_a_vendor_goes_to_the_onboarding_page_with_the_block() {
        $form = dokan_get_container()->get( MyAccountForm::class );
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'customer' ] ) );

        $this->assertSame( '', $form->get_account_migration_redirect() );

        $page_id = $this->onboarding_page( $this->master_block() );

        $this->assertSame( get_permalink( $page_id ), $form->get_account_migration_redirect() );
    }

    public function test_a_sign_up_without_the_signed_setup_follows_the_onboarding_block() {
        $master_id  = $this->onboarding_page( $this->master_block() );
        $submission = dokan_get_container()->get( Submission::class );
        // A stale copy of Dokan's form, or the block's form with its setup removed.
        $_POST = [
            'role'                                 => 'seller',
            'dokan_vendor_registration_form_nonce' => 'stale-copy',
        ];

        $setup = $submission->get_posted_setup();

        $this->assertSame( $master_id, $setup['page_id'] );
        $this->assertSame( 'myaccount', $setup['view'] );
    }

    public function test_the_old_migration_form_stands_down_once_the_block_takes_over() {
        $form          = dokan_get_container()->get( MyAccountForm::class );
        $_POST         = [ 'dokan_migration' => 'Become a Vendor' ];
        WC()->initialize_session();

        $form->refuse_legacy_migration();
        $this->assertArrayHasKey( 'dokan_migration', $_POST ); // phpcs:ignore WordPress.Security.NonceVerification.Missing

        $this->onboarding_page( $this->master_block() );
        $form->refuse_legacy_migration();

        $this->assertArrayNotHasKey( 'dokan_migration', $_POST ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
    }

    public function test_a_shortcode_drawn_form_belongs_to_the_master_page() {
        $master_id = $this->onboarding_page( $this->master_block() );
        $this->on_page( '[dokan-vendor-registration]' );

        $block = dokan_get_container()->get( Block::class );
        $block->reset_render_count( '' );

        $html = $block->skip_shortcode_next_to_block( false, 'dokan-vendor-registration' );

        $this->assertStringContainsString( 'name="dokan_vreg_form" value="' . $master_id . '"', $html );
        $this->assertStringContainsString( 'wp-block-dokan-vendor-registration', $html );
    }

    public function test_the_old_shortcodes_keep_their_login_and_registration_choices() {
        $this->onboarding_page( $this->master_block() );
        $this->on_page( '' );
        $block = dokan_get_container()->get( Block::class );

        // The registration shortcode never had a login box.
        $block->reset_render_count( '' );
        $this->assertStringNotContainsString( 'dokan-vreg__login', $block->skip_shortcode_next_to_block( false, 'dokan-vendor-registration', [] ) );

        $block->reset_render_count( '' );
        $this->assertStringNotContainsString( 'dokan-vreg__login', $block->skip_shortcode_next_to_block( false, 'dokan-vendor-onboarding-registration', [ 'show_login' => 'no' ] ) );

        $block->reset_render_count( '' );
        $this->assertStringContainsString( 'dokan-vreg__login', $block->skip_shortcode_next_to_block( false, 'dokan-vendor-onboarding-registration', [] ) );

        // Login only: the old shortcode draws itself.
        $this->assertFalse( $block->skip_shortcode_next_to_block( false, 'dokan-vendor-onboarding-registration', [ 'show_registration' => 'no' ] ) );
    }
}
