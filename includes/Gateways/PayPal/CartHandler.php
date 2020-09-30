<?php

namespace WeDevs\Dokan\Gateways\PayPal;

use WeDevs\Dokan\Gateways\PayPal\PaymentMethod\DokanPayPal;

/**
 * Class CartHandler
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class CartHandler extends DokanPayPal {

    /**
     * CartHandler constructor.
     *
     * @since DOKAN_LITE_SINCE
     */
    public function __construct() {
        parent::__construct();

        add_action( 'woocommerce_after_checkout_validation', [ $this, 'after_checkout_validation' ], 15, 2 );

        //show paypal smart payment buttons
//        add_action( 'woocommerce_review_order_after_submit', [ $this, 'display_paypal_button' ] );
//        add_action( 'wp_enqueue_scripts', [ $this, 'payment_scripts' ] );
    }

    /**
     * Checkout page script added
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function payment_scripts() {
        if ( ! is_cart() && ! is_checkout() && ! isset( $_GET['pay_for_order'] ) ) {
            return;
        }

        // if our payment gateway is disabled
        if ( 'no' === $this->enabled ) {
            return;
        }

        //loading this scripts only in checkout page
        if ( is_checkout() || is_checkout_pay_page() ) {

            if ( 'yes' === $this->get_option( 'test_mode' ) ) {
                $app_user = $this->get_option( 'test_app_user' );
            } else {
                $app_user = $this->get_option( 'app_user' );
            }

            $partner_id = $this->get_option( 'partner_id' );

            $paypal_js_sdk_url = esc_url( "https://www.paypal.com/sdk/js?client-id={$app_user}&merchant-id={$partner_id}&currency=USD&intent=capture" );

            wp_enqueue_script( 'dokan_paypal_sdk', $paypal_js_sdk_url, [], null, true );

            //add BN code to script
            add_filter( 'script_loader_tag', [ $this, 'add_bn_code_to_script' ], 10, 3 );
        }
    }

    /**
     * Add bn code to paypal script
     *
     * @param $tag
     * @param $handle
     * @param $source
     *
     * @return string
     */
    public function add_bn_code_to_script( $tag, $handle, $source ) {
        if ( 'dokan_paypal_sdk' === $handle ) {
            $tag = '<script type="text/javascript" src="' . $source . '" id="' . $handle . '-js" data-partner-attribution-id="weDevs_SP_Dokan"></script>';
        }

        return $tag;
    }

    /**
     * Display PayPal button on the checkout page order review.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function display_paypal_button() {
        ?>
        <div id="paypal-button-container"></div>

        <script>paypal.Buttons().render('#paypal-button-container');</script>
        <?php
    }

    /**
     * Validation after checkout
     *
     * @param $data
     * @param $errors
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function after_checkout_validation( $data, $errors ) {
        if ( 'yes' === $this->get_option( 'allow_non_connected_seller' ) ) {
            return;
        }

        if ( $this->id !== $data['payment_method'] ) {
            return;
        }

        $available_vendors = [];
        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id                                                               = $item['data']->get_id();
            $available_vendors[ get_post_field( 'post_author', $product_id ) ][] = $item['data'];
        }

        foreach ( array_keys( $available_vendors ) as $vendor_id ) {
            $merchant_id = get_user_meta( $vendor_id, '_dokan_paypal_marketplace_merchant_id', true );

            if ( ! $merchant_id ) {
                $vendor      = dokan()->vendor->get( $vendor_id );
                $vendor_name = sprintf( '<a href="%s">%s</a>', esc_url( $vendor->get_shop_url() ), $vendor->get_shop_name() );

                $vendor_products = [];
                foreach ( $available_vendors[ $vendor_id ] as $product ) {
                    $vendor_products[] = sprintf( '<a href="%s">%s</a>', $product->get_permalink(), $product->get_name() );
                }

                $errors->add(
                    'paypal-not-configured',
                    sprintf(
                        __( '<strong>Error!</strong> You cannot complete your purchase until <strong>%s</strong> has connected PayPal as a payment gateway. Please remove %s to continue.', 'dokan-lite' ),
                        $vendor_name,
                        implode( ', ', $vendor_products )
                    )
                );
            }
        }
    }
}
