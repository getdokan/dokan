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
		$repo->update( [ 'vendor_store_url' => 'boutique' ] );

		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertSame( 'boutique', $accessor->get( 'vendor_store_url' ) );
	}

	public function test_get_returns_schema_default_when_no_stored_value(): void {
		// dokan_admin_settings is empty (cleared in setUp). vendor_store_url has a
		// schema default of 'store' (see SettingsSchema.php:165).
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertSame( 'store', $accessor->get( 'vendor_store_url' ) );
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
		$repo->update( [ 'vendor_store_url' => 'boutique' ] );

		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertSame( 'boutique', $accessor->get( 'vendor_store_url', 'IGNORED' ) );
	}

	public function test_has_returns_true_for_registered_field_id(): void {
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertTrue( $accessor->has( 'vendor_store_url' ) );
	}

	public function test_has_returns_false_for_unregistered_id(): void {
		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$this->assertFalse( $accessor->has( 'not_a_real_setting_xyz' ) );
	}

	public function test_all_returns_every_field_keyed_by_id_with_value_or_default(): void {
		$repo = new SettingsRepository();
		$repo->update( [ 'vendor_store_url' => 'boutique' ] );

		$accessor = new SettingsAccessor( new SettingsRegistry() );
		$all      = $accessor->all();

		$this->assertIsArray( $all );
		$this->assertArrayHasKey( 'vendor_store_url', $all );
		$this->assertSame( 'boutique', $all['vendor_store_url'] );

		foreach ( $all as $id => $_value ) {
			$this->assertIsString( $id );
		}
	}
}
