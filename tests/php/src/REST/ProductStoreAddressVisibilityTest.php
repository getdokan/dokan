<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Utilities\VendorUtil;
use WP_REST_Response;

/**
 * The store embedded in product responses honours the admin's "Hide Store Address" setting.
 *
 * @group dokan-product-controller
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\REST\ProductController::prepare_data_for_response
 * @covers \WeDevs\Dokan\REST\Manager::prepare_product_response
 * @covers \WeDevs\Dokan\Utilities\VendorUtil::current_user_can_view_store_address
 */
class ProductStoreAddressVisibilityTest extends DokanTestCase {

    /**
     * Published product owned by seller_id1.
     *
     * @var int
     */
    protected int $product_id;

    /**
     * Setup test fixtures.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        $profile            = (array) get_user_meta( $this->seller_id1, 'dokan_profile_settings', true );
        $profile['address'] = [
            'street_1' => '1 Test Street',
            'city'     => 'Dhaka',
            'zip'      => '1207',
            'country'  => 'BD',
        ];

        update_user_meta( $this->seller_id1, 'dokan_profile_settings', $profile );

        $this->product_id = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
                    'name'   => 'Address Visibility Product',
                    'status' => 'publish',
                ]
            );
    }

    /**
     * Set the admin's "Hide Vendor Info → Store Address" option.
     *
     * @param bool $hidden Whether the store address is hidden.
     *
     * @return void
     */
    protected function hide_store_address( bool $hidden ): void {
        $appearance = (array) get_option( 'dokan_appearance', [] );

        $appearance['hide_vendor_info'] = $hidden ? [ 'address' => 'address' ] : [];

        update_option( 'dokan_appearance', $appearance );
    }

    /**
     * Stores embedded in the fixture product by every serializer that adds one.
     *
     * @return array Label => embedded store.
     */
    protected function get_embedded_stores(): array {
        $stores = [];

        foreach ( [ "stores/{$this->seller_id1}/products", 'products/latest' ] as $route ) {
            $response = $this->get_request( $route, [ 'per_page' => 100 ] );

            $this->assertEquals( 200, $response->get_status(), $route );

            foreach ( $response->get_data() as $product ) {
                if ( $this->product_id === (int) $product['id'] ) {
                    $stores[ $route ] = $product['store'];
                }
            }

            $this->assertArrayHasKey( $route, $stores, "Product {$this->product_id} missing from {$route}" );
        }

        // WooCommerce's own product responses get the store through this filter callback.
        $response                 = dokan()->api->prepare_product_response( new WP_REST_Response( [ 'id' => $this->product_id ] ) );
        $stores['wc product hook'] = $response->get_data()['store'];

        return $stores;
    }

    /**
     * Resolve a caller label to a user id.
     *
     * @param string $caller Caller label.
     *
     * @return int
     */
    protected function get_caller_id( string $caller ): int {
        if ( 'owner_staff' === $caller || 'other_staff' === $caller ) {
            $staff_id = $this->factory()->user->create( [ 'role' => 'customer' ] );

            ( new \WP_User( $staff_id ) )->add_cap( 'vendor_staff' );
            update_user_meta( $staff_id, '_vendor_id', 'owner_staff' === $caller ? $this->seller_id1 : $this->seller_id2 );

            return $staff_id;
        }

        $ids = [
            'anonymous'     => 0,
            'customer'      => $this->customer_id,
            'other_vendor'  => $this->seller_id2,
            'owner'         => $this->seller_id1,
            'administrator' => $this->admin_id,
        ];

        return $ids[ $caller ];
    }

    /**
     * Callers the hidden address must not reach.
     *
     * @return array
     */
    public function other_caller_provider(): array {
        return [
            'anonymous'          => [ 'anonymous' ],
            'customer'           => [ 'customer' ],
            'other vendor'       => [ 'other_vendor' ],
            'other vendor staff' => [ 'other_staff' ],
        ];
    }

    /**
     * Callers that keep the address whatever the setting says.
     *
     * @return array
     */
    public function owner_and_admin_provider(): array {
        return [
            'owner'         => [ 'owner' ],
            'owner staff'   => [ 'owner_staff' ],
            'administrator' => [ 'administrator' ],
        ];
    }

    /**
     * Every caller.
     *
     * @return array
     */
    public function all_caller_provider(): array {
        return array_merge( $this->other_caller_provider(), $this->owner_and_admin_provider() );
    }

    /**
     * @dataProvider other_caller_provider
     *
     * @param string $caller Caller label.
     *
     * @return void
     */
    public function test_hidden_address_is_omitted_for_other_callers( string $caller ): void {
        $this->hide_store_address( true );

        wp_set_current_user( $this->get_caller_id( $caller ) );

        foreach ( $this->get_embedded_stores() as $label => $store ) {
            $this->assertSame( $this->seller_id1, (int) $store['id'], $label );
            $this->assertArrayNotHasKey( 'address', $store, "Store address leaked to {$caller} on {$label}" );
        }
    }

    /**
     * @dataProvider owner_and_admin_provider
     *
     * @param string $caller Caller label.
     *
     * @return void
     */
    public function test_hidden_address_is_kept_for_owner_and_admin( string $caller ): void {
        $this->hide_store_address( true );

        wp_set_current_user( $this->get_caller_id( $caller ) );

        foreach ( $this->get_embedded_stores() as $label => $store ) {
            $this->assertSame( '1 Test Street', $store['address']['street_1'], "{$caller} on {$label}" );
        }
    }

    /**
     * @dataProvider all_caller_provider
     *
     * @param string $caller Caller label.
     *
     * @return void
     */
    public function test_address_stays_public_while_the_setting_is_off( string $caller ): void {
        $this->hide_store_address( false );

        wp_set_current_user( $this->get_caller_id( $caller ) );

        foreach ( $this->get_embedded_stores() as $label => $store ) {
            $this->assertSame( '1 Test Street', $store['address']['street_1'], "{$caller} on {$label}" );
        }
    }

    /**
     * WooCommerce's own product route is readable by other vendors, so it follows the setting too.
     *
     * @return void
     */
    public function test_hidden_address_is_omitted_on_the_woocommerce_product_route(): void {
        $this->hide_store_address( true );

        wp_set_current_user( $this->seller_id2 );

        $this->namespace = 'wc/v3';

        $response = $this->get_request( "products/{$this->product_id}" );

        $this->assertEquals( 200, $response->get_status() );
        $this->assertArrayNotHasKey( 'address', $response->get_data()['store'] );
    }

    /**
     * A product without a vendor does not make a logged-out visitor its owner.
     *
     * @return void
     */
    public function test_logged_out_visitor_never_matches_a_missing_vendor(): void {
        $this->hide_store_address( true );

        wp_set_current_user( 0 );

        $this->assertFalse( VendorUtil::current_user_can_view_store_address( 0 ) );
    }
}
