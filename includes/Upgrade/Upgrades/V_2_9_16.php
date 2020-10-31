<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_2_9_16_StoreSettings;

class V_2_9_16 extends DokanUpgrader {

    /**
     * Update update store settings
     *
     * @since 2.9.16
     *
     * @return void
     */
    public static function update_store_settings() {
        $processor = new V_2_9_16_StoreSettings();

        $args = [
            'updating' => 'store_settings',
            'paged'    => 0,
        ];

        $processor->push_to_queue( $args )->dispatch_process();
    }
}
