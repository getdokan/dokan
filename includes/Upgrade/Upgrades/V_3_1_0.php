<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_3_1_0 extends DokanUpgrader {

    /**
     * Remove any numeric indexed data from withdraw_methods added due to dokan setup wizard
     *
     * @return void
     */
    public static function update_dokan_withdraw_methods() {
        $options = get_option( 'dokan_withdraw', [] );
        if ( isset( $options['withdraw_methods'] ) ) {
            $new_methods = [];
            foreach ( $options['withdraw_methods'] as $key => $value ) {
                if ( is_numeric( $key ) ) {
                    continue;
                }
                $new_methods[ $key ] = $value;
            }

            if ( empty( $new_methods ) ) {
                unset( $options['withdraw_methods'] ); // by default paypal will be added if we remove withdraw_methods
            } else {
                $options['withdraw_methods'] = $new_methods;
            }

            update_option( 'dokan_withdraw', $options );
        }
    }
}
