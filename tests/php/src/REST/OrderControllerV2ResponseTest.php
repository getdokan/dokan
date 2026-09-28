<?php

namespace WeDevs\Dokan\Test\REST;

use Automattic\WooCommerce\Internal\ProductDownloads\ApprovedDirectories\Register as DownloadApprovedDirectories;
use WeDevs\Dokan\REST\OrderControllerV2;
use WeDevs\Dokan\Test\DokanTestCase;
use WC_Product_Download;
use WP_REST_Request;

/**
 * Regression test for the v2 order routes inherited from OrderController.
 *
 * OrderControllerV2 used to override prepare_data_for_response() with a download
 * serializer, so the inherited GET orders / GET orders/{id} routes passed a WC_Order
 * into it and fataled with "Call to a member function get_id() on string".
 *
 * @since DOKAN_SINCE
 *
 * @group orders
 * @group dokan-order-downloads
 *
 * @covers \WeDevs\Dokan\REST\OrderControllerV2::prepare_download_for_response
 * @covers \WeDevs\Dokan\REST\OrderController::get_items
 * @covers \WeDevs\Dokan\REST\OrderController::get_item
 */
class OrderControllerV2ResponseTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';

    /**
     * Order owned by vendor A.
     *
     * @var int
     */
    protected int $order_id;

    /**
     * Approved-directories mode captured in set_up() and restored in tear_down().
     *
     * @var string
     */
    protected string $previous_download_mode;

    public function set_up() {
        parent::set_up();

        // Disable the approved-directories gate so the test's example.com files validate; restored in tear_down().
        $approved_directories         = wc_get_container()->get( DownloadApprovedDirectories::class );
        $this->previous_download_mode = $approved_directories->get_mode();
        $approved_directories->set_mode( DownloadApprovedDirectories::MODE_DISABLED );

        ( new OrderControllerV2() )->register_routes();

        $this->order_id = $this->create_single_vendor_order( $this->seller_id1 );
    }

    /**
     * GET dokan/v2/orders serializes orders instead of fataling.
     */
    public function test_get_orders_returns_order_list() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->server->dispatch( new WP_REST_Request( 'GET', '/dokan/v2/orders' ) );

        $this->assertSame( 200, $response->get_status() );
        $this->assertContains( $this->order_id, array_map( 'intval', wp_list_pluck( $response->get_data(), 'id' ) ) );
    }

    /**
     * GET dokan/v2/orders/{id} serializes the order instead of fataling.
     */
    public function test_get_single_order_returns_order() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->server->dispatch( new WP_REST_Request( 'GET', "/dokan/v2/orders/{$this->order_id}" ) );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( $this->order_id, (int) $response->get_data()['id'] );
    }

    /**
     * GET dokan/v2/orders/{id}/downloads still shapes each download's product after the rename.
     */
    public function test_get_order_downloads_formats_product() {
        $product_id = $this->create_downloadable_product_for( $this->seller_id1 );
        $product    = wc_get_product( $product_id );

        foreach ( array_keys( $product->get_downloads() ) as $download_id ) {
            wc_downloadable_file_permission( $download_id, $product_id, wc_get_order( $this->order_id ) );
        }

        wp_set_current_user( $this->seller_id1 );

        $response = $this->server->dispatch( new WP_REST_Request( 'GET', "/dokan/v2/orders/{$this->order_id}/downloads" ) );
        $data     = $response->get_data();

        $this->assertSame( 200, $response->get_status() );
        $this->assertNotEmpty( $data['downloads'] );

        $download = $data['downloads'][0];
        $this->assertSame( $product_id, $download->product['id'] );
        $this->assertSame( $product->get_name(), $download->product['name'] );
        $this->assertFalse( property_exists( $download, 'product_id' ), 'Raw product_id should be replaced by the product array.' );
    }

    /**
     * Create a downloadable product (with one file) owned by the given seller.
     */
    protected function create_downloadable_product_for( int $seller_id ): int {
        $download = new WC_Product_Download();
        $download->set_name( 'Test File' );
        $download->set_id( wp_generate_uuid4() );
        $download->set_file( 'https://example.com/' . uniqid() . '.pdf' );

        $product = $this->factory()->product->create_downloadable_product( [ $download ] );
        wp_update_post(
            [
                'ID'          => $product->get_id(),
                'post_author' => $seller_id,
            ]
        );

        return $product->get_id();
    }

    public function tear_down() {
        wp_set_current_user( 0 );

        // Restore the shared approved-directories mode so disabling it here doesn't leak into later tests.
        wc_get_container()->get( DownloadApprovedDirectories::class )->set_mode( $this->previous_download_mode );

        parent::tear_down();
    }
}
