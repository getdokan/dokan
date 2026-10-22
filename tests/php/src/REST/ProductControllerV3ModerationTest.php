<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\ProductControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The v3 products API applies the same selling and review rules as the v1 API (getdokan/dokan-pro#6281).
 *
 * @group dokan-product-controller-v3
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\REST\ProductControllerV3::create_item_permissions_check
 * @covers \WeDevs\Dokan\REST\ProductControllerV3::enforce_publish_moderation
 */
class ProductControllerV3ModerationTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Setup test environment.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        ( new ProductControllerV3() )->register_routes();

        // An enabled vendor who is not trusted, so new products wait for review.
        update_user_meta( $this->seller_id1, 'dokan_enable_selling', 'yes' );
        update_user_meta( $this->seller_id1, 'dokan_publishing', 'no' );
    }

    /**
     * Dispatch a JSON request, mirroring a real REST client.
     *
     * @param string $method HTTP method.
     * @param string $route  Route below the namespace.
     * @param array  $body   Request body.
     *
     * @return WP_REST_Response
     */
    protected function json_request( string $method, string $route, array $body = [] ): WP_REST_Response {
        $request = new WP_REST_Request( $method, "/dokan/v3/$route" );
        $request->add_header( 'Content-Type', 'application/json' );
        $request->set_body( wp_json_encode( $body ) );

        return $this->server->dispatch( $request );
    }

    /**
     * A product owned by seller_id1 with the given status.
     *
     * @param string $status Post status.
     *
     * @return int
     */
    protected function vendor_product( string $status ): int {
        $product_id = $this->factory()->product->set_seller_id( $this->seller_id1 )->create( [ 'regular_price' => '10' ] );
        wp_update_post(
            [
                'ID'          => $product_id,
                'post_status' => $status,
            ]
        );

        return $product_id;
    }

    /**
     * A vendor whose selling is disabled can't create products, alone or in a batch.
     */
    public function test_disabled_vendor_cannot_create(): void {
        update_user_meta( $this->seller_id1, 'dokan_enable_selling', 'no' );
        wp_set_current_user( $this->seller_id1 );

        $response = $this->json_request( 'POST', 'products', [ 'name' => 'Blocked' ] );
        $this->assertSame( 403, $response->get_status() );

        $response = $this->json_request( 'POST', 'products/batch', [ 'create' => [ [ 'name' => 'Blocked in batch' ] ] ] );
        $this->assertArrayHasKey( 'error', $response->get_data()['create'][0] );
        $this->assertEmpty(
            get_posts(
                [
					'post_type' => 'product',
					'title' => 'Blocked in batch',
					'post_status' => 'any',
				]
            )
        );
    }

    /**
     * An untrusted vendor's new product waits for review, whether it asks for publish, schedules it, or leaves status out.
     */
    public function test_untrusted_vendor_create_is_held_for_review(): void {
        wp_set_current_user( $this->seller_id1 );

        foreach ( [ 'publish', 'future', null ] as $status ) {
            $body = [
                'name'          => 'Held ' . wp_json_encode( $status ),
                'regular_price' => '10',
            ];
            if ( null !== $status ) {
                $body['status'] = $status;
            }
            if ( 'future' === $status ) {
                $body['date_created'] = gmdate( 'Y-m-d\TH:i:s', strtotime( '+1 week' ) );
            }

            $response = $this->json_request( 'POST', 'products', $body );

            $this->assertSame( 201, $response->get_status() );
            $this->assertSame( 'pending', get_post_status( $response->get_data()['id'] ), 'status: ' . wp_json_encode( $status ) );
        }

        $response = $this->json_request(
            'POST',
            'products',
            [
                'name'   => 'Draft',
                'status' => 'draft',
            ]
        );
        $this->assertSame( 'draft', get_post_status( $response->get_data()['id'] ) );
    }

    /**
     * Trusted vendors and admins still publish directly.
     */
    public function test_trusted_vendor_and_admin_can_publish(): void {
        update_user_meta( $this->seller_id1, 'dokan_publishing', 'yes' );
        wp_set_current_user( $this->seller_id1 );
        $response = $this->json_request(
            'POST',
            'products',
            [
                'name'   => 'Trusted',
                'status' => 'publish',
            ]
        );
        $this->assertSame( 'publish', get_post_status( $response->get_data()['id'] ) );

        $admin = $this->factory()->user->create( [ 'role' => 'administrator' ] );
        wp_set_current_user( $admin );
        $response = $this->json_request(
            'POST',
            'products',
            [
                'name'   => 'Admin',
                'status' => 'publish',
            ]
        );
        $this->assertSame( 'publish', get_post_status( $response->get_data()['id'] ) );
    }

    /**
     * Updating a product into publish, alone or in a batch, is held for review too.
     */
    public function test_untrusted_vendor_update_to_publish_is_held_for_review(): void {
        wp_set_current_user( $this->seller_id1 );
        $draft   = $this->vendor_product( 'draft' );
        $pending = $this->vendor_product( 'pending' );

        $this->json_request( 'PUT', "products/$draft", [ 'status' => 'publish' ] );
        $this->assertSame( 'pending', get_post_status( $draft ) );

        $this->json_request(
            'POST', 'products/batch', [
				'update' => [
					[
						'id' => $pending,
						'status' => 'publish',
					],
				],
			]
        );
        $this->assertSame( 'pending', get_post_status( $pending ) );
    }

    /**
     * Editing an already-published product doesn't send it back to review.
     */
    public function test_editing_published_product_keeps_it_published(): void {
        wp_set_current_user( $this->seller_id1 );
        $published = $this->vendor_product( 'publish' );

        $response = $this->json_request(
            'PUT',
            "products/$published",
            [
                'status'        => 'publish',
                'regular_price' => '12',
            ]
        );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'publish', get_post_status( $published ) );
        $this->assertSame( '12', wc_get_product( $published )->get_regular_price() );
    }

    /**
     * A disabled vendor can't make a product live, even when trusted.
     */
    public function test_disabled_vendor_update_to_publish_is_held_for_review(): void {
        update_user_meta( $this->seller_id1, 'dokan_enable_selling', 'no' );
        update_user_meta( $this->seller_id1, 'dokan_publishing', 'yes' );
        wp_set_current_user( $this->seller_id1 );
        $draft = $this->vendor_product( 'draft' );

        $this->json_request( 'PUT', "products/$draft", [ 'status' => 'publish' ] );

        $this->assertSame( 'pending', get_post_status( $draft ) );
    }

    /**
     * The site's default product status setting is respected.
     */
    public function test_default_product_status_filter_is_respected(): void {
        add_filter( 'dokan_get_default_product_status', [ $this, 'return_publish' ] );
        wp_set_current_user( $this->seller_id1 );

        $response = $this->json_request(
            'POST',
            'products',
            [
                'name'   => 'Auto publish site',
                'status' => 'publish',
            ]
        );

        remove_filter( 'dokan_get_default_product_status', [ $this, 'return_publish' ] );
        $this->assertSame( 'publish', get_post_status( $response->get_data()['id'] ) );
    }

    /**
     * Filter callback.
     *
     * @return string
     */
    public function return_publish(): string {
        return 'publish';
    }
}
