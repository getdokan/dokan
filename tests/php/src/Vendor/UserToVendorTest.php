<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Vendor\Vendor;

class UserToVendorTest extends \WP_UnitTestCase {

    /**
     * Check vendor class persists `shop_data` on save.
     *
     * @test
     */
    public function test_vendor_data_is_persisted_on_save() {
		$user = $this->factory()->user->create_and_get();

		$data = [
			'shopurl'  => '',
			'fname'    => 'John',
			'lname'    => 'Doe',
			'shopname' => 'My Shop',
			'phone'    => '+00000000000000',
			'address'  => 'My Address',
		];

        add_action(
            'dokan_new_seller_created', function ( $user_id, $vendor_info ) use ( $data ) {
				$this->assertEquals( $data['shopname'], $vendor_info['store_name'] );
				$this->assertEquals( $data['phone'], $vendor_info['phone'] );
			}, 10, 2
        );

		dokan_user_update_to_seller( $user, $data );

		$vendor = new Vendor( $user->ID );
		$shop_info = $vendor->get_shop_info();
		$this->assertEquals( $data['shopname'], $shop_info['store_name'] );
		$this->assertEquals( $data['phone'], $shop_info['phone'] );

		$this->assertTrue( (bool) did_action( 'dokan_new_seller_created' ) );
    }
}
