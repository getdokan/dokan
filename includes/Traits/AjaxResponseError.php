<?php

namespace WeDevs\Dokan\Traits;

use Exception;
use WP_Error;
use WeDevs\Dokan\Exceptions\DokanException;

trait AjaxResponseError {

    /**
     * Send Ajax error response
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param \Exception $e
     * @param string     $default_message
     *
     * @return \WP_Error
     */
    protected static function send_response_error( Exception $e, $default_message = '' ) {
        if ( $e instanceof DokanException ) {
            return wp_send_json_error( $e->get_message(), $e->get_status_code() );
        }

        $default_message = $default_message ? $default_message : __( 'Something went wrong', 'dokan-lite' );
        return wp_send_json_error( $default_message, 422 );
    }
}
