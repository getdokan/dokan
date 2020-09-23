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
            'title'    => __( 'PayPal Marketplace', 'dokan-lite' ),
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

        $email = isset( $store_settings['payment']['paypal']['email'] ) ? esc_attr( $store_settings['payment']['paypal']['email'] ) : $current_user->user_email;

        $partner_id = isset( $store_settings['payment']['paypal']['partner_id'] ) ? esc_attr( $store_settings['payment']['paypal']['partner_id'] ) : '';

        $merchant_id = get_user_meta( get_current_user_id(), '_dokan_paypal_marketplace_merchant_id', true );
        $button_text = $merchant_id ? __( 'Connected', 'dokan-lite' ) : __( 'Connect', 'dokan-lite' );

        dokan_get_template(
            'gateways/paypal/vendor-settings-payment.php',
            [
                'email'           => $email,
                'partner_id'      => $partner_id,
                'button_text'     => $button_text,
                'button_disabled' => $merchant_id ? true : false,
                'button_class'    => $merchant_id ? 'dokan-btn-success disabled' : '',
            ]
        );
    }
}
