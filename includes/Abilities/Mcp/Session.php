<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Per-request record of who the Dokan MCP transport authenticated, and with what scope.
 *
 * Kept apart from {@see Transport} so the ability-layer hooks that consult it never autoload the
 * adapter's transport base class on a site where the adapter is not installed.
 *
 * @since DOKAN_SINCE
 */
class Session {

    /**
     * The user the current request's credential resolved to; 0 before authentication.
     *
     * @var int
     */
    private static int $user_id = 0;

    /**
     * Whether the current request's credential may only read.
     *
     * @var bool
     */
    private static bool $read_only = false;

    /**
     * Record a successful authentication.
     *
     * @since DOKAN_SINCE
     *
     * @param int  $user_id   The authenticated user.
     * @param bool $read_only Whether the credential is limited to read-only tools.
     *
     * @return void
     */
    public static function authenticate( int $user_id, bool $read_only ): void {
        self::$user_id   = $user_id;
        self::$read_only = $read_only;
    }

    /**
     * The user authenticated by this request's credential.
     *
     * @since DOKAN_SINCE
     *
     * @return int 0 when the request did not authenticate through the Dokan transport.
     */
    public static function user_id(): int {
        return self::$user_id;
    }

    /**
     * Whether the authenticated credential is limited to read-only tools.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_read_only(): bool {
        return self::$user_id > 0 && self::$read_only;
    }

    /**
     * Forget the per-request state. Intended for tests.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function reset(): void {
        self::$user_id   = 0;
        self::$read_only = false;
    }
}
