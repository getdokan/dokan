<?php

namespace WeDevs\Dokan\Test\REST;

use WC_Product_Download;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * The public product routes must not leak paid download URLs or vendor earning.
 *
 * @group dokan-product-controller
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\REST\ProductController::prepare_data_for_response
 * @covers \WeDevs\Dokan\REST\ProductController::can_view_vendor_product_data
 *
 * @see https://github.com/getdokan/dokan-pro/issues/6031
 */
class ProductPublicRoutesDisclosureTest extends DokanTestCase {

    /**
     * Published downloadable product owned by seller_id1.
     *
     * @var int
     */
    protected int $product_id;

    /**
     * Download URL attached to the product.
     *
     * @var string
     */
    protected string $file_url;

    public function set_up() {
        parent::set_up();

        // Keep WooCommerce's approved download directories out of the way so the example.com file validates.
        update_option( 'wc_downloads_approved_directories_mode', 'disabled' );

        $this->file_url   = 'https://example.com/paid-' . uniqid() . '.pdf';
        $this->product_id = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
                    'name'          => 'Paid Ebook',
                    'status'        => 'publish',
                    'regular_price' => '49',
                ]
            );

        $download = new WC_Product_Download();
        $download->set_id( wp_generate_uuid4() );
        $download->set_name( 'ebook.pdf' );
        $download->set_file( $this->file_url );

        $product = wc_get_product( $this->product_id );
        $product->set_downloadable( true );
        $product->set_downloads( [ $download ] );
        $product->set_featured( true );
        $product->set_total_sales( 3 );
        $product->save();

        // top_rated orders by review rating meta, so the fixture needs a real approved review.
        $comment_id = wp_insert_comment(
            [
                'comment_post_ID'  => $this->product_id,
                'comment_type'     => 'review',
                'comment_approved' => 1,
                'comment_content'  => 'Great ebook.',
                'user_id'          => $this->customer_id,
            ]
        );
        add_comment_meta( $comment_id, 'rating', 5 );
    }

    public function tear_down() {
        wp_set_current_user( 0 );

        parent::tear_down();
    }

    /**
     * Public routes that serialize products with the vendor serializer.
     *
     * @return array<string, array{string, array}>
     */
    public function public_routes(): array {
        return [
            'latest'         => [ 'products/latest', [ 'per_page' => 100 ] ],
            'best_selling'   => [ 'products/best_selling', [ 'per_page' => 100 ] ],
            'featured'       => [ 'products/featured', [ 'per_page' => 100 ] ],
            'top_rated'      => [ 'products/top_rated', [ 'per_page' => 100 ] ],
            'store products' => [ 'stores/%d/products', [ 'per_page' => 100 ] ],
        ];
    }

    /**
     * Find the fixture product in a collection response.
     *
     * @param array $data Response data.
     *
     * @return array|null
     */
    protected function find_product( array $data ): ?array {
        foreach ( $data as $item ) {
            if ( (int) $item['id'] === $this->product_id ) {
                return $item;
            }
        }

        return null;
    }

    protected function fetch_public( string $route, array $params ): ?array {
        $response = $this->get_request( sprintf( $route, $this->seller_id1 ), $params );

        $this->assertEquals( 200, $response->get_status() );

        return $this->find_product( $response->get_data() );
    }

    /**
     * @dataProvider public_routes
     */
    public function test_anonymous_caller_gets_no_download_url_or_earning( string $route, array $params ): void {
        wp_set_current_user( 0 );

        $product = $this->fetch_public( $route, $params );

        if ( null === $product ) {
            $this->markTestSkipped( "Fixture product not listed by {$route}" );
        }

        $this->assertTrue( $product['downloadable'] );
        $this->assertSame( [], $product['downloads'] );
        $this->assertNull( $product['earning'] );
        $this->assertStringNotContainsString( $this->file_url, wp_json_encode( $product ) );
    }

    /**
     * @dataProvider public_routes
     */
    public function test_other_vendor_gets_no_download_url_or_earning( string $route, array $params ): void {
        wp_set_current_user( $this->seller_id2 );

        $product = $this->fetch_public( $route, $params );

        if ( null === $product ) {
            $this->markTestSkipped( "Fixture product not listed by {$route}" );
        }

        $this->assertSame( [], $product['downloads'] );
        $this->assertNull( $product['earning'] );
    }

    public function test_latest_route_lists_the_fixture_for_anonymous_callers(): void {
        wp_set_current_user( 0 );

        $this->assertNotNull( $this->fetch_public( 'products/latest', [ 'per_page' => 100 ] ) );
    }

    public function test_owner_still_gets_download_url_and_earning_on_own_product(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( "products/{$this->product_id}" );
        $data     = $response->get_data();

        $this->assertEquals( 200, $response->get_status() );
        $this->assertSame( $this->file_url, $data['downloads'][0]['file'] );
        $this->assertIsFloat( $data['earning'] );
    }

    public function test_admin_still_gets_download_url_on_public_route(): void {
        wp_set_current_user( $this->admin_id );

        $product = $this->fetch_public( 'products/latest', [ 'per_page' => 100 ] );

        $this->assertNotNull( $product );
        $this->assertSame( $this->file_url, $product['downloads'][0]['file'] );
    }
}
