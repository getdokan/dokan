<?php

namespace WeDevs\Dokan\Test\REST;

use Automattic\WooCommerce\Internal\ProductDownloads\ApprovedDirectories\Register as DownloadApprovedDirectories;
use WeDevs\Dokan\REST\OrderControllerV2;
use WeDevs\Dokan\Test\DokanTestCase;
use WC_Customer_Download;
use WC_Data_Store;
use WC_Product_Download;
use WP_REST_Request;

/**
 * Authorization test for the REST download-revoke endpoint.
 *
 * Covers the cross-vendor IDOR (audit L8 / plugin-internal-tasks#2150): revoke_order_downloads()
 * deleted a permission by attacker-supplied permission_id without checking it belonged to the
 * route order. The endpoint now rejects a permission that belongs to a different order.
 *
 * @group dokan-order-downloads
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\REST\OrderControllerV2::revoke_order_downloads
 */
class OrderDownloadsRevokeOwnershipTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v2';

    /**
     * Order owned by the caller (vendor A).
     *
     * @var int
     */
    protected int $own_order;

    /**
     * Order owned by another vendor (vendor B).
     *
     * @var int
     */
    protected int $foreign_order;

    /**
     * Downloadable product id (with a file).
     *
     * @var int
     */
    protected int $product_id;

    public function set_up() {
        parent::set_up();

        wc_get_container()->get( DownloadApprovedDirectories::class )->set_mode( DownloadApprovedDirectories::MODE_DISABLED );

        ( new OrderControllerV2() )->register_routes();

        $download = new WC_Product_Download();
        $download->set_name( 'Test File' );
        $download->set_id( wp_generate_uuid4() );
        $download->set_file( 'https://example.com/' . uniqid() . '.pdf' );

        $product = $this->factory()->product->create_downloadable_product( [ $download ] );
        $this->product_id = $product->get_id();

        $this->own_order     = $this->create_single_vendor_order( $this->seller_id1 );
        $this->foreign_order = $this->create_single_vendor_order( $this->seller_id2 );
    }

    /**
     * Vendor A cannot delete a permission that belongs to another vendor's order.
     */
    public function test_vendor_cannot_revoke_foreign_order_permission() {
        $foreign_permission = $this->grant_permission( $this->foreign_order );

        wp_set_current_user( $this->seller_id1 );
        $response = $this->revoke_request( $this->own_order, $foreign_permission );

        $this->assertSame( 400, $response->get_status(), 'Revoking a foreign order\'s permission must be rejected.' );
        $this->assertSame( $foreign_permission, ( new WC_Customer_Download( $foreign_permission ) )->get_id(), 'The foreign permission must still exist.' );
    }

    /**
     * Vendor A can delete a permission that belongs to their own order.
     */
    public function test_vendor_can_revoke_own_order_permission() {
        $own_permission = $this->grant_permission( $this->own_order );

        wp_set_current_user( $this->seller_id1 );
        $response = $this->revoke_request( $this->own_order, $own_permission );

        $this->assertSame( 200, $response->get_status(), 'Revoking a permission on the caller\'s own order should succeed.' );
        $remaining = WC_Data_Store::load( 'customer-download' )->get_downloads( [ 'order_id' => $this->own_order ] );
        $this->assertCount( 0, $remaining, 'The own permission must be deleted.' );
    }

    /**
     * Grant one download permission on the given order and return its permission id.
     */
    protected function grant_permission( int $order_id ): int {
        $downloads   = wc_get_product( $this->product_id )->get_downloads();
        $download_id = array_key_first( $downloads );

        return (int) wc_downloadable_file_permission( $download_id, $this->product_id, wc_get_order( $order_id ) );
    }

    /**
     * Dispatch a DELETE against the downloads endpoint.
     */
    protected function revoke_request( int $order_id, int $permission_id ) {
        $request = new WP_REST_Request( 'DELETE', "/dokan/v2/orders/{$order_id}/downloads" );
        $request->set_body_params( [ 'permission_id' => $permission_id ] );

        return $this->server->dispatch( $request );
    }

    public function tear_down() {
        wp_set_current_user( 0 );
        parent::tear_down();
    }
}
