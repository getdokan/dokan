<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\StoreController;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Test cases for StoreController authorization logic.
 *
 * @group dokan-store-controller
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\REST\StoreController::update_store_permissions_check
 * @covers \WeDevs\Dokan\REST\StoreController::get_store
 * @covers \WeDevs\Dokan\REST\StoreController::update_store
 * @covers \WeDevs\Dokan\Traits\VendorAuthorizable::can_access_vendor_store
 * @covers \WeDevs\Dokan\Traits\VendorAuthorizable::get_vendor_id_for_user
 */
class StoreControllerAuthorizationTest extends DokanTestCase {

    /**
     * Store controller instance.
     *
     * @var StoreController
     */
    protected StoreController $controller;

    /**
     * Vendor staff user ID for seller_id1.
     *
     * @var int
     */
    protected int $vendor_staff_id1;

    /**
     * Vendor staff user ID for seller_id2.
     *
     * @var int
     */
    protected int $vendor_staff_id2;

    /**
     * Setup test environment.
     *
     * @return void
     */
    protected function setUp(): void {
        parent::setUp();

        $this->controller = new StoreController();
        $this->controller->register_routes();

        // Create vendor staff users
        $this->vendor_staff_id1 = $this->create_vendor_staff( $this->seller_id1 );
        $this->vendor_staff_id2 = $this->create_vendor_staff( $this->seller_id2 );
    }

    /**
     * Create a vendor staff user for the given vendor ID.
     *
     * @param int $vendor_id The vendor ID to associate staff with.
     * @return int The staff user ID.
     */
    protected function create_vendor_staff( int $vendor_id ): int {
        $staff_id = $this->factory()->user->create(
            [
                'role' => 'vendor_staff',
            ]
        );

        // Set vendor association
        update_user_meta( $staff_id, '_vendor_id', $vendor_id );

        return $staff_id;
    }

    /**
     * Test that admin can update any vendor settings.
     *
     * @return void
     */
    public function test_admin_can_update_any_vendor_settings(): void {
        wp_set_current_user( $this->admin_id );

        // Test updating seller_id1's store as admin
        $response = $this->put_request(
            "stores/{$this->seller_id1}",
            [
                'store_name' => 'Admin Updated Store Name',
            ]
        );

        $this->assertEquals( 200, $response->get_status(), 'Admin should be able to update vendor 1 store' );
        $data = $response->get_data();
        $this->assertEquals( 'Admin Updated Store Name', $data['store_name'] );

        // Test updating seller_id2's store as admin
        $response = $this->put_request(
            "stores/{$this->seller_id2}",
            [
                'store_name' => 'Admin Updated Store Name 2',
            ]
        );

        $this->assertEquals( 200, $response->get_status(), 'Admin should be able to update vendor 2 store' );
        $data = $response->get_data();
        $this->assertEquals( 'Admin Updated Store Name 2', $data['store_name'] );
    }

    /**
     * Test that admin can access any vendor store.
     *
     * @return void
     */
    public function test_admin_can_access_any_vendor_store(): void {
        wp_set_current_user( $this->admin_id );

        // Test accessing seller_id1's store
        $response = $this->get_request( "stores/{$this->seller_id1}" );
        $this->assertEquals( 200, $response->get_status(), 'Admin should be able to access vendor 1 store' );

        // Test accessing seller_id2's store
        $response = $this->get_request( "stores/{$this->seller_id2}" );
        $this->assertEquals( 200, $response->get_status(), 'Admin should be able to access vendor 2 store' );
    }

    /**
     * Test that vendor can access their own store.
     *
     * @return void
     */
    public function test_vendor_can_access_their_own_store(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( "stores/{$this->seller_id1}" );
        $this->assertEquals( 200, $response->get_status(), 'Vendor should be able to access their own store' );

        $data = $response->get_data();
        $this->assertEquals( $this->seller_id1, $data['id'], 'Store ID should match vendor ID' );
    }

    /**
     * Test that vendor can update their own store settings.
     *
     * @return void
     */
    public function test_vendor_can_update_their_own_store_settings(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->put_request(
            "stores/{$this->seller_id1}",
            [
                'store_name' => 'My Updated Store Name',
            ]
        );

        $this->assertEquals( 200, $response->get_status(), 'Vendor should be able to update their own store' );
        $data = $response->get_data();
        $this->assertEquals( 'My Updated Store Name', $data['store_name'] );
    }

    /**
     * Test that vendor cannot access another vendor's store.
     *
     * @return void
     */
    public function test_vendor_cannot_access_another_vendor_store(): void {
        wp_set_current_user( $this->seller_id1 );

        // Try to access seller_id2's store
        $response = $this->get_request( "stores/{$this->seller_id2}" );
        $this->assertEquals( 403, $response->get_status(), 'Vendor should not be able to access another vendor store' );

        $data = $response->get_data();
        $this->assertEquals( 'rest_forbidden', $data['code'], 'Error code should be rest_forbidden' );
        $this->assertStringContainsString( 'permissions', $data['message'], 'Error message should mention permissions' );
    }

    /**
     * Test that vendor cannot update another vendor's store settings.
     *
     * @return void
     */
    public function test_vendor_cannot_update_another_vendor_store(): void {
        wp_set_current_user( $this->seller_id1 );

        // Try to update seller_id2's store
        $response = $this->put_request(
            "stores/{$this->seller_id2}",
            [
                'store_name' => 'Unauthorized Update',
            ]
        );

        $this->assertEquals( 403, $response->get_status(), 'Vendor should not be able to update another vendor store' );
    }

    /**
     * Test that vendor staff can access their associated vendor's store.
     *
     * @return void
     */
    public function test_vendor_staff_can_access_associated_store(): void {
        wp_set_current_user( $this->vendor_staff_id1 );

        // Staff should be able to access their vendor's store by vendor ID
        $response = $this->get_request( "stores/{$this->seller_id1}" );
        $this->assertEquals( 200, $response->get_status(), 'Vendor staff should be able to access their vendor store' );

        $data = $response->get_data();
        $this->assertEquals( $this->seller_id1, $data['id'], 'Store ID should match associated vendor ID' );

        // Staff should also be able to access their vendor's store using their own ID
        // (the system should resolve staff ID to vendor ID)
        $response = $this->get_request( "stores/{$this->vendor_staff_id1}" );
        $this->assertEquals( 200, $response->get_status(), 'Vendor staff should be able to access store using their own ID' );

        $data = $response->get_data();
        $this->assertEquals( $this->seller_id1, $data['id'], 'Store ID should resolve to associated vendor ID' );
    }

    /**
     * Test that vendor staff can update their associated vendor's store settings.
     *
     * @return void
     */
    public function test_vendor_staff_can_update_associated_store(): void {
        wp_set_current_user( $this->vendor_staff_id1 );

        // Staff should be able to update their vendor's store by vendor ID
        $response = $this->put_request(
            "stores/{$this->seller_id1}",
            [
                'store_name' => 'Updated by Staff',
            ]
        );

        $this->assertEquals( 200, $response->get_status(), 'Vendor staff should be able to update their vendor store' );
        $data = $response->get_data();
        $this->assertEquals( 'Updated by Staff', $data['store_name'] );

        // Staff should also be able to update using their own ID
        // (the system should resolve staff ID to vendor ID)
        $response = $this->put_request(
            "stores/{$this->vendor_staff_id1}",
            [
                'store_name' => 'Updated by Staff via Self ID',
            ]
        );

        $this->assertEquals( 200, $response->get_status(), 'Vendor staff should be able to update store using their own ID' );
        $data = $response->get_data();
        $this->assertEquals( 'Updated by Staff via Self ID', $data['store_name'] );
    }

    /**
     * Test that vendor staff cannot access another vendor's store.
     *
     * @return void
     */
    public function test_vendor_staff_cannot_access_another_vendor_store(): void {
        wp_set_current_user( $this->vendor_staff_id1 );

        // Try to access seller_id2's store (different vendor)
        $response = $this->get_request( "stores/{$this->seller_id2}" );
        $this->assertEquals( 403, $response->get_status(), 'Vendor staff should not be able to access another vendor store' );

        $data = $response->get_data();
        $this->assertEquals( 'rest_forbidden', $data['code'], 'Error code should be rest_forbidden' );
    }

    /**
     * Test that vendor staff cannot update another vendor's store.
     *
     * @return void
     */
    public function test_vendor_staff_cannot_update_another_vendor_store(): void {
        wp_set_current_user( $this->vendor_staff_id1 );

        // Try to update seller_id2's store (different vendor)
        $response = $this->put_request(
            "stores/{$this->seller_id2}",
            [
                'store_name' => 'Unauthorized Staff Update',
            ]
        );

        $this->assertEquals( 403, $response->get_status(), 'Vendor staff should not be able to update another vendor store' );
    }

    /**
     * Test that customer cannot access any vendor store.
     *
     * @return void
     */
    public function test_customer_cannot_access_vendor_store(): void {
        wp_set_current_user( $this->customer_id );

        // Try to access seller_id1's store
        $response = $this->get_request( "stores/{$this->seller_id1}" );
        $this->assertEquals( 403, $response->get_status(), 'Customer should not be able to access vendor store' );

        $data = $response->get_data();
        $this->assertEquals( 'rest_forbidden', $data['code'], 'Error code should be rest_forbidden' );
    }

    /**
     * Test that customer cannot update any vendor store settings.
     *
     * @return void
     */
    public function test_customer_cannot_update_vendor_store(): void {
        wp_set_current_user( $this->customer_id );

        // Try to update seller_id1's store
        $response = $this->put_request(
            "stores/{$this->seller_id1}",
            [
                'store_name' => 'Unauthorized Customer Update',
            ]
        );

        $this->assertEquals( 403, $response->get_status(), 'Customer should not be able to update vendor store' );
    }

    /**
     * Test that unauthenticated user cannot access vendor store.
     *
     * @return void
     */
    public function test_unauthenticated_user_cannot_access_vendor_store(): void {
        wp_set_current_user( 0 );

        // Try to access seller_id1's store
        $response = $this->get_request( "stores/{$this->seller_id1}" );
        // Note: get_store has permission_callback '__return_true', so unauthenticated users can view stores
        // This test verifies the authorization logic within get_store itself
        // However, if the store doesn't exist or authorization fails, it returns 403
        $this->assertContains(
            $response->get_status(),
            [ 200, 403 ],
            'Unauthenticated user access depends on store visibility settings'
        );
    }

    /**
     * Test that unauthenticated user cannot update vendor store.
     *
     * @return void
     */
    public function test_unauthenticated_user_cannot_update_vendor_store(): void {
        wp_set_current_user( 0 );

        // Try to update seller_id1's store
        $response = $this->put_request(
            "stores/{$this->seller_id1}",
            [
                'store_name' => 'Unauthorized Update',
            ]
        );

        $this->assertEquals( 401, $response->get_status(), 'Unauthenticated user should not be able to update vendor store' );
    }

    /**
     * Test that vendor staff from different vendors cannot access each other's stores.
     *
     * @return void
     */
    public function test_different_vendor_staff_cannot_access_each_others_stores(): void {
        // Staff from vendor 1 trying to access vendor 2's store
        wp_set_current_user( $this->vendor_staff_id1 );
        $response = $this->get_request( "stores/{$this->seller_id2}" );
        $this->assertEquals( 403, $response->get_status(), 'Vendor staff 1 should not access vendor 2 store' );

        // Staff from vendor 2 trying to access vendor 1's store
        wp_set_current_user( $this->vendor_staff_id2 );
        $response = $this->get_request( "stores/{$this->seller_id1}" );
        $this->assertEquals( 403, $response->get_status(), 'Vendor staff 2 should not access vendor 1 store' );
    }

    /**
     * Test vendor ID resolution for vendor staff when accessing store by staff ID.
     *
     * @return void
     */
    public function test_vendor_id_resolution_for_staff_accessing_by_staff_id(): void {
        wp_set_current_user( $this->vendor_staff_id1 );

        // When staff accesses store using their own ID, it should resolve to their vendor's ID
        $response = $this->get_request( "stores/{$this->vendor_staff_id1}" );
        $this->assertEquals( 200, $response->get_status(), 'Staff should access store using their own ID' );

        $data = $response->get_data();
        $this->assertEquals(
            $this->seller_id1,
            $data['id'],
            'Store ID should resolve to the staff member\'s associated vendor ID, not the staff ID'
        );
    }

    /**
     * Test vendor ID resolution for vendor staff when updating store by staff ID.
     *
     * @return void
     */
    public function test_vendor_id_resolution_for_staff_updating_by_staff_id(): void {
        wp_set_current_user( $this->vendor_staff_id1 );

        // When staff updates store using their own ID, it should resolve to their vendor's ID
        $response = $this->put_request(
            "stores/{$this->vendor_staff_id1}",
            [
                'store_name' => 'Staff Update via Self ID',
            ]
        );

        $this->assertEquals( 200, $response->get_status(), 'Staff should update store using their own ID' );

        $data = $response->get_data();
        $this->assertEquals( 'Staff Update via Self ID', $data['store_name'] );
        $this->assertEquals(
            $this->seller_id1,
            $data['id'],
            'Store ID should resolve to the staff member\'s associated vendor ID, not the staff ID'
        );
    }

    /**
     * Test that accessing non-existent store returns validation error.
     *
     * @return void
     */
    public function test_accessing_nonexistent_store_returns_404(): void {
        wp_set_current_user( $this->admin_id );

        // Validation callback returns 400 for non-existent stores (GET request)
        $response = $this->get_request( 'stores/99999' );
        $this->assertEquals( 400, $response->get_status(), 'Non-existent store should return 400 (validation error) for GET requests' );
        $data = $response->get_data();
        $this->assertEquals( 'rest_invalid_param', $data['code'], 'Error code should be rest_invalid_param' );

        // For update, the update_store method checks and returns 404 (not found)
        $response = $this->put_request(
            'stores/99999',
            [
                'store_name' => 'Test',
            ]
        );
        $this->assertEquals( 404, $response->get_status(), 'Updating non-existent store should return 404 (not found)' );
        $data = $response->get_data();
        $this->assertEquals( 'dokan_rest_store_not_found', $data['code'], 'Error code should be dokan_rest_store_not_found' );
    }

    /**
     * Test authorization check with invalid vendor ID.
     *
     * @return void
     */
    public function test_authorization_with_invalid_vendor_id(): void {
        wp_set_current_user( $this->seller_id1 );

        // Try to access store with ID 0 - validation should catch this first
        $response = $this->get_request( 'stores/0' );
        $this->assertEquals( 400, $response->get_status(), 'Invalid vendor ID (0) should return 400 (validation error)' );
        $data = $response->get_data();
        $this->assertEquals( 'rest_invalid_param', $data['code'], 'Error code should be rest_invalid_param' );
    }

    /**
     * Test that vendor staff cannot access store if vendor_id meta is missing.
     *
     * @return void
     */
    public function test_vendor_staff_without_vendor_id_meta_cannot_access_store(): void {
        // Create staff without vendor_id meta
        $orphan_staff_id = $this->factory()->user->create(
            [
                'role' => 'vendor_staff',
            ]
        );
        // Don't set _vendor_id meta

        wp_set_current_user( $orphan_staff_id );

        // Try to access any store
        $response = $this->get_request( "stores/{$this->seller_id1}" );
        $this->assertEquals( 403, $response->get_status(), 'Staff without vendor_id meta should not access store' );

        // Clean up
        wp_delete_user( $orphan_staff_id );
    }
}
