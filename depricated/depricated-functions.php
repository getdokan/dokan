<?php

/**
 * Wrapper for wc_doing_it_wrong.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @param string $function Function used.
 * @param string $message Message to log.
 * @param string $version Version the message was added in.
 *
 * @return void
 */
function dokan_doing_it_wrong( $function, $message, $version ) {
    $message .= ' Backtrace: ' . wp_debug_backtrace_summary();

    if ( is_ajax() || WC()->is_rest_api_request() ) {
        do_action( 'doing_it_wrong_run', $function, $message, $version );
        error_log( "{$function} was called incorrectly. {$message}. This message was added in version {$version}." );
    } else {
        _doing_it_wrong( $function, $message, $version );
    }
}

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
