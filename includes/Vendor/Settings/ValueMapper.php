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

        foreach ( $sanitized as $id => $value ) {
            switch ( $id ) {
                case 'store_map':
                    // Composite field → the two legacy top-level keys.
                    $slice['location']     = (string) ( $value['location'] ?? '' );
                    $slice['find_address'] = (string) ( $value['find_address'] ?? '' );
                    break;

                case 'address':
                    // Merge over the previous subkeys so extras like the
                    // store-pickup `location_name` survive a React save.
                    $slice['address'] = array_merge( (array) ( $prev['address'] ?? [] ), (array) $value );
                    break;

                case 'catalog_mode_hide_add_to_cart_button':
                case 'catalog_mode_hide_product_price':
                    // Collected into the nested catalog_mode array below.
                    break;

                default:
                    $field      = $fields_by_id[ $id ] ?? [];
                    $legacy_key = isset( $field['legacy_key'] ) && is_string( $field['legacy_key'] ) ? $field['legacy_key'] : $id;

                    $slice[ $legacy_key ] = $value;
            }
        }

        $catalog = $this->catalog_mode_slice( $sanitized, $prev );
        if ( null !== $catalog ) {
            $slice['catalog_mode'] = $catalog;
        }

        return $slice;
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
