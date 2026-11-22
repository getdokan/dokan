<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\FormRenderer;
use WeDevs\Dokan\VendorRegistration\FormSetup;
use WeDevs\Dokan\VendorRegistration\Submission;
use WeDevs\Dokan\VendorRegistration\VendorAnswers;
use WP_Error;

/**
 * Covers the server checks and saving of sign-ups from the registration block.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class SubmissionTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /** @var Submission */
    protected $submission;

    public function set_up() {
        parent::set_up();
        $this->use_shortcode_onboarding_page();

        $this->submission = dokan_get_container()->get( Submission::class );
        dokan_get_container()->get( FormSetup::class )->flush_cache();
    }

    /**
     * Create a published page holding the registration block.
     *
     * @param array  $attributes Block attributes.
     * @param string $status     Post status.
     *
     * @return int
     */
    private function block_page( array $attributes, string $status = 'publish' ): int {
        return $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => $status,
                'post_content' => serialize_block(
                    [
                        'blockName'    => FormSetup::BLOCK_NAME,
                        'attrs'        => $attributes,
                        'innerBlocks'  => [],
                        'innerHTML'    => '',
                        'innerContent' => [],
                    ]
                ),
            ]
        );
    }

    /**
     * Fill $_POST like the block's form does, with a signed copy of the setup.
     *
     * @param array $attributes Block attributes.
     * @param array $fields     Other posted fields.
     * @param int   $page_id    Page the form is on.
     *
     * @return void
     */
    private function post_form( array $attributes, array $fields = [], int $page_id = 0 ): void {
        $page_id = $page_id ? $page_id : $this->block_page( $attributes );
        $signed  = dokan_get_container()->get( FormRenderer::class )->sign_setup( $attributes, $page_id );

        $_POST = array_merge(
            [
                'dokan_vreg_form'  => $page_id,
                'dokan_vreg_setup' => $signed['payload'],
                'dokan_vreg_sig'   => $signed['signature'],
                'role'             => 'seller',
            ],
            $fields
        );
    }

    /**
     * Attributes of a form with an optional phone, a visible address and two custom fields.
     *
     * @return array
     */
    private function attributes(): array {
        return [
            'termsPageId' => $this->factory()->post->create(
                [
                    'post_type'   => 'page',
                    'post_status' => 'publish',
                ]
            ),
            'sections'    => [
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
                    'id'     => 'address',
                    'hidden' => false,
                ],
                [
                    'id'   => 'additional',
                    'rows' => [
                        [
                            'id'       => 'f1',
                            'custom'   => true,
                            'type'     => 'select',
                            'label'    => 'Business type',
                            'required' => true,
                            'metaKey'  => 'dokan_vreg_business_type',
                            'options'  => [
                                [
                                    'label' => 'Company',
                                    'value' => 'company',
                                ],
                            ],
                        ],
                        [
                            'id'      => 'f2',
                            'custom'  => true,
                            'type'    => 'multiselect',
                            'label'   => 'Categories',
                            'metaKey' => 'dokan_vreg_categories',
                            'options' => [
                                [
                                    'label' => 'Books',
                                    'value' => 'books',
                                ],
                                [
                                    'label' => 'Music',
                                    'value' => 'music',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
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

    public function test_other_forms_keep_dokans_required_fields() {
        $fields = [
            'fname' => 'First',
            'phone' => 'Phone',
        ];

        $this->assertSame( $fields, $this->submission->filter_required_fields( $fields ) );
    }

    public function test_required_fields_follow_the_page_setup_and_keep_add_on_fields() {
        $this->post_form( $this->attributes() );

        $required = $this->submission->filter_required_fields(
            [
                'fname'                   => 'First',
                'phone'                   => 'Phone',
                'dokan-subscription-pack' => 'Pick a pack',
            ]
        );

        $this->assertArrayNotHasKey( 'phone', $required );
        $this->assertSame( 'First', $required['fname'] );
        $this->assertArrayHasKey( 'shopurl', $required );
        $this->assertSame( 'Pick a pack', $required['dokan-subscription-pack'] );
    }

    public function test_validate_reports_missing_address_custom_and_terms_answers() {
        $this->post_form(
            $this->attributes(),
            [
                'dokan_address' => [ 'country' => 'BD' ],
                'dokan_vreg'    => [ 'dokan_vreg_categories' => [ 'books', 'not-an-option' ] ],
            ]
        );

        $codes = $this->submission->validate( new WP_Error() )->get_error_codes();

        $this->assertContains( 'dokan_vreg_required_street_1', $codes );
        $this->assertContains( 'dokan_vreg_required_f1', $codes );
        $this->assertContains( 'dokan_vreg_invalid_f2', $codes );
        $this->assertContains( 'dokan_vreg_terms', $codes );
        $this->assertNotContains( 'dokan_vreg_required_street_2', $codes );
        $this->assertNotContains( 'dokan_vreg_required_phone', $codes );
    }

    public function test_a_tampered_setup_is_refused() {
        $this->post_form( $this->attributes() );

        // Drop the required custom field from the posted setup without re-signing it.
        $_POST['dokan_vreg_setup'] = base64_encode( wp_json_encode( [ 'sections' => [] ] ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode

        $this->assertContains( 'dokan_vreg_form', $this->submission->validate( new WP_Error() )->get_error_codes() );
    }

    public function test_a_setup_signed_for_another_page_is_refused() {
        $page_id = $this->block_page( $this->attributes() );
        $this->post_form( $this->attributes(), [], $page_id );
        $_POST['dokan_vreg_form'] = $page_id + 1;

        $this->assertNull( $this->submission->get_posted_setup() );
    }

    public function test_the_setup_works_wherever_the_block_sits() {
        // A template or synced pattern: the page itself has no block.
        $page_id = $this->factory()->post->create( [ 'post_type' => 'page' ] );
        $this->post_form( $this->attributes(), [], $page_id );

        $setup = $this->submission->get_posted_setup();

        $this->assertNotNull( $setup );
        $this->assertSame( $page_id, $setup['page_id'] );
    }

    public function test_an_older_signed_copy_cannot_loosen_the_pages_current_rules() {
        $strict  = $this->attributes();
        $page_id = $this->block_page( $strict );

        // Signed before the owner made the form stricter.
        $this->post_form( [ 'sections' => [] ], [], $page_id );

        $this->assertSame( $strict, $this->submission->get_posted_setup()['attributes'] );
    }

    public function test_a_setup_signed_for_an_unpublished_page_gets_only_the_onboarding_rules() {
        $draft = $this->factory()->post->create(
            [
                'post_type'   => 'page',
                'post_status' => 'draft',
            ]
        );
        $this->post_form( [ 'sections' => [] ], [], $draft );

        $this->assertNull( $this->submission->get_posted_setup() );

        // Signed without a page, e.g. through the block renderer.
        $signed                    = dokan_get_container()->get( FormRenderer::class )->sign_setup( [ 'sections' => [] ], 0 );
        $_POST['dokan_vreg_form']  = 0;
        $_POST['dokan_vreg_setup'] = $signed['payload'];
        $_POST['dokan_vreg_sig']   = $signed['signature'];

        $this->assertNull( $this->submission->get_posted_setup() );
    }

    public function test_a_reformatted_taken_shop_url_is_refused() {
        $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'taken-shop',
            ]
        );

        $this->post_form( [], [ 'shopurl' => 'Taken Shop' ] );

        $this->assertContains( 'shop-url-error', $this->submission->validate( new WP_Error() )->get_error_codes() );
    }

    public function test_customer_sign_ups_are_left_alone() {
        $this->post_form( $this->attributes(), [ 'role' => 'customer' ] );

        $this->assertFalse( $this->submission->validate( new WP_Error() )->has_errors() );
    }

    public function test_answers_and_the_sign_up_page_are_saved() {
        $page_id = $this->factory()->post->create( [ 'post_type' => 'page' ] );
        $user_id = $this->factory()->user->create( [ 'role' => 'seller' ] );

        $this->post_form(
            $this->attributes(),
            [
                'dokan_vreg' => [
                    'dokan_vreg_business_type' => 'company',
                    'dokan_vreg_categories'    => [ 'music', 'hacked' ],
                    'dokan_vreg_not_in_form'   => 'x',
                ],
            ],
            $page_id
        );

        $this->submission->save( $user_id );

        $this->assertSame( 'company', get_user_meta( $user_id, 'dokan_vreg_business_type', true ) );
        $this->assertSame( [ 'music' ], get_user_meta( $user_id, 'dokan_vreg_categories', true ) );
        $this->assertSame( '', get_user_meta( $user_id, 'dokan_vreg_not_in_form', true ) );
        $this->assertSame( $page_id, (int) get_user_meta( $user_id, Submission::SIGNUP_PAGE_META, true ) );

        // The page holds no block (a template or pattern form), so its fields come from the setup kept at sign-up.
        $fields = dokan_get_container()->get( VendorAnswers::class )->get_fields( $user_id );
        $this->assertArrayHasKey( 'dokan_vreg_business_type', $fields );
        $this->assertSame( 'company', $fields['dokan_vreg_business_type']['value'] );
    }

    public function test_customers_get_nothing_saved() {
        $user_id = $this->factory()->user->create( [ 'role' => 'customer' ] );

        $this->post_form( $this->attributes() );

        $this->submission->save( $user_id );

        $this->assertSame( '', get_user_meta( $user_id, Submission::SIGNUP_PAGE_META, true ) );
    }

    public static function answer_provider(): array {
        return [
            'email ok'      => [ 'email', 'a@b.test', true ],
            'email bad'     => [ 'email', 'nope', false ],
            'url ok'        => [ 'url', 'https://example.test', true ],
            'url bad'       => [ 'url', 'not a url', false ],
            'number ok'     => [ 'number', '12.5', true ],
            'number bad'    => [ 'number', 'twelve', false ],
            'date ok'       => [ 'date', '2026-02-28', true ],
            'date bad'      => [ 'date', '2026-02-30', false ],
            'phone ok'      => [ 'phone', '+880 1700-000000', true ],
            'phone bad'     => [ 'phone', 'call me', false ],
            'empty allowed' => [ 'text', '', true ],
        ];
    }

    /**
     * @dataProvider answer_provider
     */
    public function test_custom_answers_are_checked_by_type( string $type, string $answer, bool $valid ) {
        $row = [
            'id'       => 'f',
            'type'     => $type,
            'label'    => 'Field',
            'required' => false,
            'options'  => [],
        ];

        $this->assertSame( $valid, true === $this->submission->validate_custom_answer( $row, $answer ) );
    }

    public function test_answers_are_sanitized_by_type() {
        $this->assertSame( 'no', $this->submission->sanitize_answer( [ 'type' => 'checkbox' ], '' ) );
        $this->assertSame( 'yes', $this->submission->sanitize_answer( [ 'type' => 'checkbox' ], [ '', 'yes' ] ) );
        $this->assertSame( "line one\nline two", $this->submission->sanitize_answer( [ 'type' => 'textarea' ], "line one\nline two<script>" ) );
        $this->assertNull( $this->submission->sanitize_answer( [ 'type' => 'text' ], [ 'array' ] ) );
    }

    public function test_a_list_posted_for_a_single_answer_field_is_no_answer() {
        $row = [
            'id'       => 'f',
            'type'     => 'select',
            'label'    => 'Field',
            'required' => true,
            'options'  => [ [ 'value' => 'a' ] ],
        ];

        $this->assertInstanceOf( WP_Error::class, $this->submission->validate_custom_answer( $row, [ 'a' ] ) );
        $this->assertTrue( $this->submission->validate_custom_answer( $row, 'a' ) );
    }

    public function test_logged_in_users_cannot_sign_up_through_the_visitor_form() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        $this->post_form( $this->attributes() );

        $this->assertContains( 'dokan_vreg_logged_in', $this->submission->validate( new WP_Error() )->get_error_codes() );
    }
}
