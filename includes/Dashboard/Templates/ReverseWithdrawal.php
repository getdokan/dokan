<?php

namespace WeDevs\Dokan\Dashboard\Templates;

use WeDevs\Dokan\ReverseWithdrawal\Helper;
use WeDevs\Dokan\ReverseWithdrawal\SettingsHelper;
use WeDevs\Dokan\ReverseWithdrawal\Manager as ReverseWithdrawalManager;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Load Reverse Withdrawal Template
 *
 * @since   3.5.1
 *
 * @package Wedevs\Dokan\Dashboard\Templates
 */
class ReverseWithdrawal {
    /**
     * @since 3.5.1
     *
     * @var int $seller_id
     */
    protected $seller_id;

    /**
     * @since 3.5.1
     *
     * @var string[] $transaction_date
     */
    protected $transaction_date = [
        'from' => '',
        'to'   => '',
    ];

    /**
     * Class Constructor.
     *
     * @since 3.5.1
     */
    public function __construct() {
        // return if reverse withdrawal feature is disabled
        if ( ! SettingsHelper::is_enabled() ) {
            return;
        }

        if ( ! is_user_logged_in() ) {
            return;
        }

        // get current user id
        $this->seller_id = dokan_get_current_user_id();

        // check if current user is vendor
        if ( ! dokan_is_user_seller( $this->seller_id ) ) {
            return;
        }

        //enqueue required scripts
        add_action( 'wp_enqueue_scripts', [ $this, 'wp_enqueue_scripts' ], 10, 1 );
        add_filter( 'dokan_frontend_localize_script', [ $this, 'localized_scripts' ], 10, 1 );

        // display notice to pay reverse withdrawal balance
        add_action( 'dokan_dashboard_content_inside_before', [ $this, 'display_notice_on_vendor_dashboard' ] );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'display_payment_notice' ] );

        // display action taken notice
        add_action( 'dokan_dashboard_content_inside_before', [ $this, 'display_action_taken_notice' ] );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'display_action_taken_notice' ] );

        // render reverse withdrawal page content
        add_action( 'dokan_reverse_withdrawal_content_area_header', [ $this, 'render_header' ] );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'render_balance_section' ], 10 );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'render_filter_section' ], 10 );
        add_action( 'dokan_reverse_withdrawal_content', [ $this, 'render_transactions_table' ], 10 );
    }

    /**
     * Display notice on vendor dashboard page
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function display_notice_on_vendor_dashboard() {
        if ( SettingsHelper::display_payment_notice_on_vendor_dashboard() ) {
            $this->display_payment_notice();
        }
    }

    /**
     * Display notice on reverse withdrawal page
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function display_payment_notice() {
        // get vendor due status
        $due_status = Helper::get_vendor_due_status( $this->seller_id );
        if ( is_wp_error( $due_status ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => $due_status->get_error_message(),
                ]
            );

            return;
        }

        if ( false === $due_status['status'] ) {
            // we don't need to show any notices on vendor dashboard
            return;
        }

        if ( true === $due_status['status'] && 'immediate' === $due_status['due_date'] ) {
            // due period is over, we don't need to show any notices on vendor dashboard
            return;
        }

        // get formatted error messages
        $message = sprintf(
            // translators: 1) reverse withdrawal balance, 2) navigation url, 3) due status, 4) will be taken actions
            __( 'You have a reverse withdrawal balance of %1$s to be paid. Please <a href="%2$s">pay</a> it before %3$s. Below actions will be taken after the billing period is over. %4$s', 'dokan-lite' ),
            wc_price( $due_status['balance']['payable_amount'] ),
            dokan_get_navigation_url( 'reverse-withdrawal' ),
            $due_status['due_date'],
            Helper::get_formatted_failed_actions()
        );
        dokan_get_template_part(
            'global/dokan-error', '', [
                'deleted' => false,
                'message' => $message,
            ]
        );
    }

    /**
     * Display action taken notice
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function display_action_taken_notice() {
        // check if we already took action for this vendor
        if ( empty( Helper::get_failed_actions_by_vendor( $this->seller_id ) ) ) {
            return;
        }

        // get formatted error messages
        $message = sprintf(
            // translators: 1) reverse withdrawal failed actions, 2) reverse withdrawal navigation url
            __( 'Below actions have been taken due to unpaid reverse withdrawal balance: %1$s Kindly <a href="%2$s">pay</a> your due to start selling again.', 'dokan-lite' ),
            Helper::get_formatted_failed_actions_by_vendor( $this->seller_id ),
            dokan_get_navigation_url( 'reverse-withdrawal' )
        );
        dokan_get_template_part(
            'global/dokan-error', '', [
                'deleted' => false,
                'message' => $message,
            ]
        );
    }

    /**
     * Dokan Reverse Withdrawal header Template render
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function render_header() {
        dokan_get_template_part( 'reverse-withdrawal/header' );
    }

    /**
     * Load payment section
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function render_balance_section() {
        $args = Helper::get_vendor_balance();

        if ( is_wp_error( $args ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => $args->get_error_message(),
                ]
            );

            return;
        }

        dokan_get_template_part( 'reverse-withdrawal/reverse-balance', '', $args );
    }

    /**
     * Dokan Reverse Withdrawal header Template render
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function render_filter_section() {
        dokan_get_template_part( 'reverse-withdrawal/filters', '', [ 'trn_date' => $this->get_transaction_date() ] );
    }

    /**
     * Dokan Reverse Withdrawal header Template render
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function render_transactions_table() {
        $manager = new ReverseWithdrawalManager();

        $transactions = $manager->get_store_transactions(
            [
                'vendor_id' => $this->seller_id,
                'trn_date'  => $this->get_transaction_date(),
                'orderby'   => 'added',
                'order'     => 'DESC',
            ]
        );

        if ( is_wp_error( $transactions ) ) {
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => $transactions->get_error_message(),
                ]
            );

            return;
        }

        dokan_get_template_part( 'reverse-withdrawal/transaction-listing', '', [ 'transactions' => $transactions ] );
    }

    /**
     * Enqueue Frontend Scripts
     *
     * @since 3.5.1
     *
     * @param string $hook
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
        wp_enqueue_style( 'dokan-date-range-picker' );
    }

    /**
     * Localize Reverse Withdrawal Scripts
     *
     * @since 3.5.1
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
     * @since 3.5.1
     *
     * @return string[]
     */
    protected function get_transaction_date() {
        // get default transaction date
        $this->transaction_date = Helper::get_default_transaction_date();

        if ( isset( $_REQUEST['_nonce'] ) && wp_verify_nonce( sanitize_key( $_REQUEST['_nonce'] ), 'dokan_reverse_withdrawal_filter' ) ) {
            if ( ! empty( $_REQUEST['trn_date']['from'] ) ) {
                $this->transaction_date['from'] = sanitize_text_field( wp_unslash( $_REQUEST['trn_date']['from'] ) );
            }

            if ( ! empty( $_REQUEST['trn_date']['to'] ) ) {
                $this->transaction_date['to'] = sanitize_text_field( wp_unslash( $_REQUEST['trn_date']['to'] ) );
            }
        }

        return $this->transaction_date;
    }
}
