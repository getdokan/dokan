<?php

namespace WeDevs\Dokan\CJDropshipping\Security;

/**
 * Encrypts stored CJ secrets with libsodium (WordPress ships a polyfill).
 *
 * @since DOKAN_SINCE
 */
class Crypto {

    private const PREFIX = 'dcj1:';

    /**
     * Encrypt a secret for storage.
     *
     * @since DOKAN_SINCE
     *
     * @param string $plain Secret to encrypt.
     *
     * @return string
     */
    public static function encrypt( string $plain ): string {
        if ( '' === $plain ) {
            return '';
        }

        $nonce  = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
        $cipher = sodium_crypto_secretbox( $plain, $nonce, self::key() );

        return self::PREFIX . base64_encode( $nonce . $cipher ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
    }

    /**
     * Decrypt a stored secret, also with the salt when DOKAN_CJ_ENCRYPTION_KEY was added later.
     *
     * @since DOKAN_SINCE
     *
     * @param string $stored Value written by encrypt().
     *
     * @return string|null Null when it can't be decrypted, e.g. after the salts changed.
     */
    public static function decrypt( string $stored ): ?string {
        return self::open( $stored, self::keys() );
    }

    /**
     * Whether a stored secret is encrypted with the current key.
     *
     * @since DOKAN_SINCE
     *
     * @param string $stored Value written by encrypt().
     *
     * @return bool
     */
    public static function is_current( string $stored ): bool {
        return null !== self::open( $stored, [ self::key() ] );
    }

    /**
     * Decrypt with the first key that works.
     *
     * @since DOKAN_SINCE
     *
     * @param string   $stored Value written by encrypt().
     * @param string[] $keys   Keys to try.
     *
     * @return string|null
     */
    private static function open( string $stored, array $keys ): ?string {
        if ( '' === $stored ) {
            return '';
        }

        if ( 0 !== strpos( $stored, self::PREFIX ) ) {
            return null;
        }

        $raw = base64_decode( substr( $stored, strlen( self::PREFIX ) ), true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode

        if ( false === $raw || strlen( $raw ) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
            return null;
        }

        $nonce  = substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
        $cipher = substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );

        foreach ( $keys as $key ) {
            try {
                $plain = sodium_crypto_secretbox_open( $cipher, $nonce, $key );
            } catch ( \Throwable $e ) {
                $plain = false;
            }

            if ( false !== $plain ) {
                return $plain;
            }
        }

        return null;
    }

    /**
     * Current key first, then the salt key that was used before DOKAN_CJ_ENCRYPTION_KEY was set.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    private static function keys(): array {
        return array_values( array_unique( [ self::key(), self::derive( wp_salt( 'auth' ) ) ] ) );
    }

    /**
     * Key from DOKAN_CJ_ENCRYPTION_KEY, falling back to the site's auth salt (E2).
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    private static function key(): string {
        $secret = defined( 'DOKAN_CJ_ENCRYPTION_KEY' ) && '' !== (string) DOKAN_CJ_ENCRYPTION_KEY
            ? (string) DOKAN_CJ_ENCRYPTION_KEY
            : wp_salt( 'auth' );

        return self::derive( $secret );
    }

    /**
     * 32-byte secretbox key from a secret.
     *
     * @since DOKAN_SINCE
     *
     * @param string $secret Constant or salt.
     *
     * @return string
     */
    private static function derive( string $secret ): string {
        return hash( 'sha256', 'dokan-cj|' . $secret, true );
    }
}
