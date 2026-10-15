<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Vendor\Vendor;

/**
 * Profile data survives admin vendor creation regardless of the selling flag.
 *
 * @group vendor
 */
class VendorCreateProfileTest extends DokanTestCase {

    /**
     * Only the vendor manager is exercised; no REST server needed.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    public function set_up() {
        parent::set_up();

        // make_active() is gated on manage_woocommerce, so run as an admin.
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
    }

    /**
     * Payload with every profile section populated.
     */
    protected function payload( array $extra = [] ): array {
        $suffix = wp_rand( 1000, 9999 );

        return $extra + [
            'store_name' => "Profile Store $suffix",
            'user_login' => "profile_vendor_$suffix",
            'user_pass'  => 'profile-pass',
            'email'      => "profile_vendor_$suffix@example.test",
            'phone'      => '+15550001234',
            'address'    => [
                'street_1' => '1 Test St',
                'city'     => 'Dublin',
                'zip'      => 'D01',
                'state'    => 'D',
                'country'  => 'IE',
            ],
            'payment'    => [
                'bank'   => [
                    'ac_name'   => 'Holder',
                    'ac_number' => '123',
                ],
                'paypal' => [ 'email' => 'pp@example.test' ],
            ],
            'social'     => [ 'fb' => 'https://fb.com/profile' ],
        ];
    }

    /**
     * Assert the stored profile carries every section from the payload.
     */
    protected function assert_profile_stored( Vendor $vendor, array $payload ): void {
        $profile = get_user_meta( $vendor->get_id(), 'dokan_profile_settings', true );

        $this->assertSame( $payload['store_name'], $profile['store_name'] );
        $this->assertSame( $payload['phone'], $profile['phone'] );
        $this->assertSame( $payload['address'], $profile['address'] );
        $this->assertSame( $payload['payment']['bank'], $profile['payment']['bank'] );
        $this->assertSame( $payload['payment']['paypal'], $profile['payment']['paypal'] );
        $this->assertSame( $payload['social']['fb'], $profile['social']['fb'] );
        $this->assertSame( $payload['store_name'], get_user_meta( $vendor->get_id(), 'dokan_store_name', true ) );
    }

    public function test_profile_is_stored_when_selling_is_enabled_on_create() {
        $payload = $this->payload( [ 'enabled' => true ] );

        $vendor = dokan()->vendor->create( $payload );

        $this->assertInstanceOf( Vendor::class, $vendor );
        $this->assertSame( 'yes', get_user_meta( $vendor->get_id(), 'dokan_enable_selling', true ) );
        $this->assert_profile_stored( $vendor, $payload );
    }

    public function test_profile_is_stored_when_selling_is_disabled_on_create() {
        $payload = $this->payload( [ 'enabled' => false ] );

        $vendor = dokan()->vendor->create( $payload );

        $this->assertInstanceOf( Vendor::class, $vendor );
        $this->assert_profile_stored( $vendor, $payload );
    }

    public function test_returned_vendor_reflects_profile_when_selling_is_enabled() {
        $payload = $this->payload(
            [
                'enabled'  => true,
                'featured' => true,
                'trusted'  => true,
            ]
        );

        $vendor = dokan()->vendor->create( $payload );
        $data   = $vendor->to_array();

        $this->assertSame( $payload['phone'], $data['phone'] );
        $this->assertSame( $payload['address']['city'], $data['address']['city'] );
        $this->assertTrue( $data['enabled'] );
        $this->assertTrue( $data['featured'] );
        $this->assertTrue( $data['trusted'] );
    }

    public function test_vendor_enabled_hook_sees_the_stored_profile() {
        $seen_phone = null;

        add_action(
            'dokan_vendor_enabled',
            function ( $vendor_id ) use ( &$seen_phone ) {
                $seen_phone = dokan()->vendor->get( $vendor_id )->get_phone();
            }
        );

        $payload = $this->payload( [ 'enabled' => true ] );
        dokan()->vendor->create( $payload );

        $this->assertSame( $payload['phone'], $seen_phone );
    }
}
