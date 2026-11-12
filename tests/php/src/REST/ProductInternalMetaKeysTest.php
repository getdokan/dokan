<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\ProductControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * A REST product save can't write raw meta under a key WooCommerce owns, unless a Store Admin sends it.
 *
 * @group dokan-security
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\Product\Hooks::drop_internal_meta_from_rest_save
 */
class ProductInternalMetaKeysTest extends DokanTestCase {

    /**
     * Setup test environment.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        ( new ProductControllerV3() )->register_routes();
    }

    /**
     * Dispatch a JSON request, mirroring a real REST client.
     *
     * @param string $method HTTP method.
     * @param string $route  Full route.
     * @param array  $body   Request body.
     *
     * @return WP_REST_Response
     */
    protected function json_request( string $method, string $route, array $body ): WP_REST_Response {
        $request = new WP_REST_Request( $method, $route );
        $request->add_header( 'Content-Type', 'application/json' );
        $request->set_body( wp_json_encode( $body ) );

        return $this->server->dispatch( $request );
    }

    /**
     * Every stored value of a meta key, read past the object cache.
     *
     * @param int    $post_id Post ID.
     * @param string $key     Meta key.
     *
     * @return string[]
     */
    protected function stored_values( int $post_id, string $key ): array {
        global $wpdb;

        return $wpdb->get_col( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = %s", $post_id, $key ) );
    }

    /**
     * A product owned by seller_id1.
     *
     * @return int
     */
    protected function vendor_product(): int {
        return $this->factory()->product->set_seller_id( $this->seller_id1 )->create( [ 'regular_price' => '10' ] );
    }

    /**
     * Raw meta mixing one ordinary key with two keys WooCommerce owns.
     *
     * @return array
     */
    protected function mixed_meta(): array {
        return [
            [
                'key'   => '_vendor_note',
                'value' => 'kept',
            ],
            [
                'key'   => '_product_attributes',
                'value' => 'raw attributes',
            ],
            [
                'key'   => '_thumbnail_id',
                'value' => '999999',
            ],
        ];
    }

    /**
     * The v1 product schema types meta values as "mixed", which WordPress reports whenever a request sends one.
     *
     * @return void
     */
    protected function expect_mixed_type_notice(): void {
        $this->setExpectedIncorrectUsage( 'rest_validate_value_from_schema' );
        $this->setExpectedIncorrectUsage( 'rest_sanitize_value_from_schema' );
    }

    /**
     * Product routes a vendor can save through, and whether the route uses the v1 schema.
     *
     * @return array
     */
    public function product_routes(): array {
        return [
            'dokan/v1' => [ '/dokan/v1/products/', true ],
            'dokan/v2' => [ '/dokan/v2/products/', true ],
            'dokan/v3' => [ '/dokan/v3/products/', false ],
            'wc/v3'    => [ '/wc/v3/products/', false ],
        ];
    }

    /**
     * @dataProvider product_routes
     *
     * @param string $route     Route base.
     * @param bool   $v1_schema Whether the route uses the v1 schema.
     */
    public function test_vendor_update_keeps_ordinary_meta_and_drops_internal_keys( string $route, bool $v1_schema ): void {
        if ( $v1_schema ) {
            $this->expect_mixed_type_notice();
        }

        $product_id = $this->vendor_product();
        wp_set_current_user( $this->seller_id1 );

        $response = $this->json_request( 'PUT', $route . $product_id, [ 'meta_data' => $this->mixed_meta() ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( [ 'kept' ], $this->stored_values( $product_id, '_vendor_note' ) );
        $this->assertNotContains( 'raw attributes', $this->stored_values( $product_id, '_product_attributes' ) );
        $this->assertNotContains( '999999', $this->stored_values( $product_id, '_thumbnail_id' ) );
    }

    public function test_vendor_create_drops_internal_keys(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->json_request(
            'POST',
            '/dokan/v3/products',
            [
                'name'          => 'Created with raw meta',
                'regular_price' => '10',
                'meta_data'     => $this->mixed_meta(),
            ]
        );

        $this->assertSame( 201, $response->get_status() );

        $product_id = (int) $response->get_data()['id'];

        $this->assertSame( [ 'kept' ], $this->stored_values( $product_id, '_vendor_note' ) );
        $this->assertNotContains( 'raw attributes', $this->stored_values( $product_id, '_product_attributes' ) );
    }

    public function test_an_existing_row_cannot_be_renamed_to_an_internal_key(): void {
        $this->expect_mixed_type_notice();

        $product_id = $this->vendor_product();
        $meta_id    = add_post_meta( $product_id, '_vendor_note', 'mine' );
        wp_set_current_user( $this->seller_id1 );

        $response = $this->json_request(
            'PUT',
            '/dokan/v1/products/' . $product_id,
            [
                'meta_data' => [
                    [
                        'id'    => $meta_id,
                        'key'   => '_product_attributes',
                        'value' => 'raw attributes',
                    ],
                ],
            ]
        );

        $this->assertSame( 200, $response->get_status() );
        $this->assertNotContains( 'raw attributes', $this->stored_values( $product_id, '_product_attributes' ) );
        // The row the request tried to rename is removed rather than kept under the internal key.
        $this->assertFalse( get_metadata_by_mid( 'post', $meta_id ) );
    }

    public function test_vendor_attributes_field_still_saves(): void {
        $product_id = $this->vendor_product();
        wp_set_current_user( $this->seller_id1 );

        $response = $this->json_request(
            'PUT',
            '/dokan/v1/products/' . $product_id,
            [
                'attributes' => [
                    [
                        'name'    => 'Material',
                        'visible' => true,
                        'options' => [ 'Wool', 'Silk' ],
                    ],
                ],
            ]
        );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( [ 'material' ], array_keys( (array) get_post_meta( $product_id, '_product_attributes', true ) ) );
    }

    public function test_vendor_variation_update_drops_internal_keys(): void {
        $product_id   = $this->vendor_product();
        $variation_id = wp_insert_post(
            [
                'post_type'   => 'product_variation',
                'post_parent' => $product_id,
                'post_status' => 'publish',
                'post_author' => $this->seller_id1,
            ]
        );
        wp_set_object_terms( $product_id, 'variable', 'product_type' );
        wp_set_current_user( $this->seller_id1 );

        $response = $this->json_request( 'PUT', "/wc/v3/products/$product_id/variations/$variation_id", [ 'meta_data' => $this->mixed_meta() ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( [ 'kept' ], $this->stored_values( $variation_id, '_vendor_note' ) );
        $this->assertNotContains( 'raw attributes', $this->stored_values( $variation_id, '_product_attributes' ) );
    }

    public function test_store_admin_keeps_raw_meta(): void {
        $product_id = $this->vendor_product();
        wp_set_current_user( $this->admin_id );

        $response = $this->json_request( 'PUT', '/wc/v3/products/' . $product_id, [ 'meta_data' => $this->mixed_meta() ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertContains( 'raw attributes', $this->stored_values( $product_id, '_product_attributes' ) );
    }
}
