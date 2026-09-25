<?php

namespace WeDevs\Dokan\Traits;

/**
 * Trait for handling recursive settings replacement.
 *
 * @since DOKAN_SINCE
 */
trait SettingsRecursion {

    /**
     * Handle settings recursively replace.
     *
     * @since DOKAN_SINCE
     *
     * @param array $existing
     * @param array $new_settings
     *
     * @return array
     */
    protected function settings_recursive_replace( array $existing, array $new_settings ): array {
        foreach ( $new_settings as $key => $value ) {
            // Explicit empty array must overwrite.
            if ( is_array( $value ) && empty( $value ) ) {
                $existing[ $key ] = [];
                continue;
            }

            if ( is_array( $value ) && isset( $existing[ $key ] ) && is_array( $existing[ $key ] ) ) {
                if ( $this->is_list( $value ) ) {
                    $existing[ $key ] = $value;
                } else {
                    // Important: even if $value is empty, this should overwrite
                    $existing[ $key ] = $this->settings_recursive_replace( $existing[ $key ], $value );
                }
            } else {
                // Always replace it, even with an empty array or empty value
                $existing[ $key ] = $value;
            }
        }

        return $existing;
    }

    /**
     * Check if an array is a list.
     *
     * @since DOKAN_SINCE
     *
     * @param array $settings
     *
     * @return bool
     */
    protected function is_list( array $settings ): bool {
        if ( empty( $settings ) ) {
            return true;
        }

        if ( function_exists( 'array_is_list' ) ) {
            return array_is_list( $settings );
        }

        return array_keys( $settings ) === range( 0, count( $settings ) - 1 );
    }
}
