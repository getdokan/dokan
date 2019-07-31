<?php

function dokan_update_admin_settings_next() {
    $field_map = array(
        'dokan_general' => array(
            'shipping_fee_recipient'     => array( 'shipping_fee_recipient', 'dokan_selling' ),
            'tax_fee_recipient'          => array( 'tax_fee_recipient', 'dokan_selling' ),
            'store_open_close'           => array( 'store_open_close', 'dokan_appearance' ),
            'store_map'                  => array( 'store_map', 'dokan_appearance' ),
            'gmap_api_key'               => array( 'gmap_api_key', 'dokan_appearance' ),
            'contact_seller'             => array( 'contact_seller', 'dokan_appearance' ),
            'enable_theme_store_sidebar' => array( 'enable_theme_store_sidebar', 'dokan_appearance' ),
            'seller_review_manage'       => array( 'seller_review_manage', 'dokan_selling' ),
            'store_banner_width'         => array( 'store_banner_width', 'dokan_appearance' ),
            'store_banner_height'        => array( 'store_banner_height', 'dokan_appearance' ),
        ),
        'dokan_appearance' => array(
            'setup_wizard_logo_url' => array( 'setup_wizard_logo_url', 'dokan_general' ),
        ),
        'dokan_selling' => array(
            'enable_shipstation_logging' => array( 'enable_shipstation_logging', 'dokan_general' ),
        ),
    );

    $options_to_save = array();

    foreach ( $field_map as $old_section => $map ) {
        $old_settings = get_option( $old_section, array() );

        foreach ( $map as $old_option => $rearranged_option ) {
            if ( isset( $old_settings[ $old_option ] ) ) {
                $new_option_option  = $rearranged_option[0];
                $new_section = $rearranged_option[1];

                if ( ! isset( $options_to_save[ $old_section ] ) ) {
                    $options_to_save[ $old_section ] = $old_settings;
                }

                if ( ! isset( $options_to_save[ $new_section ] ) ) {
                    $options_to_save[ $new_section ] = get_option( $new_section, array() );
                }

                $options_to_save[ $new_section ][ $new_option_option ] = $old_settings[ $old_option ];
            }
        }
    }

    foreach ( $options_to_save as $section => $value ) {
        update_option( $section, $value );
    }
}

dokan_update_admin_settings_next();
