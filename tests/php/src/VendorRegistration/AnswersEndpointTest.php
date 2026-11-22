<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\FormSetup;
use WeDevs\Dokan\VendorRegistration\Submission;
use WP_REST_Request;

/**
 * Covers the endpoint the admin's vendor page reads and edits sign-up answers through.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class AnswersEndpointTest extends DokanTestCase {

    /** @var int */
    protected $vendor_id;

    /** @var int */
    protected $page_id;

    public function set_up() {
        parent::set_up();

        dokan_get_container()->get( FormSetup::class )->flush_cache();
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
        $this->vendor_id = $this->factory()->user->create( [ 'role' => 'seller' ] );

        update_user_meta( $this->vendor_id, Submission::SIGNUP_PAGE_META, $this->page_id );
        update_user_meta( $this->vendor_id, 'dokan_vreg_business_type', 'company' );
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
    }

    private function request( string $method, array $answers = [] ): WP_REST_Request {
        $request = new WP_REST_Request( $method, '/dokan/v1/vendor-registration/answers/' . $this->vendor_id );

        if ( 'PUT' === $method ) {
            $request->set_body_params( [ 'answers' => $answers ] );
        }

        return $request;
    }

    public function test_admins_read_the_answers_grouped_by_section_with_the_sign_up_page() {
        $response = $this->server->dispatch( $this->request( 'GET' ) );
        $data     = $response->get_data();

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( $this->page_id, $data['page']['id'] );
        $this->assertSame( 'Join us', $data['page']['title'] );
        $this->assertSame( 'Additional Information', $data['sections'][0]['title'] );

        $fields = array_column( $data['sections'][0]['fields'], null, 'key' );

        $this->assertSame( 'company', $fields['dokan_vreg_business_type']['value'] );
        $this->assertSame( 'Company', $fields['dokan_vreg_business_type']['display'] );
        // Unanswered: the page shows "Not answered yet" for an empty value.
        $this->assertSame( '', $fields['dokan_vreg_support_email']['value'] );
    }

    public function test_vendors_and_customers_cannot_read_them() {
        wp_set_current_user( $this->vendor_id );
        $this->assertSame( 403, $this->server->dispatch( $this->request( 'GET' ) )->get_status() );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'customer' ] ) );
        $this->assertSame( 403, $this->server->dispatch( $this->request( 'GET' ) )->get_status() );
    }

    public function test_a_non_vendor_has_no_answers_to_manage() {
        $this->vendor_id = $this->factory()->user->create( [ 'role' => 'customer' ] );

        $this->assertSame( 403, $this->server->dispatch( $this->request( 'GET' ) )->get_status() );
    }

    public function test_changed_answers_are_checked_and_saved() {
        $response = $this->server->dispatch(
            $this->request(
                'PUT',
                [
                    'dokan_vreg_business_type' => '',
                    'dokan_vreg_support_email' => 'help@example.test',
                ]
            )
        );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'help@example.test', get_user_meta( $this->vendor_id, 'dokan_vreg_support_email', true ) );
        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_business_type', true ) );

        $fields = array_column( $response->get_data()['sections'][0]['fields'], null, 'key' );
        $this->assertSame( 'help@example.test', $fields['dokan_vreg_support_email']['value'] );
    }

    public function test_an_invalid_change_is_refused_and_nothing_is_saved() {
        $response = $this->server->dispatch(
            $this->request(
                'PUT',
                [
                    'dokan_vreg_business_type' => '',
                    'dokan_vreg_support_email' => 'nope',
                ]
            )
        );

        $this->assertSame( 400, $response->get_status() );
        $this->assertSame( 'company', get_user_meta( $this->vendor_id, 'dokan_vreg_business_type', true ) );
        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_support_email', true ) );
    }

    public function test_an_untouched_answer_a_newer_rule_rejects_does_not_block_a_save() {
        update_user_meta( $this->vendor_id, 'dokan_vreg_support_email', 'not-an-email' );

        $response = $this->server->dispatch(
            $this->request(
                'PUT',
                [
                    'dokan_vreg_business_type' => '',
                    'dokan_vreg_support_email' => 'not-an-email',
                ]
            )
        );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_business_type', true ) );
    }

    public function test_keys_outside_the_form_are_ignored() {
        $response = $this->server->dispatch( $this->request( 'PUT', [ 'dokan_vreg_not_in_form' => 'x' ] ) );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( '', get_user_meta( $this->vendor_id, 'dokan_vreg_not_in_form', true ) );
    }
}
