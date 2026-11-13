<?php

namespace WeDevs\Dokan\CJDropshipping\Data;

/**
 * CJ variants and their stock per warehouse.
 *
 * @since DOKAN_SINCE
 */
class VariantRepository {

    public const STATUS_ACTIVE  = 'active';
    public const STATUS_REMOVED = 'removed';

    /**
     * Insert or update a variant.
     *
     * @since DOKAN_SINCE
     *
     * @param string $vid  CJ variant id.
     * @param array  $data Columns: pid, sku, name, cost_usd, weight_g, volume_cm3, props, status, sync_failures, synced_at.
     *
     * @return void
     */
    public function save( string $vid, array $data ): void {
        global $wpdb;

        $allowed = [ 'pid', 'sku', 'name', 'cost_usd', 'weight_g', 'volume_cm3', 'props', 'status', 'sync_failures', 'synced_at' ];
        $data    = array_intersect_key( $data, array_flip( $allowed ) );

        if ( isset( $data['props'] ) && is_array( $data['props'] ) ) {
            // CJ's freight API expects its own upper-case property names, e.g. COMMON.
            $data['props'] = implode( ',', array_filter( array_map( static fn( $prop ) => preg_replace( '/[^A-Za-z_]/', '', (string) $prop ), $data['props'] ) ) );
        }

        $data['updated_at'] = current_time( 'mysql', true );
        $table              = Schema::tables()['variants'];

        if ( $this->get( $vid ) ) {
            $wpdb->update( $table, $data, [ 'vid' => $vid ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        } else {
            $wpdb->insert( $table, array_merge( [ 'vid' => $vid ], $data ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        }

        wp_cache_delete( $vid, 'dokan_cj_variants' );
    }

    /**
     * One variant.
     *
     * @since DOKAN_SINCE
     *
     * @param string $vid CJ variant id.
     *
     * @return array|null
     */
    public function get( string $vid ): ?array {
        global $wpdb;

        $cached = wp_cache_get( $vid, 'dokan_cj_variants' );

        if ( false !== $cached ) {
            return $cached ? $cached : null;
        }

        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Schema::tables()['variants'] . ' WHERE vid = %s', $vid ), ARRAY_A ); // phpcs:ignore WordPress.DB

        wp_cache_set( $vid, $row ? $row : [], 'dokan_cj_variants' );

        return $row ? $row : null;
    }

    /**
     * Variants of a CJ product.
     *
     * @since DOKAN_SINCE
     *
     * @param string $pid CJ product id.
     *
     * @return array[]
     */
    public function for_product( string $pid ): array {
        global $wpdb;

        return (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Schema::tables()['variants'] . ' WHERE pid = %s', $pid ), ARRAY_A ); // phpcs:ignore WordPress.DB
    }

    /**
     * Replace a variant's stock rows.
     *
     * @since DOKAN_SINCE
     *
     * @param string $vid   CJ variant id.
     * @param array  $stock country => [ cj => int, factory => int ].
     *
     * @return void
     */
    public function save_stock( string $vid, array $stock ): void {
        global $wpdb;

        $table = Schema::tables()['stock'];
        $now   = current_time( 'mysql', true );

        $wpdb->delete( $table, [ 'vid' => $vid ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery

        foreach ( $stock as $country => $row ) {
            $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
                $table,
                [
                    'vid'         => $vid,
                    'country'     => strtoupper( (string) $country ),
                    'cj_qty'      => max( 0, (int) ( $row['cj'] ?? 0 ) ),
                    'factory_qty' => max( 0, (int) ( $row['factory'] ?? 0 ) ),
                    'updated_at'  => $now,
                ]
            );
        }

        wp_cache_delete( $vid, 'dokan_cj_stock' );
    }

    /**
     * A variant's stock per warehouse country.
     *
     * @since DOKAN_SINCE
     *
     * @param string $vid CJ variant id.
     *
     * @return array<string, array{cj: int, factory: int}>
     */
    public function get_stock( string $vid ): array {
        global $wpdb;

        $cached = wp_cache_get( $vid, 'dokan_cj_stock' );

        if ( is_array( $cached ) ) {
            return $cached;
        }

        $rows  = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Schema::tables()['stock'] . ' WHERE vid = %s', $vid ), ARRAY_A ); // phpcs:ignore WordPress.DB
        $stock = [];

        foreach ( $rows as $row ) {
            $stock[ $row['country'] ] = [
                'cj'      => (int) $row['cj_qty'],
                'factory' => (int) $row['factory_qty'],
            ];
        }

        wp_cache_set( $vid, $stock, 'dokan_cj_stock' );

        return $stock;
    }

    /**
     * Distinct CJ products, oldest sync first, for the scheduled check.
     *
     * @since DOKAN_SINCE
     *
     * @param int $limit Max products.
     *
     * @return string[] CJ product ids.
     */
    public function due_for_sync( int $limit ): array {
        global $wpdb;

        $variants = Schema::tables()['variants'];
        $links    = Schema::tables()['links'];

        // Only products some vendor still sells.
        return (array) $wpdb->get_col( // phpcs:ignore WordPress.DB
            $wpdb->prepare(
                "SELECT v.pid FROM {$variants} v INNER JOIN {$links} l ON l.vid = v.vid GROUP BY v.pid ORDER BY MIN( COALESCE( v.synced_at, '1970-01-01' ) ) ASC LIMIT %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $limit
            )
        );
    }
}
