<?php

/**
 * Dokan Dahsboard Withdraw class
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

        $this->current_status = isset( $_GET['type'] ) ? $_GET['type'] : 'pending';

        add_action( 'template_redirect', array( $this, 'handle_withdraws' ) );
        add_action( 'dokan_withdraw_content_inside_before', array( $this, 'show_seller_enable_message' ) );
        add_action( 'dokan_withdraw_content_area_header', array( $this, 'withdraw_header_render' ), 10 );
        add_action( 'dokan_withdraw_content', array( $this, 'render_withdraw_error' ), 10 );
        add_action( 'dokan_withdraw_content', array( $this, 'withdraw_status_filter' ), 15 );
        add_action( 'dokan_withdraw_content', array( $this, 'show_seller_balance' ), 20 );
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
            echo dokan_seller_not_enabled_notice();
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
    }

    /**
     * Render Withdraw Error Template
     *
     * @since 2.4
     *
     * @return void
     */
    public function render_withdraw_error() {
        if ( is_wp_error( self::$validate) ) {
            $messages = self::$validate->get_error_messages();

            foreach( $messages as $message ) {
                dokan_get_template_part('global/dokan-error', '', array( 'deleted' => true, 'message' => $message ) );
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
        dokan_get_template_part( 'withdraw/status-listing', '', array( 'current' => $this->current_status ) );
    }

    /**
     * Show Seller balance
     *
     * @since 1.0
     *
     * @return void
     */
    public function show_seller_balance() {
        $balance        = dokan_get_seller_balance( get_current_user_id(), true );
        $withdraw_limit = dokan_get_option( 'withdraw_limit', 'dokan_withdraw', -1 );
        $threshold      = dokan_get_option( 'withdraw_date_limit', 'dokan_withdraw', -1 );

        $message = sprintf( __('Current Balance: %s ', 'dokan-lite' ), $balance );

        if ( $withdraw_limit != -1 ) {
            $message .= sprintf( __( '<br>Minimum Withdraw amount: %s ', 'dokan-lite' ), wc_price( $withdraw_limit ) );
        }
        if ( $threshold != -1 ) {
            $message .= sprintf( __( '<br>Withdraw Threshold: %d days ', 'dokan-lite' ), $threshold );
        }

        dokan_get_template_part( 'global/dokan-warning', '', array( 'message' => $message, 'deleted' => false ) );
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
            $this->user_approved_withdraws( get_current_user_id() );
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

        if ( self::$validate !== false && !is_wp_error( self::$validate ) ) {
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

        if ( isset( $_GET['action'] ) && $_GET['action'] == 'dokan_cancel_withdrow' ) {

            if ( !wp_verify_nonce( $_GET['_wpnonce'], 'dokan_cancel_withdrow' ) ) {
                wp_die( __( 'Are you cheating?', 'dokan-lite' ) );
            }

            global $current_user, $wpdb;

            $row_id = absint( $_GET['id'] );

            $this->update_status( $row_id, $current_user->ID, 2 );

            wp_redirect( add_query_arg( array( 'message' => 'request_cancelled' ), dokan_get_navigation_url( 'withdraw' ) ) );
        }
    }

    /**
     * Validate an withdraw request
     *
     * @return void
     */
    function validate() {

        if ( !isset( $_POST['withdraw_submit'] ) ) {
            return false;
        }

        if ( !wp_verify_nonce( $_POST['dokan_withdraw_nonce'], 'dokan_withdraw' ) ) {
            wp_die( __( 'Are you cheating?', 'dokan-lite' ) );
        }

        $error           = new WP_Error();
        $limit           = $this->get_withdraw_limit();
        $balance         = dokan_get_seller_balance( get_current_user_id(), false );
        $withdraw_amount = (float) $_POST['witdraw_amount'];

        if ( empty( $_POST['witdraw_amount'] ) ) {
            $error->add( 'dokan_empty_withdrad', __( 'Withdraw amount required ', 'dokan-lite' ) );
        } elseif ( $withdraw_amount > $balance ) {

            $error->add( 'enough_balance', __( 'You don\'t have enough balance for this request', 'dokan-lite' ) );
        } elseif ( $withdraw_amount < $limit ) {
            $error->add( 'dokan_withdraw_amount', sprintf( __( 'Withdraw amount must be greater than %d', 'dokan-lite' ), $this->get_withdraw_limit() ) );
        }

        if ( empty( $_POST['withdraw_method'] ) ) {
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

        global $current_user, $wpdb;

        $amount = floatval( $_POST['witdraw_amount'] );
        $method = $_POST['withdraw_method'];

        $data_info = array(
            'user_id' => $current_user->ID,
            'amount'  => $amount,
            'status'  => 0,
            'method'  => $method,
            'ip'      => dokan_get_client_ip(),
            'notes'   => ''
        );

        $update = $this->insert_withdraw( $data_info );
        Dokan_Email::init()->new_withdraw_request( $current_user, $amount, $method );

        wp_redirect( add_query_arg( array( 'message' => 'request_success' ), dokan_get_navigation_url( 'withdraw' ) ) );
    }

    /**
     * List withdraw request for a user
     *
     * @param  int  $user_id
     *
     * @return void
     */
    function withdraw_requests( $user_id ) {
        $withdraw_requests = $this->get_withdraw_requests( $user_id );

        dokan_get_template_part( 'withdraw/pending-request-listing', '', array(
            'withdraw_requests' => $withdraw_requests
        ) );
    }

    /**
     * Show alert messages
     *
     * @return void
     */
    function show_alert_messages() {
        $type    = isset( $_GET['message'] ) ? $_GET['message'] : '';
        $message = '';

        switch ( $type ) {
            case 'request_cancelled':
                $message = __( 'Your request has been cancelled successfully!', 'dokan-lite' );
                break;

            case 'request_success':
                $message = __( 'Your request has been received successfully and being reviewed!', 'dokan-lite' );
                break;

            case 'request_error':
                $message = __( 'Unknown error!', 'dokan-lite' );
                break;
        }

        if ( ! empty( $message ) ) {
            dokan_get_template_part( 'global/dokan-error', '', array( 'deleted' => true, 'message' => $message ) );
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
        global $current_user;

        // show alert messages
        $this->show_alert_messages();

        $balance = $this->get_user_balance( $current_user->ID );

        if ( $balance < 0 ) {
            dokan_get_template_part( 'global/dokan-error', '', array(
                'deleted'=> false,
                'message' => sprintf( __( 'You already withdrawed %s. This amount will deducted from your balance.', 'dokan-lite' ), wc_price( $balance ) )
            ) );
        }

        if ( $this->has_pending_request( $current_user->ID ) ) {

            $req_success = isset( $_GET['message'] ) ? $_GET['message'] : false;

            if( !$req_success ) {
                $pending_warning = sprintf( "<p>%s</p><p>%s</p>", __( 'You already have pending withdraw request(s).', 'dokan-lite' ), __( 'Please submit your request after approval or cancellation of your previous request.', 'dokan-lite' ) );

                dokan_get_template_part( 'global/dokan-error', '', array(
                    'deleted' => false,
                    'message' => $pending_warning
                ) );
            }

            $this->withdraw_requests( $current_user->ID );
            return;

        } else if ( !$this->has_withdraw_balance( $current_user->ID ) ) {

            dokan_get_template_part( 'global/dokan-error', '', array(
                'deleted' => false,
                'message' => __( 'You don\'t have sufficient balance for a withdraw request!', 'dokan-lite' )
            ) );

            return;
        }

        $payment_methods = dokan_withdraw_get_active_methods();

        if ( is_wp_error( $validate ) ) {
            $amount          = $_POST['witdraw_amount'];
            $withdraw_method = $_POST['withdraw_method'];
        } else {
            $amount          = '';
            $withdraw_method = '';
        }

        dokan_get_template_part( 'withdraw/request-form', '', array(
            'amount' => $amount,
            'withdraw_method' => $withdraw_method,
            'payment_methods' => $payment_methods
        ) );
    }

    /**
     * Print the approved user withdraw requests
     *
     * @param  int  $user_id
     *
     * @return void
     */
    function user_approved_withdraws( $user_id ) {
        $requests = $this->get_withdraw_requests( $user_id, 1, 100 );

        if ( $requests ) {

            dokan_get_template_part( 'withdraw/approved-request-listing', '', array(
                'requests' => $requests
            ) );

        } else {

            dokan_get_template_part( 'global/dokan-warning', '', array(
                'deleted' => false,
                'message' => __( 'Sorry, no transactions were found!', 'dokan-lite' )
            ) );

        }
    }

}
