<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_2_8_3_VendorBalance;

class V_2_8_3 extends DokanUpgrader {

    /**
     * Add new table for vendor-balance
     *
     * @since 2.8.3
     *
     * @return void
     */
    public static function create_vendor_balance_table_283() {
        $processor = new V_2_8_3_VendorBalance();

        $args = [
            'updating' => 'vendor_balance_table',
        ];

        $processor->push_to_queue( $args )->dispatch_process();
    }
}
