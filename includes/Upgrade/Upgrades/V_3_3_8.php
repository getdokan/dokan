<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_3_8 extends DokanUpgrader {

    /**
     * Updates usermeta database table column. Before on,
     * store time gets single data in usermeta. Now, we
     * are setting data as array for multiple store times.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @return void
     */
    public static function update_withdraw_table_column() {
        $current_user_id = dokan_get_current_user_id();
        $user_store_info = dokan_get_store_info( $current_user_id );

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

        update_user_meta( $current_user_id, 'dokan_profile_settings', $user_store_info );
    }
}
