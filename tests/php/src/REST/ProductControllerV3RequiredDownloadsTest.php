<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\ProductControllerV3;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Server-side enforcement of the required "Downloadable Files" form field.
 *
 * Covers getdokan/dokan-pro#5963: a downloadable product could be saved with no
 * attached file even though the form schema (Dokan Pro's Product Form Manager)
 * marked the field as required.
 *
 * @group dokan-product-controller-v3
 * @group dokan-product-editor
 *
 * @covers \WeDevs\Dokan\REST\ProductControllerV3::validate_required_downloads
 * @covers \WeDevs\Dokan\REST\ProductControllerV3::prepare_object_for_database
 */
class ProductControllerV3RequiredDownloadsTest extends DokanTestCase {

    /**
     * Error code the guard rejects with.
     */
    const ERROR_CODE = 'dokan_rest_product_download_required';

    /**
     * REST namespace for this controller.
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Product owned by the acting vendor.
     *
     * @var int
     */
    protected int $product_id;

    /**
     * Setup test environment.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        $controller = new ProductControllerV3();
        $controller->register_routes();

        // Keep WooCommerce's approved download directories out of the way; this suite is about the form rule.
        update_option( 'wc_downloads_approved_directories_mode', 'disabled' );

        $this->product_id = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
					'name'          => 'Downloadable Product',
					'regular_price' => '10',
				]
            );

        wp_set_current_user( $this->seller_id1 );
    }

    /**
     * Override the "Downloadable Files" schema field, the way the Product Form Manager does.
     *
     * @param array $overrides Schema keys to merge onto the field.
     *
     * @return void
     */
    protected function override_downloads_field( array $overrides ): void {
        add_filter(
            'dokan_product_editor_prepared_schema',
            function ( $items ) use ( $overrides ) {
                foreach ( $items as &$item ) {
                    if ( 'downloads' === ( $item['id'] ?? '' ) ) {
                        $item = array_merge( $item, $overrides );
                    }
                }
                unset( $item );

                return $items;
            },
            99
        );
    }

    /**
     * Mark the "Downloadable Files" field required for every product type.
     *
     * @return void
     */
    protected function mark_downloads_required(): void {
        $this->override_downloads_field( [ 'required' => true ] );
    }

    /**
     * A downloadable product payload carrying the given file rows.
     *
     * @param array $downloads Download rows.
     *
     * @return array
     */
    protected function downloadable_payload( array $downloads = [] ): array {
        return [
            'type'         => 'simple',
            'downloadable' => true,
            'downloads'    => $downloads,
        ];
    }

    /**
     * A download row pointing at a real file.
     *
     * @return array
     */
    protected function file_row(): array {
        return [
            'id'   => '',
            'name' => 'Guide',
            'file' => content_url( 'uploads/dokan-required-downloads-test.pdf' ),
        ];
    }

    /**
     * Dispatch a JSON request, the way the product form does.
     *
     * The JSON content type is load bearing: the controller re-encodes the resolved payload onto the
     * request body during `rest_pre_dispatch`, which WordPress only parses back for JSON requests.
     *
     * @param string $method HTTP method.
     * @param string $route  Route below the namespace.
     * @param array  $body   Request payload.
     *
     * @return WP_REST_Response
     */
    protected function json_request( string $method, string $route, array $body ): WP_REST_Response {
        $request = new WP_REST_Request( $method, $this->get_route( $route ) );
        $request->add_header( 'Content-Type', 'application/json' );
        $request->set_body( wp_json_encode( $body ) );

        return $this->server->dispatch( $request );
    }

    /**
     * Dispatch a product update.
     *
     * @param array $body Product payload.
     *
     * @return WP_REST_Response
     */
    protected function update_request( array $body ): WP_REST_Response {
        return $this->json_request( 'PUT', '/products/' . $this->product_id, $body );
    }

    /**
     * Assert a response was rejected by the download rule.
     *
     * @param WP_REST_Response $response Response under test.
     * @param string           $message  Failure message.
     *
     * @return void
     */
    protected function assertRejectedForMissingDownload( WP_REST_Response $response, string $message ): void {
        $this->assertSame( 400, $response->get_status(), $message );
        $this->assertSame( self::ERROR_CODE, $response->as_error()->get_error_code(), $message );
    }

    /**
     * A downloadable product with no download rows is rejected.
     *
     * @return void
     */
    public function test_downloadable_product_without_files_is_rejected(): void {
        $this->mark_downloads_required();

        $this->assertRejectedForMissingDownload(
            $this->update_request( $this->downloadable_payload() ),
            'A required download must block the save.'
        );

        $this->assertFalse( wc_get_product( $this->product_id )->is_downloadable(), 'The product must not be saved as downloadable.' );
    }

    /**
     * Blank rows carry no file, so they do not satisfy the requirement.
     *
     * @return void
     */
    public function test_blank_download_rows_do_not_satisfy_the_requirement(): void {
        $this->mark_downloads_required();

        $this->assertRejectedForMissingDownload(
            $this->update_request(
                $this->downloadable_payload(
                    [
						[
							'id' => '',
							'name' => 'Untitled',
							'file' => '',
						],
					]
                )
            ),
            'A row without a file must block the save.'
        );
    }

    /**
     * Omitting the downloads key does not dodge the rule.
     *
     * WooCommerce turns a product downloadable from `downloadable` alone and only reads `downloads`
     * when that key is present, so a payload-shaped guard would let this through.
     *
     * @return void
     */
    public function test_update_without_a_downloads_key_is_rejected(): void {
        $this->mark_downloads_required();

        $this->assertRejectedForMissingDownload(
            $this->update_request(
                [
					'type' => 'simple',
					'downloadable' => true,
				]
            ),
            'Turning a product downloadable without sending downloads must block the save.'
        );
    }

    /**
     * The rule applies to product creation as well as updates.
     *
     * @return void
     */
    public function test_create_without_a_downloads_key_is_rejected(): void {
        $this->mark_downloads_required();

        $this->assertRejectedForMissingDownload(
            $this->json_request(
                'POST',
                '/products',
                [
					'name'         => 'Created downloadable',
					'type'         => 'simple',
					'downloadable' => true,
				]
            ),
            'Creating a downloadable product with no file must block the save.'
        );
    }

    /**
     * Batch updates run through the same hook.
     *
     * @return void
     */
    public function test_batch_update_is_rejected(): void {
        $this->mark_downloads_required();

        $response = $this->json_request(
            'POST',
            '/products/batch',
            [
                'update' => [
                    array_merge( [ 'id' => $this->product_id ], $this->downloadable_payload() ),
                ],
            ]
        );

        $data = $response->get_data();

        $this->assertArrayHasKey( 'update', $data, 'Batch response should contain an update section.' );
        $this->assertSame( self::ERROR_CODE, $data['update'][0]['error']['code'] ?? '', 'Batch items must be validated too.' );
    }

    /**
     * A row with a real file passes the rule.
     *
     * @return void
     */
    public function test_attached_file_is_accepted(): void {
        $this->mark_downloads_required();

        $response = $this->update_request( $this->downloadable_payload( [ $this->file_row() ] ) );

        $this->assertSame( 200, $response->get_status(), 'An attached file must satisfy the rule.' );

        $product = wc_get_product( $this->product_id );

        $this->assertTrue( $product->is_downloadable() );
        $this->assertCount( 1, $product->get_downloads(), 'The attached file should be stored.' );
    }

    /**
     * A partial save that never touches the downloadable fields stays untouched.
     *
     * @return void
     */
    public function test_partial_update_without_downloads_is_allowed(): void {
        $this->mark_downloads_required();

        $response = $this->update_request( [ 'regular_price' => '12.50' ] );

        $this->assertSame( 200, $response->get_status(), 'Quick-edit style saves must not hit the download rule.' );
        $this->assertSame( '12.50', wc_get_product( $this->product_id )->get_regular_price() );
    }

    /**
     * A product that is already downloadable with no file stays editable through partial saves.
     *
     * @return void
     */
    public function test_existing_zero_file_product_stays_editable(): void {
        $product = wc_get_product( $this->product_id );
        $product->set_downloadable( true );
        $product->save();

        $this->mark_downloads_required();

        $response = $this->update_request( [ 'regular_price' => '12.50' ] );

        $this->assertSame( 200, $response->get_status(), 'Products predating the rule must remain editable.' );
    }

    /**
     * Nothing is enforced while the field is left optional in the form schema.
     *
     * @return void
     */
    public function test_optional_downloads_field_is_not_enforced(): void {
        $response = $this->update_request( $this->downloadable_payload() );

        $this->assertSame( 200, $response->get_status(), 'An optional field must not block the save.' );
        $this->assertTrue( wc_get_product( $this->product_id )->is_downloadable() );
    }

    /**
     * A required field that the form hides for this product type is not enforced.
     *
     * @return void
     */
    public function test_hidden_downloads_field_is_not_enforced(): void {
        $this->override_downloads_field(
            [
				'required'   => true,
				'visibility' => false,
			]
        );

        $response = $this->update_request( $this->downloadable_payload() );

        $this->assertSame( 200, $response->get_status(), 'A hidden field must not block the save.' );
    }

    /**
     * Per-product-type `requireds` win over the shared `required` flag.
     *
     * @return void
     */
    public function test_per_type_required_map_is_honoured(): void {
        $this->override_downloads_field(
            [
				'required'  => true,
				'requireds' => [ 'simple' => false ],
			]
        );

        $response = $this->update_request( $this->downloadable_payload() );

        $this->assertSame( 200, $response->get_status(), 'The simple-product override must win over the shared flag.' );
    }

    /**
     * Per-product-type `visibilities` win over the shared `visibility` flag.
     *
     * @return void
     */
    public function test_per_type_visibility_map_is_honoured(): void {
        $this->override_downloads_field(
            [
				'required'     => true,
				'visibility'   => false,
				'visibilities' => [ 'simple' => true ],
			]
        );

        $this->assertRejectedForMissingDownload(
            $this->update_request( $this->downloadable_payload() ),
            'The simple-product override must win over the shared visibility flag.'
        );
    }

    /**
     * Extensions can reject a save through the prepared-object filter.
     *
     * @return void
     */
    public function test_extensions_can_reject_a_save(): void {
        add_filter(
            'dokan_rest_pre_insert_product_object',
            static function () {
                return new \WP_Error( 'dokan_test_rejected', 'Nope.', [ 'status' => 400 ] );
            }
        );

        $response = $this->update_request( [ 'regular_price' => '12.50' ] );

        $this->assertSame( 400, $response->get_status(), 'The filter must be able to reject a save.' );
        $this->assertSame( 'dokan_test_rejected', $response->as_error()->get_error_code() );
    }

    /**
     * The prepared-object filter receives the assembled product on an allowed save.
     *
     * @return void
     */
    public function test_extensions_receive_the_prepared_product(): void {
        $seen = null;

        add_filter(
            'dokan_rest_pre_insert_product_object',
            static function ( $product, $request, $creating ) use ( &$seen ) {
                $seen = [ $product, $creating ];

                return $product;
            },
            10,
            3
        );

        $response = $this->update_request( [ 'regular_price' => '12.50' ] );

        $this->assertSame( 200, $response->get_status(), 'Returning the product must let the save through.' );
        $this->assertInstanceOf( \WC_Product::class, $seen[0] ?? null, 'The filter should receive the assembled product.' );
        $this->assertFalse( $seen[1] ?? true, 'An update is not a create.' );
    }
}
