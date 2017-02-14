<?php

/**
 * Dokan get product status
 *
 * @since 2.5
 *
 * @deprecated 2.5.1
 *
 * @return string|array
 **/
function dokan_get_product_status( $status ) {
    _deprecated_function( 'dokan_get_product_status', '2.5', 'dokan_get_product_types' );
    return dokan_get_product_types( $status );
}