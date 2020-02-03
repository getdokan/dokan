<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_1_2 extends DokanUpgrader {

    public static function generate_sync_table() {
        dokan_generate_sync_table();
    }
}
