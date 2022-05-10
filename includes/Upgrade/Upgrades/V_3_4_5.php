<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

/**
 * @since DOKAN_SINCE
 */
class V_3_4_5 extends DokanUpgrader {

    // create advertisement table
    public static function install_advertisement_table() {
        global $wpdb;

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_reverse_withdrawal` (
                    `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                    `trn_id` bigint(20) UNSIGNED NOT NULL,
                    `trn_type` varchar(250) NOT NULL DEFAULT 'order_commission',
                    `vendor_id` bigint(20) UNSIGNED NOT NULL,
                    `note` mediumtext DEFAULT NULL,
                    `debit` decimal(19,4) NOT NULL DEFAULT '0.0000',
                    `credit` decimal(19,4) NOT NULL DEFAULT '0.0000',
                    `trn_date` int(13) UNSIGNED NOT NULL DEFAULT '0',
                    PRIMARY KEY (`id`),
                    KEY `trn_date` (`trn_date`),
                    KEY `vendor_id_trn_date` (`vendor_id`,`trn_date`) USING BTREE,
                    KEY `vendor_id` (`vendor_id`) USING BTREE,
                    KEY `vendor_id_trn_date_type` (`vendor_id`,`trn_date`,`trn_type`),
                    KEY `trn_id_type` (`trn_id`,`trn_type`)
                ) ENGINE=InnoDB {$wpdb->get_charset_collate()};";

        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        dbDelta( $sql );
    }
}
