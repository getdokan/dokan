<?php

namespace WeDevs\Dokan\StoreProductsSections;

use WeDevs\Dokan\StoreProductsSections\DokanStoreProducts;

/**
 * Latest products section class.
 *
 * For displaying latest products section to single store page.
 *
 * @since 3.3.5
 *
 * @package dokan
 */
class LatestProducts extends DokanStoreProducts {

    /**
     * Get products section data.
     *
     * @since 3.3.5
     *
     * @return array
     */
    public function get_products_section_data() {
        return [
            'customizer_key' => 'hide_latest_products',
            'settings_key'   => 'show_latest_products',
            'products'       => dokan_get_latest_products( $this->items_to_show, $this->vendor_id ),
            'section_id'     => 'dokan-latest-products',
            'section_title'  => __( 'Latest Products', 'dokan-lite' ),
        ];
    }

    /**
     * Get customizer settings data.
     *
     * @since 3.3.5
     *
     * @return array
     */
    public function get_customizer_settings_data() {
        return [
            'customizer_title' => __( 'Hide latest products', 'dokan-lite' ),
            'customizer_key'   => 'hide_latest_products',
        ];
    }
}
