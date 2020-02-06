<?php

namespace WeDevs\Dokan\Exceptions;

use Exception;

class DokanException extends Exception {

    /**
     * Error code
     *
     * @since 2.9.16
     *
     * @var string
     */
    protected $error_code = '';

    /**
     * Class constructor
     *
     * @since 2.9.16
     * @since 3.0.0 $error_code can be instance of WP_Error which is
     *                         useful for multiple error codes and messages in
     *                         a single WP_Error instance.
     *
     * @param string|\WP_Error $error_code  Error code string or WP_Error
     * @param string           $message
     * @param int              $status_code
     */
    public function __construct( $error_code, $message = '', $status_code = 422 ) {
        $this->error_code = $error_code;

        parent::__construct( $message, $status_code );
    }

    /**
     * Get error code
     *
     * @since 2.9.16
     *
     * @return string
     */
    final public function get_error_code() {
        return $this->error_code;
    }

    /**
     * Get error message
     *
     * @since 2.9.16
     *
     * @return string
     */
    final public function get_message() {
        return $this->getMessage();
    }

    /**
     * Get error status code
     *
     * @since 2.9.16
     *
     * @return int
     */
    final public function get_status_code() {
        return $this->getCode();
    }
}
