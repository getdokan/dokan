<?php

namespace WeDevs\Dokan\Test;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group coupon-discount
 */
class ReactUrlGenerationTest extends DokanTestCase {

	public function set_up() {
		parent::set_up();
		wp_set_current_user( $this->admin_id );
	}

	public static function data_provider(): array {
		return [
			[
				'slug' => 'withdraw',
				'new_url' => '/dashboard/new/#withdraw',
			],
			[
				'slug' => 'settings/shipping',
				'new_url' => '/dashboard/new/#settings/shipping',
			],
		];
	}

    /**
     * Test coupon with all products.
	 * @dataProvider data_provider
     */
    public function test_dokan_get_navigation_url( $slug, $expected ): void {
		$url = dokan_get_navigation_url( $slug );
		var_dump( 'nav menus --?', dokan_get_dashboard_nav() );
		$this->assertEquals( home_url() . $expected, $url );
    }
}
