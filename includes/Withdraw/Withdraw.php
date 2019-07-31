<?php

namespace WeDevs\Dokan\Withdraw;

use WP_Error;

class Withdraw {

    protected $data = [];

    public function __construct( $data = [] ) {
        $defaults = [
            'id'      => 0,
            'user_id' => 0,
            'amount'  => 0,
            'date'    => current_time( 'mysql' ),
            'status'  => dokan()->withdraw->get_status_code( 'pending' ),
            'method'  => 'paypal',
            'note'    => '',
            'ip'      => '',
        ];

        $data = wp_parse_args( $data, $defaults );

        $this->data = [
            'id'      => absint( $data['id'] ),
            'user_id' => absint( $data['user_id'] ),
            'amount'  => $data['amount'],
            'date'    => $data['date'],
            'status'  => absint( $data['status'] ),
            'method'  => $data['method'],
            'note'    => $data['note'],
            'ip'      => $data['ip'],
        ];
    }

    public function get_withdraw() {
        return $this->data;
    }

    public function get_id() {
        return $this->data['id'];
    }

    public function get_user_id() {
        return $this->data['user_id'];
    }

    public function get_amount() {
        return $this->data['amount'];
    }

    public function get_date() {
        return $this->data['date'];
    }

    public function get_status() {
        return $this->data['status'];
    }

    public function get_method() {
        return $this->data['method'];
    }

    public function get_note() {
        return $this->data['note'];
    }

    public function get_ip() {
        return $this->data['ip'];
    }

    public function set_user_id( $user_id ) {
        $this->data['user_id'] = $user_id;
        return $this;
    }

    public function set_amount( $amount ) {
        $this->data['amount'] = $amount;
        return $this;
    }

    public function set_date( $date ) {
        $this->data['date'] = $date;
        return $this;
    }

    public function set_status( $status ) {
        $this->data['status'] = $status;
        return $this;
    }

    public function set_method( $method ) {
        $this->data['method'] = $method;
        return $this;
    }

    public function set_note( $note ) {
        $this->data['note'] = $note;
        return $this;
    }

    public function set_ip( $ip ) {
        $this->data['ip'] = $ip;
        return $this;
    }

    public function save() {
        if ( ! $this->data['id'] ) {
            return $this->create();
        } else {
            return $this->update();
        }
    }

    protected function create() {
        global $wpdb;

        unset( $this->data['id'] );

        $inserted = $wpdb->insert(
            $wpdb->dokan_withdraw,
            $this->data,
            [ '%d', '%s', '%s', '%d', '%s', '%s', '%s' ]
        );

        if ( $inserted !== 1 ) {
            return new WP_Error( 'dokan_withdraw_create_error', __( 'Could not create new withdraw', 'dokan-lite' ) );
        }

        $withdraw = dokan()->withdraw->get( $wpdb->insert_id );

        /**
         * After completed withdraw request
         *
         * @since DOKAN_LITE_SINCE
         *
         * @param int    $user_id
         * @param float  $amount
         * @param string $method
         */
        do_action( 'dokan_withdraw_created', $withdraw );

        return $withdraw;
    }

    /**
     * Update a withdraw
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    protected function update() {
        global $wpdb;

        $updated = $wpdb->update(
            $wpdb->dokan_withdraw,
            [
                'user_id' => $this->get_user_id(),
                'amount'  => $this->get_amount(),
                'date'    => $this->get_date(),
                'status'  => $this->get_status(),
                'method'  => $this->get_method(),
                'note'    => $this->get_note(),
                'ip'      => $this->get_ip(),
            ],
            [ 'id' => $this->get_id() ],
            [ '%d', '%s', '%s', '%d', '%s', '%s', '%s' ],
            [ '%d' ]
        );

        if ( $updated !== 1 ) {
            return new WP_Error( 'dokan_withdraw_update_error', __( 'Could not update withdraw', 'dokan-lite' ) );
        }

        /**
         * Action based on withdraw status
         *
         * @since DOKAN_LITE_SINCE
         *
         * @param \WeDevs\Dokan\Withdraw\Withdraw $this
         */
        do_action( 'dokan_withdraw_request_' . dokan()->withdraw->get_status_name( $this->get_status() ), $this );

        /**
         * Fires after update a withdraw
         *
         * @since DOKAN_LITE_SINCE
         *
         * @param \WeDevs\Dokan\Withdraw\Withdraw $this
         */
        do_action( 'dokan_withdraw_updated', $this );

        return $this;
    }

    /**
     * Delete a withdraw
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool|\WP_Error
     */
    public function delete() {
        global $wpdb;

        $deleted = $wpdb->delete(
            $wpdb->dokan_withdraw,
            [ 'id' => $this->data['id'] ],
            [ '%d' ]
        );

        if ( ! $deleted ) {
            return new WP_Error( 'dokan_withdraw_delete_error', __( 'Could not delete withdraw', 'dokan-lite' ) );
        }

        /**
         * Fires after delete a withdraw
         *
         * @since DOKAN_LITE_SINCE
         *
         * @param array $data
         */
        do_action( 'dokan_withdraw_deleted', $this );

        return true;
    }
}
