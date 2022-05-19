<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_5_1_UpdateProductCategories;

class V_3_5_1 extends DokanUpgrader {

    /**
     * Updates product categories.
     * For every child category, it will update the parent categories and ancestors.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function update_products_categories() {
        $i         = 0;
        $products  = [];
        $processor = new V_3_5_1_UpdateProductCategories();

        while ( null !== $products ) {
            $args = [
                'paged' => $i++,
                'posts_per_page' => 20,
            ];

            $products = dokan()->product->all( $args )->posts;

            if ( ! empty( $products ) ) {
                $processor->push_to_queue( $products );
            } else {
                $products = null;
            }
        }

        $processor->dispatch_process();
    }
}
