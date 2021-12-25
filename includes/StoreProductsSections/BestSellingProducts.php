<?php

namespace WeDevs\Dokan\StoreProductsSections;

use WeDevs\Dokan\StoreProductsSections\DokanStoreProducts;

/**
 * Best Selling products section class.
 *
 * For displaying best selling products section to single store page.
 *
 * @since 3.3.6
 *
 * @package dokan
 */
class BestSellingProducts extends DokanStoreProducts {

    /**
     * Get products section data.
     *
     * @since 3.3.6
     *
     * @return array
     */
    public function get_products_section_data() {
        return [
            'products_type'  => 'best_sell_products',
            'customizer_key' => 'hide_best_sell_products',
            'settings_key'   => 'show_best_sell_products',
            'products'       => dokan_get_best_selling_products( $this->items_to_show, $this->vendor_id ),
            'section_id'     => 'dokan-best-selling-products',
            'section_title'  => __( 'Best Selling Products', 'dokan-lite' ),
        ];
    }

    /**
     * Get customizer settings data.
     *
     * @since 3.3.6
     *
     * @return array
     */
    public function get_customizer_settings_data() {
        return [
            'customizer_title' => __( 'Hide best selling products', 'dokan-lite' ),
            'customizer_key'   => 'hide_best_sell_products',
        ];
    }

    /**
     * Get store settings data.
     *
     * @since 3.3.6
     *
     * @return array
     */
    public function get_store_settings_data() {
        return [
            'customizer_key'       => 'hide_best_sell_products',
            'settings_key'         => 'show_best_sell_products',
            'settings_field_name'  => 'setting_show_best_sell_products',
            'settings_field_label' => __( 'Show best sell products section', 'dokan-lite' ),
        ];
    }
}
