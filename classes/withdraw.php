<?php
/**
 * Withdraw base class
 *
 * @author wedDevs <info@wedevs.com>
 *
 * @since 2.4
 *
 * @package dokan
 */

class Dokan_Withdraw {

    /**
     * Initializes the Dokan_Template_Withdraw class
     *
     * Checks for an existing Dokan_Template_Withdraw instance
     * and if it doesn't find one, creates it.
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Withdraw();
        }

        return $instance;
    }

    /**
     * Update withdraw status
     *
     * @since 2.4
     *
     * @param  integer $row_id
     * @param  integer $user_id
     * @param  string $status
     *
     * @return void
     */
    function update_status( $row_id, $user_id, $status ) {
        global $wpdb;

        // 0 -> pending
        // 1 -> active
        // 2 -> cancelled

        $wpdb->query(
            $wpdb->prepare( "UPDATE {$wpdb->dokan_withdraw} SET status = %d WHERE user_id=%d AND id = %d",
                $status,
                $user_id,
                $row_id
            )
        );

        do_action( 'dokan_withdraw_status_updated', $status, $user_id, $row_id );

        $cache_key = 'dokan_seller_balance_' . $user_id;
        wp_cache_delete( $cache_key );
    }

    /**
     * Insert an withdraw request
     *
     * @param  array  $data
     *
     * @return boolean
     */
    function insert_withdraw( $data = array() ) {
        global $wpdb;

        $wpdb->dokan_withdraw = $wpdb->prefix . 'dokan_withdraw';
        $data = array(
            'user_id' => $data['user_id'],
            'amount'  => $data['amount'],
            'date'    => current_time( 'mysql' ),
            'status'  => $data['status'],
            'method'  => $data['method'],
            'note'    => $data['notes'],
            'ip'      => $data['ip'],
        );

        $format = array( '%d', '%f', '%s', '%d', '%s', '%s', '%s' );

        return $wpdb->insert( $wpdb->dokan_withdraw, $data, $format );
    }

    /**
     * Check if a user has already pending withdraw request
     *
     * @param  integer   $user_id
     *
     * @return boolean
     */
    function has_pending_request( $user_id ) {
        global $wpdb;

        $wpdb->dokan_withdraw = $wpdb->prefix . 'dokan_withdraw';

        $status = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id
                FROM $wpdb->dokan_withdraw
                WHERE user_id = %d AND status = 0",
                $user_id
            )
        );

        if ( $status ) {
            return true;
        }

        return false;
    }

    /**
     * Get withdraw request of a user
     *
     * @param  integer   $user_id
     * @param  integer   $status
     * @param  integer   $limit
     * @param  integer   $offset
     *
     * @return array
     */
    function get_withdraw_requests( $user_id = '', $status = 0, $limit = 10, $offset = 0 ) {
        global $wpdb;

        if ( empty( $user_id ) ) {
            $result = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->dokan_withdraw} WHERE status = %d LIMIT %d, %d", $status, $offset, $limit ) );
        } else {
            $result = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->dokan_withdraw} WHERE user_id = %d AND status = %d LIMIT %d, %d", $user_id, $status, $offset, $limit ) );
        }

        return $result;
    }

    /**
     * Delete an withdraw request
     *
     * @param  integer
     *
     * @return void
     */
    function delete_withdraw( $id ) {
        global $wpdb;

        $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->dokan_withdraw} WHERE id = %d", $id ) );
    }

    /**
     * Get status code by status type
     *
     * @param  string
     *
     * @return integer
     */
    function get_status_code( $status ) {
        switch ( $status ) {
            case 'pending':
                return 0;
                break;

            case 'completed':
                return 1;
                break;

            case 'cancelled':
                return 2;
                break;
        }
    }

    /**
     * Check if a user has sufficient withdraw balance
     *
     * @param  integer   $user_id
     *
     * @return boolean
     */
    function has_withdraw_balance( $user_id ) {

        $balance        = $this->get_user_balance( $user_id );
        $withdraw_limit = $this->get_withdraw_limit();

        if ( $balance < $withdraw_limit ) {
            return false;
        }

        return true;
    }

    /**
     * Get the system withdraw limit
     *
     * @return integer
     */
    function get_withdraw_limit() {
        return (int) dokan_get_option( 'withdraw_limit', 'dokan_withdraw', 0 );
    }

    /**
     * Get a sellers balance
     *
     * @param  integer  $user_id
     *
     * @return integer
     */
    function get_user_balance( $user_id ) {
        return dokan_get_seller_balance( $user_id, false );
    }

    /**
     * Print status messages
     *
     * @param  string  $status
     *
     * @return void
     */
    function request_status( $status ) {
        switch ( $status ) {
            case 0:
                return '<span class="label label-danger">' . __( 'Pending Reivew', 'dokan-lite' ) . '</span>';
                break;

            case 1:
                return '<span class="label label-warning">' . __( 'Accepted', 'dokan-lite' ) . '</span>';
                break;
        }
    }
}
