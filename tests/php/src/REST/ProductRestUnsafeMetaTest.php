<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\ProductControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * A product or variation REST save ignores raw meta that sits under a key WooCommerce owns or that
 * holds a serialized PHP object, unless a Store Admin sends it.
 *
 * @group dokan-security
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\Product\Hooks::drop_unsafe_meta_from_rest_save
 */
class ProductRestUnsafeMetaTest extends DokanTestCase {

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
     * A serialized PHP object, as a client would send it.
     *
     * @return string
     */
    protected function serialized_object(): string {
        return serialize( new \stdClass() ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
    }

    /**
     * A serialized plain array, which is legitimate meta.
     *
     * @return string
     */
    protected function serialized_array(): string {
        return serialize( [ 'color' => 'red' ] ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
    }

    /**
     * Raw meta mixing two ordinary entries with the two kinds that must be ignored.
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
                'key'   => '_vendor_array',
                'value' => $this->serialized_array(),
            ],
            [
                'key'   => '_product_attributes',
                'value' => 'raw attributes',
            ],
            [
                'key'   => '_thumbnail_id',
                'value' => '999999',
            ],
            [
                'key'   => '_vendor_object',
                'value' => $this->serialized_object(),
            ],
        ];
    }

    /**
     * Assert the ordinary entries of mixed_meta() were stored and the unsafe ones were not.
     *
     * @param int $post_id Product or variation ID.
     *
     * @return void
     */
    protected function assert_only_safe_meta_stored( int $post_id ): void {
        $this->assertSame( [ 'kept' ], $this->stored_values( $post_id, '_vendor_note' ) );
        $this->assertSame( $this->serialized_array(), get_post_meta( $post_id, '_vendor_array', true ) );
        $this->assertNotContains( 'raw attributes', $this->stored_values( $post_id, '_product_attributes' ) );
        $this->assertNotContains( '999999', $this->stored_values( $post_id, '_thumbnail_id' ) );
        $this->assertSame( [], $this->stored_values( $post_id, '_vendor_object' ) );
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
    public function test_vendor_update_stores_only_safe_meta( string $route, bool $v1_schema ): void {
        if ( $v1_schema ) {
            $this->expect_mixed_type_notice();
        }

        $product_id = $this->vendor_product();
        wp_set_current_user( $this->seller_id1 );

        $response = $this->json_request( 'PUT', $route . $product_id, [ 'meta_data' => $this->mixed_meta() ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assert_only_safe_meta_stored( $product_id );
    }

    public function test_vendor_create_stores_only_safe_meta(): void {
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
        $this->assert_only_safe_meta_stored( (int) $response->get_data()['id'] );
    }

    public function test_vendor_variation_update_stores_only_safe_meta(): void {
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
        $this->assert_only_safe_meta_stored( $variation_id );
    }

    /**
     * Dokan Pro's variations route hands its variation to this filter, so the rule holds there without a Pro change.
     */
    public function test_dokan_variation_filter_stores_only_safe_meta(): void {
        $product_id = $this->vendor_product();
        $variation  = new \WC_Product_Variation();
        $variation->set_parent_id( $product_id );

        $request = new WP_REST_Request( 'POST', "/dokan/v1/products/$product_id/variations" );
        $request->set_param( 'meta_data', $this->mixed_meta() );

        foreach ( $this->mixed_meta() as $meta ) {
            $variation->update_meta_data( $meta['key'], $meta['value'] );
        }

        wp_set_current_user( $this->seller_id1 );
        $variation = apply_filters( 'dokan_rest_pre_insert_product_variation_object', $variation, $request, true );

        $this->assert_only_safe_meta_stored( $variation->save() );
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

        $row = get_metadata_by_mid( 'post', $meta_id );

        $this->assertSame( 200, $response->get_status() );
        $this->assertNotContains( 'raw attributes', $this->stored_values( $product_id, '_product_attributes' ) );
        // The row the request tried to rename is left exactly as it was stored.
        $this->assertSame( [ '_vendor_note', 'mine' ], [ $row->meta_key, $row->meta_value ] );
    }

    /**
     * Meta another plugin stored as an object is not the request's to lose, whether or not the request names its key.
     */
    public function test_a_stored_row_holding_an_object_survives_a_vendor_save(): void {
        $product_id = $this->vendor_product();
        add_post_meta( $product_id, '_third_party_state', new \stdClass() );
        $stored = $this->stored_values( $product_id, '_third_party_state' );
        wp_set_current_user( $this->seller_id1 );

        $bodies = [
            [
                [
                    'key'   => '_vendor_note',
                    'value' => 'kept',
                ],
            ],
            [
                [
                    'key'   => '_third_party_state',
                    'value' => $this->serialized_object(),
                ],
            ],
        ];

        foreach ( $bodies as $meta_data ) {
            $response = $this->json_request( 'PUT', '/wc/v3/products/' . $product_id, [ 'meta_data' => $meta_data ] );

            $this->assertSame( 200, $response->get_status() );
            $this->assertSame( $stored, $this->stored_values( $product_id, '_third_party_state' ) );
        }
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

    public function test_store_admin_keeps_raw_meta(): void {
        $product_id = $this->vendor_product();
        wp_set_current_user( $this->admin_id );

        $response = $this->json_request( 'PUT', '/wc/v3/products/' . $product_id, [ 'meta_data' => $this->mixed_meta() ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertContains( 'raw attributes', $this->stored_values( $product_id, '_product_attributes' ) );
        $this->assertCount( 1, $this->stored_values( $product_id, '_vendor_object' ) );
    }
}
