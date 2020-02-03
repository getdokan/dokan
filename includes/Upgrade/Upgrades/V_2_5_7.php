<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_5_7 extends DokanUpgrader {

    public static function remove_notice_meta() {
        delete_option( 'dokan_4th_yr_aniv_44_perc_discount_tracking_notice' );
    }
}
