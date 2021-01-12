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
    public static function update_dokan_refund_table() {
        $processor = new V_3_1_1_RefundTableUpdate();

        $tables = [
            [
                'table'     => 'dokan_refund',
                'fields'    => [ 'item_totals' ],
                'type'      => 'text',
                'null'      => 'NULL',
                'default'   => '',
            ],

            [
                'table'     => 'dokan_refund',
                'fields'    => [ 'item_tax_totals' ],
                'type'      => 'text',
                'null'      => 'NULL',
                'default'   => '',
            ],
        ];

        foreach ( $tables as $row ) {
            $processor->push_to_queue( $row );
        }

        $processor->dispatch_process();
    }
}
