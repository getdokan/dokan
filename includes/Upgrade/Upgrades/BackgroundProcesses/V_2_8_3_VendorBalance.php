<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Update vendor and product geolocation data
 *
 * @since 2.8.6
 */
class V_2_8_3_VendorBalance extends DokanBackgroundProcesses {

    /**
     * Perform updates
     *
     * @since 2.8.6
     *
     * @param mixed $item
     *
     * @return mixed
     */
    public function task( $item ) {
        if ( empty( $item ) ) {
            return false;
        }

        if ( 'vendor_balance_table' === $item['updating'] ) {
            return $this->create_vendor_balance_table_283();
        }

        if ( 'migrate_order_data' === $item['updating'] ) {
            return $this->migrate_order_data_283( $item['paged'] );
        }

        if ( 'migrate_withdraw_data' === $item['updating'] ) {
            return $this->migrate_withdraw_data_283( $item['paged'] );
        }

        return false;
    }

    /**
     * Add new table for vendor-balance
     *
     * @since 2.8.3
     *
     * @return void
     */
    private function create_vendor_balance_table_283() {
        global $wpdb;
        include_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $sql = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}dokan_vendor_balance` (
               `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
               `vendor_id` bigint(20) unsigned NOT NULL,
               `trn_id` bigint(20) unsigned NOT NULL,
               `trn_type` varchar(30) NOT NULL,
               `perticulars` text NOT NULL,
               `debit` float(11) NOT NULL,
               `credit` float(11) NOT NULL,
               `status` varchar(30) DEFAULT NULL,
               `trn_date` timestamp NOT NULL,
               `balance_date` timestamp NOT NULL,
              PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;";

        dbDelta( $sql );

        return array(
            'updating' => 'migrate_order_data',
            'paged'    => 0,
        );
    }

    /**
     * get order table data
     */
    private function migrate_order_data_283( $paged ) {
        global $wpdb;

        $limit         = 100;
        $count         = $limit * $paged;
        $threshold_day = dokan_get_option( 'withdraw_date_limit', 'dokan_withdraw', 0 );

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT `order`.*, post.post_date from {$wpdb->prefix}dokan_orders as `order` left join {$wpdb->prefix}posts as post on post.ID = order.order_id LIMIT %d OFFSET %d",
                $limit, $count
            )
        );

        if ( empty( $results ) ) {
            return array(
                'updating' => 'migrate_withdraw_data',
                'paged'    => 0,
            );
        }

        foreach ( $results as $result ) {
            $data = array(
                'vendor_id'     => $result->seller_id,
                'trn_id'        => $result->order_id,
                'trn_type'      => 'dokan_orders',
                'perticulars'   => 'Migration order',
                'debit'         => $result->net_amount,
                'credit'        => 0,
                'status'        => $result->order_status,
                'trn_date'      => $result->post_date,
                'balance_date'  => date( 'Y-m-d h:i:s', strtotime( $result->post_date . ' + ' . $threshold_day . ' days' ) ),
            );

            $this->insert_vendor_balance_data_283( $data );
        }

        return array(
            'updating' => 'migrate_order_data',
            'paged'    => ++$paged,
        );
    }

    /**
     * get withdraw table data
     */
    private function migrate_withdraw_data_283( $paged ) {
        global $wpdb;

        $limit   = 100;
        $count   = $limit * $paged;
        // $sql     = "SELECT * from {$wpdb->prefix}dokan_withdraw WHERE `status` = 1 LIMIT {$limit} OFFSET {$count}";
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * from {$wpdb->prefix}dokan_withdraw WHERE `status` = 1 LIMIT %d OFFSET %d",
                $limit, $count
            )
        );

        if ( empty( $results ) ) {
            return;
        }

        foreach ( $results as $result ) {
            $data = array(
                'vendor_id'     => $result->user_id,
                'trn_id'        => $result->id,
                'trn_type'      => 'dokan_withdraw',
                'perticulars'   => 'Migration withdraw',
                'debit'         => 0,
                'credit'        => $result->amount,
                'status'        => 'approved',
                'trn_date'      => $result->date,
                'balance_date'  => $result->date,
            );

            $this->insert_vendor_balance_data_283( $data );
        }

        return array(
            'updating' => 'migrate_withdraw_data',
            'paged'    => ++$paged,
        );
    }

    /**
     * get insert vendor_balance table data
     */
    private function insert_vendor_balance_data_283( $data ) {
        global $wpdb;

        $wpdb->insert(
            $wpdb->prefix . 'dokan_vendor_balance', $data,
            array(
                '%d',
                '%d',
                '%s',
                '%s',
                '%f',
                '%f',
                '%s',
                '%s',
                '%s',
            )
        );
    }
}
