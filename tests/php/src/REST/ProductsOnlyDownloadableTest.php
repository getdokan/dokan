<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\ProductController;
use WeDevs\Dokan\Test\DokanTestCase;
use WC_Product_Download;

/**
 * `GET dokan/v1/products?only_downloadable=true` feeds the vendor's "grant download access" pickers,
 * so it must offer downloadable variations, still scoped to the vendor's own products
 * (getdokan/plugin-internal-tasks#2406).
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-order-downloads
 *
 * @covers \WeDevs\Dokan\REST\ProductController::prepare_objects_query
 */
class ProductsOnlyDownloadableTest extends DokanTestCase {

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    public function set_up() {
        parent::set_up();

        // Keep WooCommerce's approved download directories out of the way so the example.com files validate.
        update_option( 'wc_downloads_approved_directories_mode', 'disabled' );

        ( new ProductController() )->register_routes();
    }

    /**
     * The picker lists the vendor's downloadable variations next to simple products, never the variable
     * parent or another vendor's variation.
     */
    public function test_downloadable_variations_are_listed_for_their_vendor_only() {
        list( $own_parent, $own_variation ) = $this->create_downloadable_variation_for( $this->seller_id1 );
        list( , $other_variation )          = $this->create_downloadable_variation_for( $this->seller_id2 );

        $simple = $this->factory()->product->create_downloadable_product( [ $this->make_download() ] );
        dokan_override_product_author( $simple, $this->seller_id1 );

        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request(
            'products',
            [
                'only_downloadable' => true,
                'per_page'          => 50,
            ]
        );
        $ids      = array_map( 'intval', wp_list_pluck( $response->get_data(), 'id' ) );

        $this->assertSame( 200, $response->get_status() );
        $this->assertContains( $own_variation, $ids );
        $this->assertContains( $simple->get_id(), $ids );
        $this->assertNotContains( $own_parent, $ids, 'A variable parent holds no files of its own.' );
        $this->assertNotContains( $other_variation, $ids, 'Another vendor\'s variation must not be offered.' );
    }

    /**
     * Create a variable product owned by the vendor and give its first variation a file.
     *
     * @param int $seller_id Vendor ID.
     *
     * @return int[] Parent ID and downloadable variation ID.
     */
    protected function create_downloadable_variation_for( int $seller_id ): array {
        $parent = $this->factory()->product->create_variation_product();
        dokan_override_product_author( $parent, $seller_id );

        $variation = wc_get_product( $parent->get_children()[0] );
        $variation->set_downloadable( true );
        $variation->set_downloads( [ $this->make_download() ] );
        $variation->save();

        return [ $parent->get_id(), $variation->get_id() ];
    }

    /**
     * Build a downloadable file.
     */
    protected function make_download(): WC_Product_Download {
        $download = new WC_Product_Download();
        $download->set_id( wp_generate_uuid4() );
        $download->set_name( 'Test File' );
        $download->set_file( 'https://example.com/' . uniqid() . '.pdf' );

        return $download;
    }

    public function tear_down() {
        wp_set_current_user( 0 );

        parent::tear_down();
    }
}
