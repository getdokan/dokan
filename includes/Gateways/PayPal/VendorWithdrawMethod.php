<?php

namespace WeDevs\Dokan\Gateways\PayPal;

/**
 * Class VendorWithdrawMethod
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class VendorWithdrawMethod {

    /**
     * RegisterWithdrawMethod constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        add_filter( 'dokan_withdraw_methods', [ $this, 'register_methods' ] );
        add_action( 'dokan_payment_settings_before_form', [ $this, 'handle_error_message' ], 10, 2 );
    }

    /**
     * Register methods
     *
     * @param array $methods
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function register_methods( $methods ) {
        $methods['dokan-paypal-marketplace'] = [
            'title'    => __( 'Dokan PayPal Marketplace', 'dokan-lite' ),
            'callback' => [ $this, 'paypal_connect_button' ],
        ];

        return $methods;
    }

    /**
     * This enables dokan vendors to connect their PayPal account to the site PayPal gateway account
     *
     * @param $store_settings
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function paypal_connect_button( $store_settings ) {
        global $current_user;

        $email = isset( $store_settings['payment']['dokan_paypal_marketplace']['email'] ) ? esc_attr( $store_settings['payment']['dokan_paypal_marketplace']['email'] ) : $current_user->user_email;

        $is_seller_enabled = Helper::is_seller_enable_for_receive_payment( get_current_user_id() );
        $button_text       = $is_seller_enabled ? __( 'Connected', 'dokan-lite' ) : __( 'Sign up for PayPal', 'dokan-lite' );

        $merchant_id           = get_user_meta( get_current_user_id(), '_dokan_paypal_marketplace_merchant_id', true );
        $primary_email         = get_user_meta( get_current_user_id(), '_dokan_paypal_primary_email_confirmed', true );
        $nonce                 = wp_create_nonce( 'paypal-marketplace-connect' );
        $connect_to_paypal_url = add_query_arg(
            [
                'action'   => 'paypal-marketplace-connect',
                '_wpnonce' => $nonce,
            ],
            dokan_get_navigation_url( 'settings/payment' )
        );

        dokan_get_template(
            'gateways/paypal/vendor-settings-payment.php',
            [
                'email'           => $email,
                'button_text'     => $button_text,
                'button_disabled' => $is_seller_enabled ? true : false,
                'button_class'    => $is_seller_enabled ? 'dokan-btn-success disabled' : '',
                'url'             => $connect_to_paypal_url,
                'nonce'           => $nonce,
                'primary_email'   => $primary_email,
                'merchant_id'     => $merchant_id,
                'ajax_url'        => admin_url( 'admin-ajax.php' ),
            ]
        );
    }

    /**
     * Handle PayPal error message for payment settings
     *
     * @param $current_user
     * @param $profile_info
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function handle_error_message( $current_user, $profile_info ) {
        $_get_data = wp_unslash( $_GET );//phpcs:ignore WordPress.Security.NonceVerification.Recommended

        if ( isset( $_get_data['status'] ) && 'seller_error' === sanitize_text_field( $_get_data['status'] ) ) {
            echo '<div class=\'dokan-error\'>' . $_get_data['message'] . '</div>';
        }
    }
}
