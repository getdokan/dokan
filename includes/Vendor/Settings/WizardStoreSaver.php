<?php

namespace WeDevs\Dokan\Vendor\Settings;

/**
 * Persists the setup wizard's store step through the canonical writer.
 *
 * The legacy handler wrote `dokan_get_store_info()` back to meta wholesale,
 * which also persisted every engine default (`payment.paypal = [ 'email' ]`,
 * `enable_tnc`, …) and whatever the `dokan_vendor_shop_data` filter injected
 * (taxonomy-derived categories, subscription info). This saver writes only the
 * fields the wizard owns; untouched keys survive via the writer's shallow merge.
 *
 * Seam A (`dokan_store_profile_settings_args`) stays suppressed on this path —
 * its consumers assume the dashboard Store form's field set, and Pro's
 * delivery-time handler would revert the wizard's own address edits.
 * Seam B (`dokan_store_profile_saved`) fires exactly as before.
 *
 * @since DOKAN_SINCE
 */
class WizardStoreSaver {

    /**
     * Canonical settings writer.
     *
     * @since DOKAN_SINCE
     *
     * @var StoreSettingsWriter
     */
    protected StoreSettingsWriter $writer;

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param StoreSettingsWriter|null $writer Writer override, mainly for tests.
     */
    public function __construct( ?StoreSettingsWriter $writer = null ) {
        $this->writer = $writer ? $writer : new StoreSettingsWriter();
    }

    /**
     * Persist the wizard store step for a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $vendor_id Vendor user ID.
     * @param array $slice     Sanitized owned values: address, location, find_address, show_email.
     *
     * @return array The full merged `dokan_profile_settings` array.
     */
    public function save( int $vendor_id, array $slice ): array {
        $prev = get_user_meta( $vendor_id, 'dokan_profile_settings', true );
        $prev = is_array( $prev ) ? $prev : [];

        // Replays the legacy progress math over the would-be merged array — including its re-save double count, which is pinned parity, not endorsement.
        $candidate = dokan()->registration->check_and_set_address_profile_completion(
            $vendor_id,
            array_merge( $prev, $slice ),
            $prev
        );

        if ( isset( $candidate['profile_completion'] ) ) {
            $slice['profile_completion'] = $candidate['profile_completion'];
        }

        return $this->writer->save( $vendor_id, $slice, [ 'apply_settings_args_filter' => false ] );
    }
}
