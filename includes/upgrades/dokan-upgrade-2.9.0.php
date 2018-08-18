<?php

function dokan_update_fees_recipient() {

    $options                            = get_option( 'dokan_general', array() );
    $options['shipping_fee_recipient']  = ! empty( $options['extra_fee_recipient'] ) ? $options['extra_fee_recipient'] : 'seller';
    $options['tax_fee_recipient']       = ! empty( $options['extra_fee_recipient'] ) ? $options['extra_fee_recipient'] : 'seller';

    update_option( 'dokan_general', $options );
}

dokan_update_fees_recipient();
