<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\ProductControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Authorization tests for the v3 products batch endpoint.
 *
 * Validates the IDOR fix from getdokan/dokan-pro#5818 / getdokan/dokan#3288:
 * a vendor must not be able to update or delete another vendor's product through
 * the dokan/v3/products/batch route, while own-product batch operations keep
 * working.
 *
 * @group dokan-product-controller-v3
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\REST\ProductControllerV3::update_item_permissions_check
 * @covers \WeDevs\Dokan\REST\ProductControllerV3::delete_item_permissions_check
 * @covers \WeDevs\Dokan\REST\ProductControllerV3::batch_items_permissions_check
 */
class ProductControllerV3BatchAuthorizationTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Product owned by seller_id1 (vendor A).
     *
     * @var int
     */
    protected int $product_a;

    /**
     * Product owned by seller_id2 (vendor B).
     *
     * @var int
     */
    protected int $product_b;

    /**
     * Setup test environment.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        // Ensure the v3 controller routes are registered against this server.
        $controller = new ProductControllerV3();
        $controller->register_routes();

        $this->product_a = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
					'name' => 'Vendor A Product',
					'regular_price' => '10',
				]
            );

        $this->product_b = $this->factory()->product
            ->set_seller_id( $this->seller_id2 )
            ->create(
                [
					'name' => 'Vendor B Product',
					'regular_price' => '20',
				]
            );
    }

    /**
     * Dispatch a JSON batch request, mirroring a real REST client.
     *
     * @param array $body Batch body (create/update/delete arrays).
     *
     * @return WP_REST_Response
     */
    protected function batch_request( array $body ): WP_REST_Response {
        $request = new WP_REST_Request( 'POST', '/dokan/v3/products/batch' );
        $request->add_header( 'Content-Type', 'application/json' );
        $request->set_body( wp_json_encode( $body ) );

        return $this->server->dispatch( $request );
    }

    /**
     * Vendor A cannot update Vendor B's product through batch update.
     *
     * @return void
     */
    public function test_vendor_cannot_batch_update_another_vendors_product(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->batch_request(
            [
                'update' => [
                    [
						'id' => $this->product_b,
						'regular_price' => '1.00',
					],
                ],
            ]
        );

        $data = $response->get_data();

        $this->assertArrayHasKey( 'update', $data, 'Batch response should contain an update section.' );
        $this->assertArrayHasKey( 'error', $data['update'][0], 'Cross-vendor update item must carry an error.' );
        $this->assertSame( 403, $data['update'][0]['error']['data']['status'], 'Cross-vendor update must be rejected with 403.' );

        // The target product must remain untouched.
        $product_b = wc_get_product( $this->product_b );
        $this->assertSame( '20', $product_b->get_regular_price(), 'Vendor B product price must be unchanged.' );
    }

    /**
     * Vendor A cannot delete Vendor B's product through batch delete.
     *
     * @return void
     */
    public function test_vendor_cannot_batch_delete_another_vendors_product(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->batch_request(
            [
                'delete' => [ $this->product_b ],
            ]
        );

        $data = $response->get_data();

        $this->assertArrayHasKey( 'delete', $data, 'Batch response should contain a delete section.' );
        $this->assertArrayHasKey( 'error', $data['delete'][0], 'Cross-vendor delete item must carry an error.' );
        $this->assertSame( 403, $data['delete'][0]['error']['data']['status'], 'Cross-vendor delete must be rejected with 403.' );

        // The target product must still exist.
        $this->assertInstanceOf( \WC_Product::class, wc_get_product( $this->product_b ), 'Vendor B product must still exist.' );
        $this->assertSame( 'publish', get_post_status( $this->product_b ), 'Vendor B product must not be trashed/deleted.' );
    }

    /**
     * Vendor A can still update their OWN product (no regression).
     *
     * @return void
     */
    public function test_vendor_can_batch_update_own_product(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->batch_request(
            [
                'update' => [
                    [
						'id' => $this->product_a,
						'regular_price' => '9.99',
					],
                ],
            ]
        );

        $data = $response->get_data();

        $this->assertArrayHasKey( 'update', $data );
        $this->assertArrayNotHasKey( 'error', $data['update'][0], 'Own-product update must not error: ' . wp_json_encode( $data['update'][0]['error'] ?? null ) );
        $this->assertSame( $this->product_a, $data['update'][0]['id'], 'Updated item id should match own product.' );

        $product_a = wc_get_product( $this->product_a );
        $this->assertSame( '9.99', $product_a->get_regular_price(), 'Own product price should be updated.' );
    }

    /**
     * Vendor A can still delete their OWN product (no regression).
     *
     * @return void
     */
    public function test_vendor_can_batch_delete_own_product(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->batch_request(
            [
                'delete' => [ $this->product_a ],
            ]
        );

        $data = $response->get_data();

        $this->assertArrayHasKey( 'delete', $data );
        $this->assertArrayNotHasKey( 'error', $data['delete'][0], 'Own-product delete must not error: ' . wp_json_encode( $data['delete'][0]['error'] ?? null ) );
    }

    /**
     * The batch update path must enforce the SAME ownership gate as the
     * single-item update route — this is the asymmetry the fix closes.
     *
     * Vendor A attacking Vendor B's product must be rejected identically
     * whether it goes through PUT /products/{id} or the batch route.
     *
     * @return void
     */
    public function test_batch_update_matches_single_item_route_for_cross_vendor(): void {
        wp_set_current_user( $this->seller_id1 );

        // Single-item route (the route that already had the ownership gate).
        $single = new WP_REST_Request( 'PUT', "/dokan/v3/products/{$this->product_b}" );
        $single->add_header( 'Content-Type', 'application/json' );
        $single->set_body( wp_json_encode( [ 'regular_price' => '1.00' ] ) );
        $single_response = $this->server->dispatch( $single );

        $this->assertSame( 403, $single_response->get_status(), 'Single-item route must reject cross-vendor update.' );
        $this->assertSame( 'dokan_rest_cannot_view', $single_response->get_data()['code'], 'Single-item route error code baseline.' );

        // Batch route must now produce the SAME ownership rejection per item.
        $batch_response = $this->batch_request(
            [
                'update' => [
                    [
						'id' => $this->product_b,
						'regular_price' => '1.00',
					],
                ],
            ]
        );

        $item = $batch_response->get_data()['update'][0];
        $this->assertArrayHasKey( 'error', $item, 'Batch route must reject cross-vendor update.' );
        $this->assertSame(
            $single_response->get_data()['code'],
            $item['error']['code'],
            'Batch route must return the same ownership error as the single-item route (asymmetry closed).'
        );
        $this->assertSame( 403, $item['error']['data']['status'] );
    }

    /**
     * Decisive IDOR test: even when the attacker's role carries WooCommerce's
     * `edit_others_products` / `delete_others_products` meta-capabilities — so
     * WooCommerce's own inherited per-item checks would ALLOW the cross-vendor
     * write — Dokan's explicit ownership gate must still block it.
     *
     * This is the scenario where the missing gate was actually exploitable
     * (elevated vendor roles / custom caps); on pre-fix code the update below
     * succeeds, on fixed code it is rejected with Dokan's ownership error.
     *
     * @return void
     */
    public function test_batch_blocked_even_with_edit_others_capability(): void {
        $attacker = get_user_by( 'id', $this->seller_id1 );
        $attacker->add_cap( 'edit_others_products' );
        $attacker->add_cap( 'edit_published_products' );
        $attacker->add_cap( 'delete_others_products' );
        $attacker->add_cap( 'delete_published_products' );

        wp_set_current_user( $this->seller_id1 );

        // Cross-vendor UPDATE must still be blocked by Dokan's ownership gate.
        $update = $this->batch_request(
            [
                'update' => [
                    [
						'id' => $this->product_b,
						'regular_price' => '0.01',
					],
                ],
            ]
        );

        $update_item = $update->get_data()['update'][0];
        $this->assertArrayHasKey( 'error', $update_item, 'Even with edit_others_products, cross-vendor update must be blocked.' );
        $this->assertSame( 'dokan_rest_cannot_view', $update_item['error']['code'], 'Dokan ownership gate (not WC meta-cap) must do the blocking.' );
        $this->assertSame( 403, $update_item['error']['data']['status'] );
        $this->assertSame( '20', wc_get_product( $this->product_b )->get_regular_price(), 'Victim product price must be unchanged.' );

        // Cross-vendor DELETE must still be blocked by Dokan's ownership gate.
        $delete = $this->batch_request(
            [
                'delete' => [ $this->product_b ],
            ]
        );

        $delete_item = $delete->get_data()['delete'][0];
        $this->assertArrayHasKey( 'error', $delete_item, 'Even with delete_others_products, cross-vendor delete must be blocked.' );
        $this->assertSame( 'dokan_rest_cannot_delete', $delete_item['error']['code'], 'Dokan ownership gate must block the delete.' );
        $this->assertSame( 403, $delete_item['error']['data']['status'] );
        $this->assertSame( 'publish', get_post_status( $this->product_b ), 'Victim product must still exist.' );
    }
}
