<?php

namespace WeDevs\Dokan\CJDropshipping\Security;

/**
 * Stores the marketplace CJ account's key and tokens, encrypted.
 *
 * @since DOKAN_SINCE
 */
class Credentials {

    public const OPTION = 'dokan_cj_credentials';

    private const SECRETS = [ 'api_key', 'access_token', 'refresh_token', 'open_id' ];

    /**
     * Save the connection, encrypting secret fields.
     *
     * @since DOKAN_SINCE
     *
     * @param array $data Keys: api_key, access_token, refresh_token, open_id, access_expires, refresh_expires.
     *
     * @return void
     */
    public static function save( array $data ): void {
        $stored = self::raw();

        foreach ( $data as $key => $value ) {
            $stored[ $key ] = in_array( $key, self::SECRETS, true ) ? Crypto::encrypt( (string) $value ) : $value;
        }

        update_option( self::OPTION, $stored, false );
    }

    /**
     * Read one field, decrypting secrets.
     *
     * @since DOKAN_SINCE
     *
     * @param string $key Field name.
     *
     * @return mixed Null for a secret that can't be decrypted.
     */
    public static function get( string $key ) {
        $stored = self::raw();

        if ( ! isset( $stored[ $key ] ) ) {
            return in_array( $key, self::SECRETS, true ) ? '' : null;
        }

        return in_array( $key, self::SECRETS, true ) ? Crypto::decrypt( (string) $stored[ $key ] ) : $stored[ $key ];
    }

    /**
     * Whether an API key is stored.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function has_key(): bool {
        return ! empty( self::raw()['api_key'] );
    }

    /**
     * Whether stored secrets can no longer be decrypted.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_unreadable(): bool {
        return self::has_key() && null === self::get( 'api_key' );
    }

    /**
     * Remove every stored secret.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function clear(): void {
        delete_option( self::OPTION );
    }

    /**
     * Stored array as saved.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    private static function raw(): array {
        $stored = get_option( self::OPTION, [] );

        return is_array( $stored ) ? $stored : [];
    }
}
