<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_4_11 extends DokanUpgrader {

    /**
     * Upgrade capabilities for sellers
     *
     * @since 2.4.11
     *
     * @return void
     */
    public static function upgrade_seller_capability() {
        global $wp_roles;
        $wp_roles->add_cap( 'seller', 'edit_shop_orders' );
    }

    /**
     * Add new table for refund request
     *
     * @since 2.4.11
     *
     * @return void
     */
    public static function create_refund_table() {
        global $wpdb;
        include_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_refund` (
               `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
               `order_id` bigint(20) unsigned NOT NULL,
               `seller_id` bigint(20) NOT NULL,
               `refund_amount` float(11) NOT NULL,
               `refund_reason` text NULL,
               `item_qtys` varchar(50) NULL,
               `item_totals` varchar(50) NULL,
               `item_tax_totals` varchar(50) NULL,
               `restock_items` varchar(10) NULL,
               `date` timestamp NOT NULL,
               `status` int(1) NOT NULL,
               `method` varchar(30) NOT NULL,
              PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";

        dbDelta( $sql );
    }
}
