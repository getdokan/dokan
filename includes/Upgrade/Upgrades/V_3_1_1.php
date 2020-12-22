<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_1_1_RefundTableUpdate;

class V_3_1_1 extends DokanUpgrader {

    /**
     * Update dokan refund table fields item_totals and item_tax_totals
     *
     * @return void
     */
    public static function update_dokan_refund_table_tax_and_item_total() {
        $processor = new V_3_1_1_RefundTableUpdate();

        $args = [
            'updating' => 'dokan_refund_table_updated_tax_and_item_total_id',
            'paged'    => 0,
        ];

        $processor->push_to_queue( $args )->dispatch_process();
    }
}
