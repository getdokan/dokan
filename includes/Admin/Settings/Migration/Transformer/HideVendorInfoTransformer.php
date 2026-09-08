<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

/**
 * Maps the legacy `hide_vendor_info` multicheck shape to/from the new
 * `vendor_info_visibility` field.
 *
 * Two things flip between the shapes:
 *
 * 1. Semantics. Legacy stores "what to hide" — a non-empty value at `email`
 *    means hide the email. New stores "what to show" — `store_email: true`
 *    means show it. Empty legacy / missing key = show.
 * 2. Keys. Legacy: `email` / `phone` / `address`. New: `store_email` /
 *    `store_phone` / `store_address`.
 *
 * Legacy WordPress multicheck values are the option key as a string when
 * checked, empty string when unchecked. We normalize anything truthy on the
 * legacy side to "hidden" so partial / pre-filtered payloads still round-trip.
 *
 * @since DOKAN_SINCE
 */
final class HideVendorInfoTransformer implements TransformerInterface {

    /**
     * Mapping of new schema keys → legacy multicheck keys.
     *
     * @var array<string, string>
     */
    private const KEY_MAP = [
        'store_email'   => 'email',
        'store_phone'   => 'phone',
        'store_address' => 'address',
    ];

    /**
     * {@inheritDoc}
     */
    public function to_new( $legacy_value ) {
        $legacy = is_array( $legacy_value ) ? $legacy_value : [];
        $new    = [];

        foreach ( self::KEY_MAP as $new_key => $legacy_key ) {
            $hidden            = ! empty( $legacy[ $legacy_key ] );
            $new[ $new_key ]   = ! $hidden;
        }

        return $new;
    }

    /**
     * {@inheritDoc}
     */
    public function to_legacy( $new_value ) {
        $new    = is_array( $new_value ) ? $new_value : [];
        $legacy = [];

        foreach ( self::KEY_MAP as $new_key => $legacy_key ) {
            $visible                = ! empty( $new[ $new_key ] );
            $legacy[ $legacy_key ]  = $visible ? '' : $legacy_key;
        }

        return $legacy;
    }
}
