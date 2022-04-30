<?php
namespace WeDevs\Dokan\Dashboard\Templates;

use WeDevs\Dokan\ReverseWithdrawal\Helper;
use WeDevs\Dokan\ReverseWithdrawal\Settings;
use WeDevs\Dokan\ReverseWithdrawal\Manager as ReverseWithdrawalManager;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class ReverseWithdrawal {
    /**
     * @var int $seller_id
     *
     * @since DOKAN_SINCE
     */
    protected $seller_id;

    /**
     * @var string[] $transaction_date
     *
     * @since DOKAN_SINCE
     */
    protected $transaction_date = [
        'from' => '',
        'to'   => ''
    ];

    /**
     * Class Constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        // return if reverse withdrawal feature is disabled
        if ( ! Settings::is_enabled() ) {
            return;
        }

        if ( ! is_user_logged_in() ) {
            return;
        }

        // get current user id
        $this->seller_id = dokan_get_current_user_id();

        // check if current user is vendor
        if ( ! dokan_is_user_seller( $this->seller_id) ) {
            return;
        }

        //enqueue required scripts
        add_action( 'wp_enqueue_scripts', [ $this, 'wp_enqueue_scripts' ], 10, 1 );
        add_filter( 'dokan_frontend_localize_script', [ $this, 'localized_scripts' ], 10, 1 );

        // display notice to pay reverse withdrawal balance
        add_action( 'dokan_dashboard_content_inside_before', [ $this, 'display_notice_on_vendor_dashboard' ] );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'display_notice_on_vendor_dashboard' ] );

        add_action( 'dokan_reverse_withdrawal_content_area_header', [ $this, 'render_header' ] );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'load_balance_section' ], 10 );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'load_filter_section' ], 10 );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'load_transactions_table' ], 10 );
    }

    public function display_notice_on_vendor_dashboard() {
        // get vendor due status
        $due_status = Helper::get_vendor_due_status( $this->seller_id );
        if ( is_wp_error( $due_status ) ) {
            dokan_get_template_part( 'global/dokan-error', '', [ 'deleted' => false, 'message' => $due_status->get_error_message() ] );
            return;
        }

        if (  $due_status['status'] === false ) {
            // we don't need to show any notices on vendor dashboard
            return;
        }

        if (  $due_status['status'] === true && $due_status['due_date'] === 'immediate' ) {
            // due period is over, we don't need to show any notices on vendor dashboard
            return;
        }

        // get formatted error messages
        $message = sprintf( __( 'You have a reverse withdrawal balance of %s to be paid. Please <a href="%s">pay</a> it before %s. Below actions will be taken after the billing period is over. %s', 'dokan' ),
            wc_price( $due_status['balance']['payable_amount'] ),
            dokan_get_navigation_url( 'reverse-withdrawal' ),
            $due_status['due_date'],
            Helper::get_formatted_failed_actions()
        );
        dokan_get_template_part( 'global/dokan-error', '', [ 'deleted' => false, 'message' => $message ] );
    }

    /**
     * Load payment section
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_balance_section() {
        $args = Helper::get_vendor_balance();

        if ( is_wp_error( $args ) ) {
            dokan_get_template_part( 'global/dokan-error', '', [ 'deleted' => false, 'message' => $args->get_error_message() ] );
        }

        dokan_get_template_part( 'reverse-withdrawal/reverse-balance', '', $args );
    }

    /**
     * Dokan Reverse Withdrawal header Template render
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function render_header() {
        dokan_get_template_part( 'reverse-withdrawal/header' );
    }

    /**
     * Dokan Reverse Withdrawal header Template render
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_filter_section() {
        dokan_get_template_part( 'reverse-withdrawal/filters', '', [ 'trn_date' => $this->get_transaction_date() ] );
    }

    /**
     * Dokan Reverse Withdrawal header Template render
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_transactions_table() {
        $manager = new ReverseWithdrawalManager();

        $transactions = $manager->get_store_transactions( [
            'vendor_id' => $this->seller_id,
            'trn_date'  => $this->get_transaction_date(),
            'orderby'   => 'added',
            'order'     => 'DESC',
        ] );

        dokan_get_template_part( 'reverse-withdrawal/transaction-listing', '', [ 'transactions' => $transactions ] );
    }

    /**
     * Enqueue Frontend Scripts
     *
     * @param string $hook
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function wp_enqueue_scripts( $hook ) {
        global $wp;

        if ( ! dokan_is_seller_dashboard() || ! isset( $wp->query_vars['reverse-withdrawal'] ) ) {
            return;
        }

        // load frontend scripts
        wp_enqueue_script( 'dokan-reverse-withdrawal' );
        wp_enqueue_style( 'dokan-reverse-withdrawal' );
        wp_enqueue_style( 'dokan-date-range-picker');
    }

    /**
     * Localize Reverse Withdrawal Scripts
     *
     * @since DOKAN_SINCE
     *
     * @param array $localize_script
     *
     * @return array
     */
    public function localized_scripts( $localize_script ) {
        $localize_script['reverse_withdrawal'] = [
            'reverse_pay_msg'  => esc_attr__( 'Are you sure you want to pay this amount?', 'dokan-lite' ),
            'nonce'            => wp_create_nonce( 'dokan_reverse_withdrawal_payment' ),
            'on_error_title'   => esc_html__( 'Something went wrong.', 'dokan-lite' ),
            'on_success_title' => esc_html__( 'Success.', 'dokan-lite' ),
            'checkout_url'     => wc_get_checkout_url(),
        ];

        return $localize_script;
    }

    /**
     * Get transaction date
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    protected function get_transaction_date() {
        // get default transaction date
        $this->transaction_date['from'] = dokan_current_datetime()->modify( '-1 month' )->format( 'Y-m-d' );
        $this->transaction_date['to']   = dokan_current_datetime()->format( 'Y-m-d' );

        if ( isset( $_GET['_nonce'] ) && wp_verify_nonce( $_GET['_nonce'], 'dokan_reverse_withdrawal_filter' ) ) {
            if ( ! empty( $_GET['trn_date']['from'] ) ) {
                $this->transaction_date['from'] = sanitize_text_field( wp_unslash( $_GET['trn_date']['from'] ) );
            }

            if ( ! empty( $_GET['trn_date']['to'] ) ) {
                $this->transaction_date['to'] = sanitize_text_field( wp_unslash( $_GET['trn_date']['to'] ) );
            }
        }

        return $this->transaction_date;
    }
}
