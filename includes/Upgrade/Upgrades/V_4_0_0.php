<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_4_0_0 extends DokanUpgrader {

    /**
     * Update vendor dashboard new permalink.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function flash_permalink_for_new_vendor_dashboard_url() {
        dokan()->flush_rewrite_rules();
    }
}
