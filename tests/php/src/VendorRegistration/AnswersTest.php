<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\AnswersAdmin;
use WeDevs\Dokan\VendorRegistration\AnswersSettingsTab;
use WeDevs\Dokan\VendorRegistration\FormSetup;
use WeDevs\Dokan\VendorRegistration\Submission;
use WeDevs\Dokan\VendorRegistration\VendorAnswers;

/**
 * Covers a vendor's custom sign-up answers after sign-up: Store Settings, admin and privacy tools.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class AnswersTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /** @var VendorAnswers */
    protected $answers;

    /** @var int */
    protected $vendor_id;

    /** @var int */
    protected $page_id;

    public function set_up() {
        parent::set_up();

        dokan_get_container()->get( FormSetup::class )->flush_cache();
        $this->answers   = dokan_get_container()->get( VendorAnswers::class );
        $this->page_id   = $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_title'   => 'Join us',
                'post_content' => serialize_block(
                    [
                        'blockName'    => FormSetup::BLOCK_NAME,
                        'attrs'        => [
                            'sections' => [
                                [
                                    'id'   => 'additional',
                                    'rows' => [
                                        [
                                            'id'      => 'f1',
                                            'custom'  => true,
                                            'type'    => 'select',
                                            'label'   => 'Business type',
                                            'metaKey' => 'dokan_vreg_business_type',
                                            'options' => [
                                                [
                                                    'label' => 'Company',
                                                    'value' => 'company',
                                                ],
                                            ],
                                        ],
                                        [
                                            'id'      => 'f2',
                                            'custom'  => true,
                                            'type'    => 'checkbox',
                                            'label'   => 'Ships abroad',
                                            'metaKey' => 'dokan_vreg_ships_abroad',
                                        ],
                                        [
                                            'id'      => 'f3',
                                            'custom'  => true,
                                            'type'    => 'email',
                                            'label'   => 'Support email',
                                            'metaKey' => 'dokan_vreg_support_email',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'innerBlocks'  => [],
                        'innerHTML'    => '',
                        'innerContent' => [],
                    ]
                ),
            ]
        );
        $this->vendor_id = $this->factory()->user->create(
            [
                'role'       => 'seller',
                'user_email' => 'answers@example.test',
            ]
        );

        update_user_meta( $this->vendor_id, Submission::SIGNUP_PAGE_META, $this->page_id );
        update_user_meta( $this->vendor_id, 'dokan_vreg_business_type', 'company' );
    }

    public function test_answers_come_from_the_sign_up_pages_form() {
        $sections = $this->answers->get_sections( $this->vendor_id );

        $this->assertSame( $this->page_id, $this->answers->get_form( $this->vendor_id )['page_id'] );
        $this->assertSame( [ 'dokan_vreg_business_type', 'dokan_vreg_ships_abroad', 'dokan_vreg_support_email' ], wp_list_pluck( $sections[0]['fields'], 'meta_key' ) );
        $this->assertSame( 'company', $sections[0]['fields'][0]['value'] );
    }

    public function test_a_vendor_without_a_block_form_has_no_answers() {
        $this->assertSame( [], $this->answers->get_sections( $this->factory()->user->create( [ 'role' => 'seller' ] ) ) );
    }

    public function test_updates_are_checked_and_only_touch_the_forms_fields() {
        $this->assertWPError( $this->answers->update( $this->vendor_id, [ 'dokan_vreg_support_email' => 'nope' ] ) );

        $result = $this->answers->update(
            $this->vendor_id,
            [
                'dokan_vreg_support_email' => 'help@example.test',
                'dokan_vreg_business_type' => '',
                'dokan_vreg_not_in_form'   => 'x',
            ]
        );

        $this->assertTrue( $result );
        $this->assertSame( 'help@example.test', get_user_meta( $this->vendor_id, 'dokan_vreg_support_email', true ) );
        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_business_type', true ) );
        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_not_in_form', true ) );
    }

    public function test_the_settings_tab_uses_the_settings_pages_controls() {
        wp_set_current_user( $this->vendor_id );
        $tab      = dokan_get_container()->get( AnswersSettingsTab::class );
        $elements = array_column( $tab->add_tab( [], $this->vendor_id ), null, 'id' );

        $this->assertSame( 60, $elements[ AnswersSettingsTab::TAB_ID ]['priority'] );
        $this->assertSame( 'select', $elements['dokan_vreg_business_type']['variant'] );
        $this->assertSame( [ [ 'title' => 'Company', 'value' => 'company' ] ], $elements['dokan_vreg_business_type']['options'] ); // phpcs:ignore WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
        $this->assertSame( 'switch', $elements['dokan_vreg_ships_abroad']['variant'] );
        $this->assertSame( 'no', $elements['dokan_vreg_ships_abroad']['value'] );
        $this->assertTrue( $elements['dokan_vreg_support_email']['non_meta'] );

        $other = $this->factory()->user->create( [ 'role' => 'seller' ] );
        wp_set_current_user( $other );
        $this->assertSame( [], $tab->add_tab( [], $other ) );
    }

    public function test_store_staff_do_not_see_the_vendors_answers() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'vendor_staff' ] ) );

        $this->assertSame( [], dokan_get_container()->get( AnswersSettingsTab::class )->add_tab( [], $this->vendor_id ) );
    }

    public function test_the_settings_tab_validates_and_saves_answers() {
        wp_set_current_user( $this->vendor_id );
        $tab = dokan_get_container()->get( AnswersSettingsTab::class );

        $errors = $tab->validate( [], [ 'dokan_vreg_support_email' => 'nope' ], [], $this->vendor_id );
        $this->assertArrayHasKey( 'dokan_vreg_support_email', $errors );

        $tab->save(
            $this->vendor_id,
            [
                'dokan_vreg_ships_abroad'  => 'yes',
                'dokan_vreg_support_email' => 'help@example.test',
            ]
        );

        $this->assertSame( 'yes', get_user_meta( $this->vendor_id, 'dokan_vreg_ships_abroad', true ) );
        $this->assertSame( 'help@example.test', get_user_meta( $this->vendor_id, 'dokan_vreg_support_email', true ) );

        $tab->save( $this->vendor_id, [ 'dokan_vreg_ships_abroad' => 'no' ] );
        $this->assertSame( 'no', get_user_meta( $this->vendor_id, 'dokan_vreg_ships_abroad', true ) );
    }

    public function test_privacy_export_and_erase_cover_every_answer() {
        $admin = dokan_get_container()->get( AnswersAdmin::class );
        update_user_meta( $this->vendor_id, 'dokan_vreg_removed_field', 'kept answer' );

        $export = $admin->export( 'answers@example.test' );
        $data   = wp_list_pluck( $export['data'][0]['data'], 'value', 'name' );

        $this->assertSame( 'Company', $data['Business type'] );
        $this->assertSame( 'kept answer', $data['dokan_vreg_removed_field'] );
        $this->assertSame( 'Join us', $data['Signed up on'] );

        $erase = $admin->erase( 'answers@example.test' );

        $this->assertTrue( $erase['items_removed'] );
        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_business_type', true ) );
        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_removed_field', true ) );
        $this->assertSame( [], $admin->export( 'answers@example.test' )['data'] );
    }

    public function test_only_shop_managers_and_admins_manage_answers_of_vendors() {
        $admin = dokan_get_container()->get( AnswersAdmin::class );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        $this->assertTrue( $admin->can_manage( $this->vendor_id ) );
        $this->assertFalse( $admin->can_manage( $this->factory()->user->create( [ 'role' => 'customer' ] ) ) );

        wp_set_current_user( $this->vendor_id );
        $this->assertFalse( $admin->can_manage( $this->vendor_id ) );

        // Admins also count as sellers for Dokan, but they have no sign-up answers.
        $admin_id = $this->factory()->user->create( [ 'role' => 'administrator' ] );
        wp_set_current_user( $admin_id );
        $this->assertFalse( $admin->can_manage( $admin_id ) );
    }

    public function test_a_required_field_added_later_never_blocks_saving_a_profile() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        $post = get_post( $this->page_id );
        wp_update_post(
            [
                'ID'           => $this->page_id,
                'post_content' => str_replace( '"label":"Support email"', '"label":"Support email","required":true', $post->post_content ),
            ]
        );
        dokan_get_container()->get( FormSetup::class )->flush_cache();

        $_POST  = [
            'dokan_vreg_answers_nonce' => wp_create_nonce( 'dokan_vreg_answers' ),
            'dokan_vreg'               => [ 'dokan_vreg_business_type' => 'company' ],
            'dokan_vreg_shown'         => [ 'dokan_vreg_business_type', 'dokan_vreg_support_email' ],
        ];
        $errors = new \WP_Error();

        dokan_get_container()->get( AnswersAdmin::class )->validate_profile_section( $errors, true, get_userdata( $this->vendor_id ) );

        $this->assertFalse( $errors->has_errors() );
    }

    public function test_phone_counts_in_profile_completion_only_when_filled() {
        $registration = dokan()->registration;
        $_POST        = [
            '_wpnonce'          => wp_create_nonce( 'woocommerce-register' ),
            'woocommerce-register-nonce' => wp_create_nonce( 'woocommerce-register' ),
            'shopname'          => 'Shop',
            'phone'             => '',
        ];

        $without = $this->factory()->user->create();
        $registration->save_vendor_info( $without, [ 'role' => 'seller' ] );
        $profile = get_user_meta( $without, 'dokan_profile_settings', true );

        $this->assertArrayNotHasKey( 'phone', $profile['profile_completion'] );
        $this->assertSame( 10, $profile['profile_completion']['progress'] );

        $_POST['phone'] = '01700000000';
        $with           = $this->factory()->user->create();
        $registration->save_vendor_info( $with, [ 'role' => 'seller' ] );
        $profile = get_user_meta( $with, 'dokan_profile_settings', true );

        $this->assertSame( 10, $profile['profile_completion']['phone'] );
        $this->assertSame( 20, $profile['profile_completion']['progress'] );
    }

    public function test_unchanged_answers_never_block_a_settings_save() {
        wp_set_current_user( $this->vendor_id );
        $tab = dokan_get_container()->get( AnswersSettingsTab::class );

        // An old answer the form's rules no longer accept, sent back unchanged with the rest of the page.
        update_user_meta( $this->vendor_id, 'dokan_vreg_support_email', 'not-an-email' );
        $errors = $tab->validate( [], [ 'dokan_vreg_support_email' => 'not-an-email' ], [], $this->vendor_id );

        $this->assertSame( [], $errors );
    }

    public function test_an_unanswered_number_stays_empty() {
        $tab = dokan_get_container()->get( AnswersSettingsTab::class );

        $this->assertSame( '', $tab->pass_through( '' ) );
        $this->assertSame( [ 'a', 'b' ], $tab->pass_through( [ 'a', [ 'x' ], 'b' ] ) );
    }

    public function test_a_field_hidden_later_still_shows_while_it_has_an_answer() {
        $content = str_replace( '"label":"Ships abroad"', '"label":"Ships abroad","hidden":true', get_post( $this->page_id )->post_content );
        wp_update_post(
            [
                'ID'           => $this->page_id,
                'post_content' => $content,
            ]
        );

        $this->assertArrayNotHasKey( 'dokan_vreg_ships_abroad', $this->answers->get_fields( $this->vendor_id ) );

        update_user_meta( $this->vendor_id, 'dokan_vreg_ships_abroad', 'yes' );

        $this->assertArrayHasKey( 'dokan_vreg_ships_abroad', $this->answers->get_fields( $this->vendor_id ) );
    }

    public function test_an_admins_edit_saves_even_when_an_untouched_answer_breaks_a_newer_rule() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        $post = get_post( $this->page_id );
        wp_update_post(
            [
                'ID'           => $this->page_id,
                'post_content' => str_replace( '"label":"Support email"', '"label":"Support email","required":true', $post->post_content ),
            ]
        );
        dokan_get_container()->get( FormSetup::class )->flush_cache();
        update_user_meta( $this->vendor_id, 'dokan_vreg_business_type', 'company' );

        // The support email was never answered and is now required; the admin only clears the business type.
        $_POST = [
            'dokan_vreg_answers_nonce' => wp_create_nonce( 'dokan_vreg_answers' ),
            'dokan_vreg'               => [ 'dokan_vreg_support_email' => '' ],
            'dokan_vreg_shown'         => [ 'dokan_vreg_business_type', 'dokan_vreg_support_email' ],
        ];

        dokan_get_container()->get( AnswersAdmin::class )->save_profile_section( $this->vendor_id );

        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_business_type', true ) );
    }

    public function test_an_unticked_checkbox_saved_as_no_is_not_a_change() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        $post = get_post( $this->page_id );
        wp_update_post(
            [
                'ID'           => $this->page_id,
                'post_content' => str_replace( '"label":"Ships abroad"', '"label":"Ships abroad","required":true', $post->post_content ),
            ]
        );
        dokan_get_container()->get( FormSetup::class )->flush_cache();
        update_user_meta( $this->vendor_id, 'dokan_vreg_ships_abroad', 'no' );

        $_POST  = [
            'dokan_vreg_answers_nonce' => wp_create_nonce( 'dokan_vreg_answers' ),
            'dokan_vreg'               => [
                'dokan_vreg_ships_abroad'  => '',
                'dokan_vreg_support_email' => 'help@example.test',
            ],
        ];
        $errors = new \WP_Error();
        $admin  = dokan_get_container()->get( AnswersAdmin::class );

        $admin->validate_profile_section( $errors, true, get_userdata( $this->vendor_id ) );
        $admin->save_profile_section( $this->vendor_id );

        $this->assertFalse( $errors->has_errors() );
        $this->assertSame( 'help@example.test', get_user_meta( $this->vendor_id, 'dokan_vreg_support_email', true ) );
    }

    public function test_an_admin_can_clear_a_multi_select() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        update_user_meta( $this->vendor_id, 'dokan_vreg_business_type', 'company' );

        $_POST = [
            'dokan_vreg_answers_nonce' => wp_create_nonce( 'dokan_vreg_answers' ),
            'dokan_vreg_shown'         => [ 'dokan_vreg_business_type' ],
        ];

        dokan_get_container()->get( AnswersAdmin::class )->save_profile_section( $this->vendor_id );

        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_business_type', true ) );
    }
}
