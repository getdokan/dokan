<?php

namespace WeDevs\Dokan\CJDropshipping;

/**
 * Reads the admin's CJ Dropshipping settings.
 *
 * @since DOKAN_SINCE
 */
class Settings {

    public const OPTION = 'dokan_cj_dropshipping';

    /**
     * Get one setting from the CJ settings group.
     *
     * @since DOKAN_SINCE
     *
     * @param string $key           Setting key.
     * @param mixed  $default_value Fallback when the setting was never saved.
     *
     * @return mixed
     */
    public static function get( string $key, $default_value = '' ) {
        return dokan_get_option( $key, self::OPTION, $default_value );
    }

    /**
     * Whether the admin has switched CJ Dropshipping on.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_enabled(): bool {
        return 'on' === self::get( 'enabled', 'off' );
    }

    /**
     * Markup percentage suggested on the import form.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public static function default_markup(): float {
        return max( 0.0, (float) self::get( 'default_markup', 50 ) );
    }

    /**
     * Destination countries where CJ items can't be sold (E4).
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    public static function blocked_countries(): array {
        $eu = [ 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE' ];

        return apply_filters( 'dokan_cj_blocked_countries', array_merge( $eu, [ 'GB', 'AU' ] ) );
    }

    /**
     * Countries CJ takes no disputes for; CJ items still ship there at the vendor's risk.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    public static function no_cover_countries(): array {
        // From CJ's Refund, Resend and Returns Policy, "Destination Limits".
        $countries = explode(
            ' ',
            'AD AF AG AI AL AM AO AR AS AW AZ BA BB BD BF BH BI BJ BL BM '
            . 'BN BO BQ BS BT BW BY BZ CD CF CG CI CK CM CR CU CV CW DJ DM '
            . 'DO DZ EC ER ET FJ FK FM FO GA GD GE GF GG GH GI GL GM GN GP '
            . 'GQ GT GU GW GY HN HT IQ IR IS JE JM JO KE KG KH KI KM KN KP '
            . 'KW KY KZ LA LB LC LI LK LR LS LY MA MC MD ME MF MG MH MK ML '
            . 'MM MN MP MQ MR MS MU MV MW MZ NA NC NE NG NI NP NR NU OM PA '
            . 'PE PF PG PK PW PY QA RE RO RS RW SB SC SD SH SL SM SN SO SR '
            . 'SS ST SV SY SZ TC TD TG TJ TL TM TN TO TT TV TZ UA UG UY UZ '
            . 'VA VC VE VG VI VN VU WS XK YE YT ZM ZW'
        );

        return apply_filters( 'dokan_cj_no_cover_countries', $countries );
    }

    /**
     * Whether CJ takes no disputes for a shipping method, whatever the destination.
     *
     * @since DOKAN_SINCE
     *
     * @param string $method CJ shipping method name.
     *
     * @return bool
     */
    public static function is_no_cover_method( string $method ): bool {
        // From CJ's Refund, Resend and Returns Policy, "Shipping Method Limits".
        $methods = apply_filters( 'dokan_cj_no_cover_methods', [ 'PostNL', 'Electric PostNL', 'CJPacket Eub', 'CJPacket Postal Route', 'CJPacket Postal', 'CJPacket Railway Economy' ] );

        return in_array( strtolower( trim( $method ) ), array_map( 'strtolower', (array) $methods ), true );
    }

    /**
     * Whether only CJ's own shelf counts as stock; default counts supplier stock too (F6).
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function counts_warehouse_only(): bool {
        return 'warehouse' === self::get( 'stock_source', 'all' );
    }

    /**
     * Whether buyers see "Ships from <country>" instead of "Standard shipping".
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function shows_warehouse_country(): bool {
        return 'on' === self::get( 'show_warehouse_country', 'off' );
    }

    /**
     * Convert a CJ US dollar amount to the store currency, with the safety margin.
     *
     * @since DOKAN_SINCE
     *
     * @param float $usd Amount in US dollars.
     *
     * @return float
     */
    public static function to_store_currency( float $usd ): float {
        if ( 'USD' === get_woocommerce_currency() ) {
            return $usd;
        }

        $rate   = max( 0.0, (float) self::get( 'usd_rate', 1 ) );
        $margin = max( 0.0, (float) self::get( 'currency_margin', 3 ) );

        return (float) apply_filters( 'dokan_cj_to_store_currency', $usd * $rate * ( 1 + $margin / 100 ), $usd );
    }

    /**
     * Default text vendors confirm before selling CJ products (E8).
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function default_vendor_terms(): string {
        return implode(
            "\n",
            [
                __( 'You pay CJ for each order when you place it on CJ. Your earning reaches your balance only when the order is completed, and you withdraw it under the marketplace\'s normal payout rules.', 'dokan-lite' ),
                __( 'The CJ shipping price at checkout is an estimate. If CJ charges more when you place the order, you pay the difference.', 'dokan-lite' ),
                __( 'If a buyer is refunded, getting your money back from CJ is up to you, through CJ\'s own dispute process.', 'dokan-lite' ),
                __( 'CJ takes no disputes for orders to some countries or sent with some shipping methods. Those orders are marked "No cover", and you carry the full cost of any problem with them.', 'dokan-lite' ),
                __( 'To fulfil an order, you give the buyer\'s name and address to CJ.', 'dokan-lite' ),
            ]
        );
    }

    /**
     * Text vendors confirm before selling CJ products; the admin can edit it (E8).
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function vendor_terms(): string {
        $text = trim( (string) self::get( 'vendor_terms', '' ) );

        return '' !== $text ? $text : self::default_vendor_terms();
    }

    /**
     * Units held back from CJ's warehouse stock before selling (C6).
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public static function stock_buffer(): int {
        return (int) apply_filters( 'dokan_cj_stock_buffer', 5 );
    }
}
