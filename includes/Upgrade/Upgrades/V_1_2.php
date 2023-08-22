<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_1_2 extends DokanUpgrader {
    public static function generate_sync_table() {
        self::dokan_generate_sync_table();
    }

    /**
     * Generate dokan sync table
     *
     * @since 3.8.0 moved from includes/functions.php file
     *
     * @deprecated since 2.4.3
     */
    private static function dokan_generate_sync_table() {
        global $wpdb;

        $orders = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT oi.order_id, p.ID as product_id, p.post_title, p.post_author as seller_id,
                oim2.meta_value as order_total, p.post_status as order_status
            FROM {$wpdb->prefix}woocommerce_order_items oi
            INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim ON oim.order_item_id = oi.order_item_id
            INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim2 ON oim2.order_item_id = oi.order_item_id
            INNER JOIN $wpdb->posts p ON oi.order_id = p.ID
            WHERE
                oim.meta_key = %s AND
                oim2.meta_key = %s
            GROUP BY oi.order_id",
                '_product_id',
                '_line_total'
            )
        );

        $table_name = $wpdb->prefix . 'dokan_orders';

        $wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}dokan_orders" );

        foreach ( $orders as $order ) {
            $net_amount = dokan()->commission->get_earning_by_order( $order->order_id, 'seller' );
            $wpdb->insert(
                $table_name,
                [
                    'order_id'     => $order->order_id,
                    'seller_id'    => $order->seller_id,
                    'order_total'  => $order->order_total,
                    'net_amount'   => $net_amount,
                    'order_status' => $order->order_status,
                ],
                [
                    '%d',
                    '%d',
                    '%f',
                    '%f',
                    '%s',
                ]
            );
        }
    }
}
