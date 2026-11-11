<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\REST\StoreController;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Utilities\VendorUtil;
use WP_REST_Request;

/**
 * Covers the shared shop URL normalizer and the paths that save a nicename.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class ShopUrlAvailabilityTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /**
     * Create a vendor whose nicename is `taken-shop`.
     *
     * @return int
     */
    private function create_taken_vendor(): int {
        return $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'taken-shop',
            ]
        );
    }

    public static function reformatted_url_provider(): array {
        return [
            'exact'       => [ 'taken-shop' ],
            'upper case'  => [ 'TAKEN-SHOP' ],
            'with spaces' => [ 'Taken Shop' ],
        ];
    }

    public function test_the_normalizer_matches_wordpress() {
        $this->assertSame( 'my-new-shop', VendorUtil::sanitize_shop_url( 'My New Shop' ) );
        $this->assertSame( 'taken-shop', VendorUtil::sanitize_shop_url( 'TAKEN-SHOP' ) );
    }

    /**
     * @dataProvider reformatted_url_provider
     */
    public function test_a_taken_url_is_unavailable_in_any_spelling( string $shop_url ) {
        $this->create_taken_vendor();

        $this->assertFalse( VendorUtil::is_shop_url_available( $shop_url ) );
    }

    public static function unusable_url_provider(): array {
        return [
            'punctuation only' => [ '!!!' ],
            'non-latin'        => [ 'দোকান' ],
            'over 50 chars'    => [ str_repeat( 'a', 51 ) ],
        ];
    }

    /**
     * @dataProvider unusable_url_provider
     */
    public function test_a_url_wordpress_would_refuse_is_unavailable( string $shop_url ) {
        $this->assertFalse( VendorUtil::is_shop_url_available( $shop_url ) );
    }

    public function test_a_fifty_character_url_is_still_allowed() {
        $this->assertTrue( VendorUtil::is_shop_url_available( str_repeat( 'a', 50 ) ) );
    }

    public function test_the_excluded_user_may_keep_their_own_url() {
        $vendor_id = $this->create_taken_vendor();

        $this->assertTrue( VendorUtil::is_shop_url_available( 'taken-shop', $vendor_id ) );
        $this->assertTrue( VendorUtil::is_shop_url_available( 'free-shop' ) );
    }

    public function test_the_filter_can_reserve_a_url() {
        add_filter(
            'dokan_is_shop_url_available',
            function ( bool $available, string $shop_url ) {
                return 'reserved' === $shop_url ? false : $available;
            },
            10,
            2
        );

        $this->assertFalse( VendorUtil::is_shop_url_available( 'Reserved' ) );
        $this->assertTrue( VendorUtil::is_shop_url_available( 'free-shop' ) );
    }

    public function test_the_rest_availability_check_normalizes_the_slug() {
        $this->create_taken_vendor();

        $request = new WP_REST_Request( 'GET', '/dokan/v1/stores/check' );
        $request->set_param( 'store_slug', 'Taken Shop' );

        $response = ( new StoreController() )->check_store_availability( $request );

        $this->assertSame(
            [
                'url'       => 'taken-shop',
                'available' => false,
            ],
            $response->get_data()
        );
    }

    public function test_creating_a_vendor_with_a_taken_url_is_rejected() {
        $this->create_taken_vendor();

        $result = dokan()->vendor->create(
            [
                'user_login'    => 'newvendor',
                'email'         => 'newvendor@example.com',
                'user_nicename' => 'Taken Shop',
                'store_name'    => 'New Vendor',
            ]
        );

        $this->assertWPError( $result );
        $this->assertSame( 'shop-url-error', $result->get_error_code() );
        $this->assertFalse( get_user_by( 'login', 'newvendor' ) );
    }

    public function test_updating_a_vendor_to_a_taken_url_is_rejected() {
        $this->create_taken_vendor();
        $vendor_id = $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'other-shop',
            ]
        );

        $result = dokan()->vendor->update(
            $vendor_id,
            [
                'first_name'    => 'Changed',
                'user_nicename' => 'Taken Shop',
            ]
        );

        $this->assertWPError( $result );
        $this->assertSame( 400, $result->get_error_data()['status'] );
        $this->assertSame( 'other-shop', get_userdata( $vendor_id )->user_nicename );
        // Nothing is written when the request is rejected.
        $this->assertSame( '', get_userdata( $vendor_id )->first_name );
    }

    public function test_the_rest_update_returns_a_client_error_for_a_taken_url() {
        $this->create_taken_vendor();
        $vendor_id = $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'other-shop',
            ]
        );
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

        $request = new WP_REST_Request( 'PUT', '/dokan/v1/stores/' . $vendor_id );
        $request->set_param( 'id', $vendor_id );
        $request->set_param( 'user_nicename', 'Taken Shop' );

        $result = ( new StoreController() )->update_store( $request );

        $this->assertWPError( $result );
        $this->assertSame( 'shop-url-error', $result->get_error_code() );
        $this->assertSame( 400, $result->get_error_data()['status'] );
    }

    public function test_updating_a_vendor_saves_a_free_url_normalized() {
        $vendor_id = $this->factory()->user->create(
            [
                'role'          => 'seller',
                'user_nicename' => 'other-shop',
            ]
        );

        dokan()->vendor->update( $vendor_id, [ 'user_nicename' => 'My New Shop' ] );

        $this->assertSame( 'my-new-shop', get_userdata( $vendor_id )->user_nicename );
    }
}
