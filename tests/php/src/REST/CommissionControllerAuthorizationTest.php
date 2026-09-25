<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\CommissionControllerV1;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Response;

/**
 * Authorization test for the commission calculator REST endpoint.
 *
 * `GET dokan/v1/commission` used to gate on the `dokandar` capability alone, so any vendor
 * could recover another vendor's negotiated rate by pointing `vendor_id` or `product_id`
 * at that vendor (getdokan/dokan-pro#6181).
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-commission
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\REST\CommissionControllerV1::get_permissions_check
 */
class CommissionControllerAuthorizationTest extends DokanTestCase {

    /**
     * Vendor-level rate of seller 1, in percent.
     *
     * @var int
     */
    protected const OWN_RATE = 11;

    /**
     * Vendor-level rate of seller 2, in percent.
     *
     * @var int
     */
    protected const OTHER_RATE = 27;

    /**
     * Product owned by seller 1.
     *
     * @var int
     */
    protected $own_product_id;

    /**
     * Product owned by seller 2.
     *
     * @var int
     */
    protected $other_product_id;

    public function set_up() {
        parent::set_up();

        ( new CommissionControllerV1() )->register_routes();

        $this->own_product_id   = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();
        $this->other_product_id = $this->factory()->product->set_seller_id( $this->seller_id2 )->create();

        // Distinct vendor-level rates, so a leak shows up as the other vendor's earning.
        $this->set_vendor_rate( $this->seller_id1, self::OWN_RATE );
        $this->set_vendor_rate( $this->seller_id2, self::OTHER_RATE );
    }

    /**
     * Pointing `vendor_id` at another vendor, with no product, is refused.
     */
    public function test_vendor_cannot_target_another_vendor_by_id() {
        wp_set_current_user( $this->seller_id1 );

        $this->assertSame( 403, $this->request( [ 'vendor_id' => $this->seller_id2 ] )->get_status() );
    }

    /**
     * Deriving the vendor from another vendor's product is refused.
     */
    public function test_vendor_cannot_target_another_vendors_product() {
        wp_set_current_user( $this->seller_id1 );

        $this->assertSame( 403, $this->request( [ 'product_id' => $this->other_product_id ] )->get_status() );
    }

    /**
     * An own product does not launder a foreign `vendor_id`.
     */
    public function test_vendor_cannot_pair_own_product_with_another_vendor_id() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->request(
            [
                'product_id' => $this->own_product_id,
                'vendor_id'  => $this->seller_id2,
            ]
        );

        $this->assertSame( 403, $response->get_status() );
    }

    /**
     * The product editor's request shape (own product, no vendor_id) keeps working.
     */
    public function test_vendor_receives_own_earning() {
        wp_set_current_user( $this->seller_id1 );

        $this->assertEarning( self::OWN_RATE, $this->request( [ 'product_id' => $this->own_product_id ] ) );
    }

    /**
     * A vendor may still name themselves explicitly.
     */
    public function test_vendor_may_pass_own_vendor_id() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->request(
            [
                'product_id' => $this->own_product_id,
                'vendor_id'  => $this->seller_id1,
            ]
        );

        $this->assertEarning( self::OWN_RATE, $response );
    }

    /**
     * A not-yet-saved product (ID 0) is still allowed, as the new-product form sends it.
     */
    public function test_vendor_may_calculate_without_a_saved_product() {
        wp_set_current_user( $this->seller_id1 );

        $this->assertSame( 200, $this->request( [] )->get_status() );
    }

    /**
     * Admins keep calculating for any vendor.
     */
    public function test_admin_can_target_any_vendor() {
        wp_set_current_user( $this->admin_id );

        $response = $this->request(
            [
                'product_id' => $this->other_product_id,
                'vendor_id'  => $this->seller_id2,
            ]
        );

        $this->assertEarning( self::OTHER_RATE, $response );
    }

    /**
     * A shop manager holds `dokandar` and `manage_woocommerce` but not `manage_options`; they keep store-wide access.
     */
    public function test_shop_manager_can_target_any_vendor() {
        wp_set_current_user( $this->factory()->user->create( [ 'role' => 'shop_manager' ] ) );

        $this->assertFalse( current_user_can( 'manage_options' ), 'Precondition: shop managers are not administrators.' );

        $this->assertEarning( self::OTHER_RATE, $this->request( [ 'product_id' => $this->other_product_id ] ) );
    }

    /**
     * Dispatch the commission route for an amount of 100, as the product editor does.
     *
     * @param array $params Request parameters beyond the amount.
     *
     * @return WP_REST_Response
     */
    protected function request( array $params ): WP_REST_Response {
        return $this->get_request( 'commission', array_merge( [ 'amount' => 100 ], $params ) );
    }

    /**
     * Assert the response is the vendor earning left after the given percentage on an amount of 100.
     *
     * @param int              $rate     Admin commission percentage.
     * @param WP_REST_Response $response Dispatched response.
     */
    protected function assertEarning( int $rate, WP_REST_Response $response ): void {
        $this->assertSame( 200, $response->get_status() );
        $this->assertEquals( 100 - $rate, (float) $response->get_data() );
    }

    /**
     * Configure a vendor-level percentage commission.
     *
     * @param int $vendor_id Vendor user ID.
     * @param int $rate      Admin commission percentage.
     */
    protected function set_vendor_rate( int $vendor_id, int $rate ): void {
        dokan()->vendor->get( $vendor_id )->save_commission_settings(
            [
                'type'       => 'percentage',
                'percentage' => $rate,
                'flat'       => 0,
            ]
        );
    }
}
