<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;
use WeDevs\Dokan\ProductCategory\Helper;

/**
 * Select all parent categories based on child category id.
 *
 * @since 3.6.2
 */
class V_3_6_2_UpdateProductCategories extends DokanBackgroundProcesses {

    /**
     * Save all ancestors ids based on child id.
     *
     * @param array $products
     *
     * @since 3.6.2
     *
     * @return bool
     */
    public function task( $products ) {
        if ( empty( $products || ! is_array( $products ) ) ) {
            return false;
        }

        foreach ( $products as $product ) {
            $chosen_cat = Helper::get_saved_products_category( $product->ID );
        }

        return false;
    }
}
