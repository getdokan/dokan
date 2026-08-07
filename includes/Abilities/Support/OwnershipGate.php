<?php

namespace WeDevs\Dokan\Abilities\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Decides whether the current caller may write a vendor-owned record.
 *
 * Two facts drive this class, both measured rather than assumed:
 *
 *  1. `wc_rest_check_post_permissions()` is not a uniform authorization boundary. For a vendor
 *     acting on another vendor's record it returns `false` for a product but `true` for an order,
 *     because the `shop_order` capability mapping resolves differently. Relying on native
 *     capabilities to deny cross-vendor writes therefore works for one post type and not the other.
 *  2. Vendor staff resolve to their parent vendor for data scope but hold their own, narrower
 *     capabilities — and lack `edit_others_products` while acting on records authored by that
 *     parent. Native capabilities consequently deny staff writes that Dokan's own REST API allows,
 *     making the MCP surface *more* restrictive than the vendor dashboard.
 *
 * So ownership is asserted here rather than delegated: a write is permitted when the record
 * resolves to the caller's vendor scope **and** the caller holds the Dokan capability for that
 * action. Cross-vendor writes are denied outright instead of being left to native capabilities,
 * and a permitted write is granted even where a native check would refuse it.
 *
 * @since DOKAN_SINCE
 */
class OwnershipGate {

    /**
     * Dokan capability required per object type and write context.
     *
     * An absent entry is a write the vendor model never grants below Store Admin — there is
     * deliberately no `shop_order`/`create`, because orders are created by checkout, never by
     * a Vendor.
     *
     * @var array<string, array<string, string>>
     */
    private const CAPABILITIES = [
        'product'    => [
            'create' => 'dokan_add_product',
            'edit'   => 'dokan_edit_product',
            'delete' => 'dokan_delete_product',
            'batch'  => 'dokan_edit_product',
        ],
        'shop_order' => [
            'edit'   => 'dokan_manage_order',
            'delete' => 'dokan_manage_order',
            'batch'  => 'dokan_manage_order',
        ],
    ];

    /**
     * Dokan capability required to read vendor-scoped data, mirroring the dashboard's own
     * gates: the orders list sits behind `dokan_view_order_menu`, a single order behind
     * `dokan_view_order`, and unpublished products only ever show on the product list, which
     * sits behind `dokan_view_product_menu`. Published products are public and never gated.
     *
     * @var array<string, array<string, string>>
     */
    private const READ_CAPABILITIES = [
        'product'    => [
            'item' => 'dokan_view_product_menu',
            'list' => 'dokan_view_product_menu',
        ],
        'shop_order' => [
            'item' => 'dokan_view_order',
            'list' => 'dokan_view_order_menu',
        ],
    ];

    /**
     * Request contexts that mutate a record.
     *
     * @var string[]
     */
    private const WRITE_CONTEXTS = [ 'create', 'edit', 'delete', 'batch' ];

    /**
     * Whether a WooCommerce REST permission context mutates a record.
     *
     * @since DOKAN_SINCE
     *
     * @param string $context Request context: read, create, edit, delete, batch.
     *
     * @return bool
     */
    public static function is_write_context( string $context ): bool {
        return in_array( $context, self::WRITE_CONTEXTS, true );
    }

    /**
     * Resolve the vendor owning a record.
     *
     * @since DOKAN_SINCE
     *
     * @param string $object_type Post type: `product` or `shop_order`.
     * @param int    $object_id   Record ID.
     *
     * @return int Vendor user ID, or 0 when it cannot be resolved.
     */
    public static function owner_of( string $object_type, int $object_id ): int {
        if ( $object_id <= 0 ) {
            return 0;
        }

        if ( 'shop_order' === $object_type ) {
            return absint( dokan_get_seller_id_by_order( $object_id ) );
        }

        return (int) get_post_field( 'post_author', $object_id );
    }

    /**
     * Decide a write permission for a single vendor-owned record.
     *
     * Store admins and non-vendors are passed through untouched. Collection-level checks
     * (`$object_id` of 0) are passed through too — list queries are scoped elsewhere, and a
     * batch request re-checks each contained operation individually — except creates, which
     * never name a record: there the Dokan capability alone decides.
     *
     * @since DOKAN_SINCE
     *
     * @param string $object_type Post type: `product` or `shop_order`.
     * @param string $context     Request context.
     * @param int    $object_id   Record ID, or 0 for a collection-level check.
     * @param bool   $permission  Permission decided so far.
     *
     * @return bool
     */
    public static function can_write( string $object_type, string $context, int $object_id, bool $permission ): bool {
        if ( ! self::is_write_context( $context ) ) {
            return $permission;
        }

        // Store admins are deliberately unscoped.
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return $permission;
        }

        $vendor_id = dokan_get_current_user_id();

        // Not a vendor (nor staff of one): native capabilities remain the only authority.
        if ( ! dokan_is_user_seller( $vendor_id ) ) {
            return $permission;
        }

        // A create names no record yet, so ownership cannot decide and the Dokan capability
        // alone does. Left to native capabilities, staff product creation would be refused
        // (`publish_products` is not in the staff baseline) where Dokan's own REST API permits
        // it — the parity break this gate exists to close.
        if ( 'create' === $context ) {
            return self::has_capability( $object_type, 'create' );
        }

        // Collection-level checks are governed by the list-query scoping; a batch request
        // re-checks each contained create/edit/delete individually with a real ID.
        if ( $object_id <= 0 ) {
            return $permission;
        }

        // Denied here rather than left to native capabilities, which do not deny cross-vendor
        // writes uniformly across post types.
        if ( self::owner_of( $object_type, $object_id ) !== $vendor_id ) {
            return false;
        }

        // Granted even where a native check would refuse: vendor staff legitimately act on records
        // authored by their parent vendor, which native capabilities alone cannot express.
        return self::has_capability( $object_type, $context );
    }

    /**
     * Whether the caller holds the Dokan capability for a vendor-scoped read.
     *
     * Ownership is not decided here — callers establish that the record (or list) resolves to
     * the caller's vendor scope first; this supplies the capability half. Reads below Store
     * Admin are gated like the dashboard (ADR-0007), which is behaviourally free for a default
     * Vendor, who holds every `dokan_*` capability, and bites only where a site has
     * deliberately narrowed staff capabilities.
     *
     * @since DOKAN_SINCE
     *
     * @param string $object_type Post type: `product` or `shop_order`.
     * @param string $view        `item` for a single record, `list` for a collection.
     *
     * @return bool
     */
    public static function has_read_capability( string $object_type, string $view ): bool {
        $capability = self::READ_CAPABILITIES[ $object_type ][ $view ] ?? null;

        // Fail closed: a read the map does not grant is denied, never waved through.
        if ( null === $capability ) {
            return false;
        }

        /**
         * Filters the Dokan capability required to read vendor-scoped data over the
         * Abilities layer.
         *
         * @since DOKAN_SINCE
         *
         * @param string $capability  Required capability, or an empty string for none.
         * @param string $object_type Post type being read.
         * @param string $view        `item` for a single record, `list` for a collection.
         */
        $capability = (string) apply_filters(
            'dokan_ability_read_capability',
            $capability,
            $object_type,
            $view
        );

        return '' === $capability || current_user_can( $capability );
    }

    /**
     * Whether the caller holds the Dokan capability for this write.
     *
     * @since DOKAN_SINCE
     *
     * @param string $object_type Post type.
     * @param string $context     Request context.
     *
     * @return bool
     */
    private static function has_capability( string $object_type, string $context ): bool {
        $capability = self::CAPABILITIES[ $object_type ][ $context ] ?? null;

        // Fail closed: a write the map does not grant is denied, never waved through.
        if ( null === $capability ) {
            return false;
        }

        /**
         * Filters the Dokan capability required to write a vendor-owned record over the
         * Abilities layer.
         *
         * @since DOKAN_SINCE
         *
         * @param string $capability  Required capability, or an empty string for none.
         * @param string $object_type Post type being written.
         * @param string $context     Request context.
         */
        $capability = (string) apply_filters(
            'dokan_ability_write_capability',
            $capability,
            $object_type,
            $context
        );

        return '' === $capability || current_user_can( $capability );
    }
}
