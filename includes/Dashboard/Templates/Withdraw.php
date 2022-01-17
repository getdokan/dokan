<?php

namespace WeDevs\Dokan\Dashboard\Templates;

use Automattic\WooCommerce\Utilities\NumberUtil;
use WP_Error;

/**
 * Dokan Dashboard Withdraw class
 *
 * @since 2.4
 */
class Withdraw {

    /**
     * Current status
     *
     * @var null|string
     */
    protected $current_status = null;

    /**
     * Error bag
     *
     * @var null|\WP_Error;
     */
    protected $errors = null;

    /**
     * Load Automatically When class initiate
     *
     * Trigger all actions
     *
     * @since 2.4
     */
    public function __construct() {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        $this->errors = new WP_Error();

        if ( dokan_withdraw_is_disabled() ) {
            $this->redirect_to_dashboard();
            return;
        }

        add_action( 'dokan_load_custom_template', [ $this, 'display_request_listing' ] );
        add_filter( 'dokan_dashboard_nav_active', [ $this, 'active_dashboard_nav_menu' ], 10, 3 );
        add_action( 'template_redirect', [ $this, 'handle_request' ] );
        add_action( 'dokan_withdraw_content_inside_before', [  $this, 'show_seller_enable_message' ] );
        add_action( 'dokan_withdraw_content_area_header', [ $this, 'withdraw_header_render' ] );
        add_action( 'dokan_withdraw_content', [ $this, 'withdraw_status_filter' ], 10 );
        add_action( 'dokan_withdraw_content', [ $this, 'withdraw_form_and_listing' ], 15 );
        add_action( 'dokan_withdraw_content', [ $this, 'withdraw_dashboard_layout_display' ], 10 );
        add_action( 'dokan_withdraw_content_after', [ $this, 'include_withdraw_popup_templates' ], 10 );
        add_action( 'dokan_send_withdraw_request_popup_form_content', [ $this, 'withdraw_request_popup_form_content' ], 10 );
        add_action( 'dokan_withdraw_content_after_last_payment_section', [ $this, 'pending_withdraw_requests' ], 20 );
    }

    /**
     * Add error to error bag
     *
     * @since 3.0.0
     *
     * @param string $message
     * @param string $code
     */
    public function add_error( $message, $code = 'dokan_vendor_dashboard_template_withdraw_error' ) {
        $this->errors->add( $code, $message );
    }

    /**
     * Get current withdraw status
     *
     * @since 3.0.0
     *
     * @return string
     */
    public function get_current_status() {
        if ( ! isset( $this->current_status ) ) {
            $get_data = wp_unslash( $_GET );
            $this->current_status = isset( $get_data['type'] ) ? $get_data['type'] : 'pending';
        }

        return $this->current_status;
    }

    /**
     * Handle Withdraw form submission
     *
     * @return void
     */
    public function handle_request() {
        if ( empty( $_REQUEST['dokan_handle_withdraw_request'] ) ) {
            return;
        }

        if ( 'cancel' === $_REQUEST['dokan_handle_withdraw_request'] ) {
            $this->handle_cancel_request();
        } else if ( 'approval' == $_REQUEST['dokan_handle_withdraw_request'] ) {
            $this->handle_approval_request();
        }
    }

    /**
     * Handle withdraw cancellation request
     *
     * @since 3.0.0
     *
     * @return void
     */
    protected function handle_cancel_request() {
        $get_data = wp_unslash( $_GET );

        if ( ! isset( $get_data['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $get_data['_wpnonce'] ), 'dokan_cancel_withdraw' ) ) {
            $this->add_error( esc_html__( 'Are you cheating?', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            $this->add_error( esc_html__( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        if ( empty( wp_unslash( $get_data['id'] ) ) ) {
            $this->add_error( esc_html__( 'Missing withdraw id.', 'dokan-lite' ) );
        }

        if ( $this->errors->has_errors() ) {
            return;
        }

        $user_id     = get_current_user_id();
        $withdraw_id = absint( wp_unslash( $get_data['id'] ) );

        if ( ! dokan_is_seller_enabled( $user_id ) ) {
            return $this->add_error( esc_html__( 'Your account is not enabled for selling, please contact the admin', 'dokan-lite' ) );
        }

        $args = array(
            'user_id' => $user_id,
            'id'      => $withdraw_id,
        );

        $validate_request = dokan()->withdraw->is_valid_cancellation_request( $args );

        if ( is_wp_error( $validate_request )  ) {
            return $this->add_error( $validate_request->get_error_message(), $validate_request->get_code() );
        }

        $withdraw = dokan()
            ->withdraw
            ->get( $withdraw_id )
            ->set_status( dokan()->withdraw->get_status_code( 'cancelled' ) )
            ->save();

        if ( is_wp_error( $withdraw ) ) {
            return $this->add_error( $withdraw->get_error_message(), $withdraw->get_code() );
        }

        wp_redirect( add_query_arg( array(
            'message' => 'request_cancelled',
        ), dokan_get_navigation_url( 'withdraw-requests' ) ) );
    }

    /**
     * Handle withdraw approval request
     *
     * @since 3.0.0
     *
     * @return void
     */
    protected function handle_approval_request() {
        global $current_user;

        $post_data = wp_unslash( $_POST );

        if ( dokan()->withdraw->has_pending_request( $current_user->ID ) ) {
            return;
        }

        if ( ! isset( $post_data['dokan_withdraw_nonce'] ) || ! wp_verify_nonce( sanitize_key( $post_data['dokan_withdraw_nonce'] ), 'dokan_withdraw' ) ) {
            $this->add_error( esc_html__( 'Are you cheating?', 'dokan-lite' ) );
        }

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            $this->add_error( esc_html__( 'You have no permission to do this action', 'dokan-lite' ) );
        }

        if ( empty( $post_data['withdraw_amount'] ) ) {
            $this->add_error( esc_html__( 'withdraw_amount is required', 'dokan-lite' ) );
        }

        if ( empty( $post_data['withdraw_method'] ) ) {
            $this->add_error( esc_html__( 'withdraw_method is required', 'dokan-lite' ) );
        }

        if ( $this->errors->has_errors() ) {
            return;
        }

        $user_id = get_current_user_id();
        $amount  = $post_data['withdraw_amount'];
        $method  = sanitize_text_field( $post_data['withdraw_method'] );

        $args = array(
            'user_id' => $user_id,
            'amount'  => $amount,
            'method'  => $method,
        );

        $validate_request = dokan()->withdraw->is_valid_approval_request( $args );

        if ( is_wp_error( $validate_request )  ) {
            return $this->add_error( $validate_request->get_error_message(), $validate_request->get_error_code() );
        }

        $data = array(
            'user_id' => $user_id,
            'amount'  => $amount,
            'status'  => dokan()->withdraw->get_status_code( 'pending' ),
            'method'  => $method,
            'ip'      => dokan_get_client_ip(),
            'note'    => '',
        );

        $withdraw = dokan()->withdraw->create( $data );

        if ( is_wp_error( $withdraw ) ) {
            return $this->add_error( $withdraw->get_error_message(), $withdraw->get_error_code() );
        }

        do_action( 'dokan_after_withdraw_request', $user_id, $amount, $method );

        wp_redirect( add_query_arg( array(
            'message' => 'request_success',
        ), dokan_get_navigation_url( 'withdraw-requests' ) ) );
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
     * Print error messages
     *
     * @since 3.0.0
     *
     * @param string|array $messages
     * @param bool   $deleted
     *
     * @return void
     */
    protected function show_error_messages( $messages, $deleted = false ) {
        if ( ! is_array( $messages ) ) {
            $messages = array( $messages );
        }

        foreach ( $messages as $message ) {
            dokan_get_template_part( 'global/dokan-error', '', array(
                'deleted' => $deleted,
                'message' => $message,
            ) );
        }
    }

    /**
     * Print warning message
     *
     * @since 3.0.0
     *
     * @param string $message
     * @param bool   $deleted
     *
     * @return void
     */
    protected function show_warning_message( $message, $deleted = false ) {
        dokan_get_template_part( 'global/dokan-warning', '', array(
            'deleted' => $deleted,
            'message' => $message,
        ) );
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
     * Render WIthdraw Status Filter template
     *
     * @since 2.4
     *
     * @return void
     */
    public function withdraw_status_filter() {
        global $wp;

        if ( ! isset( $wp->query_vars['withdraw-requests'] ) ) {
            return;
        }
        dokan_get_template_part( 'withdraw/status-listing', '', array(
            'current' => $this->get_current_status(),
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
        $balance        = dokan_get_seller_balance( dokan_get_current_user_id(), true );
        $withdraw_limit = dokan_get_option( 'withdraw_limit', 'dokan_withdraw', -1 );
        $threshold      = dokan_get_withdraw_threshold( dokan_get_current_user_id() );

        $message = sprintf( __( 'Current Balance: %s ', 'dokan-lite' ), $balance );

        if ( $withdraw_limit != -1 ) {
            $message .= sprintf( __( '<br>Minimum Withdraw amount: %s ', 'dokan-lite' ), wc_price( $withdraw_limit ) );
        }

        if ( $threshold != -1 ) {
            $message .= sprintf( __( '<br>Withdraw Threshold: %d days ', 'dokan-lite' ), $threshold );
        }

        $this->show_warning_message( $message );
    }

    /**
     * Get Withdraw form and listing
     *
     * @since 2.4
     * @since 3.3.1 Display only in `withdraw-requests` endpoint.
     *
     * @return void
     */
    public function withdraw_form_and_listing() {
        global $wp;

        if ( ! isset( $wp->query_vars['withdraw-requests'] ) ) {
            return;
        }

        if ( $this->get_current_status() == 'pending' ) {
            $this->withdraw_requests( dokan_get_current_user_id() );
        } elseif ( $this->get_current_status() == 'approved' ) {
            $this->user_approved_withdraws( dokan_get_current_user_id() );
        } elseif ( $this->get_current_status() == 'cancelled' ) {
            $this->user_cancelled_withdraws( dokan_get_current_user_id() );
        }
    }

    /**
     * List withdraw request for a user for dashboard.
     *
     * @since 3.3.1
     *
     * @param  int  $user_id
     *
     * @return void
     */
    public function withdraw_requests( $user_id ) {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        $withdraw_requests = dokan()->withdraw->get_withdraw_requests( $user_id );

        dokan_get_template_part( 'withdraw/pending-request-listing', '', array(
            'withdraw_requests' => $withdraw_requests,
        ) );
    }

    /**
     * Show alert messages
     *
     * @return void
     */
    public function show_alert_messages() {
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
    public function withdraw_form() {
        global $current_user;

        $get_data  = wp_unslash( $_GET ); // WPCS: CSRF ok
        $post_data = wp_unslash( $_POST ); // WPCS: CSRF ok

        // show alert messages
        $this->show_alert_messages();

        if ( $this->errors->has_errors() ) {
            $this->show_error_messages( $this->errors->get_error_messages() );
        }

        $balance = dokan()->withdraw->get_user_balance( $current_user->ID );

        if ( $balance < 0 ) {
            $message = sprintf( __( 'You have already withdrawn %s. This amount will be deducted from your balance.', 'dokan-lite' ), wc_price( $balance ) );
            $this->show_error_messages( $message );
        }

        if ( dokan()->withdraw->has_pending_request( $current_user->ID ) ) {

            $req_success = isset( $get_data['message'] ) ? true : false;

            if ( ! $req_success ) {
                $message = sprintf( '<p>%s</p><p>%s</p>', __( 'You already have pending withdraw request(s).', 'dokan-lite' ), __( 'Please submit your request after approval or cancellation of your previous request.', 'dokan-lite' ) );

                $this->show_error_messages( $message );
            }

            $this->withdraw_requests( $current_user->ID );

            return;

        } else if ( ! dokan()->withdraw->has_withdraw_balance( $current_user->ID ) ) {
            $message = __( 'You don\'t have sufficient balance for a withdraw request!', 'dokan-lite' );
            $this->show_error_messages( $message );
            return;
        }

        $payment_methods = array_intersect( dokan_get_seller_active_withdraw_methods(), dokan_withdraw_get_active_methods() );

        $amount          = '';
        $withdraw_method = '';

        dokan_get_template_part( 'withdraw/request-form', '', array(
            'amount'          => $amount,
            'withdraw_method' => $withdraw_method,
            'payment_methods' => $payment_methods,
        ) );
    }

    /**
     * Get all withdraws
     *
     * @param integer $user_id
     * @param integer $limit
     * @param integer $offset
     *
     * @return array
     */
    public function get_all_withdraws( $user_id, $limit = 100, $offset = 0 ) {
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
     * @since 3.3.1
     *
     * @param  int  $user_id
     *
     * @return void
     */
    public function user_approved_withdraws( $user_id ) {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }
        $requests = dokan()->withdraw->get_withdraw_requests( $user_id, 1, 100 );

        if ( $requests ) {
            dokan_get_template_part( 'withdraw/approved-request-listing', '', array(
                'requests' => $requests,
            ) );
        } else {
            $this->show_warning_message( __( 'Sorry, no transactions were found!', 'dokan-lite' ) );
        }
    }

     /**
     * Print the cancelled user withdraw requests
     *
     * @param  int  $user_id
     *
     * @return void
     */
    public function user_cancelled_withdraws( $user_id ) {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        $requests = dokan()->withdraw->get_withdraw_requests( $user_id, 2, 100 );

        if ( $requests ) {

            dokan_get_template_part( 'withdraw/cancelled-request-listing', '', array(
                'requests' => $requests,
            ) );

        } else {
            $message = __( 'Sorry, no transactions were found!', 'dokan-lite' );
            $this->show_warning_message( $message );
        }
    }

    /**
     * Display dashboard content
     *
     * @since 3.3.1
     *
     * @return void
     */
    public function withdraw_dashboard_layout_display() {
        global $wp;

        if ( ! isset( $wp->query_vars['withdraw'] ) ) {
            return;
        }

        $last_withdraw = dokan()->withdraw->get_withdraw_requests(  dokan_get_current_user_id(), 1, 1 );
        $payment_details = __( 'You do not have any approved withdraw yet.', 'dokan-lite' );

        if ( ! empty( $last_withdraw ) ) {
            $last_withdraw_amount      = '<strong>' . wc_price( $last_withdraw[0]->amount ) . '</strong>';
            $last_withdraw_date        = '<strong><em>' . dokan_format_date( $last_withdraw[0]->date ) . '</em></strong>';
            $last_withdraw_method_used = '<strong>' . dokan_withdraw_get_method_title( $last_withdraw[0]->method ) . '</strong>';

            // translators: 1: Last formatted withdraw amount 2: Last formatted withdraw date 3: Last formatted withdraw method used.
            $payment_details = sprintf( __( '%1$s on %2$s to %3$s', 'dokan-lite' ), $last_withdraw_amount, $last_withdraw_date, $last_withdraw_method_used );
        }

        $args = [
            'balance'         => dokan_get_seller_balance( dokan_get_current_user_id(), true ),
            'withdraw_limit'  => dokan_get_option( 'withdraw_limit', 'dokan_withdraw', -1 ),
            'threshold'       => dokan_get_withdraw_threshold( dokan_get_current_user_id() ),
            'payment_details' => $payment_details,
            'active_methods'  => dokan_withdraw_get_withdrawable_active_methods(),
            'default_method'  => dokan_withdraw_get_default_method(),
        ];
        dokan_get_template_part( 'withdraw/withdraw-dashboard', '', $args );
    }

    /**
     * Include withdraw request popup content
     *
     * @since 3.3.1
     *
     * @return void
     */
    public function include_withdraw_popup_templates() {
        dokan_get_template_part( 'withdraw/tmpl-withdraw-request-popup', '' );
    }

    /**
     * Populate withdraw request popup content.
     *
     * @since 3.3.1
     *
     * @return void
     */
    public function withdraw_request_popup_form_content() {
        $current_user_id = dokan_get_current_user_id();

        $balance = dokan()->withdraw->get_user_balance( $current_user_id );

        if ( $balance < 0 ) {
            $message = sprintf( __( 'You have already withdrawn %s. This amount will be deducted from your balance.', 'dokan-lite' ), wc_price( $balance ) );
            $this->show_error_messages( $message );
        }

        if ( dokan()->withdraw->has_pending_request( $current_user_id ) ) {
            $message = __( 'You already have pending withdraw request(s). Please submit your request after approval or cancellation of your previous request.', 'dokan-lite' );
            $this->show_error_messages( $message );
            return;
        }

        if ( ! dokan()->withdraw->has_withdraw_balance( $current_user_id ) ) {
            $message = __( 'You don\'t have sufficient balance for a withdraw request!', 'dokan-lite' );
            $this->show_error_messages( $message );
            return;
        }

        $payment_methods         = array_intersect( dokan_get_seller_active_withdraw_methods(), dokan_withdraw_get_active_methods() );
        $default_withdraw_method = dokan_withdraw_get_default_method( $current_user_id );
        dokan_get_template_part( 'withdraw/request-form', '', array(
            'amount'          => NumberUtil::round( $balance, wc_get_price_decimals(), PHP_ROUND_HALF_DOWN ), // we are setting 12.3456 to 12.34 not 12.35
            'withdraw_method' => $default_withdraw_method,
            'payment_methods' => $payment_methods,
        ) );
    }

    /**
     * Get pending withdraw request in dashboard listing.
     *
     * @since 3.3.1
     *
     * @return void
     */
    public function pending_withdraw_requests() {
        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            return;
        }

        $user_id           = dokan_get_current_user_id();
        $withdraw_requests = dokan()->withdraw->get_withdraw_requests( $user_id );

        dokan_get_template_part( 'withdraw/pending-request-listing-dashboard', '', array(
            'withdraw_requests' => $withdraw_requests,
        ) );
    }

    /**
     * Display withdraw listing.
     *
     * @since 3.3.1
     *
     * @param array $query_vars
     *
     * @return void
     */
    public function display_request_listing( $query_vars ) {
        if ( empty( $query_vars ) || ! array_key_exists( 'withdraw-requests', $query_vars ) ) {
            return;
        }

        if ( ! current_user_can( 'dokan_view_withdraw_menu' ) ) {
            dokan_get_template_part( 'global/no-permission' );
        } else {
            dokan_get_template_part( 'withdraw/withdraw' );
        }
    }

    /**
     * Set withdraw menu as active.
     *
     * @since 3.3.1
     *
     * @param string $active_menu
     * @param $request
     * @param array $active
     *
     * @return string
     */
    public function active_dashboard_nav_menu( $active_menu, $request, $active ) {
        if (  'withdraw-requests' !== $active_menu ) {
            return $active_menu;
        }
        return 'withdraw';
    }

    /**
     * Redirect to vendor dashboard.
     *
     * @since 3.3.1
     *
     * @return void
     */
    public function redirect_to_dashboard() {
        $current_url =  strtok( home_url( esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) ) , '?' );

        if ( dokan_get_navigation_url( 'withdraw' ) === $current_url || dokan_get_navigation_url( 'withdraw-requests' ) === $current_url ) {
            wp_safe_redirect( dokan_get_navigation_url( '/' ) );
            exit;
        }
    }
}
