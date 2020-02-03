<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_9_19 extends DokanUpgrader {

    public static function dokan_update_admin_settings_next() {
        $field_map = [
            'dokan_general' => [
                'shipping_fee_recipient'     => [ 'shipping_fee_recipient', 'dokan_selling' ],
                'tax_fee_recipient'          => [ 'tax_fee_recipient', 'dokan_selling' ],
                'store_open_close'           => [ 'store_open_close', 'dokan_appearance' ],
                'store_map'                  => [ 'store_map', 'dokan_appearance' ],
                'gmap_api_key'               => [ 'gmap_api_key', 'dokan_appearance' ],
                'contact_seller'             => [ 'contact_seller', 'dokan_appearance' ],
                'enable_theme_store_sidebar' => [ 'enable_theme_store_sidebar', 'dokan_appearance' ],
                'seller_review_manage'       => [ 'seller_review_manage', 'dokan_selling' ],
                'store_banner_width'         => [ 'store_banner_width', 'dokan_appearance' ],
                'store_banner_height'        => [ 'store_banner_height', 'dokan_appearance' ],
            ],
            'dokan_appearance' => [
                'setup_wizard_logo_url' => [ 'setup_wizard_logo_url', 'dokan_general' ],
            ],
            'dokan_selling' => [
                'enable_shipstation_logging' => [ 'enable_shipstation_logging', 'dokan_general' ],
            ],
        ];

        $options_to_save = [];

        foreach ( $field_map as $old_section => $map ) {
            $old_settings = get_option( $old_section, [] );

            foreach ( $map as $old_option => $rearranged_option ) {
                if ( isset( $old_settings[ $old_option ] ) ) {
                    $new_option_option  = $rearranged_option[0];
                    $new_section = $rearranged_option[1];

                    if ( ! isset( $options_to_save[ $old_section ] ) ) {
                        $options_to_save[ $old_section ] = $old_settings;
                    }

                    if ( ! isset( $options_to_save[ $new_section ] ) ) {
                        $options_to_save[ $new_section ] = get_option( $new_section, [] );
                    }

                    $options_to_save[ $new_section ][ $new_option_option ] = $old_settings[ $old_option ];
                }
            }
        }

        foreach ( $options_to_save as $section => $value ) {
            update_option( $section, $value );
        }
    }
}
