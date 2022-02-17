<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Dokan vendor store times upgrader class.
 *
 * @since 3.3.8
 */
class V_3_3_8_VendorStoreTimes extends DokanBackgroundProcesses {

    /**
     * Update vendors store time.
     *
     * @param array $vendors
     *
     * @since 3.3.8
     *
     * @return bool
     */
    public function task( $vendors ) {
        if ( empty( $vendors ) ) {
            return false;
        }

        foreach ( $vendors as $store_id ) {
            $user_store_info = dokan_get_store_info( $store_id );

            foreach ( dokan_get_translated_days() as $day => $value ) {
                if ( empty( $user_store_info['dokan_store_time'][ $day ] ) ) {
                    $user_store_info['dokan_store_time'][ $day ] = [
                        'status'       => 'close',
                        'opening_time' => [],
                        'closing_time' => [],
                    ];

                    continue;
                }

                // Sets store open & close time as array value.
                if ( ! is_array( $user_store_info['dokan_store_time'][ $day ]['opening_time'] ) || ! is_array( $user_store_info['dokan_store_time'][ $day ]['closing_time'] ) ) {
                    $user_store_info['dokan_store_time'][ $day ]['opening_time'] = (array) $user_store_info['dokan_store_time'][ $day ]['opening_time'];
                    $user_store_info['dokan_store_time'][ $day ]['closing_time'] = (array) $user_store_info['dokan_store_time'][ $day ]['closing_time'];
                }
            }

            update_user_meta( $store_id, 'dokan_profile_settings', $user_store_info );
        }

        return false;
    }
}
