<?php

namespace WeDevs\Dokan\StoreProductsSections;

use WeDevs\Dokan\Abstracts\DokanStoreProducts;

/**
 * Best Selling products section class.
 *
 * For displaying best selling products section to single store page.
 *
 * @since 3.3.5
 *
 * @package dokan
 */
class BestSellingProducts extends DokanStoreProducts {

    /**
     * Get products section data.
     *
     * @since 3.3.5
     *
     * @return array
     */
    public function get_products_section_data() {
        return [
            'customizer_key' => 'hide_best_sell_products',
            'settings_key'   => 'show_best_sell_products',
            'products'       => dokan_get_best_selling_products( $this->items_to_show, $this->vendor_id ),
            'section_id'     => 'dokan-best-selling-products',
            'section_title'  => __( 'Best Selling Products', 'dokan-lite' ),
        ];
    }
}
