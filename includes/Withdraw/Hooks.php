<?php

namespace WeDevs\Dokan\Withdraw;

class Hooks {

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        add_action( 'dokan_withdraw_status_updated', [ self::class, 'delete_seller_balance_cache' ], 10, 3 );
        add_action( 'dokan_withdraw_request_approved', [ self::class, 'update_vendor_balance' ], 11 );
    }

    /**
     * Delete seller balance cache after a withdraw update
     *
     * @since 3.0.0
     *
     * @param string $status
     * @param int    $user_id
     * @param int    $id
     *
     * @return void
     */
    public static function delete_seller_balance_cache( $status, $user_id, $id ) {
        wp_cache_delete( 'dokan_seller_balance_' . $user_id );
    }

    /**
     * Update vendor balance after approve a request
     *
     * @since 3.0.0
     *
     * @param \WeDevs\Dokan\Withdraw\Withdraw $withdraw
     *
     * @return void
     */
    public static function update_vendor_balance( $withdraw ) {
        global $wpdb;

        if ( round( dokan_get_seller_balance( $withdraw->get_user_id(), false ), 2 ) < $withdraw->get_amount() ) {
            return;
        }

        $balance_result = $wpdb->get_row( $wpdb->prepare(
            "select * from {$wpdb->dokan_vendor_balance} where trn_id = %d and trn_type = %s",
            $withdraw->get_id(),
            'dokan_withdraw'
        ) );

        if ( empty( $balance_result ) ) {
            $wpdb->insert(
                $wpdb->dokan_vendor_balance,
                array(
                    'vendor_id'     => $withdraw->get_user_id(),
                    'trn_id'        => $withdraw->get_id(),
                    'trn_type'      => 'dokan_withdraw',
                    'perticulars'   => 'Approve withdraw request',
                    'debit'         => 0,
                    'credit'        => $withdraw->get_amount(),
                    'status'        => 'approved',
                    'trn_date'      => $withdraw->get_date(),
                    'balance_date'  => current_time( 'mysql' ),
                ),
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
}
