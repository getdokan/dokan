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
                'CHECKOUT.ORDER.APPROVED'          => 'CheckoutOrderApproved',
                'CHECKOUT.ORDER.COMPLETED'         => 'CheckoutOrderCompleted',
                'MERCHANT.PARTNER-CONSENT.REVOKED' => 'MerchantPartnerConsentRevoked',
            ]
        );
    }

    /**
     * Get advanced credit card debit card supported countries (UCC/Unbranded payments)
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

        return apply_filters( 'dokan_paypal_advanced_credit_card_debit_card_supported_countries', $supported_countries );
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

        if ( 'US' === $country_code ) {
            return static::get_advanced_credit_card_debit_card_us_supported_currencies();
        }

        return static::get_supported_currencies();
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
        $button_type     = dokan()->payment_gateway->paypal_marketplace->paypal_wc_gateway->get_option( 'button_type' );
        $ucc_mode        = dokan()->payment_gateway->paypal_marketplace->paypal_wc_gateway->get_option( 'ucc_mode' );
        $wc_base_country = WC()->countries->get_base_country();

        if (
            'smart' === $button_type &&
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
     * @since DOKAN_LITE_SINCE
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
        $ucc_enabled = static::is_ucc_enabled();

        if ( ! $ucc_enabled ) {
            return false;
        }

        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id = $item['data']->get_id();
            $seller_id  = get_post_field( 'post_author', $product_id );

            if ( $ucc_enabled && ! get_user_meta( $seller_id, '_dokan_paypal_enable_for_ucc', true ) ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get branded payment supported countries
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public static function get_branded_payment_supported_countries() {
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
            'DE' => 'Germany',
            'HU' => 'Hungary',
            'IE' => 'Ireland',
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

        return apply_filters( 'dokan_paypal_branded_payment_supported_countries', $supported_countries );
    }

    /**
     * Get PayPal product type based on country
     *
     * @param $country_code
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool|string
     */
    public static function get_product_type( $country_code ) {
        $branded_ucc_supported_countries = static::get_advanced_credit_card_debit_card_supported_countries();
        $branded_supported_countries     = static::get_branded_payment_supported_countries();

        if ( ! array_key_exists( $country_code, array_merge( $branded_ucc_supported_countries, $branded_supported_countries ) ) ) {
            return false;
        }

        if ( array_key_exists( $country_code, $branded_ucc_supported_countries ) ) {
            return 'PPCP';
        }

        if ( array_key_exists( $country_code, $branded_supported_countries ) ) {
            return 'EXPRESS_CHECKOUT';
        }
    }

    /**
     * Get PayPal gateway id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public static function get_gateway_id() {
        return 'dokan_paypal_marketplace';
    }

    /**
     * Log PayPal error data with debug id
     *
     * @param $id
     * @param $error
     * @param $meta_key
     *
     * @param string $context
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public static function log_paypal_error( $id, $error, $meta_key, $context = 'post' ) {
        $error_data = $error->get_error_data();

        //store paypal debug id
        switch ( $context ) {
            case 'post':
                update_post_meta( $id, "_dokan_paypal_{$meta_key}_debug_id", $error_data['paypal_debug_id'] );

                break;
            case 'user':
                update_user_meta( $id, "_dokan_paypal_{$meta_key}_debug_id", $error_data['paypal_debug_id'] );

                break;
        }

        dokan_log( "[Dokan PayPal Marketplace] $meta_key Error:\n" . print_r( $error, true ), 'error' );
    }

    /**
     * Get user id by merchant id
     *
     * @param $merchant_id
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return int
     */
    public static function get_user_id( $merchant_id ) {
        global $wpdb;

        $user_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT `user_id` FROM $wpdb->usermeta WHERE `meta_key` = %s AND `meta_value`= %s",
                '_dokan_paypal_marketplace_merchant_id',
                $merchant_id
            )
        );

        return absint( $user_id );
    }

    /**
     * Check if the paypal payment method is enabled or not
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return bool
     */
    public static function is_paypal_enabled() {
        $paypal_enabled = dokan()->payment_gateway->paypal_marketplace->paypal_wc_gateway->get_option( 'enabled' );

        if ( 'no' === $paypal_enabled ) {
            return false;
        }

        return true;
    }

    /**
     * Get Percentage of from a price
     *
     * @param $price
     * @param $extra_amount
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return float|int
     */
    public static function get_percentage( $price, $extra_amount ) {
        $percentage = ( $extra_amount * 100 ) / $price;

        return $percentage;
    }

    /**
     * Get webhook events for notification
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public static function get_webhook_events_for_notification() {
        $events = array_keys( static::get_supported_webhook_events() );

        $events = array_merge( $events, [
            'BILLING.SUBSCRIPTION.ACTIVATED',
            'BILLING.SUBSCRIPTION.CANCELLED',
            'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
            'PAYMENT.SALE.COMPLETED',
        ] );

        $notification_events = array_map( function ( $event ) {
            return [ 'name' => $event ];
        }, $events );

        return $notification_events;
    }

    /**
     * Get settings of the gateway
     *
     * @param null $key
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return mixed|void
     */
    public static function get_settings( $key = null ) {
        $settings = get_option( 'woocommerce_' . static::get_gateway_id() . '_settings', [] );

        if ( $key && isset( $settings[ $key ] ) ) {
            return $settings[ $key ];
        }

        return $settings;
    }
}
