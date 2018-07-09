<?php
/**
 * Add new table for vendor-balance
 *
 * @since 2.8.3
 *
 * @return void
 */
function create_vendor_balance_table_283() {
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
}

/**
 * get order table data
 */
function dokan_migrate_order_data_283(){
    global $wpdb;

    $threshold_day = dokan_get_option( 'withdraw_date_limit', 'dokan_withdraw', 0 );

    $sql = "SELECT `order`.*, post.post_date from {$wpdb->prefix}dokan_orders as `order` left join {$wpdb->prefix}posts as post on post.ID = order.order_id";
    $results = $wpdb->get_results( $sql );
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
            'balance_date'  => date( 'Y-m-d h:i:s', strtotime( $result->post_date . ' + '.$threshold_day.' days' ) ),
        );
        dokan_insert_vendor_balance_data_283( $data );
    }
}

/**
 * get withdraw table data
 */
function dokan_migrate_withdraw_data_283(){
    global $wpdb;

    $sql = "SELECT * from {$wpdb->prefix}dokan_withdraw WHERE `status` = 1";
    $results = $wpdb->get_results( $sql );
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
        dokan_insert_vendor_balance_data_283( $data );
    }
}

/**
 * get insert vendor_balance table data
 */
function dokan_insert_vendor_balance_data_283( $data ){
    global $wpdb;

    $wpdb->insert( $wpdb->prefix . 'dokan_vendor_balance', $data,
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

create_vendor_balance_table_283();
dokan_migrate_order_data_283();
dokan_migrate_withdraw_data_283();
