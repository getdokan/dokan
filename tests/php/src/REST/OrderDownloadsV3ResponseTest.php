<?php

namespace WeDevs\Dokan\Test\REST;

use Automattic\WooCommerce\Internal\ProductDownloads\ApprovedDirectories\Register as DownloadApprovedDirectories;
use WeDevs\Dokan\REST\OrderControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WC_Product_Download;

/**
 * Response test for `GET dokan/v3/orders/{id}/downloads`.
 *
 * The v3 formatter looked downloads up by a `product_id` the v2 serializer had already
 * removed, so any order with a permission on a live product returned a 500
 * (getdokan/dokan-pro#6178).
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-order-downloads
 *
 * @covers \WeDevs\Dokan\REST\OrderControllerV3::format_downloads_data
 */
class OrderDownloadsV3ResponseTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Downloadable product owned by seller 1.
     *
     * @var int
     */
    protected int $product_id;

    /**
     * Order owned by seller 1 that holds one permission on the product.
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

        // Disable the approved-directories gate so the test's example.com file validates; restored in tear_down().
        $approved_directories         = wc_get_container()->get( DownloadApprovedDirectories::class );
        $this->previous_download_mode = $approved_directories->get_mode();
        $approved_directories->set_mode( DownloadApprovedDirectories::MODE_DISABLED );

        ( new OrderControllerV3() )->register_routes();

        $download = new WC_Product_Download();
        $download->set_name( 'Test File' );
        $download->set_id( wp_generate_uuid4() );
        $download->set_file( 'https://example.com/test-file.pdf' );

        $product = $this->factory()->product->create_downloadable_product( [ $download ] );
        wp_update_post(
            [
                'ID'          => $product->get_id(),
                'post_author' => $this->seller_id1,
            ]
        );
        $this->product_id = $product->get_id();

        $this->order_id = $this->create_single_vendor_order( $this->seller_id1 );
        wc_downloadable_file_permission( $download->get_id(), $this->product_id, wc_get_order( $this->order_id ) );
    }

    /**
     * A permission on a live product comes back with the product summary and the file data.
     */
    public function test_permission_on_live_product_returns_product_and_file() {
        $data = $this->request_downloads();

        $this->assertCount( 1, $data );

        $download = $data[0];
        $this->assertSame( $this->product_id, $download->product['id'] );
        $this->assertSame( get_post_field( 'post_name', $this->product_id ), $download->product['slug'] );
        $this->assertSame( 'Test File', $download->file_data['name'] );
        $this->assertSame( 'test-file.pdf', $download->file_data['file_title'] );
    }

    /**
     * A permission whose file was removed from the product is skipped rather than fataling.
     */
    public function test_permission_without_a_file_is_skipped() {
        $product = wc_get_product( $this->product_id );
        $product->set_downloads( [] );
        $product->save();

        $this->assertSame( [], $this->request_downloads() );
    }

    /**
     * Dispatch the v3 downloads route as the order's vendor and return the decoded list.
     */
    protected function request_downloads(): array {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( "orders/{$this->order_id}/downloads" );

        $this->assertSame( 200, $response->get_status() );

        return $response->get_data();
    }

    public function tear_down() {
        wp_set_current_user( 0 );

        // Restore the shared approved-directories mode so disabling it here doesn't leak into later tests.
        wc_get_container()->get( DownloadApprovedDirectories::class )->set_mode( $this->previous_download_mode );

        parent::tear_down();
    }
}
