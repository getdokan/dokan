<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses\V_3_4_3_UpdateProductCategories;

class V_3_4_3 extends DokanUpgrader {

    /**
     * Updates product categories.
     * For every child category, it will update the parent categories and ancestors.
     *
     * @since 3.3.9
     *
     * @return void
     */
    public static function update_products_categories() {
        $i         = 0;
        $products  = [];
        $processor = new V_3_4_3_UpdateProductCategories();

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
