<?php

namespace WeDevs\Dokan\Gateways\PayPal;

use WeDevs\Dokan\Traits\ChainableContainer;

/**
 * Class Manager
 * @since DOKAN_LITE_SINCE
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 */
class Manager {

    use ChainableContainer;

    /**
     * PayPal Manager constructor
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        $this->register_gateway();
        $this->set_controllers();

        add_action( 'template_redirect', [ $this, 'handle_paypal_marketplace_connect' ], 10 );
    }

    /**
     * Set controllers
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    private function set_controllers() {
        $this->container['vendor_withdraw_methods'] = new VendorWithdrawMethod();
        $this->container['dokan_paypal_wc_gateway'] = new DokanPayPal();
    }

    /**
     * Register PayPal gateway
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function register_gateway() {
        \WeDevs\Dokan\Gateways\Manager::set_gateway('\WeDevs\Dokan\Gateways\PayPal\DokanPayPal');
    }

    /**
     * @since DOKAN_LITE_SINCE
     */
    public function handle_paypal_marketplace_connect() {
        if ( ! dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return;
        }

        if ( ! isset( $_GET['action'] ) && $_GET['action'] !== 'paypal-marketplace-connect' ) {
            return;
        }

        $get_data = wp_unslash( $_GET );

        if ( ! wp_verify_nonce( $get_data['_wpnonce'], 'paypal-marketplace-connect' ) ) {
            wp_safe_redirect( add_query_arg( [ 'message' => 'error' ], dokan_get_navigation_url( 'settings/payment' ) ) );
            exit;
        }

        $email_address = sanitize_text_field( $_GET['vendor_paypal_email_address'] );

        $processor = new Processor();
        $paypal_url = $processor->create_partner_referral( $email_address );

        if ( is_wp_error( $paypal_url ) ) {
            wp_safe_redirect( add_query_arg( [ 'status' => 'paypal-error', 'message' => $paypal_url['error'] ], dokan_get_navigation_url( 'settings/payment' ) ) );
            exit;
        }

        wp_redirect( $paypal_url );
        exit;
    }
}
