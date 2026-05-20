<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Schema;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 * @group settings-schema
 */
class SettingsRegistryFindFieldTest extends DokanTestCase {

	protected function setUp(): void {
		parent::setUp();
		$repo = new SettingsRepository();
		$repo->replace( [] );
	}

	protected function tearDown(): void {
		$repo = new SettingsRepository();
		$repo->replace( [] );
		parent::tearDown();
	}

	public function test_find_field_returns_field_array_for_registered_id(): void {
		$registry = new SettingsRegistry();
		$field    = $registry->find_field( 'vendor_store_url_slug' );

		$this->assertNotNull( $field, 'vendor_store_url_slug must be registered.' );
		$this->assertSame( 'vendor_store_url_slug', $field['id'] );
		$this->assertSame( 'field', $field['type'] );
		$this->assertArrayHasKey( 'default', $field );
	}

	public function test_find_field_returns_null_for_unregistered_id(): void {
		$registry = new SettingsRegistry();
		$this->assertNull( $registry->find_field( 'definitely_not_a_real_field_id' ) );
	}

	public function test_find_field_returns_null_for_structural_node_ids(): void {
		$registry = new SettingsRegistry();

		// Walk the schema to find a non-field element id (page/section/tab/etc.).
		$structural_id = null;
		foreach ( $registry->get_schema() as $el ) {
			if ( ( $el['type'] ?? '' ) !== 'field' && ! empty( $el['id'] ) ) {
				$structural_id = $el['id'];
				break;
			}
		}
		$this->assertNotNull( $structural_id, 'Schema must contain at least one structural node for this test.' );

		$this->assertNull(
			$registry->find_field( $structural_id ),
			'find_field() must return null for non-field elements even when the id exists in the schema.'
		);
	}

	public function test_clear_cache_invalidates_field_index(): void {
		$registry = new SettingsRegistry();

		// Prime the index.
		$this->assertNotNull( $registry->find_field( 'vendor_store_url_slug' ) );

		// Mutate stored value, clear cache, re-read — the rebuilt field should reflect the new value.
		$repo = new SettingsRepository();
		$repo->update( [ 'vendor_store_url_slug' => 'boutique' ] );
		$registry->clear_cache();

		$field = $registry->find_field( 'vendor_store_url_slug' );
		$this->assertNotNull( $field );
		$this->assertSame( 'boutique', $field['value'] );
	}
}
