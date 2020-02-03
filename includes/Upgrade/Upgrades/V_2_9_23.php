<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_2_9_23_StoreName;

class V_2_9_23 extends DokanUpgrader {

    /**
     * Update update store settings
     *
     * @since 2.9.23
     *
     * @return void
     */
    public static function dokan_update_store_name() {
        $processor = new V_2_9_23_StoreName();

        $args = array(
            'updating' => 'store_name',
            'paged'    => 0
        );

        $processor->push_to_queue( $args )->dispatch_process();
    }
}
