<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_6_2_UpdateProductCategories;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_7_19_UpdateOrderMeta;

class V_3_7_19 extends DokanUpgrader {

    /**
     * Update Order meta.
     * Add new meta `shipping_tax_fee_recipient`
     *
     * @since 3.7.19
     *
     * @return void
     */
    public static function update_order_meta() {
        $i         = 1;
        $processor = new V_3_7_19_UpdateOrderMeta();

        do {
            $args = array(
                'paginate' => true,
                'limit' => 20,
                'paged' => $i,
            );

            $results = wc_get_orders( $args );

            $processor->push_to_queue( $results->orders );

            ++$i;
        } while ( $i <= $results->max_num_pages );

        $processor->dispatch_process();
    }
}
