<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_2_9_23_StoreName;

class V_3_2_11 extends DokanUpgrader {

    /**
     * Update store name meta data
     *
     * @since 3.2.11
     *
     * @return void
     */
    public static function dokan_update_store_name() {
        $processor = new V_2_9_23_StoreName();

        $args = [
            'updating' => 'store_name',
            'paged'    => 0,
        ];

        $processor->push_to_queue( $args )->dispatch_process();
    }

}
