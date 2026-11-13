<?php

namespace WeDevs\Dokan\CJDropshipping\Api;

use Exception;

/**
 * A failed CJ API call, with a reason callers can branch on.
 *
 * @since DOKAN_SINCE
 */
class ApiException extends Exception {

    public const SUSPENDED        = 'suspended';
    public const POINTS_EXHAUSTED = 'points_exhausted';
    public const RATE_LIMITED     = 'rate_limited';
    public const AUTH_FAILED      = 'auth_failed';
    public const NOT_CONNECTED    = 'not_connected';
    public const NOT_FOUND        = 'not_found';
    public const INVALID_REQUEST  = 'invalid_request';
    public const NETWORK          = 'network';
    public const UNKNOWN          = 'unknown';

    protected string $reason;

    protected int $cj_code;

    protected string $request_id;

    /**
     * Build the exception.
     *
     * @since DOKAN_SINCE
     *
     * @param string $reason     One of the reason constants.
     * @param string $message    Message for logs.
     * @param int    $cj_code    CJ's `code` field, 0 when there was none.
     * @param string $request_id CJ's requestId for support.
     */
    public function __construct( string $reason, string $message, int $cj_code = 0, string $request_id = '' ) {
        parent::__construct( $message, $cj_code );

        $this->reason     = $reason;
        $this->cj_code    = $cj_code;
        $this->request_id = $request_id;
    }

    /**
     * Reason constant.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_reason(): string {
        return $this->reason;
    }

    /**
     * CJ's error code.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_cj_code(): int {
        return $this->cj_code;
    }

    /**
     * CJ's request id.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_request_id(): string {
        return $this->request_id;
    }

    /**
     * Whether retrying later may succeed.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_temporary(): bool {
        return in_array( $this->reason, [ self::RATE_LIMITED, self::POINTS_EXHAUSTED, self::NETWORK ], true );
    }
}
