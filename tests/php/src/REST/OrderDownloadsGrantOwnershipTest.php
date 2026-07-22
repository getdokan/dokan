<?php

namespace WeDevs\Dokan\Test\REST;

use Automattic\WooCommerce\Internal\ProductDownloads\ApprovedDirectories\Register as DownloadApprovedDirectories;
use WeDevs\Dokan\REST\OrderControllerV2;
use WeDevs\Dokan\Test\DokanTestCase;
use WC_Data_Store;
use WC_Product_Download;
use WP_REST_Request;

/**
 * Authorization test for the REST download-grant endpoint.
 *
 * Covers the cross-vendor IDOR (audit L7 / plugin-internal-tasks#2149): the REST
 * twin of L4 (getdokan/dokan#3293). A vendor granting downloads on their own order
 * must not be able to grant access to another vendor's downloadable files.
 *
 * @group dokan-order-downloads
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\REST\OrderControllerV2::grant_order_downloads
 */
class OrderDownloadsGrantOwnershipTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';

    /**
     * Downloadable product owned by the caller (vendor A).
     *
     * @var int
     */
    protected int $own_product;

    /**
     * Downloadable product owned by another vendor (vendor B).
     *
     * @var int
     */
    protected int $foreign_product;

    /**
     * Order owned by vendor A.
     *
     * @var int
     */
    protected int $order_id;

    public function set_up() {
        parent::set_up();

        // Let the test's example.com download files validate without the approved-directories gate.
        wc_get_container()->get( DownloadApprovedDirectories::class )->set_mode( DownloadApprovedDirectories::MODE_DISABLED );

        ( new OrderControllerV2() )->register_routes();

        $this->own_product     = $this->create_downloadable_product_for( $this->seller_id1 );
        $this->foreign_product = $this->create_downloadable_product_for( $this->seller_id2 );
        $this->order_id        = $this->create_single_vendor_order( $this->seller_id1 );
    }

    /**
     * Vendor A cannot grant downloads for Vendor B's product; their own product is still granted.
     */
    public function test_vendor_cannot_grant_downloads_for_foreign_product() {
        wp_set_current_user( $this->seller_id1 );

        $request = new WP_REST_Request( 'POST', "/dokan/v2/orders/{$this->order_id}/downloads" );
        $request->set_body_params( [ 'ids' => [ $this->own_product, $this->foreign_product ] ] );
        $response = $this->server->dispatch( $request );

        $this->assertSame( 200, $response->get_status() );

        $granted = $this->granted_product_ids( $this->order_id );
        $this->assertContains( $this->own_product, $granted, 'Vendor should grant downloads for their own product.' );
        $this->assertNotContains( $this->foreign_product, $granted, 'Vendor must not grant downloads for another vendor\'s product.' );
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

    /**
     * Product ids that currently have a download permission on the order.
     */
    protected function granted_product_ids( int $order_id ): array {
        $permissions = WC_Data_Store::load( 'customer-download' )->get_downloads( [ 'order_id' => $order_id ] );

        return array_map(
            static function ( $permission ) {
                return (int) $permission->get_product_id();
            },
            $permissions
        );
    }

    public function tear_down() {
        wp_set_current_user( 0 );
        parent::tear_down();
    }
}
