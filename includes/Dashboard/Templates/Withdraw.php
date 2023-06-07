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
            add_action( 'template_redirect', [ $this, 'redirect_to_dashboard' ], 1 );
            return;
        }

        add_action( 'dokan_load_custom_template', [ $this, 'display_request_listing' ] );
        add_filter( 'dokan_dashboard_nav_active', [ $this, 'active_dashboard_nav_menu' ], 10, 3 );
        add_action( 'template_redirect', [ $this, 'handle_request' ] );
        add_action( 'dokan_withdraw_content_inside_before', [ $this, 'show_seller_enable_message' ] );
        add_action( 'dokan_withdraw_content_area_header', [ $this, 'withdraw_header_render' ] );
        add_action( 'dokan_withdraw_content', [ $this, 'show_alert_messages' ], 10 );
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
            $this->current_status = 'pending';
        }
        if ( isset( $_GET['_withdraw_link_nonce'], $_GET['type'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_withdraw_link_nonce'] ) ), 'dokan_withdraw_requests_link' ) ) {
            $this->current_status = sanitize_text_field( wp_unslash( $_GET['type'] ) );
        }

        return $this->current_status;
    }

    /**
     * Handle Withdraw form submission
     *
     * @return void
     */
    public function handle_request() {
        if ( ! isset( $_REQUEST['_wpnonce'], $_REQUEST['dokan_handle_withdraw_request'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_REQUEST['_wpnonce'] ) ), 'dokan_cancel_withdraw' ) ) {
            return;
        }

        if ( 'cancel' === sanitize_text_field( wp_unslash( $_REQUEST['dokan_handle_withdraw_request'] ) ) ) {
            $this->handle_cancel_request();
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
        if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'dokan_cancel_withdraw' ) ) {
            $this->add_error( esc_html__( 'Are you cheating?', 'dokan-lite' ) );
            return;
        }

        if ( ! current_user_can( 'dokan_manage_withdraw' ) ) {
            $this->add_error( esc_html__( 'You have no permission to do this action', 'dokan-lite' ) );
            return;
        }

        $withdraw_id = isset( $_GET['id'] ) ? absint( wp_unslash( $_GET['id'] ) ) : 0;
        $user_id     = get_current_user_id();

        if ( empty( $withdraw_id ) ) {
            $this->add_error( esc_html__( 'Missing withdraw id.', 'dokan-lite' ) );
            return;
        }

        if ( $this->errors->has_errors() ) {
            return;
        }

        if ( ! dokan_is_seller_enabled( $user_id ) ) {
            $this->add_error( esc_html__( 'Your account is not enabled for selling, please contact the admin', 'dokan-lite' ) );
            return;
        }

        $args = array(
            'user_id' => $user_id,
            'id'      => $withdraw_id,
        );

        $validate_request = dokan()->withdraw->is_valid_cancellation_request( $args );

        if ( is_wp_error( $validate_request ) ) {
            $this->add_error( $validate_request->get_error_message(), $validate_request->get_code() );
            return;
        }

        $withdraw = dokan()
            ->withdraw
            ->get( $withdraw_id )
            ->set_status( dokan()->withdraw->get_status_code( 'cancelled' ) )
            ->save();

        if ( is_wp_error( $withdraw ) ) {
            $this->add_error( $withdraw->get_error_message(), $withdraw->get_code() );
            return;
        }

        wp_safe_redirect(
            esc_url(
                add_query_arg(
                    [
                        'message' => 'request_cancelled',
                        'type'    => 'cancelled',
                        '_withdraw_link_nonce' => wp_create_nonce( 'dokan_withdraw_requests_link' ),
                    ],
                    dokan_get_navigation_url( 'withdraw-requests' )
                ),
                'dokan_withdraw_requests_link',
                '_withdraw_link_nonce'
            )
        );
        exit();
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
            $messages = (array) $messages;
        }

        foreach ( $messages as $message ) {
            dokan_get_template_part(
                'global/dokan-error',
                '',
                [
                    'deleted' => $deleted,
                    'message' => $message,
                ]
            );
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
        dokan_get_template_part(
            'global/dokan-warning',
            '',
            [
                'deleted' => $deleted,
                'message' => $message,
            ]
        );
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

        dokan_get_template_part(
            'withdraw/status-listing',
            '',
            [
                'current' => $this->get_current_status(),
            ]
        );
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

        if ( $this->get_current_status() === 'pending' ) {
            $this->withdraw_requests( dokan_get_current_user_id() );
        } elseif ( $this->get_current_status() === 'approved' ) {
            $this->user_approved_withdraws( dokan_get_current_user_id() );
        } elseif ( $this->get_current_status() === 'cancelled' ) {
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

        dokan_get_template_part(
            'withdraw/pending-request-listing', '', array(
				'withdraw_requests' => $withdraw_requests,
            )
        );
    }

    /**
     * Show alert messages
     *
     * @return void
     */
    public function show_alert_messages() {
        $type     = '';
        $template = 'global/dokan-success';
        $message  = '';

        if ( isset( $_REQUEST['_withdraw_link_nonce'], $_REQUEST['message'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_REQUEST['_withdraw_link_nonce'] ) ), 'dokan_withdraw_requests_link' ) ) {
            $type = sanitize_text_field( wp_unslash( $_REQUEST['message'] ) );
        }

        switch ( $type ) {
            case 'request_cancelled':
                $message = __( 'Your request has been cancelled successfully!', 'dokan-lite' );
                break;

            case 'request_success':
                $message = __( 'Your request has been received successfully and being reviewed!', 'dokan-lite' );
                break;

            case 'request_error':
                $message  = __( 'Unknown error!', 'dokan-lite' );
                $template = 'global/dokan-error';
                break;
        }

        if ( ! empty( $message ) ) {
            dokan_get_template_part(
                $template,
                '',
                [
                    'deleted' => true,
                    'message' => $message,
                ]
            );
        }
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
            dokan_get_template_part(
                'withdraw/approved-request-listing',
                '',
                [
                    'requests' => $requests,
                ]
            );
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
            dokan_get_template_part(
                'withdraw/cancelled-request-listing',
                '',
                [
                    'requests' => $requests,
                ]
            );
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

        $last_withdraw = dokan()->withdraw->get_withdraw_requests( dokan_get_current_user_id(), 1, 1 );
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
            // translators: 1) Negative withdrawal balance amount
            $message = sprintf( __( 'You have already withdrawn %s. This amount will be deducted from your balance.', 'dokan-lite' ), wc_format_decimal( $balance ) );
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
        dokan_get_template_part(
            'withdraw/request-form', '', array(
				'amount'          => NumberUtil::round( $balance, wc_get_price_decimals(), PHP_ROUND_HALF_DOWN ), // we are setting 12.3456 to 12.34 not 12.35
				'withdraw_method' => $default_withdraw_method,
				'payment_methods' => $payment_methods,
            )
        );
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

        dokan_get_template_part(
            'withdraw/pending-request-listing-dashboard', '', array(
				'withdraw_requests' => $withdraw_requests,
            )
        );
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
        if ( 'withdraw-requests' !== $active_menu ) {
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
        global $wp;
        // check if we are in
        if ( ! isset( $wp->query_vars['withdraw'] ) && ! isset( $wp->query_vars['withdraw-requests'] ) ) {
            return;
        }
        wp_safe_redirect( dokan_get_navigation_url() );
        exit();
    }
}
