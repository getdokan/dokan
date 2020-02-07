<?php

namespace WeDevs\Dokan\Traits;

use Exception;
use WP_Error;
use WeDevs\Dokan\Exceptions\DokanException;

trait AjaxResponseError {

    /**
     * Send Ajax error response
     *
     * @since 3.0.0
     *
     * @param \Exception $e
     * @param string     $default_message
     *
     * @return void
     */
    protected static function send_response_error( Exception $e, $default_message = '' ) {
        if ( $e instanceof DokanException ) {
            $error_code = $e->get_error_code();

            if ( $error_code instanceof WP_Error ) {
                wp_send_json_error( $error_code, 400 );
            }

            wp_send_json_error( $e->get_message(), $e->get_status_code() );
        }

        $default_message = $default_message ? $default_message : __( 'Something went wrong', 'dokan-lite' );
        wp_send_json_error( $default_message, 422 );
    }
}
