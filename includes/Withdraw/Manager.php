<?php

namespace WeDevs\Dokan\Withdraw;

use WeDevs\Dokan\Cache;
use WP_Error;
use WeDevs\Dokan\Withdraw\Withdraws;

/**
 * Withdraw base class
 *
 * @since   2.4
 *
 * @author  wedDevs <info@wedevs.com>
 *
 * @package dokan
 */
class Manager {

    /**
     * Validate approval request
     *
     * @since 3.0.0
     *
     * @param array $args
     *
     * @return bool|\WP_Error
     */
    public function is_valid_approval_request( $args ) {
        $user_id = $args['user_id'];
        $limit   = $this->get_withdraw_limit();
        $balance = wc_format_decimal( dokan_get_seller_balance( $user_id, false ), 2 );
        $amount  = wc_format_decimal( $args['amount'], 2 );
        $method  = $args['method'];

        if ( empty( $amount ) ) {
            return new WP_Error( 'dokan_withdraw_empty', __( 'Withdraw amount required ', 'dokan-lite' ) );
        }

        if ( $amount > $balance ) {
            return new WP_Error( 'dokan_withdraw_not_enough_balance', __( 'You don\'t have enough balance for this request', 'dokan-lite' ) );
        }

        if ( $amount < $limit ) {
            // translators: %s: withdraw limit amount
            return new WP_Error( 'dokan_withdraw_amount', sprintf( __( 'Withdraw amount must be greater than or equal to %s', 'dokan-lite' ), wc_price( $limit ) ) );
        }

        if ( ! in_array( $method, dokan_get_seller_active_withdraw_methods( $user_id ), true ) ) {
            return new WP_Error( 'dokan_withdraw_invalid_method', __( 'Withdraw method is not active.', 'dokan-lite' ) );
        }

        if ( ! dokan_is_seller_enabled( $user_id ) ) {
            return new WP_Error( 'dokan_withdraw_seller_not_enabled', __( 'Vendor is not enabled for selling, please contact site admin', 'dokan-lite' ) );
        }

        if ( ! empty( $args['id'] ) && isset( $args['status'] ) && absint( $args['status'] ) === dokan()->withdraw->get_status_code( 'approved' ) ) {
            return new WP_Error( 'dokan_withdraw_already_approved', __( 'Withdraw is already approved.', 'dokan-lite' ) );
        }

        /**
         * Filter validated withdraw request
         *
         * @since 3.0.0
         *
         * @param bool
         * @param array $args
         */
        return apply_filters( 'dokan_withdraw_is_valid_request', true, $args );
    }

    /**
     * Validate cancellation request
     *
     * @since 3.0.0
     *
     * @param array $args
     *
     * @return bool|\WP_Error
     */
    public function is_valid_cancellation_request( $args ) {
        global $wpdb;

        $result = $wpdb->get_row(
            $wpdb->prepare(
                "select * from {$wpdb->dokan_withdraw} where id = %d and status = %d",
                $args['id'],
                $this->get_status_code( 'pending' )
            )
        );

        if ( ! empty( $result ) ) {
            // permission: vendor -> only own && shop_manager
            if ( ! ( ( $args['user_id'] === absint( $result->user_id ) ) || user_can( $args['user_id'], 'manage_woocommerce' ) ) ) {
                return new WP_Error( 'dokan_withdraw_cancel_request_invalid_permission', __( 'Invalid permission to cancel the request.', 'dokan-lite' ) );
            }

            return true;
        }

        return new WP_Error( 'dokan_withdraw_cancel_request_error', __( 'Invalid cancel withdraw request', 'dokan-lite' ) );
    }

    /**
     * Update withdraw status
     *
     * @since 2.4
     *
     * @param int    $id
     * @param int    $user_id
     * @param string $status
     *
     * @return void
     */
    public function update_status( $id, $user_id, $status ) {
        global $wpdb;

        // 0 -> pending
        // 1 -> active
        // 2 -> cancelled

        $updated = $wpdb->update(
            $wpdb->dokan_withdraw,
            [
                'status' => $status,
            ],
            [
                'id'      => $id,
                'user_id' => $user_id,
            ],
            [
                '%s',
            ],
            [
                '%d',
                '%d',
            ]
        );

        if ( $updated !== 1 ) {
            return new WP_Error( 'dokan_withdraw_unable_to_update', __( 'Could not update withdraw status', 'dokan-lite' ) );
        }

        do_action( 'dokan_withdraw_status_updated', $status, $user_id, $id );

        return true;
    }

    /**
     * Insert an withdraw approval request
     *
     * @param array $data
     *
     * @return bool|\WP_Error
     */
    public function insert_withdraw( $args = [] ) {
        global $wpdb;

        $data = [
            'user_id' => $args['user_id'],
            'amount'  => $args['amount'],
            'date'    => current_time( 'mysql' ),
            'status'  => $args['status'],
            'method'  => $args['method'],
            'note'    => $args['notes'],
            'details' => ! empty( $args['details'] ) ? $args['details'] : '',
            'ip'      => $args['ip'],
        ];

        $format = [ '%d', '%f', '%s', '%d', '%s', '%s', '%s', '%s' ];

        $inserted = $wpdb->insert( $wpdb->dokan_withdraw, $data, $format );

        if ( $inserted !== 1 ) {
            return new WP_Error( 'dokan_withdraw_unable_to_insert', __( 'Could not add new withdraw approval request.', 'dokan-lite' ) );
        }

        /**
         * After completed withdraw request
         *
         * @since 3.0.0 move action from template class to here.
         *            Change first param from global $current_user
         *            to dynamic $user_id
         *
         * @param int    $user_id
         * @param float  $amount
         * @param string $method
         */
        do_action( 'dokan_after_withdraw_request', $data['user_id'], $data['amount'], $data['method'] );

        return true;
    }

    /**
     * Check if a user has already pending withdraw request
     *
     * @param integer $user_id
     *
     * @return boolean
     */
    public function has_pending_request( $user_id ) {
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
     * @param integer $user_id
     * @param integer $status
     * @param integer $limit
     * @param integer $offset
     *
     * @return array
     */
    public function get_withdraw_requests( $user_id = '', $status = 0, $limit = 10, $offset = 0 ) {
        // get all function arguments as key => value pairs
        $args = get_defined_vars();

        $cache_group = empty( $user_id ) ? 'withdraws' : "withdraws_seller_{$user_id}";
        $cache_key   = 'withdraw_requests_' . md5( wp_json_encode( $args ) );
        $result      = Cache::get( $cache_key, $cache_group );

        if ( false === $result ) {
            global $wpdb;
            if ( empty( $user_id ) ) {
                $result = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->dokan_withdraw} WHERE status = %d LIMIT %d, %d", $status, $offset, $limit ) );
            } else {
                $result = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->dokan_withdraw} WHERE user_id = %d AND status = %d ORDER BY id DESC LIMIT %d, %d", $user_id, $status, $offset, $limit ) );
            }

            Cache::set( $cache_key, $result, $cache_group );
        }

        return $result;
    }

    /**
     * Get status code by status type
     *
     * @param string
     *
     * @return integer
     */
    public function get_status_code( $status ) {
        switch ( $status ) {
            case 'pending':
                return 0;

            case 'completed':
            case 'approved':
                return 1;

            case 'cancelled':
                return 2;
        }

        return null;
    }

    /**
     * Get withdraw details by method and user
     *
     * @param string $method
     * @param int    $user_id
     *
     * @return array
     */
    public function get_formatted_details( $method, $user_id ) {
        if ( 'dokan_custom' === $method ) {
            $store_settings = dokan_get_store_info( $user_id );

            return [
                'value'  => $store_settings['payment']['dokan_custom']['value'],
                'method' => dokan_get_option( 'withdraw_method_name', 'dokan_withdraw' ),
            ];
        }

        $vendor = dokan()->vendor->get( $user_id );

        return isset( $vendor->get_payment_profiles()[ $method ] ) ? (array) $vendor->get_payment_profiles()[ $method ] : [];
    }

    /**
     * Get withdraw status from code
     *
     * @since 3.0.0
     *
     * @param int $code
     *
     * @return string
     */
    public function get_status_name( $code ) {
        switch ( absint( $code ) ) {
            case 0:
                return 'pending';

            case 1:
                return 'approved';

            case 2:
                return 'cancelled';
        }

        return null;
    }

    /**
     * Get list of withdraws
     *
     * @since 3.0.0
     *
     * @param array $args
     *
     * @return array|object
     */
    public function all( $args = [] ) {
        $withdraws = new Withdraws( $args );

        if ( empty( $args['paginate'] ) ) {
            return $withdraws->get_withdraws();
        } else {
            return (object) [
                'withdraws'     => $withdraws->get_withdraws(),
                'total'         => $withdraws->get_total(),
                'max_num_pages' => $withdraws->get_maximum_num_pages(),
            ];
        }
    }

    /**
     * @since DOKAN_LITE_SINCE
     *
     * @return int|null
     */
    public function get_total_withdraw_count() {
        $withdraws = new Withdraws();
        $count     = $withdraws->get_total();

        return (int) $count;
    }

    /**
     * Get a single withdraw
     *
     * @since 3.0.0
     *
     * @param 3.0.0 $id
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw|null
     */
    public function get( $id ) {
        global $wpdb;

        if ( ! is_array( $id ) ) {
            $result = $wpdb->get_row(
                $wpdb->prepare(
                    "select * from {$wpdb->dokan_withdraw} where id = %d",
                    $id
                ), ARRAY_A
            );
        } else {
            $attributes = [
                'id'      => '%d',
                'user_id' => '%d',
                'amount'  => '%s',
                'date'    => '%s',
                'status'  => '%d',
                'method'  => '%s',
                'note'    => '%s',
                'details' => '%s',
                'ip'      => '%s',
            ];

            $fields = array_intersect( array_keys( $attributes ), array_keys( $id ) );

            if ( ! $fields ) {
                return null;
            }

            $where   = '';
            $formats = [];
            foreach ( $fields as $field ) {
                $where     .= ' and ' . $field . '=' . $attributes[ $field ];
                $formats[] = $id[ $field ];
            }

            $result = $wpdb->get_row( $wpdb->prepare( "select * from {$wpdb->dokan_withdraw} where 1 = 1 {$where}", ...$formats ), ARRAY_A );  // phpcs:ignore
        }

        return $result ? new Withdraw( $result ) : null;
    }

    /**
     * Create a withdraw request
     *
     * @since 3.0.0
     *
     * @param array $args
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw|\WP_Error
     */
    public function create( $args ) {
        if ( isset( $args['id'] ) ) {
            unset( $args['id'] );
        }

        $withdraw = new Withdraw( $args );

        return $withdraw->save();
    }

    /**
     * Check if a user has sufficient withdraw balance
     *
     * @param integer $user_id
     *
     * @return boolean
     */
    public function has_withdraw_balance( $user_id ) {
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
    public function get_withdraw_limit() {
        return dokan_get_option( 'withdraw_limit', 'dokan_withdraw', 0 );
    }

    /**
     * Get a sellers balance
     *
     * @param integer $user_id
     *
     * @return integer
     */
    public function get_user_balance( $user_id ) {
        return dokan_get_seller_balance( $user_id, false );
    }

    /**
     * Export withdraw data
     *
     * @since 3.0.0
     *
     * @param array $args
     *
     * @return \WeDevs\Dokan\Withdraw\Export\Manager
     */
    public function export( $args ) {
        return new Export\Manager( $args );
    }

    /**
     * Returns users withdraws summary.
     *
     * @since 3.7.10
     *
     * @param int $user_id
     *
     * @return array
     */
    public function get_user_withdraw_summary( $user_id = '' ) {
        global $wpdb;

        if ( empty( $user_id ) ) {
            $user_id = dokan_get_current_user_id();
        }

        $results = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT
                    count(*) AS total,
                    sum(status = '0') AS pending,
                    sum(status = '1') AS approved,
                    sum(status = '2') AS cancelled
                FROM {$wpdb->prefix}dokan_withdraw AS dw
                WHERE dw.user_id = %d",
                $user_id
            ),
            ARRAY_A
        );

        $summary = [
            'total'     => ! empty( $results['total'] ) ? absint( $results['total'] ) : 0,
            'pending'   => ! empty( $results['pending'] ) ? absint( $results['pending'] ) : 0,
            'approved'  => ! empty( $results['approved'] ) ? absint( $results['approved'] ) : 0,
            'cancelled' => ! empty( $results['cancelled'] ) ? absint( $results['cancelled'] ) : 0,
        ];

        return $summary;
    }
}
