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
    }

    /**
     * Function for mapping customer visibility
     * @since DOKAN_SINCE
     * @param $value
     * @param $to_indicator
     * @param $old_key
     * @param $new_key
     * @return string
     */
    public function map_customer_details_visibility( $value, $to_indicator, $old_key, $new_key ) {
        if ( 'dokan_selling.hide_customer_info' !== $old_key || 'general.marketplace.marketplace_settings.show_customer_details_to_vendors' !== $new_key || is_null( $value ) ) {
            return $value;
        }
        return $value === 'on' ? 'off' : 'on';
    }
}
