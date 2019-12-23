<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_9_23 extends DokanUpgrader {

    /**
     * Update update store settings
     *
     * @since 2.9.23
     *
     * @return void
     */
    public function dokan_update_store_name() {
        $processor_file = DOKAN_INC_DIR . '/Upgrade/Upgrades/background-processes/class_dokan_update_2_9_23_store_name.php';

        include_once $processor_file;

        $processor = new Dokan_Update_2_9_23_Store_Name();

        $args = array(
            'updating' => 'store_name',
            'paged'    => 0
        );

        $processor->push_to_queue( $args )->dispatch_process( $processor_file );
    }
}
