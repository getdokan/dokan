<?php

namespace WeDevs\Dokan\StoreProductsSections;

use WeDevs\Dokan\StoreProductsSections\DokanStoreProducts;

/**
 * Top rated products section class.
 *
 * For displaying top rated products section to single store page.
 *
 * @since 3.3.5
 *
 * @package dokan
 */
class TopRatedProducts extends DokanStoreProducts {

    /**
     * Get products section data.
     *
     * @since 3.3.5
     *
     * @return array
     */
    public function get_products_section_data() {
        return [
            'customizer_key' => 'hide_top_rated_products',
            'settings_key'   => 'show_top_rated_products',
            'products'       => dokan_get_top_rated_products( $this->items_to_show, $this->vendor_id ),
            'section_id'     => 'dokan-top-rated-products',
            'section_title'  => __( 'Top Rated Products', 'dokan-lite' ),
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
            'customizer_title' => __( 'Hide top rated products', 'dokan-lite' ),
            'customizer_key'   => 'hide_top_rated_products',
        ];
    }
}
