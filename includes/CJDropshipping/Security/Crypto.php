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
     * Decrypt a stored secret.
     *
     * @since DOKAN_SINCE
     *
     * @param string $stored Value written by encrypt().
     *
     * @return string|null Null when it can't be decrypted, e.g. after the salts changed.
     */
    public static function decrypt( string $stored ): ?string {
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

        try {
            $plain = sodium_crypto_secretbox_open( $cipher, $nonce, self::key() );
        } catch ( \Throwable $e ) {
            return null;
        }

        return false === $plain ? null : $plain;
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

        return hash( 'sha256', 'dokan-cj|' . $secret, true );
    }
}
