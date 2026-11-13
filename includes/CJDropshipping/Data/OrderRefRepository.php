<?php

namespace WeDevs\Dokan\CJDropshipping\Data;

/**
 * CJ order numbers and tracking saved per order and warehouse group.
 *
 * @since DOKAN_SINCE
 */
class OrderRefRepository {

    /**
     * Save the CJ order number or tracking for one warehouse group.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $order_id  Order id.
     * @param int    $vendor_id Vendor id.
     * @param string $warehouse Warehouse country.
     * @param array  $data      cj_order_no, tracking_no, delivered_at.
     *
     * @return void
     */
    public function save( int $order_id, int $vendor_id, string $warehouse, array $data ): void {
        global $wpdb;

        $table   = Schema::tables()['orders'];
        $data    = array_intersect_key( $data, array_flip( [ 'cj_order_no', 'tracking_no', 'delivered_at' ] ) );
        $current = $this->get( $order_id, $warehouse );

        $data['updated_at'] = current_time( 'mysql', true );

        if ( $current ) {
            $wpdb->update( $table, $data, [ 'id' => $current['id'] ] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            return;
        }

        $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
            $table,
            array_merge(
                [
                    'order_id'  => $order_id,
                    'vendor_id' => $vendor_id,
                    'warehouse' => $warehouse,
                ],
                $data
            )
        );
    }

    /**
     * One warehouse group's row.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $order_id  Order id.
     * @param string $warehouse Warehouse country.
     *
     * @return array|null
     */
    public function get( int $order_id, string $warehouse ): ?array {
        global $wpdb;

        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Schema::tables()['orders'] . ' WHERE order_id = %d AND warehouse = %s', $order_id, $warehouse ), ARRAY_A ); // phpcs:ignore WordPress.DB

        return $row ? $row : null;
    }

    /**
     * Every group of an order, keyed by warehouse.
     *
     * @since DOKAN_SINCE
     *
     * @param int $order_id Order id.
     *
     * @return array<string, array>
     */
    public function for_order( int $order_id ): array {
        global $wpdb;

        $rows = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Schema::tables()['orders'] . ' WHERE order_id = %d', $order_id ), ARRAY_A ); // phpcs:ignore WordPress.DB

        return array_column( $rows, null, 'warehouse' );
    }

    /**
     * Other orders of the vendor already using this CJ order number (D7).
     *
     * @since DOKAN_SINCE
     *
     * @param int    $vendor_id   Vendor id.
     * @param string $cj_order_no CJ order number.
     * @param int    $order_id    Order to exclude.
     *
     * @return int[]
     */
    public function orders_with_number( int $vendor_id, string $cj_order_no, int $order_id ): array {
        global $wpdb;

        $ids = $wpdb->get_col( // phpcs:ignore WordPress.DB
            $wpdb->prepare(
                'SELECT DISTINCT order_id FROM ' . Schema::tables()['orders'] . ' WHERE vendor_id = %d AND cj_order_no = %s AND order_id <> %d', // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
                $vendor_id,
                $cj_order_no,
                $order_id
            )
        );

        return array_map( 'intval', (array) $ids );
    }

    /**
     * Whether every warehouse group of an order has a CJ order number.
     *
     * @since DOKAN_SINCE
     *
     * @param int      $order_id   Order id.
     * @param string[] $warehouses Warehouse groups on the order.
     *
     * @return bool
     */
    public function is_fully_ordered( int $order_id, array $warehouses ): bool {
        $rows = $this->for_order( $order_id );

        foreach ( $warehouses as $warehouse ) {
            if ( empty( $rows[ $warehouse ]['cj_order_no'] ) ) {
                return false;
            }
        }

        return ! empty( $warehouses );
    }
}
