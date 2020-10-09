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
        return apply_filters( 'dokan_paypal_supported_currencies', [
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
        ] );
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
        return apply_filters( 'dokan_paypal_us_supported_currencies', [
            'AUD',
            'CAD',
            'EUR',
            'GBP',
            'JPY',
            'USD',
        ] );
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
     * 3DS enabled for paypal
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    public static function is_3ds_enabled() {
        $_3ds_mode = dokan()->payment_gateway->paypal_marketplace->paypal_wc_gateway->get_option( '3ds_mode' );

        if ( 'yes' === $_3ds_mode && static::is_ucc_enabled() ) {
            return true;
        }

        return false;
    }
}
