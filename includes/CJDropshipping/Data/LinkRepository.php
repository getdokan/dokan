<?php

namespace WeDevs\Dokan\CJDropshipping\Data;

/**
 * Links between WooCommerce products and CJ variants.
 *
 * @since DOKAN_SINCE
 */
class LinkRepository {

    public const LINKED_META = '_dokan_cj_linked';

    /**
     * Link a product or variation to a CJ variant.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $product_id Product or variation id.
     * @param int    $parent_id  Parent product id (same as product id for simple products).
     * @param int    $vendor_id  Vendor id.
     * @param string $vid        CJ variant id.
     * @param string $pid        CJ product id.
     *
     * @return bool False when the vendor already sells this variant.
     */
    public function link( int $product_id, int $parent_id, int $vendor_id, string $vid, string $pid ): bool {
        global $wpdb;

        // UNIQUE( vendor_id, vid ) turns a double-submitted import into a failed insert.
        $suppress = $wpdb->suppress_errors( true );
        $inserted = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            Schema::tables()['links'],
            [
                'product_id' => $product_id,
                'parent_id'  => $parent_id,
                'vendor_id'  => $vendor_id,
                'vid'        => $vid,
                'pid'        => $pid,
                'created_at' => current_time( 'mysql', true ),
            ]
        );

        $wpdb->suppress_errors( $suppress );

        if ( ! $inserted ) {
            return false;
        }

        // Marker meta lets cheap checks skip the table; copies drop it (B2).
        update_post_meta( $parent_id, self::LINKED_META, 1 );
        wp_cache_delete( $product_id, 'dokan_cj_links' );

        return true;
    }

    /**
     * Link of a product or variation.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product or variation id.
     *
     * @return array|null
     */
    public function get( int $product_id ): ?array {
        global $wpdb;

        $cached = wp_cache_get( $product_id, 'dokan_cj_links' );

        if ( false !== $cached ) {
            return $cached ? $cached : null;
        }

        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Schema::tables()['links'] . ' WHERE product_id = %d', $product_id ), ARRAY_A ); // phpcs:ignore WordPress.DB

        wp_cache_set( $product_id, $row ? $row : [], 'dokan_cj_links' );

        return $row ? $row : null;
    }

    /**
     * Whether a product is a CJ product.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product or parent id.
     *
     * @return bool
     */
    public function is_cj_product( int $product_id ): bool {
        return (bool) get_post_meta( $product_id, self::LINKED_META, true );
    }

    /**
     * Links of a parent product's variations (or the simple product itself).
     *
     * @since DOKAN_SINCE
     *
     * @param int $parent_id Parent product id.
     *
     * @return array[]
     */
    public function for_parent( int $parent_id ): array {
        global $wpdb;

        return (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Schema::tables()['links'] . ' WHERE parent_id = %d', $parent_id ), ARRAY_A ); // phpcs:ignore WordPress.DB
    }

    /**
     * Every product linked to a CJ product, across vendors.
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid CJ product id.
     *
     * @return array[]
     */
    public function for_cj_product( string $pid ): array {
        global $wpdb;

        return (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Schema::tables()['links'] . ' WHERE pid = %s', $pid ), ARRAY_A ); // phpcs:ignore WordPress.DB
    }

    /**
     * A vendor's product already linked to a CJ variant, to stop double imports.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $vendor_id Vendor id.
     * @param string $vid       CJ variant id.
     *
     * @return int Product id, 0 when none.
     */
    public function find_vendor_product( int $vendor_id, string $vid ): int {
        global $wpdb;

        return (int) $wpdb->get_var( $wpdb->prepare( 'SELECT parent_id FROM ' . Schema::tables()['links'] . ' WHERE vendor_id = %d AND vid = %s LIMIT 1', $vendor_id, $vid ) ); // phpcs:ignore WordPress.DB
    }

    /**
     * Parent product ids of a vendor's CJ products.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id, 0 for all vendors.
     *
     * @return int[]
     */
    public function parent_ids( int $vendor_id = 0 ): array {
        global $wpdb;

        $table = Schema::tables()['links'];
        $ids   = $vendor_id
            ? $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT parent_id FROM {$table} WHERE vendor_id = %d", $vendor_id ) ) // phpcs:ignore WordPress.DB
            : $wpdb->get_col( "SELECT DISTINCT parent_id FROM {$table}" ); // phpcs:ignore WordPress.DB

        return array_map( 'intval', (array) $ids );
    }

    /**
     * Remove a product's links.
     *
     * @since DOKAN_SINCE
     *
     * @param int $product_id Product or variation id.
     *
     * @return void
     */
    public function unlink( int $product_id ): void {
        global $wpdb;

        $wpdb->delete( Schema::tables()['links'], [ 'product_id' => $product_id ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $wpdb->delete( Schema::tables()['links'], [ 'parent_id' => $product_id ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        wp_cache_delete( $product_id, 'dokan_cj_links' );
    }

    /**
     * Remove every link of a vendor (E7).
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id.
     *
     * @return void
     */
    public function unlink_vendor( int $vendor_id ): void {
        global $wpdb;

        $table       = Schema::tables()['links'];
        $product_ids = (array) $wpdb->get_col( $wpdb->prepare( "SELECT product_id FROM {$table} WHERE vendor_id = %d", $vendor_id ) ); // phpcs:ignore WordPress.DB

        $wpdb->delete( $table, [ 'vendor_id' => $vendor_id ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery

        foreach ( $product_ids as $product_id ) {
            wp_cache_delete( (int) $product_id, 'dokan_cj_links' );
        }
    }
}
