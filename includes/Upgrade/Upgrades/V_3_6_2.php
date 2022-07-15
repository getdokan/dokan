<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_6_2_UpdateProductCategories;

class V_3_6_2 extends DokanUpgrader {

    /**
     * Updates product categories.
     * For every child category, it will update the parent categories and ancestors.
     *
     * @since 3.6.2
     *
     * @return void
     */
    public static function update_products_categories() {
        $i         = 1;
        $products  = [];
        $processor = new V_3_6_2_UpdateProductCategories();

        while ( null !== $products ) {
            $args = [
                'paged' => $i,
                'posts_per_page' => 10,
            ];

            $products = dokan()->product->all( $args )->posts;

            if ( ! empty( $products ) ) {
                $processor->push_to_queue( $products );
            } else {
                $products = null;
            }

            $i++;
        }

        $processor->dispatch_process();
    }
}
