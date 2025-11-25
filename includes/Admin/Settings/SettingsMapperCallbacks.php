<?php

namespace WeDevs\Dokan\Admin\Settings;

use WeDevs\Dokan\Contracts\Hookable;

class SettingsMapperCallbacks implements Hookable {

    /**
     * Register hooks for WordPress.
     * This method will be called automatically to register the hooks.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_customer_details_visibility' ], 10, 4 );
        add_filter( 'dokan_settings_mapper_transform_value', [ $this, 'map_cod_payments' ], 10, 4 );
    }

    /**
     * Function for mapping customer visibility
     *
     * @since DOKAN_SINCE
     *
     * @param $value
     * @param $to_indicator
     * @param $old_key
     * @param $new_key
     *
     * @return string|null
     */
    public function map_customer_details_visibility( $value, $to_indicator, $old_key, $new_key ) {
        if ( 'dokan_selling.hide_customer_info' !== $old_key || 'general.marketplace.marketplace_settings.show_customer_details_to_vendors' !== $new_key || is_null( $value ) ) {
            return $value;
        }
        return $value === 'on' ? 'off' : 'on';
    }

    /**
     * Function for mapping COD Payments between old and new settings
     *
     * Maps legacy 'on'/'off' values to new 'exclude'/'include' values and vice versa.
     * Returns immediately if the value is null.
     *
     * @since DOKAN_SINCE
     *
     * @param string|null $value The current value to map
     * @param string      $to_indicator Direction of mapping: 'old_to_new' or 'new_to_old'
     * @param string      $old_key The legacy setting key
     * @param string      $new_key The new settings dot-path key
     *
     * @return string|null The mapped value or null if input is null
     */
    public function map_cod_payments( $value, $to_indicator, $old_key, $new_key ) {

        $old = 'dokan_withdraw.exclude_cod_payment';
        $new = 'transaction.withdraw_charge.cod_payments_section.cod_payments';

        if ( is_null( $value ) || $old !== $old_key || $new !== $new_key ) {
            return $value;
        }

        // OLD → NEW (off/on → include/exclude)
        if ( $to_indicator === 'old_to_new' ) {
            return $value === 'on' ? 'exclude' : 'include';
        }

        // NEW → OLD (include/exclude → off/on)
        if ( $to_indicator === 'new_to_old' ) {
            return $value === 'exclude' ? 'on' : 'off';
        }

        return $value;
    }
}
