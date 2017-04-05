<?php
/**
 * Wrapper functions to keep BackWards compatibility with WC 2.6 and older versions
 */

/**
 * Get product method made backwards compatible
 * 
 * @since 2.5.7
 * 
 * @param WC_Product $product
 * 
 * @return WC_Product
 */
function dokan_cmp_wc_get_product( $product ) {
    
    if ( WC_VERSION > 2.7 ) {
        return wc_get_product( $product );
    }

    return get_product( $product );
}

/**
 * Dynamically access new properties with backwards compatibility
 * 
 * @since 2.5.7
 * 
 * @param Object $object
 * 
 * @param String $prop
 * 
 * @param String $callback If the object is fetched using a different callback
 * 
 * @return $prop
 */
function dokan_cmp_get_prop( $object, $prop, $callback = false ){
    
    if ( WC_VERSION > 2.7 ) {
        $fn_name = $callback ? $callback : 'get_'.$prop;
        return $object->$fn_name();
    }
    
    return $object->$prop;
}

/**
 * Get order created date
 * 
 * @since 2.5.7
 * 
 * @param WC_Order $order
 * 
 * @return String date
 */
function dokan_cmp_get_date_created( $order ){
    
    if ( WC_VERSION > 2.7 ) {
        return wc_format_datetime( $order->get_date_created(), get_option( 'date_format' ) . ', ' . get_option( 'time_format' ) );
    }
    
    return $order->order_date;
}

/**
 * Get meta data for given item_id
 * 
 * @since 2.5.7
 * 
 * @param WC_Order $order
 * 
 * @param int $item_id
 * 
 * @return $metadata
 */

function dokan_cmp_get_metadata( $order, $item_id ) {
    
    if ( WC_VERSION > 2.7 ) {
        $item = new WC_Order_Item( $order );
        return $item->get_meta_data();
    }
    
    return $order->has_meta( $item_id );
}
