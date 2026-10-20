<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Personal connection tokens: one per user, for clients that cannot sign in through a browser.
 *
 * A token is bound to the user who minted it and acts as that user, so there is no shared
 * site-wide key: a Store Admin's token reaches every store, a Vendor's token only their own.
 *
 * Two user-meta rows per token. The SHA-256 digest is the ONLY thing a presented token is ever
 * compared against and is what the lookup is keyed on; the encrypted copy exists so the settings
 * screen can show the token again.
 *
 * @since DOKAN_SINCE
 */
class Tokens {

    /**
     * User meta holding the encrypted token and its bookkeeping.
     *
     * @since DOKAN_SINCE
     */
    const META = 'dokan_mcp_token';

    /**
     * User meta holding the token digest, kept separate so a token can be looked up by it.
     *
     * @since DOKAN_SINCE
     */
    const META_HASH = 'dokan_mcp_token_hash';

    /**
     * Seconds between `last_used` writes.
     *
     * @since DOKAN_SINCE
     */
    const LAST_USED_THROTTLE = 60;

    /**
     * A user's token state, defaults merged and the display copy decrypted.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User whose token to read.
     *
     * @return array{token:string,hash:string,created:int,last_used:int}
     */
    public static function get( int $user_id ): array {
        $stored = $user_id > 0 ? get_user_meta( $user_id, self::META, true ) : [];
        $stored = is_array( $stored ) ? $stored : [];
        $raw    = isset( $stored['secret'] ) ? (string) $stored['secret'] : '';

        return [
            'token'     => '' === $raw ? '' : SecretAtRest::decrypt( $raw ),
            'hash'      => $user_id > 0 ? (string) get_user_meta( $user_id, self::META_HASH, true ) : '',
            'created'   => isset( $stored['created'] ) ? (int) $stored['created'] : 0,
            'last_used' => isset( $stored['last_used'] ) ? (int) $stored['last_used'] : 0,
        ];
    }

    /**
     * Whether a user holds a token.
     *
     * Asks the digest, not the display copy: a token whose ciphertext can no longer be opened still
     * authenticates the clients configured with it.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User to check.
     *
     * @return bool
     */
    public static function has( int $user_id ): bool {
        return '' !== self::get( $user_id )['hash'];
    }

    /**
     * Mint a fresh token for a user, replacing any existing one immediately.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User to mint for.
     *
     * @return array Public status after minting, including the token in the clear.
     */
    public static function mint( int $user_id ): array {
        $token = bin2hex( random_bytes( 32 ) );

        update_user_meta( $user_id, self::META_HASH, self::hash( $token ) );
        update_user_meta(
            $user_id,
            self::META,
            [
                'secret'    => SecretAtRest::encrypt( $token ),
                'created'   => time(),
                'last_used' => 0,
            ]
        );

        return self::public_status( $user_id );
    }

    /**
     * Drop a user's token, cutting off every client configured with it.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User whose token goes.
     *
     * @return void
     */
    public static function revoke( int $user_id ): void {
        delete_user_meta( $user_id, self::META );
        delete_user_meta( $user_id, self::META_HASH );
    }

    /**
     * Resolve a presented token to the user who minted it.
     *
     * @since DOKAN_SINCE
     *
     * @param string $presented Token presented by the client.
     *
     * @return int User ID, or 0 when the token matches nobody.
     */
    public static function verify( string $presented ): int {
        if ( '' === $presented ) {
            return 0;
        }

        $hash  = self::hash( $presented );
        $users = get_users(
            [
                'meta_key'   => self::META_HASH, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
                'meta_value' => $hash, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
                'fields'     => 'ID',
                'number'     => 1,
            ]
        );

        if ( empty( $users ) ) {
            return 0;
        }

        $user_id = (int) $users[0];

        // Compared again in constant time: the meta lookup is the index, not the verifier.
        return hash_equals( self::get( $user_id )['hash'], $hash ) ? $user_id : 0;
    }

    /**
     * Record that a token just authenticated a call, at most once a minute.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id Token owner.
     *
     * @return void
     */
    public static function touch_last_used( int $user_id ): void {
        $stored = get_user_meta( $user_id, self::META, true );

        if ( ! is_array( $stored ) ) {
            return;
        }

        $now  = time();
        $last = isset( $stored['last_used'] ) ? (int) $stored['last_used'] : 0;

        if ( $now - $last < self::LAST_USED_THROTTLE ) {
            return;
        }

        $stored['last_used'] = $now;

        update_user_meta( $user_id, self::META, $stored );
    }

    /**
     * Sanitised snapshot for the settings screen.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id Token owner.
     *
     * @return array
     */
    public static function public_status( int $user_id ): array {
        $state = self::get( $user_id );

        return [
            'connected'       => '' !== $state['hash'],
            'token'           => $state['token'],
            // False while connected is the salt-rotation case: still authenticating, no display copy.
            'token_available' => '' !== $state['token'],
            'created'         => $state['created'],
            'last_used'       => $state['last_used'],
            'config'          => self::config_snippets( $state['token'] ),
        ];
    }

    /**
     * Copy-paste connection recipes carrying the token in an `Authorization` header.
     *
     * @since DOKAN_SINCE
     *
     * @param string $token Token in the clear, or '' when unavailable.
     *
     * @return array{cli:string,json:string}
     */
    public static function config_snippets( string $token ): array {
        if ( '' === $token ) {
            return [
                'cli'  => '',
                'json' => '',
            ];
        }

        $endpoint = Access::endpoint();
        $json     = wp_json_encode(
            [
                'mcpServers' => [
                    'dokan' => [
                        'type'    => 'http',
                        'url'     => $endpoint,
                        'headers' => [
                            'Authorization' => 'Bearer ' . $token,
                        ],
                    ],
                ],
            ],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        );

        return [
            'cli'  => sprintf( 'claude mcp add dokan %s --transport http --header "Authorization: Bearer %s"', $endpoint, $token ),
            'json' => false === $json ? '' : $json,
        ];
    }

    /**
     * The digest a token is stored and compared as.
     *
     * @since DOKAN_SINCE
     *
     * @param string $value Raw token.
     *
     * @return string
     */
    private static function hash( string $value ): string {
        return hash( 'sha256', $value );
    }
}
