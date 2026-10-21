<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\FieldIndex;
use WeDevs\Dokan\VendorRegistration\FormSetup;
use WP_REST_Request;

/**
 * Covers the saved custom field keys the editor can reuse, and the endpoint listing them.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class FieldIndexTest extends DokanTestCase {

    /** @var FieldIndex */
    protected $index;

    public function set_up() {
        parent::set_up();

        $this->index = dokan_get_container()->get( FieldIndex::class );
    }

    /**
     * Create a post holding a registration block with one custom field.
     *
     * @param string $key    Meta key.
     * @param string $label  Label.
     * @param string $status Post status.
     *
     * @return int
     */
    private function form_with( string $key, string $label, string $status = 'publish' ): int {
        return $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => $status,
                'post_title'   => 'Form ' . $label,
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
                                            'type'    => 'text',
                                            'label'   => $label,
                                            'metaKey' => $key,
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
    }

    public function test_keys_come_from_blocks_on_any_page_with_their_answers() {
        $published = $this->form_with( 'dokan_vreg_licence', 'Licence' );
        $draft     = $this->form_with( 'dokan_vreg_warehouse', 'Warehouse', 'draft' );
        update_user_meta( $this->factory()->user->create(), 'dokan_vreg_licence', 'TL-1' );

        $fields = $this->index->get_fields();

        $this->assertSame( 1, $fields['dokan_vreg_licence']['answers'] );
        $this->assertSame( $published, $fields['dokan_vreg_licence']['pages'][0]['id'] );
        $this->assertSame( $draft, $fields['dokan_vreg_warehouse']['pages'][0]['id'] );
        $this->assertFalse( $fields['dokan_vreg_warehouse']['removed'] );
    }

    public function test_keys_only_in_answers_are_removed_fields_with_a_guessed_type() {
        $user_id = $this->factory()->user->create();
        update_user_meta( $user_id, 'dokan_vreg_founded_on', '2020-05-01' );
        update_user_meta( $user_id, 'dokan_vreg_categories', [ 'books' ] );
        update_user_meta( $user_id, 'dokan_vreg_signup_page', 12 );

        $fields = $this->index->get_fields();

        $this->assertTrue( $fields['dokan_vreg_founded_on']['removed'] );
        $this->assertSame( 'date', $fields['dokan_vreg_founded_on']['type'] );
        $this->assertSame( 'Founded On', $fields['dokan_vreg_founded_on']['label'] );
        $this->assertSame( 'multiselect', $fields['dokan_vreg_categories']['type'] );
        $this->assertArrayNotHasKey( 'dokan_vreg_signup_page', $fields );
    }

    public static function sample_provider(): array {
        return [
            'checkbox' => [ 'yes', 'checkbox' ],
            'number'   => [ '42', 'number' ],
            'email'    => [ 'a@b.test', 'email' ],
            'url'      => [ 'https://example.test', 'url' ],
            'textarea' => [ "two\nlines", 'textarea' ],
            'text'     => [ 'hello', 'text' ],
        ];
    }

    /**
     * @dataProvider sample_provider
     */
    public function test_types_are_guessed_from_answers( string $sample, string $type ) {
        $this->assertSame( $type, $this->index->guess_type( $sample ) );
    }

    public function test_the_endpoint_is_for_users_who_can_edit_pages() {
        $this->form_with( 'dokan_vreg_licence', 'Licence' );
        $request = new WP_REST_Request( 'GET', '/dokan/v1/vendor-registration/fields' );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'author' ] ) );
        $this->assertSame( 403, $this->server->dispatch( $request )->get_status() );

        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'editor' ] ) );
        $response = $this->server->dispatch( $request );

        $this->assertSame( 200, $response->get_status() );
        $this->assertContains( 'dokan_vreg_licence', wp_list_pluck( $response->get_data(), 'key' ) );
    }
}
