<?php

namespace WeDevs\Dokan\Test\Abilities;

use WeDevs\Dokan\Abilities\Support\VendorPayload;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 *
 * Tests the shared vendor payload builder used by the product / order ability output.
 */
class VendorPayloadTest extends DokanTestCase {

    public function test_zero_user_is_an_empty_payload() {
        $payload = VendorPayload::for_user( 0 );

        $this->assertSame( 0, $payload['id'] );
        $this->assertSame( '', $payload['store_name'] );
    }

    public function test_uses_the_shop_name_when_available() {
        $payload = VendorPayload::for_user( $this->seller_id1 );

        $this->assertSame( $this->seller_id1, $payload['id'] );
        $this->assertNotSame( '', $payload['store_name'] );
        $this->assertSame( dokan()->vendor->get( $this->seller_id1 )->get_shop_name(), $payload['store_name'] );
    }

    public function test_falls_back_to_display_name_when_no_shop_name() {
        // An admin who owns orders / products but never configured a store has no shop name.
        $user_id = $this->factory()->user->create( [ 'display_name' => 'No Shop Admin' ] );
        delete_user_meta( $user_id, 'dokan_profile_settings' );

        $payload = VendorPayload::for_user( $user_id );

        $this->assertSame( $user_id, $payload['id'] );
        $this->assertSame( 'No Shop Admin', $payload['store_name'] );
    }
}
