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
        //add_filter('dokan_settings_mapper_after_transform_new_to_old', [ $this, 'general_marketplace_show_customer_details_to_vendors' ], 10, 3 );
        add_filter('dokan_settings_mapper_transform_value_old_to_new', [ $this, 'general_marketplace_show_customer_details_to_vendors' ], 10, 3 );
        // TODO: Implement register_hooks() method.
    }
    public function general_marketplace_show_customer_details_to_vendors($value ,$old_key, $new_key) {
        error_log('transform_value_new_to_old:');
        error_log('value: ' . print_r($value, true));
        error_log('old_key: ' . $old_key);
        error_log('new_key: ' . $new_key);

        // New → Old: If new key is "show_*", legacy may be "hide_*"
        if ($old_key === 'dokan_selling.hide_customer_info' && $new_key === 'general.marketplace.marketplace_settings.show_customer_details_to_vendors') {
            // Switchers use 'on'/'off'
            // dokan_selling.hide_customer_info
            // general.marketplace.marketplace_settings.show_customer_details_to_vendors
            error_log('value converted: ' . print_r($value, true));
            return $value === 'on' ? 'off' : 'on';
        }
        return $value;
    }
    public function transform_value_old_to_new($value, $old_key, $new_key) {
        // Old → New: If new key is "show_*", legacy may be "hide_*"
        if ($old_key === 'dokan_selling.hide_customer_info' && $new_key === 'general.marketplace.marketplace_settings.show_customer_details_to_vendors') {
            return $value === 'on' ? 'off' : 'on';
        }
        return $value;
    }
}
