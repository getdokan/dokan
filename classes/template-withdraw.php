<?php

/**
 * Dokan Dashboard Withdraw class
 *
 * @author weDevs
 *
 * @since 2.4
 *
 * @package dokan
 */
class Dokan_Template_Withdraw extends Dokan_Withdraw {

    public static $validate;
    public $current_status;

    /**
     * Load Autometically When class initiate
     *
     * Trigger all actions
     *
     * @since 2.4
     */
    public function __construct() {

        $get_data = wp_unslash( $_GET );

        $this->current_status = isset( $get_data['type'] ) ? $get_data['type'] : 'pending';

        add_action( 'template_redirect', array( $this, 'handle_withdraws' ) );
        add_action( 'dokan_withdraw_content_inside_before', array( $this, 'show_seller_enable_message' ) );
        add_action( 'dokan_withdraw_content_area_header', array( $this, 'withdraw_header_render' ), 10 );
        add_action( 'dokan_withdraw_content', array( $this, 'render_withdraw_error' ), 10 );
        add_action( 'dokan_withdraw_content', array( $this, 'withdraw_status_filter' ), 15 );
        add_action( 'dokan_withdraw_content', array( $this, 'show_seller_balance' ), 5 );
        add_action( 'dokan_withdraw_content', array( $this, 'withdraw_form_and_listing' ), 20 );

    }

    /**
     * Initializes the Dokan_Template_Withdraw class
     *
     * Checks for an existing Dokan_Template_Withdraw instance
     * and if it doesn't find one, creates it.
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Template_Withdraw();
        }

        return $instance;
    }

    /**
     * Show Seller Enable Error Message
     *
     * @since 2.4
     *
     * @return void
     */
    public function show_seller_enable_message() {
        $user_id = get_current_user_id();

        if ( ! dokan_is_seller_enabled( $user_id ) ) {
            dokan_seller_not_enabled_notice();
        }
    }

    /**
     * Dokan Withdraw header Template render
     *
     * @since 2.4
     *
     * @return void
     */
    public function withdraw_header_render() {
        dokan_get_template_part( 'withdraw/header' );

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            dokan_get_template_part('global/dokan-error', '', array(
                'deleted' => false,
                'message' => __( 'You have no permission to manage withdraws', 'dokan-lite' ),
            ) );
            return;
        }
    }

    /**
     * Render Withdraw Error Template
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_withdraw_error() {
        if ( is_wp_error( self::$validate ) ) {
            $messages = self::$validate->get_error_messages();

            foreach ( $messages as $message ) {
                dokan_get_template_part( 'global/dokan-error', '', array(
                    'deleted' => true,
                    'message' => $message,
                ) );
            }
        }
    }

    /**
     * Render WIthdraw Status Filter template
     *
     * @since 2.4
     *
     * @return void
     */
    public function withdraw_status_filter() {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        dokan_get_template_part( 'withdraw/status-listing', '', array(
            'current' => $this->current_status,
        ) );
    }

    /**
     * Show Seller balance
     *
     * @since 1.0
     *
     * @return void
     */
    public function show_seller_balance() {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        $balance        = dokan_get_seller_balance( dokan_get_current_user_id(), true );
        $withdraw_limit = dokan_get_option( 'withdraw_limit', 'dokan_withdraw', -1 );
        $threshold      = dokan_get_option( 'withdraw_date_limit', 'dokan_withdraw', -1 );

        $message = sprintf( __( 'Current Balance: %s ', 'dokan-lite' ), $balance );

        if ( $withdraw_limit != -1 ) {
            $message .= sprintf( __( '<br>Minimum Withdraw amount: %s ', 'dokan-lite' ), wc_price( $withdraw_limit ) );
        }

        if ( $threshold != -1 ) {
            $message .= sprintf( __( '<br>Withdraw Threshold: %d days ', 'dokan-lite' ), $threshold );
        }

        dokan_get_template_part( 'global/dokan-warning', '', array(
            'message' => $message,
            'deleted' => false,
        ) );
    }

    /**
     * Get Withdraw form and listing
     *
     * @since 2.4
     *
     * @return void
     */
    public function withdraw_form_and_listing() {

        if ( $this->current_status == 'pending' ) {
            $this->withdraw_form( self::$validate );
        } elseif ( $this->current_status == 'approved' ) {
            $this->user_approved_withdraws( dokan_get_current_user_id() );
        } elseif ( $this->current_status == 'cancelled' ) {
            $this->user_cancelled_withdraws( dokan_get_current_user_id() );
        }
    }

    /**
     * Handle Withdraw form submission
     *
     * @return void
     */
    function handle_withdraws() {
        // Withdraw functionality
        self::$validate = $this->validate();

        if ( self::$validate !== false && ! is_wp_error( self::$validate ) ) {
            $this->insert_withdraw_info();
        }

        $this->cancel_pending();
    }


    /**
     * Cancel an withdraw request
     *
     * @return void
     */
    function cancel_pending() {

        $get_data = wp_unslash( $_GET );

        if ( isset( $get_data['action'] ) && $get_data['action'] == 'dokan_cancel_withdrow' ) {

            if ( ! wp_verify_nonce( $get_data['_wpnonce'], 'dokan_cancel_withdrow' ) ) {
                wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
            }

            if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
                wp_die( esc_attr__( 'You have no permission to do this action', 'dokan-lite' ) );
            }

            global $current_user, $wpdb;

            $row_id = absint( $get_data['id'] );

            $this->update_status( $row_id, $current_user->ID, 2 );

            wp_redirect( add_query_arg( array(
				'message' => 'request_cancelled',
            ), dokan_get_navigation_url( 'withdraw' ) ) );
        }
    }

    /**
     * Validate an withdraw request
     *
     * @return void
     */
    function validate() {

        $post_data = wp_unslash( $_POST );

        if ( ! isset( $post_data['withdraw_submit'] ) ) {
            return false;
        }

        if ( ! isset( $post_data['dokan_withdraw_nonce'] ) || ! wp_verify_nonce( sanitize_key( $post_data['dokan_withdraw_nonce'] ), 'dokan_withdraw' ) ) {
            wp_die( esc_attr__( 'Are you cheating?', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            wp_die( esc_attr__( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        $error           = new WP_Error();
        $limit           = $this->get_withdraw_limit();
        $balance         = round( dokan_get_seller_balance( dokan_get_current_user_id(), false ), 2 );
        $withdraw_amount = (float) $post_data['witdraw_amount'];

        if ( empty( $withdraw_amount ) ) {
            $error->add( 'dokan_empty_withdrad', __( 'Withdraw amount required ', 'dokan-lite' ) );
        } elseif ( $withdraw_amount > $balance ) {
            $error->add( 'enough_balance', __( 'You don\'t have enough balance for this request', 'dokan-lite' ) );
        } elseif ( $withdraw_amount < $limit ) {
            $error->add( 'dokan_withdraw_amount', sprintf( __( 'Withdraw amount must be greater than %d', 'dokan-lite' ), $this->get_withdraw_limit() ) );
        }

        if ( empty( sanitize_text_field( $post_data['withdraw_method'] ) ) ) {
            $error->add( 'dokan_withdraw_method', __( 'withdraw method required', 'dokan-lite' ) );
        }

        if ( $error->get_error_codes() ) {
            return $error;
        }

        return true;
    }

    /**
     * Insert withdraw info
     *
     * @return void
     */
    function insert_withdraw_info() {

        $post_data = wp_unslash( $_POST );

        if ( ! isset( $post_data['dokan_withdraw_nonce'] ) || ! wp_verify_nonce( sanitize_key( $post_data['dokan_withdraw_nonce'] ), 'dokan_withdraw' ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        global $current_user;

        $amount = (float) sanitize_text_field( $post_data['witdraw_amount'] );
        $method = sanitize_text_field( $post_data['withdraw_method'] );

        $data_info = array(
            'user_id' => $current_user->ID,
            'amount'  => $amount,
            'status'  => 0,
            'method'  => $method,
            'ip'      => dokan_get_client_ip(),
            'notes'   => '',
        );

        $update = $this->insert_withdraw( $data_info );

        do_action( 'dokan_after_withdraw_request', $current_user, $amount, $method );

        wp_redirect( add_query_arg( array(
			'message' => 'request_success',
        ), dokan_get_navigation_url( 'withdraw' ) ) );
    }

    /**
     * List withdraw request for a user
     *
     * @param  int  $user_id
     *
     * @return void
     */
    function withdraw_requests( $user_id ) {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        $withdraw_requests = $this->get_withdraw_requests( $user_id );

        dokan_get_template_part( 'withdraw/pending-request-listing', '', array(
            'withdraw_requests' => $withdraw_requests,
        ) );
    }

    /**
     * Show alert messages
     *
     * @return void
     */
    function show_alert_messages() {
        $get_data = wp_unslash( $_GET );

        $type    = isset( $get_data['message'] ) ? sanitize_text_field( $get_data['message'] ) : '';
        $message = '';

        $template = 'global/dokan-success';

        switch ( $type ) {
            case 'request_cancelled':
                $message = __( 'Your request has been cancelled successfully!', 'dokan-lite' );
                break;

            case 'request_success':
                $message = __( 'Your request has been received successfully and being reviewed!', 'dokan-lite' );
                break;

            case 'request_error':
                $message = __( 'Unknown error!', 'dokan-lite' );
                $template = 'global/dokan-error';
                break;
        }

        if ( ! empty( $message ) ) {
            dokan_get_template_part( $template, '', array(
                'deleted' => true,
                'message' => $message,
            ) );
        }
    }

    /**
     * Generate withdraw request form
     *
     * @param  string  $validate
     *
     * @return void
     */
    function withdraw_form( $validate = '' ) {

        $get_data  = wp_unslash( $_GET );
        $post_data = wp_unslash( $_POST );

        global $current_user;

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        // show alert messages
        $this->show_alert_messages();

        $balance = $this->get_user_balance( $current_user->ID );

        if ( $balance < 0 ) {
            dokan_get_template_part( 'global/dokan-error', '', array(
                'deleted' => false,
                'message' => sprintf( __( 'You have already withdrawn %s. This amount will be deducted from your balance.', 'dokan-lite' ), wc_price( $balance ) ),
            ) );
        }

        if ( $this->has_pending_request( $current_user->ID ) ) {

            $req_success = isset( $get_data['message'] ) ? true : false;

            if ( ! $req_success ) {
                $pending_warning = sprintf( '<p>%s</p><p>%s</p>', __( 'You already have pending withdraw request(s).', 'dokan-lite' ), __( 'Please submit your request after approval or cancellation of your previous request.', 'dokan-lite' ) );

                dokan_get_template_part( 'global/dokan-error', '', array(
                    'deleted' => false,
                    'message' => $pending_warning,
                ) );
            }

            $this->withdraw_requests( $current_user->ID );
            return;

        } else if ( ! $this->has_withdraw_balance( $current_user->ID ) ) {

            dokan_get_template_part( 'global/dokan-error', '', array(
                'deleted' => false,
                'message' => __( 'You don\'t have sufficient balance for a withdraw request!', 'dokan-lite' ),
            ) );

            return;
        }

        $payment_methods = array_intersect( dokan_get_seller_active_withdraw_methods(), dokan_withdraw_get_active_methods() );

        if ( is_wp_error( $validate ) ) {
            $amount          = sanitize_text_field( $post_data['witdraw_amount'] );
            $withdraw_method = sanitize_text_field( $post_data['withdraw_method'] );
        } else {
            $amount          = '';
            $withdraw_method = '';
        }

        dokan_get_template_part( 'withdraw/request-form', '', array(
            'amount'          => $amount,
            'withdraw_method' => $withdraw_method,
            'payment_methods' => $payment_methods,
        ) );
    }

    /**
     * Get all withdraws
     *
     * @param integer $user_id [description]
     *
     * @return [type] [description]
     */
    function get_all_withdraws( $user_id, $limit = 100, $offset = 0 ) {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        global $wpdb;

        if ( empty( $user_id ) ) {
            $result = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->dokan_withdraw} ORDER BY date DESC LIMIT %d, %d", $offset, $limit ) );
        } else {
            $result = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->dokan_withdraw} WHERE user_id =%d ORDER BY date DESC LIMIT %d, %d", $user_id, $offset, $limit ) );
        }

        return $result;
    }

    /**
     * Print the approved user withdraw requests
     *
     * @param  int  $user_id
     *
     * @return void
     */
    function user_approved_withdraws( $user_id ) {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }
        $requests = $this->get_withdraw_requests( $user_id, 1, 100 );

        if ( $requests ) {

            dokan_get_template_part( 'withdraw/approved-request-listing', '', array(
                'requests' => $requests,
            ) );

        } else {

            dokan_get_template_part( 'global/dokan-warning', '', array(
                'deleted' => false,
                'message' => __( 'Sorry, no transactions were found!', 'dokan-lite' ),
            ) );

        }
    }

     /**
     * Print the cancelled user withdraw requests
     *
     * @param  int  $user_id
     *
     * @return void
     */
    function user_cancelled_withdraws( $user_id ) {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        $requests = $this->get_withdraw_requests( $user_id, 2, 100 );

        if ( $requests ) {

            dokan_get_template_part( 'withdraw/cancelled-request-listing', '', array(
                'requests' => $requests,
            ) );

        } else {

            dokan_get_template_part( 'global/dokan-warning', '', array(
                'deleted' => false,
                'message' => __( 'Sorry, no transactions were found!', 'dokan-lite' ),
            ) );
        }
    }

}
