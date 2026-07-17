<?php

namespace WeDevs\Dokan\Vendor\Settings;

/**
 * Maps sanitized flat field values (keyed by schema field id) onto the legacy
 * `dokan_profile_settings` slice.
 *
 * The flat array is a presentation schema, not a storage schema: every value
 * lands in the exact legacy key/shape the store form has always written, so
 * all existing readers (store templates, REST v1/v2, Pro read-modify-write
 * sites) keep working unchanged.
 *
 * @since DOKAN_SINCE
 */
class ValueMapper {

    /**
     * Convert sanitized flat values into a legacy profile-settings slice.
     *
     * @since DOKAN_SINCE
     *
     * @param array $sanitized    Sanitized values keyed by field id.
     * @param array $prev         The vendor's current `dokan_profile_settings` array.
     * @param array $fields_by_id Schema field elements keyed by id.
     *
     * @return array Legacy-keyed slice ready for a shallow merge.
     */
    public function to_legacy( array $sanitized, array $prev, array $fields_by_id ): array {
        $slice = [];

        // The catalog toggles fold into the nested catalog_mode array, so they get no flat key of their own.
        $folded_into_catalog = [ 'catalog_mode_hide_add_to_cart_button', 'catalog_mode_hide_product_price' ];

        foreach ( $sanitized as $id => $value ) {
            $field = $fields_by_id[ $id ] ?? [];

            // Skip catalog toggles and any field the owning plugin persists itself (e.g. the taxonomy store category).
            if ( in_array( $id, $folded_into_catalog, true ) || ! empty( $field['non_meta'] ) ) {
                continue;
            }

            $slice = array_merge( $slice, $this->legacy_entry( $id, $value, $prev, $field ) );
        }

        $catalog = $this->catalog_mode_slice( $sanitized, $prev );
        if ( null !== $catalog ) {
            $slice['catalog_mode'] = $catalog;
        }

        return $slice;
    }

    /**
     * Map one sanitized field onto its legacy key/value pair(s).
     *
     * Most fields land under a single `legacy_key`; the composite map field
     * expands to two top-level keys and the address merges over its previous
     * subkeys.
     *
     * @since DOKAN_SINCE
     *
     * @param string $id    Field id.
     * @param mixed  $value Sanitized value.
     * @param array  $prev  The vendor's current profile settings.
     * @param array  $field The field schema element.
     *
     * @return array Partial legacy slice to merge in.
     */
    protected function legacy_entry( string $id, $value, array $prev, array $field ): array {
        if ( 'store_map' === $id ) {
            return [
                'location'     => (string) ( $value['location'] ?? '' ),
                'find_address' => (string) ( $value['find_address'] ?? '' ),
            ];
        }

        // Merge over the previous subkeys so extras like the store-pickup `location_name` survive a React save.
        if ( 'address' === $id ) {
            // Registration seeds address as '' — casting that would inject a stray [0 => ''] into the row.
            $prev_address = isset( $prev['address'] ) && is_array( $prev['address'] ) ? $prev['address'] : [];

            return [ 'address' => array_merge( $prev_address, (array) $value ) ];
        }

        $legacy_key = isset( $field['legacy_key'] ) && is_string( $field['legacy_key'] ) ? $field['legacy_key'] : $id;

        return [ $legacy_key => $value ];
    }

    /**
     * Build the nested `catalog_mode` array, preserving keys other consumers
     * own (e.g. request-for-quotation's `request_a_quote_enabled`).
     *
     * @since DOKAN_SINCE
     *
     * @param array $sanitized Sanitized values keyed by field id.
     * @param array $prev      The vendor's current profile settings.
     *
     * @return array|null Nested catalog_mode array, or null when untouched.
     */
    protected function catalog_mode_slice( array $sanitized, array $prev ): ?array {
        $has_cart_button = array_key_exists( 'catalog_mode_hide_add_to_cart_button', $sanitized );
        $has_price       = array_key_exists( 'catalog_mode_hide_product_price', $sanitized );

        if ( ! $has_cart_button && ! $has_price ) {
            return null;
        }

        $catalog = (array) ( $prev['catalog_mode'] ?? [] );

        if ( $has_cart_button ) {
            $catalog['hide_add_to_cart_button'] = 'on' === $sanitized['catalog_mode_hide_add_to_cart_button'] ? 'on' : 'off';
        }

        if ( $has_price ) {
            $catalog['hide_product_price'] = 'on' === $sanitized['catalog_mode_hide_product_price'] ? 'on' : 'off';
        }

        // Hiding the price is meaningless with the cart button visible — same forced-off rule as legacy.
        if ( 'off' === ( $catalog['hide_add_to_cart_button'] ?? 'off' ) ) {
            $catalog['hide_product_price'] = 'off';

            // RFQ's quote button follows the same rule; its own Seam-A handler is nonce-guarded and silent on REST saves.
            if ( isset( $catalog['request_a_quote_enabled'] ) ) {
                $catalog['request_a_quote_enabled'] = 'off';
            }
        }

        return $catalog;
    }
}
