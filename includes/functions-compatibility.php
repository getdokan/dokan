<?php
/**
 * Wrapper functions to keep BackWards compatibility with WC 2.6 and older versions
 */


function dokan_cmp_wc_get_product( $product ) {
    
    if ( WC_VERSION > 2.6 ) {
        return wc_get_product( $product );
    }

    return get_product( $product );
}

function dokan_cmp_get_prop( $the_order, $prop ){
    
    if ( WC_VERSION > 2.6 ) {
        $fn_name = 'get_'.$prop;
        return $the_order->$fn_name();
    }
    
    return $the_order->$prop;
}

function dokan_cmp_get_date_created( $order ){
    
    if ( WC_VERSION > 2.6 ) {
        return $order->get_date_created();
    }

    return $order->order_date;
}

