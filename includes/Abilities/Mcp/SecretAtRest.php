<?php

namespace WeDevs\Dokan\Abilities\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * Encrypts a secret for storage.
 *
 * A connection token has to be shown again after it is minted, so it cannot be stored as a hash
 * alone. It is kept twice: a SHA-256 digest that authenticates a presented token, and this
 * encrypted copy that only exists so the settings screen can display it.
 *
 * Without libsodium or salts the value passes through in the clear, and a ciphertext that will not
 * open (the salts changed) decrypts to `''` rather than to its own envelope. The digest keeps
 * already-connected clients working either way; the screen offers a rotation instead.
 *
 * @since DOKAN_SINCE
 */
class SecretAtRest {

    /**
     * Marks a value as encrypted by this class.
     *
     * @since DOKAN_SINCE
     */
    const PREFIX = 'dkenc:v1:';

    /**
     * Encrypt a secret for storage.
     *
     * @since DOKAN_SINCE
     *
     * @param string $value Raw secret.
     *
     * @return string Ciphertext envelope, or the value unchanged where this host cannot encrypt.
     */
    public static function encrypt( string $value ): string {
        if ( '' === $value || ! function_exists( 'sodium_crypto_secretbox' ) ) {
            return $value;
        }

        $key = self::key();

        if ( '' === $key ) {
            return $value;
        }

        try {
            $nonce  = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
            $cipher = sodium_crypto_secretbox( $value, $nonce, $key );

            // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- transport encoding for a sodium ciphertext.
            return self::PREFIX . base64_encode( $nonce . $cipher );
        } catch ( \Exception $e ) {
            return $value;
        }
    }

    /**
     * Decrypt a value written by {@see self::encrypt()}.
     *
     * @since DOKAN_SINCE
     *
     * @param string $value Stored value.
     *
     * @return string Plaintext, the original value when it was never encrypted, or '' when it cannot be opened.
     */
    public static function decrypt( string $value ): string {
        if ( ! self::is_encrypted( $value ) ) {
            return $value;
        }

        if ( ! function_exists( 'sodium_crypto_secretbox_open' ) ) {
            return '';
        }

        $key = self::key();

        if ( '' === $key ) {
            return '';
        }

        // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- decodes our own ciphertext envelope.
        $decoded = base64_decode( substr( $value, strlen( self::PREFIX ) ), true );

        if ( false === $decoded || strlen( $decoded ) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
            return '';
        }

        $nonce  = substr( $decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
        $cipher = substr( $decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
        $plain  = sodium_crypto_secretbox_open( $cipher, $nonce, $key );

        return false === $plain ? '' : $plain;
    }

    /**
     * Whether a stored value carries this class's marker.
     *
     * @since DOKAN_SINCE
     *
     * @param string $value Stored value.
     *
     * @return bool
     */
    public static function is_encrypted( string $value ): bool {
        return 0 === strncmp( $value, self::PREFIX, strlen( self::PREFIX ) );
    }

    /**
     * Derive the 32-byte key from the site's auth salt.
     *
     * @since DOKAN_SINCE
     *
     * @return string Raw key, or '' when salts are unavailable.
     */
    private static function key(): string {
        if ( ! function_exists( 'wp_salt' ) ) {
            return '';
        }

        $salt = (string) wp_salt( 'auth' );

        if ( '' === $salt ) {
            return '';
        }

        return hash( 'sha256', 'dokan-mcp|' . $salt, true );
    }
}
