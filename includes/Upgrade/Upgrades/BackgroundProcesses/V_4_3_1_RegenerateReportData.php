<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;
use Automattic\WooCommerce\Admin\ReportsSync;

/**
 * Regenerate WooCommerce report data in background.
 *
 * @since DOKAN_SINCE
 */
class V_4_3_1_RegenerateReportData extends DokanBackgroundProcesses {

    /**
     * @param mixed $item
     *
     * @return bool
     */
    public function task( $item ) {
        if ( class_exists( ReportsSync::class ) && method_exists( ReportsSync::class, 'regenerate_report_data' ) ) {
            ReportsSync::regenerate_report_data( null, false );
        }

        return false;
    }
}
