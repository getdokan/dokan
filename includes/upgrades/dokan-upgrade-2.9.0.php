<?php

function dokan_update_fees_recipient() {

    $options                            = get_option( 'dokan_general', array() );
    $options['shipping_fee_recipient']  = ! empty( $options['extra_fee_recipient'] ) ? $options['extra_fee_recipient'] : 'seller';
    $options['tax_fee_recipient']       = ! empty( $options['extra_fee_recipient'] ) ? $options['extra_fee_recipient'] : 'seller';

    update_option( 'dokan_general', $options );
}

function dokan_update_vendor_and_product_geolocations() {
    $processes = get_option( 'dokan_background_updater_processes', array() );

    if ( empty( $processes['dokan_update_2_9_0_vendor_and_product_geolocations'] ) ) {
        include_once DOKAN_INC_DIR . '/upgrades/background-processes/class_dokan_update_2_9_0_vendor_and_product_geolocations.php';

        $processor = new dokan_update_2_9_0_vendor_and_product_geolocations();

        $payload = array(
            'updating' => 'vendors',
            'paged'    => 1,
        );

        $processor->push_to_queue( $payload );
        $processor->save()->dispatch();

        $processes['dokan_update_2_9_0_vendor_and_product_geolocations'] = true;

        update_option( 'dokan_background_updater_processes', $processes, 'no' );
    }
}

dokan_update_fees_recipient();
dokan_update_vendor_and_product_geolocations();
