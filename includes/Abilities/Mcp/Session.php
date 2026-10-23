<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Per-request record of the user the Dokan MCP transport let through.
 *
 * Kept apart from {@see Transport} so the ability-layer hooks that consult it never autoload the
 * adapter's transport base class on a site where the adapter is not installed.
 *
 * @since DOKAN_SINCE
 */
class Session {

    /**
     * The user the transport authorized; 0 before it ran, or when it refused.
     *
     * @var int
     */
    private static int $user_id = 0;

    /**
     * Record that the transport let a user through.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id The connected user.
     *
     * @return void
     */
    public static function authenticate( int $user_id ): void {
        self::$user_id = $user_id;
    }

    /**
     * The user connected through the Dokan transport on this request.
     *
     * @since DOKAN_SINCE
     *
     * @return int 0 when the request did not come through the Dokan transport.
     */
    public static function user_id(): int {
        return self::$user_id;
    }

    /**
     * Forget the per-request state. Intended for tests.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function reset(): void {
        self::$user_id = 0;
    }
}
