<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\REST\StoreController;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Authorization test for the store-categories REST endpoint.
 *
 * Covers the unauthenticated commission disclosure (audit L10 /
 * plugin-internal-tasks#2172): `GET dokan/v1/stores/<id>/categories` is a public
 * route, so the vendor's admin-configured commission must not ride along in the
 * response for callers the single-store endpoint would not show it to.
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-store-controller
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\REST\StoreController::get_store_category
 */
class StoreCategoriesCommissionDisclosureTest extends DokanTestCase {

    /**
     * Commission fields that must reach only authorized callers.
     *
     * @var array
     */
    protected const COMMISSION_FIELDS = [ 'admin_commission_type', 'commission' ];

    public function set_up() {
        parent::set_up();

        ( new StoreController() )->register_routes();

        $category_id = $this->factory()->term->create( [ 'taxonomy' => 'product_cat' ] );
        $product     = $this->factory()->product->create_simple_product();

        wp_update_post(
            [
                'ID'          => $product->get_id(),
                'post_author' => $this->seller_id1,
                'post_status' => 'publish',
            ]
        );
        wp_set_object_terms( $product->get_id(), [ $category_id ], 'product_cat' );
    }

    /**
     * An anonymous caller gets the category terms but no commission data.
     */
    public function test_anonymous_caller_does_not_receive_commission_fields() {
        wp_set_current_user( 0 );

        $this->assertCommissionFieldsVisible( false, 'Anonymous callers' );
    }

    /**
     * Another vendor is no more privileged than the public for this store's commission.
     */
    public function test_other_vendor_does_not_receive_commission_fields() {
        wp_set_current_user( $this->seller_id2 );

        $this->assertCommissionFieldsVisible( false, 'A different vendor' );
    }

    /**
     * Vendor staff are excluded too, matching what the single-store endpoint strips from them.
     */
    public function test_vendor_staff_does_not_receive_commission_fields() {
        wp_set_current_user( $this->create_vendor_staff( $this->seller_id1 ) );

        $this->assertCommissionFieldsVisible( false, 'Vendor staff' );
    }

    /**
     * The store's own vendor still sees their commission settings.
     */
    public function test_store_owner_receives_commission_fields() {
        wp_set_current_user( $this->seller_id1 );

        $this->assertCommissionFieldsVisible( true, 'The store owner' );
    }

    /**
     * An admin / shop manager still sees commission settings for any store.
     */
    public function test_admin_receives_commission_fields() {
        wp_set_current_user( $this->admin_id );

        $this->assertCommissionFieldsVisible( true, 'An admin' );
    }

    /**
     * Assert whether the commission fields are attached to every returned term.
     */
    protected function assertCommissionFieldsVisible( bool $expected, string $who ) {
        foreach ( $this->request_store_categories() as $term ) {
            $data = get_object_vars( $term );

            foreach ( self::COMMISSION_FIELDS as $field ) {
                if ( $expected ) {
                    $this->assertArrayHasKey( $field, $data, sprintf( '%s should still receive "%s".', $who, $field ) );
                } else {
                    $this->assertArrayNotHasKey( $field, $data, sprintf( '%s must not receive "%s".', $who, $field ) );
                }
            }
        }
    }

    /**
     * Dispatch the public store-categories route for seller_id1.
     */
    protected function request_store_categories(): array {
        $response = $this->get_request( "stores/{$this->seller_id1}/categories" );

        $this->assertSame( 200, $response->get_status() );

        $terms = (array) $response->get_data();

        // Guard the assertions below against passing vacuously — the terms themselves stay public for everyone.
        $this->assertNotEmpty( $terms, 'The category terms themselves stay public.' );

        return $terms;
    }

    public function tear_down() {
        wp_set_current_user( 0 );

        parent::tear_down();
    }
}
