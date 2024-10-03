<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Install\Installer;
use Automattic\WooCommerce\Admin\ReportsSync;

class V_3_13_0 extends DokanUpgrader {
    public static function resync_wc_order_stats_to_sync_dokan_stats() {
        // Create Dokan order stats table.
        ( new Installer() )->create_dokan_order_stats_table();

        // Sync the WC order stats.
		$import = ReportsSync::regenerate_report_data( null, false );
    }
}
