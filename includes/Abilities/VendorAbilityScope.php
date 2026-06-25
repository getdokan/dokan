<?php

namespace WeDevs\Dokan\Abilities;

use WeDevs\Dokan\Abilities\Support\RequestContext;
use WeDevs\Dokan\Contracts\Hookable;

defined( 'ABSPATH' ) || exit;

/**
 * Vendor-scopes WooCommerce abilities for multivendor sites.
 *
 * WooCommerce 10.9.0 registers abilities in two layers, both of which run as the
 * authenticated user and act on the whole store:
 *
 *  - Layer 1 (deprecated REST proxy): `woocommerce/products-*`, `woocommerce/orders-*`
 *    re-dispatch standard WC REST requests via `rest_do_request()`.
 *  - Layer 2 (domain abilities): `woocommerce/products-query`, `product-create|update|delete`,
 *    `orders-query`, `order-add-note`, `order-update-status` call WC CRUD directly.
 *
 * Rather than re-implementing any ability, this class makes BOTH layers vendor-safe through
 * cross-cutting, public seams:
 *
 *  - Per-object permission: `woocommerce_rest_check_permissions` (the filter every
 *    `wc_rest_check_post_permissions()` call funnels through) enforces ownership for read,
 *    edit and delete on a specific product / order. WooCommerce's native meta-caps already
 *    deny cross-vendor *mutations*; this primarily closes the cross-vendor *read* leak.
 *  - List scoping: WC data-store and REST query filters constrain product / order listings
 *    to the current vendor.
 *
 * Everything is gated to (MCP request && vendor) so normal storefront / admin / REST traffic
 * is untouched, and store admins (manage_woocommerce) stay unscoped.
 *
 * @since DOKAN_SINCE
 */
class VendorAbilityScope implements Hookable {

    /**
     * Cached vendor order IDs for the current request.
     *
     * @var int[]|null
     */
    private $vendor_order_ids = null;

    /**
     * Re-entrancy guard while resolving the vendor order IDs.
     *
     * Resolving the IDs runs `wc_get_orders()`, which re-triggers the order query
     * filters below; this prevents recursion / double scoping.
     *
     * @var bool
     */
    private $resolving_order_ids = false;

    /**
     * Vendor a product currently being created should be authored to.
     *
     * Set while a product-create ability runs so the `woocommerce_new_product` handler authors
     * the new product to the resolved vendor. `0` means "do not force" (use default behavior).
     *
     * @var int
     */
    private $forced_product_author = 0;

    /**
     * Author (vendor) to constrain the in-progress product query to. `0` means no constraint.
     *
     * @var int
     */
    private $forced_query_author = 0;

    /**
     * Whether the in-progress product query must be limited to published products.
     *
     * @var bool
     */
    private $force_published_only = false;

    /**
     * WooCommerce product-create ability names this class extends in place.
     *
     * @var string[]
     */
    private const PRODUCT_CREATE_ABILITIES = [ 'woocommerce/products-create', 'woocommerce/product-create' ];

    /**
     * WooCommerce product-list ability names that gain an optional `vendor_id` filter.
     *
     * @var string[]
     */
    private const PRODUCT_FILTER_ABILITIES = [ 'woocommerce/products-query' ];

    /**
     * WooCommerce product abilities whose output is enriched with the owning vendor.
     *
     * @var string[]
     */
    private const PRODUCT_OUTPUT_ABILITIES = [ 'woocommerce/products-query', 'woocommerce/product-create', 'woocommerce/product-update' ];

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        // Track ability execution so scoping works on ANY MCP server (WooCommerce, Dokan, or
        // third-party such as MCP Site Manager), not just known endpoint URLs.
        add_action( 'wp_before_execute_ability', [ RequestContext::class, 'mark_ability_execution_started' ] );
        add_action( 'wp_after_execute_ability', [ RequestContext::class, 'mark_ability_execution_finished' ] );

        // Per-object permission: published products are public; orders and unpublished products
        // are restricted to their owner (and store admins).
        add_filter( 'woocommerce_rest_check_permissions', [ $this, 'scope_object_permissions' ], 99, 4 );

        // Product list scoping: applies the optional vendor_id filter and the published-only guard.
        add_filter( 'woocommerce_product_data_store_cpt_get_products_query', [ $this, 'scope_products_query' ], 99 );
        add_filter( 'woocommerce_rest_product_object_query', [ $this, 'scope_rest_products_query' ], 99 );

        // Orders list scoping (Layer 2: legacy CPT + HPOS data stores; Layer 1: REST controller).
        add_filter( 'woocommerce_order_data_store_cpt_get_orders_query', [ $this, 'scope_orders_query' ], 99 );
        add_filter( 'woocommerce_orders_table_datastore_get_orders_query', [ $this, 'scope_orders_query' ], 99 );
        add_filter( 'woocommerce_rest_orders_prepare_object_query', [ $this, 'scope_rest_orders_query' ], 99 );

        // Extend WooCommerce's own product abilities in place: vendor selector on create,
        // and the owning vendor on product output.
        add_filter( 'wp_register_ability_args', [ $this, 'extend_product_abilities' ], 10, 2 );

        // Ensure ability-created products are authored to the vendor (matters for vendor staff).
        add_action( 'woocommerce_new_product', [ $this, 'assign_vendor_as_product_author' ], 99 );
    }

    /**
     * Enforce the public / private boundary on per-object WooCommerce REST permission checks.
     *
     * Governs `wc_rest_check_post_permissions()` for products and shop orders. Published products
     * are public (any caller may read one by ID); unpublished products are readable only by their
     * owner or a store admin. Orders are always private to the owning vendor. Writes are left to
     * WooCommerce's native capabilities, which already deny cross-vendor mutations.
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
    public function scope_object_permissions( $permission, $context, $object_id, $post_type ) {
        if ( ! RequestContext::is_mcp_request() ) {
            return $permission;
        }

        if ( 'product' === $post_type ) {
            return $this->scope_product_permission( $permission, $context, absint( $object_id ) );
        }

        if ( 'shop_order' === $post_type ) {
            return $this->scope_order_permission( $permission, $context, absint( $object_id ) );
        }

        return $permission;
    }

    /**
     * Permission for a single product: published is public; otherwise owner or admin only.
     *
     * @since DOKAN_SINCE
     *
     * @param bool   $permission Incoming permission.
     * @param string $context    Request context.
     * @param int    $object_id  Product ID (0 for collection-level checks).
     *
     * @return bool
     */
    private function scope_product_permission( $permission, $context, $object_id ) {
        // List reads and writes are governed by the query scoping / WooCommerce caps.
        if ( 'read' !== $context || $object_id <= 0 ) {
            return $permission;
        }

        if ( current_user_can( 'manage_woocommerce' ) || dokan_is_product_author( $object_id ) ) {
            return true;
        }

        return 'publish' === get_post_status( $object_id );
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

        if ( $object_id > 0 ) {
            return absint( dokan_get_seller_id_by_order( $object_id ) ) === dokan_get_current_user_id();
        }

        // Collection level: broaden read so vendors can list; rows are scoped by the order query.
        if ( 'read' === $context ) {
            return true;
        }

        return $permission;
    }

    /**
     * Apply the active product-query scope (vendor_id filter + published-only guard).
     *
     * Both the data-store and REST product query filters route through here. The scope is only
     * set while a `products-query` ability runs, so other product queries are untouched.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $query Query args.
     *
     * @return mixed
     */
    private function apply_product_query_scope( $query ) {
        if ( ! is_array( $query ) ) {
            return $query;
        }

        if ( $this->forced_query_author > 0 ) {
            $query['author'] = $this->forced_query_author;
        }

        if ( $this->force_published_only ) {
            $query['post_status'] = 'publish';
        }

        return $query;
    }

    /**
     * Scope a Layer 2 (CRUD) product query.
     *
     * @since DOKAN_SINCE
     *
     * @param array $query WP_Query args built by the product data store.
     *
     * @return array
     */
    public function scope_products_query( $query ) {
        return $this->apply_product_query_scope( $query );
    }

    /**
     * Scope a Layer 1 (REST proxy) product query.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args WP_Query args for the products REST controller.
     *
     * @return array
     */
    public function scope_rest_products_query( $args ) {
        return $this->apply_product_query_scope( $args );
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
        if ( ! is_array( $query ) || $this->resolving_order_ids || ! $this->is_vendor_mcp_context() ) {
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
     * Author an ability-created product to the resolved vendor.
     *
     * WooCommerce authors new products to `get_current_user_id()`, which is correct for a
     * vendor but not for vendor staff (who act on behalf of their parent vendor) or for an
     * admin who selected a specific vendor. A forced author (set while a product-create ability
     * runs) takes precedence; otherwise vendor/staff get their own store. Only writes when the
     * author differs, so the common case is a no-op.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Newly created product ID.
     *
     * @return void
     */
    public function assign_vendor_as_product_author( $product_id ) {
        if ( $this->forced_product_author > 0 ) {
            $vendor_id = $this->forced_product_author;
        } elseif ( $this->is_vendor_mcp_context() ) {
            $vendor_id = dokan_get_current_user_id();
        } else {
            return;
        }

        if ( (int) get_post_field( 'post_author', $product_id ) === $vendor_id ) {
            return;
        }

        wp_update_post(
            [
                'ID'          => $product_id,
                'post_author' => $vendor_id,
            ]
        );
    }

    /**
     * Extend WooCommerce's own product-create abilities with a vendor selector.
     *
     * Adds an optional `vendor_id` to the input schema and wraps the execute callback so the
     * created product is authored to the chosen vendor. The ability id and registration are left
     * intact, so other consumers keep working; only behavior is augmented.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $args Ability registration arguments.
     * @param string $name Ability name.
     *
     * @return array
     */
    public function extend_product_abilities( $args, $name ) {
        if ( ! is_array( $args ) ) {
            return $args;
        }

        $is_create  = in_array( $name, self::PRODUCT_CREATE_ABILITIES, true );
        $is_filter  = in_array( $name, self::PRODUCT_FILTER_ABILITIES, true );
        $has_output = in_array( $name, self::PRODUCT_OUTPUT_ABILITIES, true );

        if ( ! $is_create && ! $is_filter && ! $has_output ) {
            return $args;
        }

        if ( $is_create ) {
            $args = $this->inject_vendor_id_schema( $args );
        }

        if ( $is_filter ) {
            $args = $this->inject_vendor_filter_schema( $args );
        }

        if ( $has_output ) {
            $args = $this->inject_vendor_output_schema( $args );
        }

        if ( isset( $args['execute_callback'] ) && is_callable( $args['execute_callback'] ) ) {
            $original                 = $args['execute_callback'];
            $args['execute_callback'] = function ( $input ) use ( $original, $is_create, $is_filter, $has_output ) {
                return $this->run_product_ability( $original, (array) $input, $is_create, $is_filter, $has_output );
            };
        }

        return $args;
    }

    /**
     * Add the optional `vendor_id` filter property to a product-list input schema.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args Ability registration arguments.
     *
     * @return array
     */
    private function inject_vendor_filter_schema( array $args ): array {
        if ( ! isset( $args['input_schema']['properties'] ) || ! is_array( $args['input_schema']['properties'] ) ) {
            return $args;
        }

        $args['input_schema']['properties']['vendor_id'] = [
            'type'        => 'integer',
            'minimum'     => 1,
            'description' => __( 'Filter products to a specific vendor (store). For vendors other than your own only published products are returned.', 'dokan-lite' ),
        ];

        return $args;
    }

    /**
     * Add the `vendor_id` property to a product-create input schema.
     *
     * Handles both a flat object schema (Layer 1) and a `oneOf` branch schema (Layer 2), where
     * each branch declares `additionalProperties: false` and so must list the field itself.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args Ability registration arguments.
     *
     * @return array
     */
    private function inject_vendor_id_schema( array $args ): array {
        if ( ! isset( $args['input_schema'] ) || ! is_array( $args['input_schema'] ) ) {
            return $args;
        }

        $field = [
            'type'        => 'integer',
            'minimum'     => 1,
            'description' => __( 'Vendor (store) the product belongs to. Admins and shop managers must set this when creating over MCP; vendors may omit it to use their own store.', 'dokan-lite' ),
        ];

        if ( isset( $args['input_schema']['oneOf'] ) && is_array( $args['input_schema']['oneOf'] ) ) {
            foreach ( $args['input_schema']['oneOf'] as &$branch ) {
                if ( is_array( $branch ) && isset( $branch['properties'] ) && is_array( $branch['properties'] ) ) {
                    $branch['properties']['vendor_id'] = $field;
                }
            }
            unset( $branch );
        } elseif ( isset( $args['input_schema']['properties'] ) && is_array( $args['input_schema']['properties'] ) ) {
            $args['input_schema']['properties']['vendor_id'] = $field;
        }

        return $args;
    }

    /**
     * Run a wrapped product ability: assign the vendor on create, enrich the vendor on output.
     *
     * @since DOKAN_SINCE
     *
     * @param callable $original   Original ability execute callback.
     * @param array    $input      Ability input.
     * @param bool     $is_create  Whether this is a product-create ability.
     * @param bool     $is_filter  Whether this is a product-list ability that accepts a vendor filter.
     * @param bool     $has_output Whether this ability's product output should be enriched.
     *
     * @return mixed
     */
    private function run_product_ability( callable $original, array $input, bool $is_create, bool $is_filter, bool $has_output ) {
        if ( $is_create ) {
            $vendor_id = $this->resolve_create_vendor( $input );

            if ( is_wp_error( $vendor_id ) ) {
                return $vendor_id;
            }

            $this->forced_product_author = $vendor_id;
        }

        if ( $is_filter ) {
            $this->prepare_product_query_scope( $input );
        }

        try {
            $result = call_user_func( $original, $input );
        } finally {
            $this->forced_product_author = 0;
            $this->forced_query_author   = 0;
            $this->force_published_only  = false;
        }

        return $has_output ? $this->enrich_product_result( $result ) : $result;
    }

    /**
     * Decide the product-query scope for the current caller and `vendor_id` filter.
     *
     * Published products are public; a caller only sees unpublished products for their own store
     * (vendors/staff) or when they are a store admin.
     *
     * @since DOKAN_SINCE
     *
     * @param array $input Ability input.
     *
     * @return void
     */
    private function prepare_product_query_scope( array $input ): void {
        $caller        = dokan_get_current_user_id();
        $is_admin      = current_user_can( 'manage_woocommerce' );
        $vendor_filter = empty( $input['vendor_id'] ) ? 0 : absint( $input['vendor_id'] );

        $this->forced_query_author = $vendor_filter;

        $views_own = $vendor_filter > 0 && $vendor_filter === $caller && dokan_is_user_seller( $caller );

        // Limit to published products unless the caller is a store admin or browsing their own store.
        $this->force_published_only = ! $is_admin && ! $views_own;
    }

    /**
     * Add the `vendor` property to a product ability's output schema.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args Ability registration arguments.
     *
     * @return array
     */
    private function inject_vendor_output_schema( array $args ): array {
        if ( ! isset( $args['output_schema']['properties'] ) || ! is_array( $args['output_schema']['properties'] ) ) {
            return $args;
        }

        $vendor_schema = [
            'type'        => 'object',
            'description' => __( 'The vendor (store) the product belongs to.', 'dokan-lite' ),
            'properties'  => [
                'id'         => [ 'type' => 'integer' ],
                'store_name' => [ 'type' => 'string' ],
            ],
        ];

        $props = &$args['output_schema']['properties'];

        // Collection of products (e.g. products-query).
        if ( isset( $props['products']['items']['properties'] ) && is_array( $props['products']['items']['properties'] ) ) {
            $props['products']['items']['properties']['vendor'] = $vendor_schema;
            $props['products']['items']['required']             = array_values(
                array_unique( array_merge( $props['products']['items']['required'] ?? [], [ 'vendor' ] ) )
            );
        }

        // Single product entity (e.g. product-create / product-update).
        if ( isset( $props['product']['properties'] ) && is_array( $props['product']['properties'] ) ) {
            $props['product']['properties']['vendor'] = $vendor_schema;
        }

        unset( $props );

        return $args;
    }

    /**
     * Enrich a product ability result with the owning vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $result Ability result.
     *
     * @return mixed
     */
    private function enrich_product_result( $result ) {
        if ( ! is_array( $result ) ) {
            return $result;
        }

        if ( isset( $result['products'] ) && is_array( $result['products'] ) ) {
            $result['products'] = array_map( [ $this, 'add_vendor_to_product' ], $result['products'] );
        } elseif ( isset( $result['product'] ) && is_array( $result['product'] ) ) {
            $result['product'] = $this->add_vendor_to_product( $result['product'] );
        }

        return $result;
    }

    /**
     * Attach the owning vendor to a single product payload.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $product Product payload.
     *
     * @return mixed
     */
    public function add_vendor_to_product( $product ) {
        if ( is_array( $product ) && isset( $product['id'] ) ) {
            $product['vendor'] = $this->vendor_payload( (int) $product['id'] );
        }

        return $product;
    }

    /**
     * Build the vendor payload for a product.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product ID.
     *
     * @return array
     */
    private function vendor_payload( int $product_id ): array {
        $author = (int) get_post_field( 'post_author', $product_id );
        $vendor = $author > 0 ? dokan()->vendor->get( $author ) : null;

        return [
            'id'         => $author,
            'store_name' => $vendor ? (string) $vendor->get_shop_name() : '',
        ];
    }

    /**
     * Resolve which vendor a created product should belong to.
     *
     * Admins/shop managers must supply a valid `vendor_id` (required over MCP; left to
     * WooCommerce's default otherwise to stay backward compatible). Vendors and staff are forced
     * to their own store. Returns `0` to apply WooCommerce's default authorship.
     *
     * @since DOKAN_SINCE
     *
     * @param array $input Ability input.
     *
     * @return int|\WP_Error
     */
    private function resolve_create_vendor( array $input ) {
        if ( current_user_can( 'manage_woocommerce' ) ) {
            $vendor_id = isset( $input['vendor_id'] ) ? absint( $input['vendor_id'] ) : 0;

            if ( $vendor_id > 0 ) {
                if ( ! dokan_is_user_seller( $vendor_id ) ) {
                    return new \WP_Error(
                        'dokan_ability_invalid_vendor',
                        __( 'The selected vendor_id is not a valid vendor.', 'dokan-lite' ),
                        [ 'status' => 400 ]
                    );
                }

                return $vendor_id;
            }

            // An admin who also runs a store defaults to their own store when no vendor is given.
            $self = dokan_get_current_user_id();
            if ( dokan_is_seller_enabled( $self ) ) {
                return $self;
            }

            // A pure admin / shop manager must select a vendor when creating over MCP.
            if ( RequestContext::is_mcp_request() ) {
                return new \WP_Error(
                    'dokan_ability_vendor_required',
                    __( 'Please select a vendor: vendor_id is required when creating a product as an admin or shop manager.', 'dokan-lite' ),
                    [ 'status' => 400 ]
                );
            }

            return 0;
        }

        $self = dokan_get_current_user_id();

        return dokan_is_user_seller( $self ) ? $self : 0;
    }

    /**
     * Whether the current request is a vendor acting over an MCP / abilities endpoint.
     *
     * Store admins (manage_woocommerce) are intentionally left unscoped. Vendor staff resolve
     * to their parent vendor via dokan_get_current_user_id().
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    private function is_vendor_mcp_context(): bool {
        if ( ! RequestContext::is_mcp_request() ) {
            return false;
        }

        if ( current_user_can( 'manage_woocommerce' ) ) {
            return false;
        }

        return dokan_is_user_seller( dokan_get_current_user_id() );
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
