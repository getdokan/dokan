<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests that SettingsRegistry drops pages without children.
 *
 * @group admin-settings
 * @group settings-schema
 */
class SettingsRegistryEmptyPageTest extends DokanTestCase {

    public function test_page_without_children_is_removed(): void {
        // Strip any Pro/module subpages so the Product page is left empty.
        add_filter(
            'dokan_get_admin_settings_schema',
            fn( $elements ) => array_values( array_filter( $elements, fn( $el ) => ( $el['page_id'] ?? '' ) !== 'product' ) ),
            PHP_INT_MAX
        );

        $page_ids = $this->get_page_ids();

        $this->assertNotContains( 'product', $page_ids, 'Empty Product page must be removed.' );
        $this->assertContains( 'general', $page_ids, 'Pages with children must be kept.' );
    }

    public function test_page_with_injected_subpage_is_kept(): void {
        add_filter(
            'dokan_get_admin_settings_schema',
            fn( $elements ) => array_merge(
                $elements,
                [
                    [
                        'id'      => 'test_product_subpage',
                        'type'    => 'subpage',
                        'page_id' => 'product',
                        'title'   => 'Test',
                    ],
                ]
            )
        );

        $this->assertContains( 'product', $this->get_page_ids(), 'Product page with a subpage must be kept.' );
    }

    /**
     * Get page IDs from the processed schema.
     *
     * @return array
     */
    private function get_page_ids(): array {
        $schema = ( new SettingsRegistry() )->get_schema( true );

        return array_column( array_filter( $schema, fn( $el ) => ( $el['type'] ?? '' ) === 'page' ), 'id' );
    }
}
