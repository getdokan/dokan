<?php

namespace WeDevs\Dokan\Vendor\Settings;

/**
 * The one write path for vendor Store settings.
 *
 * Replays the exact legacy pipeline from
 * `Dashboard\Templates\Settings::insert_settings_info()` so every Pro consumer
 * on the two seams keeps working: shallow merge → `dokan_store_name` mirror →
 * `dokan_store_profile_settings_args` filter → canonical meta write →
 * `dokan_store_profile_saved` action (which also invalidates the vendor cache).
 *
 * @since DOKAN_SINCE
 */
class StoreSettingsWriter {

    /**
     * Persist a legacy-keyed slice of store settings for a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id Vendor user ID.
     * @param array $slice     Legacy-keyed values to merge in.
     * @param array $options   {
     *     Optional save-pipeline switches.
     *
     *     @type bool $apply_settings_args_filter Whether to run the `dokan_store_profile_settings_args`
     *                                            filter (Seam A). That seam's implicit contract is "the
     *                                            dashboard Store form ran" — surfaces owning a different
     *                                            field set (the setup wizard) must pass false, or Pro's
     *                                            delivery-time handler reverts their address edits.
     *                                            Default true.
     * }
     *
     * @return array The full merged `dokan_profile_settings` array.
     */
    public function save( int $vendor_id, array $slice, array $options = [] ): array {
        $prev = get_user_meta( $vendor_id, 'dokan_profile_settings', true );
        $prev = is_array( $prev ) ? $prev : [];

        // Shallow on purpose — untouched top-level keys (biography, payment, store_seo, order_min_max, …) must survive a Store save.
        $merged = array_merge( $prev, $slice );

        if ( array_key_exists( 'store_name', $slice ) ) {
            update_user_meta( $vendor_id, 'dokan_store_name', $merged['store_name'] );
        }

        if ( false !== ( $options['apply_settings_args_filter'] ?? true ) ) {
            // The slice already carries the final dokan_store_time array, so the legacy POST-parsing filter must never run here.
            $merged = apply_filters( 'dokan_store_profile_settings_args', $merged, $vendor_id );
        }

        update_user_meta( $vendor_id, 'dokan_profile_settings', $merged );

        do_action( 'dokan_store_profile_saved', $vendor_id, $merged, $prev );

        return $merged;
    }
}
