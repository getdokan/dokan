<?php

namespace WeDevs\Dokan\Withdraw;

use WP_Error;

class Withdraw {

    /**
     * Witthdraw data
     *
     * @var array
     */
    protected $data = [];

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct( $data = [] ) {
        $defaults = [
            'id'          => 0,
            'user_id'     => 0,
            'amount'      => 0,
            'date'        => dokan_current_datetime(),
            'status'      => dokan()->withdraw->get_status_code( 'pending' ),
            'method'      => 'paypal',
            'note'        => '',
            'details'     => '',
            'charge'      => 0,
            'recivable'   => 0,
            'charge_data' => [],
            'ip'          => '',
        ];

        $data = wp_parse_args( $data, $defaults );

        $this->data = [
            'id'      => absint( $data['id'] ),
            'user_id' => absint( $data['user_id'] ),
            'amount'  => wc_format_decimal( $data['amount'] ),
            'date'    => $data['date'],
            'status'  => absint( $data['status'] ),
            'method'  => $data['method'],
            'note'    => $data['note'],
            'details' => $data['details'],
            'ip'      => $data['ip'],
        ];

        $details     = maybe_unserialize( $data['details'] );
        $charge      = isset( $details['charge'] ) ? wc_format_decimal( $details['charge'] ) : 0;
        $receivable  = isset( $details['receivable'] ) ? wc_format_decimal( $details['receivable'] ) : $this->get_amount();
        $charge_data = isset( $details['charge_data'] ) ? $details['charge_data'] : [];

        $this
            ->set_charge( $charge )
            ->set_recivable( $receivable )
            ->set_charge_data( $charge_data );
    }

    /**
     * Get withdraw data
     *
     * @since 3.0.0
     *
     * @return array
     */
    public function get_withdraw() {
        return $this->data;
    }

    /**
     * Get withdraw id
     *
     * @since 3.0.0
     *
     * @return int
     */
    public function get_id() {
        return $this->data['id'] ?? 0;
    }

    /**
     * Get user_id
     *
     * @since 3.0.0
     *
     * @return int
     */
    public function get_user_id() {
        return $this->data['user_id'];
    }

    /**
     * Get amount
     *
     * @since 3.0.0
     *
     * @return string
     */
    public function get_amount() {
        return $this->data['amount'];
    }

    /**
     * Get date
     *
     * @since 3.0.0
     *
     * @return string
     */
    public function get_date() {
        return $this->data['date'];
    }

    /**
     * Get status
     *
     * @since 3.0.0
     *
     * @return string
     */
    public function get_status() {
        return $this->data['status'];
    }

    /**
     * Get ip
     *
     * @since 3.0.0
     *
     * @return string
     */
    public function get_method() {
        return $this->data['method'];
    }

    /**
     * Get note
     *
     * @since 3.0.0
     *
     * @return string
     */
    public function get_note() {
        return $this->data['note'];
    }

    /**
     * Get details
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public function get_details() {
        return $this->data['details'];
    }

    /**
     * Get ip
     *
     * @since 3.0.0
     *
     * @return string
     */
    public function get_ip() {
        return $this->data['ip'];
    }

    /**
     * Get withdraw charge
     *
     * @since 3.9.6
     *
     * @returns int|float
     */
    public function get_charge() {
        return $this->data['charge'];
    }

    /**
     * Get withdraw revivable amount after deducting the charge amount.
     *
     * @since 3.9.6
     *
     * @returns int|float
     */
    public function get_receivable_amount() {
        return $this->data['receivable'];
    }

    /**
     * Get withdraw charge information.
     *
     * @since 3.9.6
     *
     * @returns array
     */
    public function get_charge_data() {
        $charge_data = $this->data['charge_data'];
        if ( ! empty( $this->get_method() ) && empty( $this->data['charge_data'] ) ) {
            $default_val       = [
                'fixed'      => 0.00,
                'percentage' => 0.00,
            ];
			$all_charges = dokan_withdraw_get_method_charges();

            $charge_data = array_key_exists( $this->get_method(), $all_charges ) ? $all_charges[ $this->get_method() ] : $default_val;
            $this->set_charge_data( $charge_data );
        }

        return $charge_data;
    }

    /**
     * Set user_id
     *
     * @since 3.0.0
     *
     * @param int $user_id
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_user_id( $user_id ) {
        $this->data['user_id'] = $user_id;
        return $this;
    }

    /**
     * Set amount
     *
     * @since 3.0.0
     *
     * @param string $amount
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_amount( $amount ) {
        $this->data['amount'] = wc_format_decimal( $amount );
        return $this;
    }

    /**
     * Set date
     *
     * @since 3.0.0
     *
     * @param string $date
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_date( $date ) {
        $this->data['date'] = $date;
        return $this;
    }

    /**
     * Set status
     *
     * @since 3.0.0
     *
     * @param string $status
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_status( $status ) {
        $this->data['status'] = $status;
        return $this;
    }

    /**
     * Set method
     *
     * @since 3.0.0
     *
     * @param string $method
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_method( $method ) {
        $this->data['method'] = $method;
        return $this;
    }

    /**
     * Set note
     *
     * @since 3.0.0
     *
     * @param string $note
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_note( $note ) {
        $this->data['note'] = $note;
        return $this;
    }

    /**
     * Set details
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param string $details
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_details( $details ) {
        $this->data['details'] = $details;
        return $this;
    }

    /**
     * Set ip
     *
     * @since 3.0.0
     *
     * @param string $ip
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_ip( $ip ) {
        $this->data['ip'] = $ip;
        return $this;
    }

    /**
     * Sets charge.
     *
     * @since 3.9.6
     *
     * @param $amount
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_charge( $amount ) {
        $this->data['charge'] = floatval( $amount );

        return $this;
    }

    /**
     * Set receivable amount
     *
     * @since 3.9.6
     *
     * @param $receivable
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_recivable( $receivable ) {
        $this->data['receivable'] = floatval( $receivable );

        return $this;
    }

    /**
     * Sets charge data.
     *
     * @since 3.9.6
     *
     * @param $charge_data array
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function set_charge_data( $charge_data ) {
        $this->data['charge_data'] = $charge_data;

        return $this;
    }

    /**
     * Calculate withdraw charge
     *
     * @since 3.9.6
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw
     */
    public function calculate_charge() {
        $charge_data = $this->get_charge_data();
        $fixed       = $charge_data['fixed'];
        $percentage  = $charge_data['percentage'];
        $charge      = 0;

        if ( ! empty( $fixed ) ) {
            $charge += (float) $fixed;
        }

        if ( ! empty( $percentage ) ) {
            $charge += $percentage / 100 * (float) $this->get_amount();
        }

        $this->set_charge( $charge );
        $this->set_recivable( floatval( $this->get_amount() - floatval( $charge ) ) );

        return $this;
    }

    /**
     * Returns withdraw data.
     *
     * @since 3.9.6
     *
     * @return array
     */
    public function get_data(): array {
        return $this->data;
    }

    /**
     * Create or update a withdraw
     *
     * @since 3.0.0
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw|\WP_Error
     */
    public function save() {
        if ( ! $this->data['id'] ) {
            return $this->create();
        } else {
            return $this->update();
        }
    }

    /**
     * Create or add a withdraw request
     *
     * @since 3.0.0
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw|\WP_Error
     */
    protected function create() {
        global $wpdb;

        $this->calculate_charge();

        $details = dokan()->withdraw->get_formatted_details( $this->data['method'], absint( $this->data['user_id'] ) );

        $details['charge']      = $this->get_charge();
        $details['receivable']  = $this->get_receivable_amount();
        $details['charge_data'] = $this->get_charge_data();

        $this->data['details'] = maybe_serialize( apply_filters( 'dokan_withdraw_request_details_data', $details, $this ) );

        unset( $this->data['id'] );

        $inserted = $wpdb->insert(
            $wpdb->dokan_withdraw,
            [
                'user_id' => $this->get_user_id(),
                'amount'  => $this->get_amount(),
                'date'    => $this->get_date(),
                'status'  => $this->get_status(),
                'method'  => $this->get_method(),
                'note'    => $this->get_note(),
                'details' => $this->get_details(),
                'ip'      => $this->get_ip(),
            ],
            [ '%d', '%s', '%s', '%d', '%s', '%s', '%s', '%s' ]
        );

        if ( $inserted !== 1 ) {
            return new WP_Error( 'dokan_withdraw_create_error', __( 'Could not create new withdraw', 'dokan-lite' ) );
        }

        $withdraw = dokan()->withdraw->get( $wpdb->insert_id );

        /**
         * After completed withdraw request
         *
         * @since 3.0.0
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
     * @since 3.0.0
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw|\WP_Error
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

        if ( $wpdb->last_error ) {
            return new WP_Error( 'dokan_withdraw_update_error', __( 'Could not update withdraw', 'dokan-lite' ) );
        }

        /**
         * Action based on withdraw status
         *
         * @since 3.0.0
         *
         * @param \WeDevs\Dokan\Withdraw\Withdraw $this
         */
        do_action( 'dokan_withdraw_request_' . dokan()->withdraw->get_status_name( $this->get_status() ), $this );

        /**
         * Fires after update a withdraw
         *
         * @since 3.0.0
         *
         * @param \WeDevs\Dokan\Withdraw\Withdraw $this
         */
        do_action( 'dokan_withdraw_updated', $this );

        return $this;
    }

    /**
     * Delete a withdraw
     *
     * @since 3.0.0
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraw|\WP_Error
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
         * @since 3.0.0
         *
         * @param array $data
         */
        do_action( 'dokan_withdraw_deleted', $this );

        return $this;
    }
}
