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
     * Mark the "Downloadable Files" field required, the way the Product Form Manager does.
     *
     * @return void
     */
    protected function mark_downloads_required(): void {
        add_filter(
            'dokan_product_editor_prepared_schema',
            function ( $items ) {
                foreach ( $items as &$item ) {
                    if ( 'downloads' === ( $item['id'] ?? '' ) ) {
                        $item['required'] = true;
                    }
                }
                unset( $item );

                return $items;
            },
            99
        );
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
     * Dispatch a product update as a JSON request, the way the product form does.
     *
     * The JSON content type is load bearing: the controller re-encodes the resolved payload onto the
     * request body during `rest_pre_dispatch`, which WordPress only parses back for JSON requests.
     *
     * @param array $body Product payload.
     *
     * @return WP_REST_Response
     */
    protected function update_request( array $body ): WP_REST_Response {
        $request = new WP_REST_Request( 'PUT', $this->get_route( '/products/' . $this->product_id ) );
        $request->add_header( 'Content-Type', 'application/json' );
        $request->set_body( wp_json_encode( $body ) );

        return $this->server->dispatch( $request );
    }

    /**
     * A downloadable product with no download rows is rejected.
     *
     * @return void
     */
    public function test_downloadable_product_without_files_is_rejected(): void {
        $this->mark_downloads_required();

        $response = $this->update_request( $this->downloadable_payload() );

        $this->assertSame( 400, $response->get_status(), 'A required download must block the save.' );
        $this->assertSame( 'dokan_rest_product_download_required', $response->as_error()->get_error_code() );
        $this->assertFalse( wc_get_product( $this->product_id )->is_downloadable(), 'The product must not be saved as downloadable.' );
    }

    /**
     * Blank rows carry no file, so they do not satisfy the requirement.
     *
     * @return void
     */
    public function test_blank_download_rows_do_not_satisfy_the_requirement(): void {
        $this->mark_downloads_required();

        $response = $this->update_request(
            $this->downloadable_payload(
                [
					[
						'id'   => '',
						'name' => 'Untitled',
						'file' => '',
					],
				]
            )
        );

        $this->assertSame( 400, $response->get_status(), 'A row without a file must block the save.' );
        $this->assertSame( 'dokan_rest_product_download_required', $response->as_error()->get_error_code() );
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
     * Nothing is enforced while the field is left optional in the form schema.
     *
     * @return void
     */
    public function test_optional_downloads_field_is_not_enforced(): void {
        $response = $this->update_request( $this->downloadable_payload() );

        $this->assertSame( 200, $response->get_status(), 'An optional field must not block the save.' );
        $this->assertTrue( wc_get_product( $this->product_id )->is_downloadable() );
    }
}
