<?php

namespace WeDevs\Dokan\Gateways\PayPal;

/**
 * Class Helper
 * @package WeDevs\Dokan\Gateways\PayPal
 *
 * @since DOKAN_LITE_SINCE
 *
 * @author weDevs
 */
class Helper {

    /**
     * Get list of supported webhook events
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public static function get_supported_webhook_events() {
        return apply_filters(
            'dokan_paypal_get_supported_webhook_events', [
                'CHECKOUT.ORDER.APPROVED'  => 'CheckoutOrderApproved',
                'CHECKOUT.ORDER.COMPLETED' => 'CheckoutOrderCompleted',
            ]
        );
    }

    /**
     * Get advanced credit card debit card supported countries
     *
     * @see https://developer.paypal.com/docs/business/checkout/reference/currency-availability-advanced-cards/
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public static function get_advanced_credit_card_debit_card_supported_countries() {
        $supported_countries = [
            'AU' => 'Australia',
            'AT' => 'Austria',
            'BE' => 'Belgium',
            'BG' => 'Bulgaria',
            'CA' => 'Canada',
            'CY' => 'Cyprus',
            'CZ' => 'Czech',
            'DK' => 'Denmark',
            'EE' => 'Estonia',
            'FI' => 'Finland',
            'FR' => 'France',
            'GR' => 'Greece',
            'HU' => 'Hungary',
            'IT' => 'Italy',
            'LV' => 'Latvia',
            'LI' => 'Liechtenstein',
            'LT' => 'Lithuania',
            'LU' => 'Luxembourg',
            'MT' => 'Malta',
            'NL' => 'Netherlands',
            'NO' => 'Norway',
            'PL' => 'Poland',
            'PT' => 'Portugal',
            'RO' => 'Romania',
            'SK' => 'Slovakia',
            'SI' => 'Slovenia',
            'ES' => 'Spain',
            'SE' => 'Sweden',
            'US' => 'United States',
            'GB' => 'United Kingdom',
        ];

        return apply_filters( 'dokan_paypal_supported_countries', $supported_countries );
    }

    /**
     * Get advanced credit card debit card supported currencies
     *
     * @see https://developer.paypal.com/docs/business/checkout/reference/currency-availability-advanced-cards/
     *
     * @param $country_code
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array|bool
     */
    public static function get_advanced_credit_card_debit_card_supported_currencies( $country_code ) {
        $supported_countries = static::get_advanced_credit_card_debit_card_supported_countries();

        if ( ! array_key_exists( $country_code, $supported_countries ) ) {
            return false;
        }

        foreach ( $supported_countries as $key => $country_name ) {
            if ( 'US' === $key ) {
                return static::get_advanced_credit_card_debit_card_us_supported_currencies();
            }

            return static::get_supported_currencies();
        }
    }

    /**
     * Get Paypal supported currencies except US
     * for advanced credit card debit card
     *
     * @see https://developer.paypal.com/docs/business/checkout/reference/currency-availability-advanced-cards/
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public static function get_supported_currencies() {
        return apply_filters(
            'dokan_paypal_supported_currencies', [
				'AUD',
				'CAD',
				'CHF',
				'CZK',
				'DKK',
				'EUR',
				'GBP',
				'HKD',
				'HUF',
				'JPY',
				'NOK',
				'NZD',
				'PLN',
				'SEK',
				'SGD',
				'USD',
			]
        );
    }

    /**
     * Get US supported currencies for advanced credit card debit card
     *
     * @see https://developer.paypal.com/docs/business/checkout/reference/currency-availability-advanced-cards/
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public static function get_advanced_credit_card_debit_card_us_supported_currencies() {
        return apply_filters(
            'dokan_paypal_us_supported_currencies', [
				'AUD',
				'CAD',
				'EUR',
				'GBP',
				'JPY',
				'USD',
			]
        );
    }

    /**
     * Unbranded credit card mode is allowed or not
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    public static function is_ucc_enabled() {
        $ucc_mode        = dokan()->payment_gateway->paypal_marketplace->paypal_wc_gateway->get_option( 'ucc_mode' );
        $wc_base_country = WC()->countries->get_base_country();

        if (
            'yes' === $ucc_mode &&
            array_key_exists( $wc_base_country, static::get_advanced_credit_card_debit_card_supported_countries() ) &&
            in_array( get_woocommerce_currency(), static::get_advanced_credit_card_debit_card_supported_currencies( $wc_base_country ), true )
        ) {
            return true;
        }

        return false;
    }

    /**
     * Check if the seller is enabled for receive paypal payment
     *
     * @param $seller_id
     *
     * @return bool
     */
    public static function is_seller_enable_for_receive_payment( $seller_id ) {
        $merchant_id     = get_user_meta( $seller_id, '_dokan_paypal_marketplace_merchant_id', true );
        $receive_payment = get_user_meta( $seller_id, '_dokan_paypal_enable_for_receive_payment', true );

        if ( $merchant_id && $receive_payment ) {
            return true;
        }

        return false;
    }

    /**
     * Check if ucc mode is enabled for all seller in the cart
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    public static function is_ucc_enabled_for_all_seller_in_cart() {
        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id = $item['data']->get_id();
            $seller_id  = get_post_field( 'post_author', $product_id );
            if ( ! get_user_meta( $seller_id, '_dokan_paypal_enable_for_ucc', true ) && static::is_ucc_enabled() ) {
                return false;
            }
        }

        return true;
    }
}
