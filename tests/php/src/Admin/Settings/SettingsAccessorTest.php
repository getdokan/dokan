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
}
