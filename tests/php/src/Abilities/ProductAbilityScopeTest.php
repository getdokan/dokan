<?php

namespace WeDevs\Dokan\Test\Abilities;

use WeDevs\Dokan\Abilities\ProductAbilityScope;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 *
 * Tests that WooCommerce product abilities are vendor-scoped over MCP, and fully inert otherwise.
 */
class ProductAbilityScopeTest extends DokanTestCase {

    /**
     * System under test.
     *
     * @var ProductAbilityScope
     */
    private $sut;

    public function set_up() {
        parent::set_up();
        $this->sut = new ProductAbilityScope();
        // Clear the per-request MCP state so the static flag never leaks between tests.
        RequestContext::reset();
    }

    /**
     * Force the request to be treated as an MCP request.
     *
     * @return void
     */
    private function force_ability_context(): void {
        add_filter( 'dokan_is_ability_context', '__return_true' );
    }

    public function test_scope_products_query_is_noop_without_active_filter() {
        // The product query scope is only set while a products-query ability runs.
        wp_set_current_user( $this->seller_id1 );

        $query = $this->sut->scope_products_query( [ 'post_type' => 'product' ] );

        $this->assertArrayNotHasKey( 'author', $query );
        $this->assertArrayNotHasKey( 'post_status', $query );
    }

    public function test_published_product_is_publicly_readable() {
        $other_published = $this->factory()->product->set_seller_id( $this->seller_id2 )->create();

        $this->force_ability_context();
        wp_set_current_user( $this->seller_id1 );

        // A published product is public, even another vendor's.
        $this->assertTrue( $this->sut->scope_product_permissions( false, 'read', $other_published, 'product' ) );
    }

    public function test_unpublished_product_readable_only_by_owner_or_admin() {
        $other_draft = $this->factory()->product->set_seller_id( $this->seller_id2 )->create();
        $own_draft   = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();
        wp_update_post(
            [
				'ID' => $other_draft,
				'post_status' => 'draft',
			]
        );
        wp_update_post(
            [
				'ID' => $own_draft,
				'post_status' => 'draft',
			]
        );

        $this->force_ability_context();

        wp_set_current_user( $this->seller_id1 );
        $this->assertFalse( $this->sut->scope_product_permissions( true, 'read', $other_draft, 'product' ) );
        $this->assertTrue( $this->sut->scope_product_permissions( true, 'read', $own_draft, 'product' ) );

        wp_set_current_user( $this->admin_id );
        $this->assertTrue( $this->sut->scope_product_permissions( false, 'read', $other_draft, 'product' ) );
    }

    public function test_scope_product_permissions_is_noop_for_unrelated_post_type() {
        $this->force_ability_context();
        wp_set_current_user( $this->seller_id1 );

        // Unrelated post types must pass the incoming permission through untouched.
        $this->assertFalse( $this->sut->scope_product_permissions( false, 'read', 123, 'shop_order' ) );
        $this->assertTrue( $this->sut->scope_product_permissions( true, 'read', 123, 'shop_order' ) );
    }

    public function test_scope_product_permissions_is_noop_when_not_mcp_request() {
        $other_draft = $this->factory()->product->set_seller_id( $this->seller_id2 )->create();
        wp_update_post(
            [
				'ID' => $other_draft,
				'post_status' => 'draft',
			]
        );

        wp_set_current_user( $this->seller_id1 );

        // Without MCP context the incoming permission is returned unchanged (no enforcement).
        $this->assertTrue( $this->sut->scope_product_permissions( true, 'read', $other_draft, 'product' ) );
    }

    public function test_staff_created_product_is_authored_to_parent_vendor() {
        $staff_id = $this->create_vendor_staff( $this->seller_id1 );

        $this->force_ability_context();
        wp_set_current_user( $staff_id );
        $this->sut->register_hooks();

        $product = new \WC_Product_Simple();
        $product->set_name( 'Staff product' );
        $product->save();

        // WooCommerce authors to the staff user; our hook reassigns to the parent vendor.
        $this->assertSame( $this->seller_id1, (int) get_post_field( 'post_author', $product->get_id() ) );
    }

    public function test_vendor_created_product_keeps_vendor_author() {
        $this->force_ability_context();
        wp_set_current_user( $this->seller_id1 );
        $this->sut->register_hooks();

        $product = new \WC_Product_Simple();
        $product->set_name( 'Vendor product' );
        $product->save();

        $this->assertSame( $this->seller_id1, (int) get_post_field( 'post_author', $product->get_id() ) );
    }

    public function test_product_author_untouched_when_not_mcp_request() {
        $staff_id = $this->create_vendor_staff( $this->seller_id1 );

        wp_set_current_user( $staff_id );
        $this->sut->register_hooks();

        $product = new \WC_Product_Simple();
        $product->set_name( 'Dashboard product' );
        $product->save();

        // Outside MCP we must not interfere; WooCommerce's default author stands.
        $this->assertSame( $staff_id, (int) get_post_field( 'post_author', $product->get_id() ) );
    }

    public function test_extend_injects_vendor_id_into_flat_schema() {
        $args = $this->sut->extend_product_abilities(
            [
                'input_schema'     => [
					'type' => 'object',
					'properties' => [ 'name' => [ 'type' => 'string' ] ],
				],
                'execute_callback' => static function ( $input ) {
                    return $input;
                },
            ],
            'woocommerce/products-create'
        );

        $this->assertArrayHasKey( 'vendor_id', $args['input_schema']['properties'] );
    }

    public function test_extend_injects_vendor_id_into_each_oneof_branch() {
        $args = $this->sut->extend_product_abilities(
            [
                'input_schema'     => [
                    'type'  => 'object',
                    'oneOf' => [
                        [ 'properties' => [ 'name' => [ 'type' => 'string' ] ] ],
                        [ 'properties' => [ 'id' => [ 'type' => 'integer' ] ] ],
                    ],
                ],
                'execute_callback' => static function ( $input ) {
                    return $input;
                },
            ],
            'woocommerce/product-create'
        );

        $this->assertArrayHasKey( 'vendor_id', $args['input_schema']['oneOf'][0]['properties'] );
        $this->assertArrayHasKey( 'vendor_id', $args['input_schema']['oneOf'][1]['properties'] );
    }

    public function test_extend_leaves_unrelated_ability_untouched() {
        $input = [
            'input_schema'     => [
				'type' => 'object',
				'properties' => [],
			],
            'execute_callback' => static function ( $i ) {
                return $i;
            },
        ];

        $this->assertSame( $input, $this->sut->extend_product_abilities( $input, 'something/else' ) );
    }

    /**
     * Build the wrapped product-create callback whose "original" creates a real product.
     *
     * @return callable
     */
    private function wrapped_create_callback(): callable {
        $original = static function () {
            $product = new \WC_Product_Simple();
            $product->set_name( 'Created via ability' );
            $product->save();

            return [ 'id' => $product->get_id() ];
        };

        $args = $this->sut->extend_product_abilities(
            [
                'input_schema'     => [
					'type' => 'object',
					'properties' => [],
				],
                'execute_callback' => $original,
            ],
            'woocommerce/products-create'
        );

        return $args['execute_callback'];
    }

    public function test_admin_must_select_vendor_when_creating_over_mcp() {
        $this->force_ability_context();
        $this->sut->register_hooks();
        wp_set_current_user( $this->admin_id );

        $result = call_user_func( $this->wrapped_create_callback(), [ 'name' => 'X' ] );

        $this->assertInstanceOf( \WP_Error::class, $result );
        $this->assertSame( 'dokan_ability_vendor_required', $result->get_error_code() );
    }

    public function test_admin_rejects_invalid_vendor_when_creating() {
        $this->force_ability_context();
        $this->sut->register_hooks();
        wp_set_current_user( $this->admin_id );

        $result = call_user_func(
            $this->wrapped_create_callback(), [
				'name' => 'X',
				'vendor_id' => $this->customer_id,
			]
        );

        $this->assertInstanceOf( \WP_Error::class, $result );
        $this->assertSame( 'dokan_ability_invalid_vendor', $result->get_error_code() );
    }

    public function test_admin_create_authors_product_to_selected_vendor() {
        $this->force_ability_context();
        $this->sut->register_hooks();
        wp_set_current_user( $this->admin_id );

        $result = call_user_func(
            $this->wrapped_create_callback(), [
				'name' => 'X',
				'vendor_id' => $this->seller_id1,
			]
        );

        $this->assertSame( $this->seller_id1, (int) get_post_field( 'post_author', $result['id'] ) );
    }

    public function test_vendor_create_is_forced_to_own_store() {
        $this->force_ability_context();
        $this->sut->register_hooks();
        wp_set_current_user( $this->seller_id1 );

        // Supplies another vendor's id; must be ignored in favor of their own store.
        $result = call_user_func(
            $this->wrapped_create_callback(), [
				'name' => 'X',
				'vendor_id' => $this->seller_id2,
			]
        );

        $this->assertSame( $this->seller_id1, (int) get_post_field( 'post_author', $result['id'] ) );
    }

    public function test_extend_injects_vendor_into_products_query_output_schema() {
        $args = $this->sut->extend_product_abilities(
            [
                'output_schema'    => [
                    'type'       => 'object',
                    'properties' => [
                        'products' => [
                            'type'  => 'array',
                            'items' => [
                                'type'       => 'object',
                                'properties' => [ 'id' => [ 'type' => 'integer' ] ],
                            ],
                        ],
                    ],
                ],
                'execute_callback' => static function ( $input ) {
                    return $input;
                },
            ],
            'woocommerce/products-query'
        );

        $this->assertArrayHasKey( 'vendor', $args['output_schema']['properties']['products']['items']['properties'] );
    }

    public function test_products_query_output_is_enriched_with_owning_vendor() {
        $product_id = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();

        $original = static function () use ( $product_id ) {
            return [ 'products' => [ [ 'id' => $product_id ] ] ];
        };

        $args = $this->sut->extend_product_abilities(
            [
                'output_schema'    => [
					'type' => 'object',
					'properties' => [ 'products' => [ 'items' => [ 'properties' => [] ] ] ],
				],
                'execute_callback' => $original,
            ],
            'woocommerce/products-query'
        );

        $result = call_user_func( $args['execute_callback'], [] );

        $vendor = $result['products'][0]['vendor'];
        $this->assertSame( $this->seller_id1, $vendor['id'] );
        $this->assertSame( dokan()->vendor->get( $this->seller_id1 )->get_shop_name(), $vendor['store_name'] );
    }

    /**
     * Run a products-query whose "original" returns the scoped product data-store query.
     *
     * @param array $input Ability input.
     *
     * @return array The query args after the product query scope has been applied.
     */
    private function products_query_scope_for( array $input ): array {
        $original = static function () {
            return apply_filters(
                'woocommerce_product_data_store_cpt_get_products_query',
                [ 'post_type' => 'product' ],
                [],
                null
            );
        };

        $args = $this->sut->extend_product_abilities(
            [
                'input_schema'     => [
					'type' => 'object',
					'properties' => [],
				],
                'output_schema'    => [
					'type' => 'object',
					'properties' => [ 'products' => [ 'items' => [ 'properties' => [] ] ] ],
				],
                'execute_callback' => $original,
            ],
            'woocommerce/products-query'
        );

        return call_user_func( $args['execute_callback'], $input );
    }

    public function test_products_query_injects_vendor_filter_into_input_schema() {
        $args = $this->sut->extend_product_abilities(
            [
                'input_schema'     => [
					'type' => 'object',
					'properties' => [],
				],
                'execute_callback' => static function ( $i ) {
                    return $i;
                },
            ],
            'woocommerce/products-query'
        );

        $this->assertArrayHasKey( 'vendor_id', $args['input_schema']['properties'] );
    }

    public function test_products_query_with_no_filter_is_published_only_for_vendor() {
        $this->sut->register_hooks();
        $this->force_ability_context();
        wp_set_current_user( $this->seller_id1 );

        $query = $this->products_query_scope_for( [] );

        $this->assertArrayNotHasKey( 'author', $query );
        $this->assertSame( 'publish', $query['post_status'] );
    }

    public function test_products_query_filtering_own_store_shows_all_statuses() {
        $this->sut->register_hooks();
        $this->force_ability_context();
        wp_set_current_user( $this->seller_id1 );

        $query = $this->products_query_scope_for( [ 'vendor_id' => $this->seller_id1 ] );

        $this->assertSame( $this->seller_id1, $query['author'] );
        $this->assertArrayNotHasKey( 'post_status', $query );
    }

    public function test_products_query_filtering_other_vendor_is_published_only() {
        $this->sut->register_hooks();
        $this->force_ability_context();
        wp_set_current_user( $this->seller_id1 );

        $query = $this->products_query_scope_for( [ 'vendor_id' => $this->seller_id2 ] );

        $this->assertSame( $this->seller_id2, $query['author'] );
        $this->assertSame( 'publish', $query['post_status'] );
    }

    public function test_products_query_admin_sees_all_statuses_for_target_vendor() {
        $this->sut->register_hooks();
        $this->force_ability_context();
        wp_set_current_user( $this->admin_id );

        $query = $this->products_query_scope_for( [ 'vendor_id' => $this->seller_id2 ] );

        $this->assertSame( $this->seller_id2, $query['author'] );
        $this->assertArrayNotHasKey( 'post_status', $query );
    }

    /**
     * The gate denies cross-vendor writes itself rather than relying on native capabilities.
     *
     * The incoming permission is deliberately `true` here: native capabilities happen to deny
     * cross-vendor product writes, but the equivalent order check does not, so the layer must not
     * depend on them. See ADR-0006.
     */
    public function test_cross_vendor_writes_are_denied_by_the_ownership_gate() {
        $other_product = $this->factory()->product->set_seller_id( $this->seller_id2 )->create();

        $this->force_ability_context();
        wp_set_current_user( $this->seller_id1 );

        $this->assertFalse( $this->sut->scope_product_permissions( true, 'edit', $other_product, 'product' ) );
        $this->assertFalse( $this->sut->scope_product_permissions( true, 'delete', $other_product, 'product' ) );

        // Native capabilities agree for products; the gate does not depend on that.
        $this->assertFalse( current_user_can( 'edit_post', $other_product ) );
        $this->assertFalse( current_user_can( 'delete_post', $other_product ) );
    }

    /**
     * Vendor staff act on records authored by their parent vendor, which native capabilities
     * cannot express — they hold `edit_product` but not `edit_others_products`. Without this the
     * MCP surface grants staff *less* than Dokan's own REST API. See ADR-0007.
     */
    public function test_staff_may_write_their_vendors_product_despite_native_caps() {
        $own_product = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        ( new \WP_User( $staff_id ) )->add_cap( 'dokan_edit_product' );

        $this->force_ability_context();
        wp_set_current_user( $staff_id );

        // Native capabilities refuse this write.
        $this->assertFalse( current_user_can( 'edit_post', $own_product ) );

        // The gate grants it, matching the vendor dashboard.
        $this->assertTrue( $this->sut->scope_product_permissions( false, 'edit', $own_product, 'product' ) );
    }

    public function test_staff_without_the_capability_may_not_write() {
        $own_product = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $this->force_ability_context();

        $this->assertFalse( current_user_can( 'dokan_edit_product' ) );
        $this->assertFalse( $this->sut->scope_product_permissions( true, 'edit', $own_product, 'product' ) );
    }

    /**
     * Unpublished-product reads are gated like the dashboard's product list — ownership alone
     * is not enough below Store Admin (ADR-0007 applies to reads too). Published products stay
     * public regardless of capabilities.
     */
    public function test_staff_unpublished_product_reads_require_the_view_capability() {
        $draft = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();
        wp_update_post(
            [
                'ID'          => $draft,
                'post_status' => 'draft',
            ]
        );

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );
        $this->force_ability_context();

        $this->assertFalse( $this->sut->scope_product_permissions( true, 'read', $draft, 'product' ) );

        wp_get_current_user()->add_cap( 'dokan_view_product_menu' );
        $this->assertTrue( $this->sut->scope_product_permissions( false, 'read', $draft, 'product' ) );
    }

    public function test_published_product_reads_stay_public_without_any_capability() {
        $product = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );
        $this->force_ability_context();

        $this->assertTrue( $this->sut->scope_product_permissions( false, 'read', $product, 'product' ) );
    }

    public function test_staff_products_query_is_published_only_without_the_view_capability() {
        $this->sut->register_hooks();
        $this->force_ability_context();

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $query = $this->products_query_scope_for( [ 'vendor_id' => $this->seller_id1 ] );
        $this->assertSame( 'publish', $query['post_status'] );

        wp_get_current_user()->add_cap( 'dokan_view_product_menu' );

        $query = $this->products_query_scope_for( [ 'vendor_id' => $this->seller_id1 ] );
        $this->assertArrayNotHasKey( 'post_status', $query );
    }

    /**
     * A create names no record, so the gate decides it on the Dokan capability alone. Left to
     * native capabilities the parity break of ADR-0007 recurs on creation: staff lack
     * `publish_products`, so WC abilities would refuse a create Dokan's own REST API permits.
     */
    public function test_staff_may_create_with_the_capability_despite_native_caps() {
        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        ( new \WP_User( $staff_id ) )->add_cap( 'dokan_add_product' );

        $this->force_ability_context();
        wp_set_current_user( $staff_id );

        // Native capabilities refuse product creation for staff.
        $this->assertFalse( current_user_can( 'publish_products' ) );

        // The gate grants it, matching the vendor dashboard.
        $this->assertTrue( $this->sut->scope_product_permissions( false, 'create', 0, 'product' ) );
    }

    public function test_staff_without_the_capability_may_not_create() {
        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $this->force_ability_context();

        $this->assertFalse( current_user_can( 'dokan_add_product' ) );
        $this->assertFalse( $this->sut->scope_product_permissions( true, 'create', 0, 'product' ) );
    }

    /**
     * An ID-carrying batch write must not slip past the capability requirement — `batch` maps
     * to the edit capability rather than falling through to an empty (always-granted) one.
     */
    public function test_batch_writes_require_the_edit_capability() {
        $own_product = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );
        $this->force_ability_context();

        $this->assertFalse( $this->sut->scope_product_permissions( true, 'batch', $own_product, 'product' ) );

        // On the live object: wp_set_current_user() short-circuits for an unchanged ID, so a
        // detached WP_User's add_cap() would leave the current user's capability set stale.
        wp_get_current_user()->add_cap( 'dokan_edit_product' );

        $this->assertTrue( $this->sut->scope_product_permissions( false, 'batch', $own_product, 'product' ) );
    }

    public function test_store_admin_writes_are_left_unscoped() {
        $other_product = $this->factory()->product->set_seller_id( $this->seller_id2 )->create();

        $this->force_ability_context();
        wp_set_current_user( $this->admin_id );

        $this->assertTrue( $this->sut->scope_product_permissions( true, 'edit', $other_product, 'product' ) );
    }

    public function test_write_capability_requirement_is_filterable() {
        $own_product = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );
        $this->force_ability_context();

        $this->assertFalse( $this->sut->scope_product_permissions( true, 'edit', $own_product, 'product' ) );

        $drop = static function ( $capability, $object_type ) {
            return 'product' === $object_type ? '' : $capability;
        };

        add_filter( 'dokan_ability_write_capability', $drop, 10, 2 );
        $permitted = $this->sut->scope_product_permissions( true, 'edit', $own_product, 'product' );
        remove_filter( 'dokan_ability_write_capability', $drop, 10 );

        $this->assertTrue( $permitted );
    }

    public function test_write_context_native_caps_allow_own_product() {
        $own_product = $this->factory()->product->set_seller_id( $this->seller_id1 )->create();

        wp_set_current_user( $this->seller_id1 );

        $this->assertTrue( current_user_can( 'edit_post', $own_product ) );
        $this->assertTrue( current_user_can( 'delete_post', $own_product ) );
    }

    public function test_admin_who_is_vendor_creates_for_own_store_without_vendor_id() {
        update_user_meta( $this->admin_id, 'dokan_enable_selling', 'yes' );

        $this->force_ability_context();
        $this->sut->register_hooks();
        wp_set_current_user( $this->admin_id );

        $result = call_user_func( $this->wrapped_create_callback(), [ 'name' => 'X' ] );

        $this->assertSame( $this->admin_id, (int) get_post_field( 'post_author', $result['id'] ) );
    }
}
