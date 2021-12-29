<?php

namespace WeDevs\Dokan\StoreProductsSections;

use WeDevs\Dokan\StoreProductsSections\DokanStoreProducts;

/**
 * Featured products section class.
 *
 * For displaying featured products section to single store page.
 *
 * @since 3.3.6
 *
 * @package dokan
 */
class FeaturedProducts extends DokanStoreProducts {

    /**
     * Get products section data.
     *
     * @since 3.3.6
     *
     * @return array
     */
    public function get_products_section_data() {
        return [
            'products_type'  => 'featured',
            'customizer_key' => 'hide_featured_products',
            'settings_key'   => 'show_featured_products',
            'products'       => dokan_get_featured_products( $this->items_to_show, $this->vendor_id ),
            'section_id'     => 'dokan-featured-products',
            'section_title'  => __( 'Featured Products', 'dokan-lite' ),
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
            'customizer_title' => __( 'Hide featured products', 'dokan-lite' ),
            'customizer_key'   => 'hide_featured_products',
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
            'customizer_key'       => 'hide_featured_products',
            'settings_key'         => 'show_featured_products',
            'settings_field_name'  => 'setting_show_featured_products',
            'settings_field_label' => __( 'Show featured products section', 'dokan-lite' ),
        ];
    }
}
