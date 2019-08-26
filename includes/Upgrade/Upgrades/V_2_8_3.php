<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_8_3 extends DokanUpgrader {

    /**
     * Add new table for vendor-balance
     *
     * @since 2.8.3
     *
     * @return void
     */
    public static function create_vendor_balance_table_283() {
        $processor_file = DOKAN_INC_DIR . '/Upgrade/Upgrades/background-processes/class_dokan_update_2_8_3_vendor_balance.php';

        include_once $processor_file;

        $processor = new \Dokan_Update_2_8_3_Vendor_Balance();

        $args = [
            'updating' => 'vendor_balance_table',
        ];

        $processor->push_to_queue( $args )->dispatch_process( $processor_file );
    }
}
