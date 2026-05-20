<?php

namespace WeDevs\Dokan\Test\Admin\Settings;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\SettingsAccessor;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group admin-settings
 * @group settings-accessor
 */
class SettingsAccessorTest extends DokanTestCase {

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

	public function test_get_returns_stored_value_for_registered_id(): void {
		$repo = new SettingsRepository();
		$repo->update( [ 'vendor_store_url_slug' => 'boutique' ] );

		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertSame( 'boutique', $accessor->get( 'vendor_store_url_slug' ) );
	}

	public function test_get_returns_schema_default_when_no_stored_value(): void {
		// dokan_admin_settings is empty (cleared in setUp). vendor_store_url_slug has a
		// schema default of 'store' (see SettingsSchema.php:165).
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertSame( 'store', $accessor->get( 'vendor_store_url_slug' ) );
	}

	public function test_get_returns_fallback_for_unregistered_key(): void {
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertSame(
			'sentinel',
			$accessor->get( 'not_a_real_setting_xyz', 'sentinel' )
		);
	}

	public function test_get_ignores_fallback_when_key_is_registered(): void {
		// Stored value present — fallback should be ignored.
		$repo = new SettingsRepository();
		$repo->update( [ 'vendor_store_url_slug' => 'boutique' ] );

		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertSame( 'boutique', $accessor->get( 'vendor_store_url_slug', 'IGNORED' ) );
	}

	public function test_has_returns_true_for_registered_field_id(): void {
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertTrue( $accessor->has( 'vendor_store_url_slug' ) );
	}

	public function test_has_returns_false_for_unregistered_id(): void {
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertFalse( $accessor->has( 'not_a_real_setting_xyz' ) );
	}

	public function test_has_stored_returns_false_for_unregistered_id(): void {
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertFalse( $accessor->has_stored( 'not_a_real_setting_xyz' ) );
	}

	public function test_has_stored_returns_false_when_registered_but_unset(): void {
		// dokan_admin_settings is empty (cleared in setUp). vendor_store_url_slug is
		// registered with a schema default — has() is true, has_stored() must be false.
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertTrue( $accessor->has( 'vendor_store_url_slug' ) );
		$this->assertFalse( $accessor->has_stored( 'vendor_store_url_slug' ) );
	}

	public function test_has_stored_returns_true_when_value_in_new_flat_option(): void {
		$repo = new SettingsRepository();
		$repo->update( [ 'vendor_store_url_slug' => 'boutique' ] );

		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertTrue( $accessor->has_stored( 'vendor_store_url_slug' ) );
	}

	public function test_has_stored_returns_true_when_value_only_in_legacy_option(): void {
		// New flat option is empty; legacy dokan_general.custom_store_url is set.
		// The bridge overlay must make this count as "stored".
		update_option( 'dokan_general', [ 'custom_store_url' => 'shoppe' ] );

		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertTrue(
			$accessor->has_stored( 'vendor_store_url_slug' ),
			'A value present only in the mapped legacy option must count as stored via the bridge overlay.'
		);

		// Cleanup outside the standard tearDown.
		delete_option( 'dokan_general' );
	}

	public function test_all_returns_every_field_keyed_by_id_with_value_or_default(): void {
		$repo = new SettingsRepository();
		$repo->update( [ 'vendor_store_url_slug' => 'boutique' ] );

		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$all      = $accessor->all();

		$this->assertIsArray( $all );
		$this->assertNotEmpty( $all, 'all() must return every registered field, not an empty array.' );
		$this->assertArrayHasKey( 'vendor_store_url_slug', $all );
		$this->assertSame( 'boutique', $all['vendor_store_url_slug'] );

		foreach ( $all as $id => $_value ) {
			$this->assertIsString( $id );
		}

		// Cross-check exhaustiveness: every field id the registry knows about
		// must appear in the snapshot.
		$registry = new SettingsRegistry();
		foreach ( $registry->get_schema() as $element ) {
			if ( ( $element['type'] ?? '' ) !== 'field' ) {
				continue;
			}
			$id = $element['id'] ?? '';
			if ( '' === $id ) {
				continue;
			}
			$this->assertArrayHasKey( $id, $all, "Field {$id} must be present in all() snapshot." );
		}
	}
}
