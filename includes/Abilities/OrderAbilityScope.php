<?php

namespace WeDevs\Dokan\Abilities;

use WeDevs\Dokan\Abilities\Support\OwnershipGate;
use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Abilities\Support\VendorPayload;
use WeDevs\Dokan\Contracts\Hookable;

defined( 'ABSPATH' ) || exit;

/**
 * Vendor-scopes WooCommerce order abilities for multivendor sites.
 *
 * WooCommerce 10.9.0 registers order abilities in two layers, both of which run as the
 * authenticated user and act on the whole store:
 *
 *  - Layer 1 (deprecated REST proxy): `woocommerce/orders-*` re-dispatch standard WC REST
 *    requests via `rest_do_request()`.
 *  - Layer 2 (domain abilities): `woocommerce/orders-query`, `order-add-note`,
 *    `order-update-status` call WC CRUD directly.
 *
 * Rather than re-implementing any ability, this class makes BOTH layers vendor-safe through
 * cross-cutting, public seams:
 *
 *  - Per-object permission: `woocommerce_rest_check_permissions` keeps orders private to the
 *    owning vendor (admins unscoped).
 *  - List scoping: the WC order data-store (legacy CPT + HPOS) and REST query filters constrain
 *    order listings to the current vendor's orders.
 *  - In-place extension: order-list output is annotated with the Dokan parent / sub-order
 *    relationship and owning vendor, so totals can be summed without double-counting a parent and
 *    its sub-orders.
 *
 * In Dokan a multi-vendor order is split into a parent (full amount) and one sub-order per vendor
 * (their portion); a single-vendor order is not split. A vendor owns their sub-orders / single
 * orders, never the parent.
 *
 * Everything is gated to (Ability Context && vendor) so normal storefront / admin / REST traffic
 * is untouched, and store admins (manage_woocommerce) stay unscoped.
 *
 * @since DOKAN_SINCE
 */
class OrderAbilityScope implements Hookable {

    /**
     * Cached vendor order IDs for the current request.
     *
     * @var int[]|null
     */
    private ?array $vendor_order_ids = null;

    /**
     * Re-entrancy guard while resolving the vendor order IDs.
     *
     * Resolving the IDs runs `dokan()->order->all()`, which re-triggers the order query
     * filters below; this prevents recursion / double scoping.
     *
     * @var bool
     */
    private bool $resolving_order_ids = false;

    /**
     * WooCommerce order abilities whose output is enriched with Dokan order relationships.
     *
     * Both layers are named: `/woocommerce/mcp` exposes only the Layer 1 (REST proxy) abilities,
     * while Layer 2 is reached through the abilities REST API and third-party MCP servers. Naming
     * one layer only would leave the annotation inert on whichever surface a client happens to use.
     *
     * @var string[]
     */
    private const ORDER_OUTPUT_ABILITIES = [
        // Layer 2.
        'woocommerce/orders-query',
        // Layer 1.
        'woocommerce/orders-list',
        'woocommerce/orders-get',
        'woocommerce/orders-create',
        'woocommerce/orders-update',
    ];

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        // Shared Ability-Context signals (registered once across the product / order scopers).
        RequestContext::register_detection_hooks();

        // Per-object permission: orders are private to the owning vendor (admins unscoped).
        add_filter( 'woocommerce_rest_check_permissions', [ $this, 'scope_order_permissions' ], 99, 4 );

        // Orders list scoping (Layer 2: legacy CPT + HPOS data stores; Layer 1: REST controller).
        add_filter( 'woocommerce_order_data_store_cpt_get_orders_query', [ $this, 'scope_orders_query' ], 99 );
        add_filter( 'woocommerce_orders_table_datastore_get_orders_query', [ $this, 'scope_orders_query' ], 99 );
        add_filter( 'woocommerce_rest_orders_prepare_object_query', [ $this, 'scope_rest_orders_query' ], 99 );

        // Annotate order-list output with the Dokan parent / sub-order relationship and owning
        // vendor, so totals can be summed without double-counting a parent and its sub-orders.
        add_filter( 'wp_register_ability_args', [ $this, 'extend_order_abilities' ], 10, 2 );
    }

    /**
     * Keep orders private to the owning vendor on per-object WooCommerce REST permission checks.
     *
     * Governs `wc_rest_check_post_permissions()` for shop orders. Reads are allowed at the
     * collection level (rows are scoped by the order query) and for a vendor's own orders.
     *
     * Writes go through {@see OwnershipGate}, which asserts ownership here rather than delegating
     * to WooCommerce. Native capabilities do **not** deny cross-vendor order writes: with this
     * filter removed, `wc_rest_check_post_permissions( 'shop_order', 'edit', $foreign )` returns
     * `true`. This class is load-bearing — see ADR-0006.
     *
     * @since DOKAN_SINCE
     *
     * @param bool   $permission Whether the action is currently permitted.
     * @param string $context    Request context: read, create, edit, delete, batch.
     * @param int    $object_id  Target object ID (0 for collection-level checks).
     * @param string $post_type  Post type being checked.
     *
     * @return bool
     */
    public function scope_order_permissions( $permission, $context, $object_id, $post_type ) {
        if ( 'shop_order' !== $post_type || ! RequestContext::is_ability_context() ) {
            return $permission;
        }

        return $this->scope_order_permission( $permission, $context, absint( $object_id ) );
    }

    /**
     * Permission for a single order: private to the owning vendor (admins unscoped).
     *
     * @since DOKAN_SINCE
     *
     * @param bool   $permission Incoming permission.
     * @param string $context    Request context.
     * @param int    $object_id  Order ID (0 for collection-level checks).
     *
     * @return bool
     */
    private function scope_order_permission( $permission, $context, $object_id ) {
        if ( current_user_can( 'manage_woocommerce' ) || ! dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return $permission;
        }

        if ( OwnershipGate::is_write_context( $context ) ) {
            return OwnershipGate::can_write( 'shop_order', $context, $object_id, $permission );
        }

        if ( $object_id > 0 ) {
            return absint( dokan_get_seller_id_by_order( $object_id ) ) === dokan_get_current_user_id()
                && OwnershipGate::has_read_capability( 'shop_order', 'item' );
        }

        // Collection level: vendors may list (rows are scoped by the order query), gated like
        // the dashboard's orders page — staff without the capability are denied at the door.
        if ( 'read' === $context ) {
            return OwnershipGate::has_read_capability( 'shop_order', 'list' );
        }

        return $permission;
    }

    /**
     * Scope an order query (Layer 2, legacy CPT or HPOS) to the current vendor's orders.
     *
     * @since DOKAN_SINCE
     *
     * @param array $query Query args passed to the order data store.
     *
     * @return array
     */
    public function scope_orders_query( $query ) {
        if ( ! is_array( $query ) || $this->resolving_order_ids || ! RequestContext::is_vendor_ability_context() ) {
            return $query;
        }

        $vendor_order_ids = $this->get_vendor_order_ids();

        if ( ! empty( $query['post__in'] ) ) {
            $existing          = array_map( 'absint', (array) $query['post__in'] );
            $query['post__in'] = array_values( array_intersect( $existing, $vendor_order_ids ) );

            // An empty intersection must yield no rows, not "all orders".
            if ( empty( $query['post__in'] ) ) {
                $query['post__in'] = [ 0 ];
            }
        } else {
            $query['post__in'] = $vendor_order_ids;
        }

        return $query;
    }

    /**
     * Scope a Layer 1 (REST proxy) order query to the current vendor's orders.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args Query args for the orders REST controller.
     *
     * @return array
     */
    public function scope_rest_orders_query( $args ) {
        return $this->scope_orders_query( $args );
    }

    /**
     * Annotate a WooCommerce order-list ability with Dokan order relationships in place.
     *
     * Adds `parent_id`, `order_relation` and the owning `vendor` to each returned order without
     * touching the ability itself, so an MCP client can list parent and sub-orders together yet
     * still total amounts without double-counting (a parent's total equals the sum of its
     * sub-orders).
     *
     * @since DOKAN_SINCE
     *
     * @param array  $args Ability registration arguments.
     * @param string $name Ability name.
     *
     * @return array
     */
    public function extend_order_abilities( $args, $name ) {
        if ( ! is_array( $args ) || ! in_array( $name, self::ORDER_OUTPUT_ABILITIES, true ) ) {
            return $args;
        }

        $args = $this->inject_order_output_schema( $args );

        if ( isset( $args['execute_callback'] ) && is_callable( $args['execute_callback'] ) ) {
            $original                 = $args['execute_callback'];
            $args['execute_callback'] = function ( $input ) use ( $original ) {
                return $this->enrich_order_result( call_user_func( $original, $input ) );
            };
        }

        return $args;
    }

    /**
     * Add the Dokan order-relationship properties to an order-list output schema.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args Ability registration arguments.
     *
     * @return array
     */
    private function inject_order_output_schema( array $args ): array {
        if ( ! isset( $args['output_schema']['properties'] ) || ! is_array( $args['output_schema']['properties'] ) ) {
            return $args;
        }

        $annotations = $this->order_annotation_schema();

        $props = &$args['output_schema']['properties'];

        // Collection of orders: Layer 2 returns `orders`, the Layer 1 REST proxy wraps rows in
        // `data`.
        foreach ( [ 'orders', 'data' ] as $collection ) {
            if ( isset( $props[ $collection ]['items']['properties'] ) && is_array( $props[ $collection ]['items']['properties'] ) ) {
                $props[ $collection ]['items']['properties'] = array_merge(
                    $props[ $collection ]['items']['properties'],
                    $annotations
                );
            }
        }

        // Layer 1 single entity: the order payload itself.
        if ( isset( $props['id'] ) ) {
            $props = array_merge( $props, $annotations );
        }

        unset( $props );

        return $args;
    }

    /**
     * The Dokan order-relationship properties added to an order output schema.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    private function order_annotation_schema(): array {
        return [
            'parent_id'      => [
                'type'        => 'integer',
                'description' => __( 'Parent order ID, or 0 for a top-level order.', 'dokan-lite' ),
            ],
            'order_relation' => [
                'type'        => 'string',
                'enum'        => [ 'parent', 'sub_order', 'single' ],
                'description' => __( 'Dokan order relationship. "parent": a multi-vendor order whose total equals the combined total of its sub-orders. "sub_order": one vendor\'s portion of a parent order. "single": a one-vendor order. To total order amounts without double-counting, sum only orders where order_relation is "parent" or "single" (marketplace gross), or only "sub_order" or "single" for a single vendor — never a parent together with its sub-orders.', 'dokan-lite' ),
            ],
            'vendor'         => [
                'type'        => 'object',
                'description' => __( 'The vendor (store) the order belongs to. Empty for a multi-vendor parent order.', 'dokan-lite' ),
                'properties'  => [
                    'id'         => [ 'type' => 'integer' ],
                    'store_name' => [ 'type' => 'string' ],
                ],
            ],
        ];
    }

    /**
     * Enrich an order-list ability result with Dokan order relationships.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $result Ability result.
     *
     * @return mixed
     */
    private function enrich_order_result( $result ) {
        if ( ! is_array( $result ) ) {
            return $result;
        }

        // Collections: Layer 2 returns `orders`, the Layer 1 REST proxy wraps rows in `data`.
        foreach ( [ 'orders', 'data' ] as $collection ) {
            if ( isset( $result[ $collection ] ) && is_array( $result[ $collection ] ) ) {
                $result[ $collection ] = array_map( [ $this, 'add_relationship_to_order' ], $result[ $collection ] );

                return $result;
            }
        }

        // Layer 1 single entity: the order payload itself.
        if ( isset( $result['id'] ) ) {
            return $this->add_relationship_to_order( $result );
        }

        return $result;
    }

    /**
     * Attach the Dokan relationship and owning vendor to a single order payload.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $order_data Order payload.
     *
     * @return mixed
     */
    public function add_relationship_to_order( $order_data ) {
        if ( ! is_array( $order_data ) || ! isset( $order_data['id'] ) ) {
            return $order_data;
        }

        $order = wc_get_order( (int) $order_data['id'] );
        if ( ! $order instanceof \WC_Order ) {
            return $order_data;
        }

        $parent_id     = (int) $order->get_parent_id();
        $has_sub_order = (bool) $order->get_meta( 'has_sub_order' );

        if ( $has_sub_order ) {
            $relation = 'parent';
        } elseif ( $parent_id > 0 ) {
            $relation = 'sub_order';
        } else {
            $relation = 'single';
        }

        // A parent multi-vendor order belongs to no single vendor; sub / single orders do.
        $seller_id = 'parent' === $relation ? 0 : absint( dokan_get_seller_id_by_order( $order ) );

        $order_data['parent_id']      = $parent_id;
        $order_data['order_relation'] = $relation;
        $order_data['vendor']         = VendorPayload::for_user( $seller_id );

        return $order_data;
    }

    /**
     * Resolve and cache the current vendor's order IDs.
     *
     * Returns `[ 0 ]` when the vendor has no orders so callers force an empty result set.
     *
     * @since DOKAN_SINCE
     *
     * @return int[]
     */
    private function get_vendor_order_ids(): array {
        if ( null !== $this->vendor_order_ids ) {
            return $this->vendor_order_ids;
        }

        $this->resolving_order_ids = true;

        $ids = dokan()->order->all(
            [
                'seller_id' => dokan_get_current_user_id(),
                'return'    => 'ids',
                'limit'     => -1,
            ]
        );

        $this->resolving_order_ids = false;

        $ids = is_array( $ids ) ? array_values( array_filter( array_map( 'absint', $ids ) ) ) : [];

        $this->vendor_order_ids = empty( $ids ) ? [ 0 ] : $ids;

        return $this->vendor_order_ids;
    }
}
