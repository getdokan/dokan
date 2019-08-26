<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_8_6 extends DokanUpgrader {

    /**
     * Update extra fee recipient settings
     *
     * @since 2.8.6
     *
     * @return void
     */
    public static function update_fees_recipient() {
        $options                            = get_option( 'dokan_general', [] );
        $options['shipping_fee_recipient']  = ! empty( $options['extra_fee_recipient'] ) ? $options['extra_fee_recipient'] : 'seller';
        $options['tax_fee_recipient']       = ! empty( $options['extra_fee_recipient'] ) ? $options['extra_fee_recipient'] : 'seller';

        update_option( 'dokan_general', $options );
    }
}
