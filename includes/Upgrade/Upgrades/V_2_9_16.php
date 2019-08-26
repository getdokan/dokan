<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;

class V_2_9_16 extends DokanUpgrader {

    /**
     * Update update store settings
     *
     * @since 2.9.16
     *
     * @return void
     */
    public static function update_store_settings() {
        $processor_file = DOKAN_INC_DIR . '/Upgrade/Upgrades/background-processes/class_dokan_update_2_9_16_store_settings.php';

        include_once $processor_file;

        $processor = new \Dokan_Update_2_9_16_Store_Settings();

        $args = [
            'updating' => 'store_settings',
            'paged'    => 0
        ];

        $processor->push_to_queue( $args )->dispatch_process( $processor_file );
    }
}
