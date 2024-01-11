<?php

namespace WeDevs\Dokan\Order\WooAnalytics;

use Automattic\WooCommerce\Internal\Admin\Schedulers\OrdersScheduler;
use Automattic\WooCommerce\Internal\DataStores\Orders\OrdersTableDataStore;
use Automattic\WooCommerce\Utilities\OrderUtil;

/**
 * When woocomemrce fetches the order analytics data it includes the sub-orders data in to the anylitics data,
 * but sub-orders should be skiped. That is why we are extending the OrderScheduler.php class modifing it and adding an where clause to
 * get the parents order only.
 *
 * @since DOKAN_SINCE
 */
class DokanOrdersScheduler extends OrdersScheduler {
    /**
     * Get the order/refund IDs and total count that need to be synced.
     *
     * @param int      $limit         Number of records to retrieve.
     * @param int      $page          Page number.
     * @param int|bool $days          Number of days prior to current date to limit search results.
     * @param bool     $skip_existing Skip already imported orders.
     *
     * @internal
     */
    public static function get_items( $limit = 10, $page = 1, $days = false, $skip_existing = false ) {
        if ( OrderUtil::custom_orders_table_usage_is_enabled() ) {
            return self::get_items_from_orders_table( $limit, $page, $days, $skip_existing );
        } else {
            return self::get_items_from_posts_table( $limit, $page, $days, $skip_existing );
        }
    }

    /**
     * Helper method to ger order/refund IDS and total count that needs to be synced from HPOS.
     *
     * @param int      $limit         Number of records to retrieve.
     * @param int      $page          Page number.
     * @param int|bool $days          Number of days prior to current date to limit search results.
     * @param bool     $skip_existing Skip already imported orders.
     *
     * @return object Total counts.
     * @internal
     */
    private static function get_items_from_posts_table( $limit, $page, $days, $skip_existing ) {
        global $wpdb;
        $where_clause = '';
        $offset       = $page > 1 ? ( $page - 1 ) * $limit : 0;
        $where_clause .= ' AND post_parent = 0 ';

        if ( is_int( $days ) ) {
            $days_ago      = gmdate( 'Y-m-d 00:00:00', time() - ( DAY_IN_SECONDS * $days ) );
            $where_clause .= " AND post_date_gmt >= '{$days_ago}'";
        }

        if ( $skip_existing ) {
            $where_clause .= " AND NOT EXISTS (
				SELECT 1 FROM {$wpdb->prefix}wc_order_stats
				WHERE {$wpdb->prefix}wc_order_stats.order_id = {$wpdb->posts}.ID
			)";
        }

        $count = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts}
			WHERE post_type IN ( 'shop_order', 'shop_order_refund' )
			AND post_status NOT IN ( 'wc-auto-draft', 'auto-draft', 'trash' )
			{$where_clause}"
        ); // phpcs:ignore unprepared SQL ok.

        $order_ids = absint( $count ) > 0 ? $wpdb->get_col(
            $wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts}
				WHERE post_type IN ( 'shop_order', 'shop_order_refund' )
				AND post_status NOT IN ( 'wc-auto-draft', 'auto-draft', 'trash' )
				{$where_clause}
				ORDER BY post_date_gmt ASC
				LIMIT %d
				OFFSET %d",
                $limit,
                $offset
            )
        ) : array(); // phpcs:ignore unprepared SQL ok.

        return (object) array(
            'total' => absint( $count ),
            'ids'   => $order_ids,
        );
    }

    /**
     * Helper method to ger order/refund IDS and total count that needs to be synced from HPOS.
     *
     * @internal
     * @param int      $limit Number of records to retrieve.
     * @param int      $page  Page number.
     * @param int|bool $days Number of days prior to current date to limit search results.
     * @param bool     $skip_existing Skip already imported orders.
     *
     * @return object Total counts.
     */
    private static function get_items_from_orders_table( $limit, $page, $days, $skip_existing ) {
        global $wpdb;
        $where_clause = '';
        $offset       = $page > 1 ? ( $page - 1 ) * $limit : 0;
        $order_table  = OrdersTableDataStore::get_orders_table_name();

        $where_clause .= ' AND orders.parent_order_id = 0 ';

        if ( is_int( $days ) ) {
            $days_ago      = gmdate( 'Y-m-d 00:00:00', time() - ( DAY_IN_SECONDS * $days ) );
            $where_clause .= " AND orders.date_created_gmt >= '{$days_ago}'";
        }

        if ( $skip_existing ) {
            $where_clause .= "AND NOT EXiSTS (
					SELECT 1 FROM {$wpdb->prefix}wc_order_stats
					WHERE {$wpdb->prefix}wc_order_stats.order_id = orders.id
					)
				";
        }

        $count = $wpdb->get_var(
            "
            SELECT COUNT(*) FROM {$order_table} AS orders
            WHERE type in ( 'shop_order', 'shop_order_refund' )
            AND status NOT IN ( 'wc-auto-draft', 'trash', 'auto-draft' )
            {$where_clause}
            "
        ); // phpcs:ignore unprepared SQL ok.

        $order_ids = absint( $count ) > 0 ? $wpdb->get_col(
            $wpdb->prepare(
                "SELECT id FROM {$order_table} AS orders
				WHERE type IN ( 'shop_order', 'shop_order_refund' )
				AND status NOT IN ( 'wc-auto-draft', 'auto-draft', 'trash' )
				{$where_clause}
				ORDER BY date_created_gmt ASC
				LIMIT %d
				OFFSET %d",
                $limit,
                $offset
            )
        ) : array(); // phpcs:ignore unprepared SQL ok.

        return (object) array(
            'total' => absint( $count ),
            'ids'   => $order_ids,
        );
    }
}
