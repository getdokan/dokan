<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\SettingsHints;

/**
 * Covers the hints the registration block adds to Dokan's settings.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class SettingsHintsTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    public function set_up() {
        parent::set_up();

        // The hints only run on the settings screen (admin or REST).
        set_current_screen( 'dashboard' );
    }

    /**
     * Make a page with the given content the Vendor Onboarding page.
     *
     * @param string $content Page content.
     *
     * @return int
     */
    private function onboarding_page( string $content ): int {
        $page_id                    = $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
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
     * The schema elements the hints touch, keyed by ID.
     *
     * @return array
     */
    private function hinted_elements(): array {
        $schema = dokan_get_container()->get( SettingsHints::class )->add_hints(
            [
                [
                    'id'          => 'vendor_registration_address_fields',
                    'description' => 'Add Address Fields.',
                ],
                [
                    'id'          => 'reg_tc_page',
                    'description' => 'Pick a page.',
                ],
                [
                    'id'         => 'vendor_onboarding_page',
                    'section_id' => 'vendor_onboarding_page_section',
                ],
            ]
        );

        return array_column( $schema, null, 'id' );
    }

    public function test_settings_the_block_replaces_get_a_help_line() {
        $elements = $this->hinted_elements();

        $this->assertStringContainsString( 'block’s own fields', $elements['vendor_registration_address_fields']['description'] );
        $this->assertStringStartsWith( 'Pick a page.', $elements['reg_tc_page']['description'] );
    }

    public function test_the_onboarding_page_with_the_block_links_to_its_form() {
        // Settings are edited by admins; the edit link needs the right to edit the page.
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
        $page_id = $this->onboarding_page( '<!-- wp:dokan/vendor-registration /-->' );
        $note    = $this->hinted_elements()['vendor_onboarding_page_registration_form'];

        $this->assertSame( 'info', $note['variant'] );
        $this->assertSame( 'Edit registration form', $note['link_title'] );
        $this->assertSame( get_edit_post_link( $page_id, 'raw' ), $note['link_url'] );
        $this->assertSame( 'vendor_onboarding_page_section', $note['section_id'] );
    }

    public function test_the_onboarding_page_without_the_block_warns() {
        $this->onboarding_page( '[dokan-vendor-onboarding-registration]' );
        $note = $this->hinted_elements()['vendor_onboarding_page_registration_form'];

        $this->assertSame( 'notice', $note['variant'] );
        $this->assertSame( 'warning', $note['notice_type'] );
        $this->assertSame( 'Add the block', $note['link_title'] );
    }

    public function test_no_note_when_the_onboarding_page_is_gone() {
        $page_id = $this->onboarding_page( '<!-- wp:dokan/vendor-registration /-->' );
        wp_delete_post( $page_id, true );

        $this->assertArrayNotHasKey( 'vendor_onboarding_page_registration_form', $this->hinted_elements() );
    }

    public function test_no_hints_on_the_front_end() {
        set_current_screen( 'front' );

        $this->assertArrayNotHasKey( 'vendor_onboarding_page_registration_form', $this->hinted_elements() );
    }
}
