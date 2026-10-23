<?php

namespace WeDevs\Dokan\Test\REST;

use WC_Product_Download;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Vendor-only product fields must not leak through the public product routes.
 *
 * @group dokan-product-controller
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\REST\ProductController::prepare_data_for_response
 * @covers \WeDevs\Dokan\REST\ProductController::can_view_private_product_data
 * @covers \WeDevs\Dokan\REST\ProductController::get_public_meta_data
 */
class PublicProductPrivateFieldsTest extends DokanTestCase {

    /**
     * Buyer-facing meta key used to exercise the public meta allowlist.
     */
    const PUBLIC_META_KEY = '_dokan_min_max_meta';

    /**
     * Value stored under the public meta key.
     */
    const PUBLIC_META_VALUE = [
        'min_quantity' => 2,
        'max_quantity' => 10,
    ];

    /**
     * Published downloadable product owned by seller_id1.
     *
     * @var int
     */
    protected int $product_id;

    /**
     * Setup test fixtures.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        // Keep WooCommerce's approved download directories out of the way so the example.org file validates.
        update_option( 'wc_downloads_approved_directories_mode', 'disabled' );

        $this->product_id = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create(
                [
                    'name'          => 'Private Fields Ebook',
                    'status'        => 'publish',
                    'regular_price' => '20',
                ]
            );

        $download = new WC_Product_Download();
        $download->set_name( 'ebook.pdf' );
        $download->set_file( 'https://example.org/wp-content/uploads/woocommerce_uploads/ebook.pdf' );

        $product = wc_get_product( $this->product_id );
        $product->set_downloadable( true );
        $product->set_virtual( true );
        $product->set_downloads( [ $download ] );
        $product->set_purchase_note( 'License key: EXAMPLE-LICENSE' );
        $product->update_meta_data( '_per_product_admin_commission', '7' );
        $product->update_meta_data( self::PUBLIC_META_KEY, self::PUBLIC_META_VALUE );
        $product->save();
    }

    /**
     * Find the fixture product in a public route response.
     *
     * @param string $rest_namespace REST namespace.
     * @param string $route          Route inside the namespace.
     *
     * @return array
     */
    protected function get_fixture_product( string $rest_namespace, string $route ): array {
        $this->namespace = $rest_namespace;

        $response = $this->get_request( $route, [ 'per_page' => 100 ] );

        $this->assertEquals( 200, $response->get_status() );

        foreach ( $response->get_data() as $product ) {
            if ( $this->product_id === (int) $product['id'] ) {
                return $product;
            }
        }

        $this->fail( "Product {$this->product_id} missing from {$rest_namespace}/{$route}" );
    }

    /**
     * Keys of a serialized product's meta data.
     *
     * @param array $product Serialized product.
     *
     * @return array
     */
    protected function get_meta_keys( array $product ): array {
        return array_map(
            function ( $meta ) {
                return is_object( $meta ) ? $meta->key : $meta['key'];
            },
            $product['meta_data']
        );
    }

    /**
     * Public routes that serialize products with the shared serializer.
     *
     * @return array
     */
    protected function get_public_routes(): array {
        return [
            [ 'dokan/v1', 'products/latest' ],
            [ 'dokan/v2', 'products/latest' ],
            [ 'dokan/v1', "stores/{$this->seller_id1}/products" ],
        ];
    }

    /**
     * Resolve a caller label to a user id.
     *
     * @param string $caller Caller label.
     *
     * @return int
     */
    protected function get_caller_id( string $caller ): int {
        switch ( $caller ) {
            case 'shop_manager':
                return $this->factory()->user->create( [ 'role' => 'shop_manager' ] );

            case 'staff':
                return $this->create_staff( true );

            case 'narrowed_staff':
                return $this->create_staff( false );
        }

        $ids = [
            'anonymous'     => 0,
            'customer'      => $this->customer_id,
            'other_vendor'  => $this->seller_id2,
            'owner'         => $this->seller_id1,
            'administrator' => $this->admin_id,
        ];

        return $ids[ $caller ];
    }

    /**
     * Create a vendor staff member of seller_id1.
     *
     * @param bool $can_view_products Whether the staff member keeps the product menu capability.
     *
     * @return int
     */
    protected function create_staff( bool $can_view_products ): int {
        $staff_id = $this->factory()->user->create( [ 'role' => 'customer' ] );
        $staff    = new \WP_User( $staff_id );

        $staff->add_cap( 'vendor_staff' );
        $staff->add_cap( 'dokandar' );

        if ( $can_view_products ) {
            $staff->add_cap( 'dokan_view_product_menu' );
            $staff->add_cap( 'dokan_edit_product' );
        }

        update_user_meta( $staff_id, '_vendor_id', $this->seller_id1 );

        return $staff_id;
    }

    /**
     * Callers that must not see vendor-only fields.
     *
     * @return array
     */
    public function unauthorized_caller_provider(): array {
        return [
            'anonymous'                        => [ 'anonymous' ],
            'customer'                         => [ 'customer' ],
            'other vendor'                     => [ 'other_vendor' ],
            'staff without product menu access' => [ 'narrowed_staff' ],
        ];
    }

    /**
     * Callers allowed to see vendor-only fields.
     *
     * @return array
     */
    public function authorized_caller_provider(): array {
        return [
            'owner'         => [ 'owner' ],
            'owner staff'   => [ 'staff' ],
            'shop manager'  => [ 'shop_manager' ],
            'administrator' => [ 'administrator' ],
        ];
    }

    /**
     * Download file URLs, earning, purchase note, meta data and dashboard links are blanked for other callers.
     *
     * @dataProvider unauthorized_caller_provider
     *
     * @param string $caller Caller label.
     *
     * @return void
     */
    public function test_private_fields_are_hidden_from_other_callers( string $caller ): void {
        wp_set_current_user( $this->get_caller_id( $caller ) );

        foreach ( $this->get_public_routes() as [ $rest_namespace, $route ] ) {
            $product = $this->get_fixture_product( $rest_namespace, $route );
            $label   = "{$caller} on {$rest_namespace}/{$route}";

            $this->assertTrue( $product['downloadable'], $label );
            $this->assertSame( [], $product['downloads'], "Download files leaked to {$label}" );
            $this->assertNull( $product['earning'], "Earning leaked to {$label}" );
            $this->assertSame( '', $product['purchase_note'], "Purchase note leaked to {$label}" );
            $this->assertSame( '', $product['edit_url'], "Edit URL leaked to {$label}" );
            $this->assertSame( [], $product['row_actions'], "Row actions leaked to {$label}" );
            $this->assertSame( [], $product['meta_data'], "Meta data leaked to {$label}" );
        }
    }

    /**
     * The owning vendor and admins still get the full product data.
     *
     * @dataProvider authorized_caller_provider
     *
     * @param string $caller Caller label.
     *
     * @return void
     */
    public function test_private_fields_are_kept_for_owner_and_admin( string $caller ): void {
        wp_set_current_user( $this->get_caller_id( $caller ) );

        foreach ( $this->get_public_routes() as [ $rest_namespace, $route ] ) {
            $product = $this->get_fixture_product( $rest_namespace, $route );
            $label   = "{$caller} on {$rest_namespace}/{$route}";

            $this->assertCount( 1, $product['downloads'], $label );
            $this->assertSame( 'https://example.org/wp-content/uploads/woocommerce_uploads/ebook.pdf', $product['downloads'][0]['file'], $label );
            $this->assertIsFloat( $product['earning'], $label );
            $this->assertStringContainsString( 'EXAMPLE-LICENSE', $product['purchase_note'], $label );
            $this->assertNotEmpty( $product['edit_url'], $label );
            $this->assertNotEmpty( $product['row_actions'], $label );
            $this->assertContains( '_per_product_admin_commission', $this->get_meta_keys( $product ), $label );
            $this->assertContains( self::PUBLIC_META_KEY, $this->get_meta_keys( $product ), $label );
        }
    }

    /**
     * Meta keys opted in through `dokan_rest_public_product_meta_keys` reach other callers; the rest stays hidden.
     *
     * @dataProvider unauthorized_caller_provider
     *
     * @param string $caller Caller label.
     *
     * @return void
     */
    public function test_opted_in_meta_keys_are_public( string $caller ): void {
        add_filter(
            'dokan_rest_public_product_meta_keys',
            function ( $keys ) {
                $keys[] = self::PUBLIC_META_KEY;

                return $keys;
            }
        );

        wp_set_current_user( $this->get_caller_id( $caller ) );

        foreach ( $this->get_public_routes() as [ $rest_namespace, $route ] ) {
            $product = $this->get_fixture_product( $rest_namespace, $route );
            $label   = "{$caller} on {$rest_namespace}/{$route}";

            $this->assertSame( [ self::PUBLIC_META_KEY ], $this->get_meta_keys( $product ), "Only opted-in meta may reach {$label}" );

            $meta  = $product['meta_data'][0];
            $value = is_object( $meta ) ? $meta->value : $meta['value'];

            $this->assertSame( self::PUBLIC_META_VALUE, $value, $label );
        }
    }
}
