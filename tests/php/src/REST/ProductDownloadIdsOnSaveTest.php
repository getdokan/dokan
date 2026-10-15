<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\ProductControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WC_Customer_Download;
use WC_Product_Download;
use WP_REST_Request;

/**
 * Saving a product from the vendor dashboard keeps an unchanged file on its stored download id (getdokan/plugin-internal-tasks#2407).
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-product-download-ids
 */
class ProductDownloadIdsOnSaveTest extends DokanTestCase {

    /**
     * File URL the product is created with.
     */
    const FILE_URL = 'https://example.com/icon-set.zip';

    /**
     * A second file URL.
     */
    const OTHER_URL = 'https://example.com/fonts.zip';

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
     * Download id WP Admin stored for the file.
     *
     * @var string
     */
    protected string $download_id;

    /**
     * Buyer's permission on the file, limited to 2 downloads.
     *
     * @var int
     */
    protected int $permission_id;

    public function set_up() {
        parent::set_up();

        // Keep WooCommerce's approved download directories out of the way so the example.com file validates.
        update_option( 'wc_downloads_approved_directories_mode', 'disabled' );

        ( new ProductControllerV3() )->register_routes();

        $this->download_id = wp_generate_uuid4();

        $download = new WC_Product_Download();
        $download->set_id( $this->download_id );
        $download->set_name( 'Icon set' );
        $download->set_file( self::FILE_URL );

        $product = $this->factory()->product->create_downloadable_product( [ $download ] );
        wp_update_post(
            [
                'ID'          => $product->get_id(),
                'post_author' => $this->seller_id1,
            ]
        );
        $this->product_id = $product->get_id();

        $order_id            = $this->create_single_vendor_order( $this->seller_id1 );
        $this->permission_id = wc_downloadable_file_permission( $this->download_id, $this->product_id, wc_get_order( $order_id ) );

        $permission = new WC_Customer_Download( $this->permission_id );
        $permission->set_downloads_remaining( 2 );
        $permission->save();

        wp_set_current_user( $this->seller_id1 );
    }

    /**
     * The React editor sends the file's attachment id; an unchanged file still keeps its stored id.
     */
    public function test_rest_save_keeps_the_stored_id_of_an_unchanged_file() {
        $response = $this->update_download( self::FILE_URL );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( [ $this->download_id ], array_keys( wc_get_product( $this->product_id )->get_downloads() ) );
        $this->assertSame( 2, ( new WC_Customer_Download( $this->permission_id ) )->get_downloads_remaining() );
    }

    /**
     * Two files sharing one URL each keep their own id, whether the client sends the editor's id or the stored one (getdokan/plugin-internal-tasks#2438).
     *
     * @dataProvider shared_url_id_shapes
     *
     * @param bool $send_stored_ids Whether each row carries its stored download id, as a client echoing the GET response does.
     */
    public function test_rest_save_keeps_both_files_that_share_a_url( bool $send_stored_ids ) {
        $stored_ids = $this->add_files_sharing_a_url();

        $rows = [];
        foreach ( [ self::FILE_URL, self::OTHER_URL, self::FILE_URL ] as $i => $url ) {
            $rows[] = [
                'id'   => $send_stored_ids ? $stored_ids[ $i ] : '0',
                'name' => 'File ' . $i,
                'file' => $url,
            ];
        }

        $response = $this->update_downloads( $rows );

        $this->assertSame( 200, $response->get_status() );
        $this->assertEqualsCanonicalizing( $stored_ids, array_keys( wc_get_product( $this->product_id )->get_downloads() ) );
        $this->assertSame( 2, ( new WC_Customer_Download( $this->permission_id ) )->get_downloads_remaining() );
    }

    /**
     * Row ids for the shared-URL case.
     *
     * @return array
     */
    public function shared_url_id_shapes(): array {
        return [
            'editor row id' => [ false ],
            'stored id'     => [ true ],
        ];
    }

    /**
     * A replaced file is a new file and gets a new id.
     */
    public function test_rest_save_gives_a_replaced_file_a_new_id() {
        $this->update_download( 'https://example.com/icon-set-v2.zip' );

        $this->assertNotContains( $this->download_id, array_keys( wc_get_product( $this->product_id )->get_downloads() ) );
    }

    /**
     * Saving the legacy edit form without changes leaves the buyer's permission untouched.
     *
     * @covers ::dokan_process_product_meta
     */
    public function test_legacy_save_keeps_the_stored_id_and_the_buyers_permission() {
        dokan_process_product_meta(
            $this->product_id,
            [
                '_stock_status'    => 'instock',
                '_enable_reviews'  => 'yes',
                '_downloadable'    => 'on',
                '_virtual'         => 'on',
                '_download_limit'  => '',
                '_download_expiry' => '',
                '_wc_file_names'   => [ 'Icon set' ],
                '_wc_file_urls'    => [ self::FILE_URL ],
            ]
        );

        $this->assertSame( [ $this->download_id ], array_keys( wc_get_product( $this->product_id )->get_downloads() ) );
        $this->assertSame( 2, ( new WC_Customer_Download( $this->permission_id ) )->get_downloads_remaining() );
    }

    /**
     * The legacy edit form keeps both files that share a URL on their own ids.
     *
     * @covers ::dokan_process_product_meta
     */
    public function test_legacy_save_keeps_both_files_that_share_a_url() {
        $stored_ids = $this->add_files_sharing_a_url();

        dokan_process_product_meta(
            $this->product_id,
            [
                '_stock_status'    => 'instock',
                '_enable_reviews'  => 'yes',
                '_downloadable'    => 'on',
                '_virtual'         => 'on',
                '_download_limit'  => '',
                '_download_expiry' => '',
                '_wc_file_names'   => [ 'File 0', 'File 1', 'File 2' ],
                '_wc_file_urls'    => [ self::FILE_URL, self::OTHER_URL, self::FILE_URL ],
            ]
        );

        $this->assertEqualsCanonicalizing( $stored_ids, array_keys( wc_get_product( $this->product_id )->get_downloads() ) );
        $this->assertSame( 2, ( new WC_Customer_Download( $this->permission_id ) )->get_downloads_remaining() );
    }

    /**
     * Give the product two more files, the last on the same URL as the first, and return the three stored ids in order.
     *
     * @return string[]
     */
    protected function add_files_sharing_a_url(): array {
        $product   = wc_get_product( $this->product_id );
        $downloads = array_values( $product->get_downloads() );

        foreach ( [ self::OTHER_URL, self::FILE_URL ] as $i => $url ) {
            $download = new WC_Product_Download();
            $download->set_id( wp_generate_uuid4() );
            $download->set_name( 'Extra ' . $i );
            $download->set_file( $url );
            $downloads[] = $download;
        }

        $product->set_downloads( $downloads );
        $product->save();

        return array_map(
            function ( $download ) {
                return $download->get_id();
            },
            $downloads
        );
    }

    /**
     * Save one file through the v3 route, shaped like the React editor's row (its media attachment id as `id`).
     *
     * @param string $file_url File URL.
     */
    protected function update_download( string $file_url ) {
        return $this->update_downloads(
            [
                [
                    'id'   => '123',
                    'name' => 'Icon set',
                    'file' => $file_url,
                ],
            ]
        );
    }

    /**
     * Save the given download rows through the v3 route.
     *
     * @param array $rows Download rows.
     */
    protected function update_downloads( array $rows ) {
        $request = new WP_REST_Request( 'PUT', $this->get_route( '/products/' . $this->product_id ) );
        $request->add_header( 'Content-Type', 'application/json' );
        $request->set_body( wp_json_encode( [ 'downloads' => $rows ] ) );

        return $this->server->dispatch( $request );
    }
}
