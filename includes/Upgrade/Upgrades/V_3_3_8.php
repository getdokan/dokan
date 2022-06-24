<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_3_8_VendorStoreTimes;

class V_3_3_8 extends DokanUpgrader {

    /**
     * Updates usermeta database table column. Before on,
     * store time gets single data in usermeta. Now, we
     * are setting data as array for multiple store times.
     *
     * @since 3.3.8
     *
     * @return void
     */
    public static function update_withdraw_table_column() {
        $i         = 0;
        $vendors   = [];
        $processor = new V_3_3_8_VendorStoreTimes();

        while ( null !== $vendors ) {
            $args = [
                'paged'  => $i++,
                'number' => 10,
                'fields' => 'ID',
            ];

            $vendors = dokan()->vendor->all( $args );

            if ( ! empty( $vendors ) ) {
                $processor->push_to_queue( $vendors );
            } else {
                $vendors = null;
            }
        }

        $processor->dispatch_process();
    }
}
