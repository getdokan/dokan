<?php

namespace WeDevs\Dokan\Test\Abilities;

use WeDevs\Dokan\Abilities\OrderAbilityScope;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group abilities
 *
 * Tests that WooCommerce order abilities are vendor-scoped over MCP, suborder-aware in their
 * output, and fully inert otherwise.
 */
class OrderAbilityScopeTest extends DokanTestCase {

    /**
     * System under test.
     *
     * @var OrderAbilityScope
     */
    private $sut;

    public function set_up() {
        parent::set_up();
        $this->sut = new OrderAbilityScope();
        // Clear the per-request MCP state so the static flag never leaks between tests.
        RequestContext::reset();
    }

    /**
     * Force the request to be treated as an MCP request.
     *
     * @return void
     */
    private function force_mcp_request(): void {
        add_filter( 'dokan_is_mcp_request', '__return_true' );
    }

    public function test_order_read_restricted_to_owning_vendor() {
        $order1 = $this->create_single_vendor_order( $this->seller_id1 );
        $order2 = $this->create_single_vendor_order( $this->seller_id2 );

        $this->force_mcp_request();
        wp_set_current_user( $this->seller_id1 );

        $this->assertTrue( $this->sut->scope_order_permissions( true, 'read', $order1, 'shop_order' ) );
        $this->assertFalse( $this->sut->scope_order_permissions( true, 'read', $order2, 'shop_order' ) );
    }

    public function test_order_write_context_also_restricted_to_owning_vendor() {
        $order1 = $this->create_single_vendor_order( $this->seller_id1 );
        $order2 = $this->create_single_vendor_order( $this->seller_id2 );

        $this->force_mcp_request();
        wp_set_current_user( $this->seller_id1 );

        $this->assertTrue( $this->sut->scope_order_permissions( true, 'edit', $order1, 'shop_order' ) );
        $this->assertFalse( $this->sut->scope_order_permissions( true, 'edit', $order2, 'shop_order' ) );
        $this->assertFalse( $this->sut->scope_order_permissions( true, 'delete', $order2, 'shop_order' ) );

        // Admins are unscoped: the incoming (native) permission passes through untouched.
        wp_set_current_user( $this->admin_id );
        $this->assertTrue( $this->sut->scope_order_permissions( true, 'edit', $order2, 'shop_order' ) );
        $this->assertFalse( $this->sut->scope_order_permissions( false, 'edit', $order2, 'shop_order' ) );
    }

    public function test_scope_order_permissions_is_noop_for_unrelated_post_type() {
        $this->force_mcp_request();
        wp_set_current_user( $this->seller_id1 );

        // Unrelated post types must pass the incoming permission through untouched.
        $this->assertFalse( $this->sut->scope_order_permissions( false, 'read', 123, 'product' ) );
        $this->assertTrue( $this->sut->scope_order_permissions( true, 'read', 123, 'product' ) );
    }

    /**
     * The MCP adapter pre-flights an ability's permission check (e.g. for woocommerce/orders-query)
     * *before* it opens a `wp_before_execute_ability` window, so the execution-depth signal is still
     * zero and the request URL is the adapter's own (not /woocommerce/mcp). The adapter firing
     * `mcp_adapter_execute_ability_capability` is what marks the request — without it the vendor's
     * order read was denied. Regression guard for "my orders" returning permission-denied over MCP.
     */
    public function test_flag_mcp_request_grants_order_read_during_adapter_preflight() {
        $order1 = $this->create_single_vendor_order( $this->seller_id1 );
        $order2 = $this->create_single_vendor_order( $this->seller_id2 );

        wp_set_current_user( $this->seller_id1 );

        // Pre-flight conditions: no execution window, no MCP URL. Previously denied.
        $this->assertFalse( RequestContext::is_executing_ability() );
        $this->assertFalse( $this->sut->scope_order_permissions( false, 'read', 0, 'shop_order' ) );

        // The adapter fires this filter before checking the target ability's permission.
        $capability = RequestContext::flag_mcp_request( 'read' );
        $this->assertSame( 'read', $capability, 'The filter value must pass through unchanged.' );
        $this->assertTrue( RequestContext::is_mcp_request() );
        $this->assertFalse( RequestContext::is_executing_ability() );

        // Collection-level read is now granted (so the vendor can list), the owned order is
        // readable, and another vendor's order is still denied.
        $this->assertTrue( $this->sut->scope_order_permissions( false, 'read', 0, 'shop_order' ) );
        $this->assertTrue( $this->sut->scope_order_permissions( true, 'read', $order1, 'shop_order' ) );
        $this->assertFalse( $this->sut->scope_order_permissions( true, 'read', $order2, 'shop_order' ) );
    }

    public function test_register_hooks_attaches_mcp_adapter_flag_filter() {
        $this->sut->register_hooks();

        $this->assertNotFalse(
            has_filter( 'mcp_adapter_execute_ability_capability', [ RequestContext::class, 'flag_mcp_request' ] ),
            'register_hooks() must attach the MCP-adapter pre-flight flag filter.'
        );

        // Simulate the adapter firing the filter; the request must then be detected as MCP.
        $this->assertFalse( RequestContext::is_mcp_request() );
        apply_filters( 'mcp_adapter_execute_ability_capability', 'read' );
        $this->assertTrue( RequestContext::is_mcp_request() );
    }

    public function test_is_mcp_request_true_during_ability_execution() {
        $this->assertFalse( RequestContext::is_mcp_request() );

        RequestContext::mark_ability_execution_started();
        $this->assertTrue( RequestContext::is_mcp_request() );

        RequestContext::mark_ability_execution_finished();
        $this->assertFalse( RequestContext::is_mcp_request() );
    }

    public function test_scope_orders_query_limits_to_vendor_orders() {
        $order1 = $this->create_single_vendor_order( $this->seller_id1 );
        $order2 = $this->create_single_vendor_order( $this->seller_id2 );

        $this->force_mcp_request();
        wp_set_current_user( $this->seller_id1 );

        $query = $this->sut->scope_orders_query( [] );

        $this->assertArrayHasKey( 'post__in', $query );
        $this->assertContains( $order1, $query['post__in'] );
        $this->assertNotContains( $order2, $query['post__in'] );
    }

    public function test_scope_orders_query_is_noop_when_not_mcp_request() {
        wp_set_current_user( $this->seller_id1 );

        $query = $this->sut->scope_orders_query( [ 'foo' => 'bar' ] );

        $this->assertArrayNotHasKey( 'post__in', $query );
        $this->assertSame( 'bar', $query['foo'] );
    }

    public function test_extend_order_abilities_injects_relationship_schema() {
        $args = $this->sut->extend_order_abilities(
            [
                'output_schema'    => [
                    'type'       => 'object',
                    'properties' => [
                        'orders' => [
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
            'woocommerce/orders-query'
        );

        $props = $args['output_schema']['properties']['orders']['items']['properties'];
        $this->assertArrayHasKey( 'parent_id', $props );
        $this->assertArrayHasKey( 'order_relation', $props );
        $this->assertArrayHasKey( 'vendor', $props );
        $this->assertSame( [ 'parent', 'sub_order', 'single' ], $props['order_relation']['enum'] );
    }

    public function test_extend_leaves_unrelated_ability_untouched() {
        $input = [
            'output_schema'    => [
				'type' => 'object',
				'properties' => [],
			],
            'execute_callback' => static function ( $i ) {
                return $i;
            },
        ];

        $this->assertSame( $input, $this->sut->extend_order_abilities( $input, 'woocommerce/products-query' ) );
    }

    public function test_single_vendor_order_is_classified_as_single_with_vendor() {
        $order_id = $this->create_single_vendor_order( $this->seller_id1 );

        $enriched = $this->sut->add_relationship_to_order( [ 'id' => $order_id ] );

        $this->assertSame( 0, $enriched['parent_id'] );
        $this->assertSame( 'single', $enriched['order_relation'] );
        $this->assertSame( $this->seller_id1, $enriched['vendor']['id'] );
        $this->assertSame( dokan()->vendor->get( $this->seller_id1 )->get_shop_name(), $enriched['vendor']['store_name'] );
    }

    public function test_multi_vendor_parent_and_sub_orders_are_classified_for_dedup() {
        // A multi-vendor order: parent holds the full total, each sub-order one vendor's portion.
        $parent_id  = $this->create_multi_vendor_order();
        $suborder_ids = dokan_get_suborder_ids_by( $parent_id );

        $this->assertNotEmpty( $suborder_ids, 'A multi-vendor order must produce sub-orders.' );

        // The parent: total equals the sum of its sub-orders, so it carries no single vendor.
        $parent = $this->sut->add_relationship_to_order( [ 'id' => $parent_id ] );
        $this->assertSame( 0, $parent['parent_id'] );
        $this->assertSame( 'parent', $parent['order_relation'] );
        $this->assertSame( 0, $parent['vendor']['id'] );

        // Each sub-order points at the parent and belongs to exactly one vendor.
        foreach ( $suborder_ids as $suborder_id ) {
            $sub = $this->sut->add_relationship_to_order( [ 'id' => $suborder_id ] );
            $this->assertSame( $parent_id, $sub['parent_id'] );
            $this->assertSame( 'sub_order', $sub['order_relation'] );
            $this->assertGreaterThan( 0, $sub['vendor']['id'] );
        }
    }

    public function test_order_output_is_enriched_through_wrapped_callback() {
        $order_id = $this->create_single_vendor_order( $this->seller_id1 );

        $original = static function () use ( $order_id ) {
            return [ 'orders' => [ [ 'id' => $order_id ] ] ];
        };

        $args = $this->sut->extend_order_abilities(
            [
                'output_schema'    => [
					'type' => 'object',
					'properties' => [ 'orders' => [ 'items' => [ 'properties' => [] ] ] ],
				],
                'execute_callback' => $original,
            ],
            'woocommerce/orders-query'
        );

        $result = call_user_func( $args['execute_callback'], [] );

        $this->assertSame( 'single', $result['orders'][0]['order_relation'] );
        $this->assertSame( $this->seller_id1, $result['orders'][0]['vendor']['id'] );
    }
}
