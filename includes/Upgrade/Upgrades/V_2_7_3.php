<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WP_Query;
use WP_Roles;

class V_2_7_3 extends DokanUpgrader {

    /**
     * Save admin fee as meta for existing sub-orders
     */
    public static function update_order_meta() {
        $args = [
            'post_type'      => 'shop_order',
            'posts_per_page' => -1,
            'post_status'    => 'any',
            'meta_query'     => [ //phpcs:ignore
                [
                    'key'     => 'has_sub_order',
                    'compare' => 'NOT EXISTS',
                ],
                [
                    'key'     => '_dokan_admin_fee',
                    'compare' => 'NOT EXISTS',
                ],
            ],
        ];

        $query = new WP_Query( $args );

        foreach ( $query->posts as $sub_order ) {
            $order     = wc_get_order( $sub_order->ID );
            $admin_fee = dokan_get_admin_commission_by( $order, dokan_get_seller_id_by_order( $sub_order->ID ) );
            update_post_meta( $sub_order->ID, '_dokan_admin_fee', $admin_fee );
        }
    }

    /**
     * Modify column structure to support upto 4 decimals
     */
    public static function update_table_structure() {
        global $wpdb;

        // @codingStandardsIgnoreStart
        $wpdb->query(
            "ALTER TABLE `{$wpdb->prefix}dokan_orders`
            MODIFY COLUMN order_total float(11,4)"
        );

        $wpdb->query(
            "ALTER TABLE `{$wpdb->prefix}dokan_orders`
            MODIFY COLUMN net_amount float(11,4)"
        );
        // @codingStandardsIgnoreEnd
    }

    /**
     * Update seller capabilities
     *
     * @since 2.7.3
     *
     * @return void
     */
    public static function update_user_capabilities() {
        global $wp_roles;

        if ( class_exists( 'WP_Roles' ) && ! isset( $wp_roles ) ) {
            $wp_roles = new WP_Roles(); //phpcs:ignore
        }

        $capabilities = [];
        $all_cap      = dokan_get_all_caps();

        foreach ( $all_cap as $key => $cap ) {
            $capabilities = array_merge( $capabilities, array_keys( $cap ) );
        }

        foreach ( $capabilities as $key => $capability ) {
            $wp_roles->add_cap( 'seller', $capability );
            $wp_roles->add_cap( 'administrator', $capability );
            $wp_roles->add_cap( 'shop_manager', $capability );
        }
    }
}
