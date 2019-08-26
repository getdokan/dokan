<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_1 extends DokanUpgrader {

    public static function create_announcement_table() {
        $dokan_installer = new \WeDevs\Dokan\Install\Installer();
        $dokan_installer->create_announcement_table();
    }
}
