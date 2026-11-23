<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Author scoping tests for the public store products route.
 *
 * `stores/<id>/products` is registered with `__return_true`, so it is normally
 * served to an anonymous caller. These tests lock down both sides of that:
 * the route must return exactly the requested store's published products, and
 * widening it must not hand a vendor a way to read another vendor's objects.
 *
 * @group dokan-store-controller
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\REST\StoreController::get_store_products
 * @covers \WeDevs\Dokan\Abstracts\DokanRESTController::get_items
 * @covers \WeDevs\Dokan\Abstracts\DokanRESTController::prepare_objects_query
 * @covers \WeDevs\Dokan\Abstracts\DokanRESTController::format_collection_response
 */
class StoreProductsScopeTest extends DokanTestCase {

    /**
     * Vendor without a single product.
     *
     * @var int
     */
    protected int $empty_seller_id;

    /**
     * Published product owned by seller_id1.
     *
     * @var int
     */
    protected int $seller1_product_id;

    /**
     * Published product owned by seller_id2.
     *
     * @var int
     */
    protected int $seller2_product_id;

    /**
     * Draft product owned by seller_id2.
     *
     * @var int
     */
    protected int $seller2_draft_id;

    /**
     * Setup test fixtures.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        $this->empty_seller_id = $this->factory()->seller->create();

        $this->seller1_product_id = $this->create_product( $this->seller_id1, 'Vendor One Published', 'publish' );
        $this->seller2_product_id = $this->create_product( $this->seller_id2, 'Vendor Two Published', 'publish' );
        $this->seller2_draft_id   = $this->create_product( $this->seller_id2, 'Vendor Two Draft', 'draft' );
    }

    /**
     * Create a product owned by the given vendor.
     *
     * @param int    $seller_id Vendor the product belongs to.
     * @param string $name      Product name.
     * @param string $status    Post status.
     *
     * @return int Product id.
     */
    protected function create_product( int $seller_id, string $name, string $status ): int {
        return $this->factory()->product
            ->set_seller_id( $seller_id )
            ->create(
                [
                    'name'          => $name,
                    'sku'           => 'scope-' . sanitize_title( $name ),
                    'status'        => $status,
                    'regular_price' => '10',
                ]
            );
    }

    /**
     * Collect the post authors of a collection response.
     *
     * @param array $data Response data.
     *
     * @return array<int> Unique author ids.
     */
    protected function get_authors( array $data ): array {
        $authors = [];

        foreach ( $data as $product ) {
            $authors[] = (int) get_post_field( 'post_author', $product['id'] );
        }

        return array_values( array_unique( $authors ) );
    }

    /**
     * A store with no products must report an empty collection, not the whole catalogue.
     *
     * @return void
     */
    public function test_anonymous_request_for_an_empty_store_returns_nothing(): void {
        wp_set_current_user( 0 );

        $response = $this->get_request( "stores/{$this->empty_seller_id}/products" );

        $this->assertEquals( 200, $response->get_status() );
        $this->assertSame( [], $response->get_data(), 'A store with no products must return an empty collection' );
    }

    /**
     * An empty collection still has to advertise its totals.
     *
     * @return void
     */
    public function test_empty_store_response_carries_zero_total_headers(): void {
        wp_set_current_user( 0 );

        $response = $this->get_request( "stores/{$this->empty_seller_id}/products" );
        $headers  = $response->get_headers();

        $this->assertArrayHasKey( 'X-WP-Total', $headers, 'X-WP-Total must be sent even when the collection is empty' );
        $this->assertEquals( 0, $headers['X-WP-Total'] );
        $this->assertArrayHasKey( 'X-WP-TotalPages', $headers );
        $this->assertEquals( 0, $headers['X-WP-TotalPages'] );
    }

    /**
     * The route must return only the requested store's published products.
     *
     * @return void
     */
    public function test_anonymous_request_is_scoped_to_the_requested_store(): void {
        wp_set_current_user( 0 );

        $response = $this->get_request( "stores/{$this->seller_id2}/products" );
        $data     = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertNotEmpty( $data );
        $this->assertSame( [ $this->seller_id2 ], $this->get_authors( $data ) );

        $product_ids = wp_list_pluck( $data, 'id' );
        $this->assertContains( $this->seller2_product_id, $product_ids );
        $this->assertNotContains( $this->seller1_product_id, $product_ids, 'Another vendor\'s products must not leak' );
        $this->assertNotContains( $this->seller2_draft_id, $product_ids, 'Draft products are not public' );
    }

    /**
     * A logged in vendor gets the same store scoped answer, not their own products.
     *
     * @return void
     */
    public function test_vendor_browsing_another_store_gets_that_store_products(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( "stores/{$this->seller_id2}/products" );
        $data     = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertNotEmpty( $data );
        $this->assertSame( [ $this->seller_id2 ], $this->get_authors( $data ) );
        $this->assertNotContains( $this->seller2_draft_id, wp_list_pluck( $data, 'id' ) );
    }

    /**
     * A store id of `0` cannot be resolved, so it must not fall through to an unscoped query.
     *
     * @return void
     */
    public function test_zero_store_id_is_rejected(): void {
        wp_set_current_user( 0 );

        $response = $this->get_request( 'stores/0/products' );

        $this->assertEquals( 404, $response->get_status() );
        $this->assertEquals( 'no_store_found', $response->get_data()['code'] );
    }

    /**
     * Regression guard for #3274: the `id` param must not scope a vendor's product listing
     * to another vendor, whichever status param is used to try to unlock it.
     *
     * @dataProvider status_param_provider
     *
     * @param array $status_params Status parameters sent along with the `id` param.
     *
     * @return void
     */
    public function test_vendor_cannot_target_another_vendor_via_id_param( array $status_params ): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'products', array_merge( [ 'id' => $this->seller_id2 ], $status_params ) );
        $data     = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertNotEmpty( $data, 'The vendor should still see their own products' );
        $this->assertSame( [ $this->seller_id1 ], $this->get_authors( $data ) );
        $this->assertNotContains( $this->seller2_draft_id, wp_list_pluck( $data, 'id' ) );
    }

    /**
     * Status parameter combinations a vendor could use to try to widen the author gate.
     *
     * @return array<string, array<array<string, mixed>>>
     */
    public function status_param_provider(): array {
        return [
            'no status param'      => [ [] ],
            'status=publish'       => [ [ 'status' => 'publish' ] ],
            'post_status=publish'  => [ [ 'post_status' => 'publish' ] ],
            'post_status[]=publish' => [ [ 'post_status' => [ 'publish' ] ] ],
        ];
    }

    /**
     * A store admin keeps the ability to list another vendor's products, drafts included.
     *
     * @return void
     */
    public function test_store_admin_can_still_target_another_vendor(): void {
        wp_set_current_user( $this->admin_id );

        $response = $this->get_request( 'products', [ 'id' => $this->seller_id2 ] );
        $data     = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertSame( [ $this->seller_id2 ], $this->get_authors( $data ) );
        $this->assertContains( $this->seller2_draft_id, wp_list_pluck( $data, 'id' ) );
    }
}
