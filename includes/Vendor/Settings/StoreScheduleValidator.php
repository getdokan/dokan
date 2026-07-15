<?php

namespace WeDevs\Dokan\Vendor\Settings;

use DateTime;

/**
 * Sanitizer + validator for the vendor store schedule (`dokan_store_time`).
 *
 * The Store settings schema wires these as the `dokan_store_time` field's
 * `sanitize_callback` and `validation_func`, so the REST controller stays
 * variant-agnostic and the schedule rules live next to the field that owns
 * them.
 *
 * @since DOKAN_SINCE
 */
class StoreScheduleValidator {

    /**
     * Normalize a submitted schedule into the exact legacy shape: per-day
     * `{ status: 'open'|'close', opening_time: string[], closing_time: string[] }`
     * with canonical `g:i a` strings. Closed days carry empty time arrays.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value Submitted schedule keyed by day.
     *
     * @return array
     */
    public static function sanitize( $value ): array {
        $value    = (array) $value;
        $schedule = [];

        foreach ( array_keys( dokan_get_translated_days() ) as $day ) {
            $day_data = isset( $value[ $day ] ) && is_array( $value[ $day ] ) ? $value[ $day ] : [];
            $status   = 'open' === ( $day_data['status'] ?? '' ) ? 'open' : 'close';

            $schedule[ $day ] = [
                'status'       => $status,
                'opening_time' => 'open' === $status
                    ? array_values( array_map( 'sanitize_text_field', (array) ( $day_data['opening_time'] ?? [] ) ) )
                    : [],
                'closing_time' => 'open' === $status
                    ? array_values( array_map( 'sanitize_text_field', (array) ( $day_data['closing_time'] ?? [] ) ) )
                    : [],
            ];
        }

        return $schedule;
    }

    /**
     * Validate a normalized schedule: open days need matching time pairs, each
     * in `g:i a` format with the opening time before the closing time (the
     * full-day `12:00 am`–`11:59 pm` pair satisfies this).
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $value Normalized schedule keyed by day.
     *
     * @return string[] Error messages (empty when valid).
     */
    public static function validate( $value ): array {
        $errors = [];

        foreach ( (array) $value as $day => $day_data ) {
            if ( 'open' !== ( $day_data['status'] ?? '' ) ) {
                continue;
            }

            $errors = array_merge( $errors, self::validate_open_day( dokan_get_translated_days( $day ), (array) $day_data ) );
        }

        return $errors;
    }

    /**
     * Validate the opening/closing time pairs of a single open day.
     *
     * @since DOKAN_SINCE
     *
     * @param string $day_label Translated day name for messages.
     * @param array  $day_data  Normalized day entry.
     *
     * @return string[] Error messages for the day (empty when valid).
     */
    protected static function validate_open_day( string $day_label, array $day_data ): array {
        $opening = (array) ( $day_data['opening_time'] ?? [] );
        $closing = (array) ( $day_data['closing_time'] ?? [] );

        // Every opening time needs its closing counterpart.
        if ( empty( $opening ) || count( $opening ) !== count( $closing ) ) {
            /* translators: %s: day name */
            return [ sprintf( __( '%s: opening and closing times are required for open days.', 'dokan-lite' ), $day_label ) ];
        }

        $errors = [];

        foreach ( $opening as $index => $opening_time ) {
            $open  = DateTime::createFromFormat( 'g:i a', strtolower( trim( (string) $opening_time ) ) );
            $close = DateTime::createFromFormat( 'g:i a', strtolower( trim( (string) $closing[ $index ] ) ) );

            if ( false === $open || false === $close ) {
                /* translators: %s: day name */
                $errors[] = sprintf( __( '%s: times must use the h:mm am/pm format.', 'dokan-lite' ), $day_label );
                continue;
            }

            if ( $open->getTimestamp() >= $close->getTimestamp() ) {
                /* translators: %s: day name */
                $errors[] = sprintf( __( '%s: the opening time must be earlier than the closing time.', 'dokan-lite' ), $day_label );
            }
        }

        return $errors;
    }
}
