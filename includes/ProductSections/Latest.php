<?php

namespace WeDevs\Dokan\ProductSections;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Latest products section class.
 *
 * For displaying latest products section to single store page.
 *
 * @since 3.3.6
 *
 * @package dokan
 */
class Latest extends AbstractProductSection {
    /**
     * Set unique section id for the this section.
     *
     * @since 3.3.6
     *
     * @return void
     */
    protected function set_section_id() {
        $this->section_id = 'latest';
    }

    /**
     * Get customizer setting title of this section.
     *
     * @since 3.3.6
     *
     * @return string
     */
    public function get_customizer_title() {
        return __( 'Hide Latest Products', 'dokan-lite' );
    }

    /**
     * Get single store page section title.
     *
     * @since 3.3.6
     *
     * @return string
     */
    public function get_section_title() {
        return apply_filters( "dokan_{$this->get_section_id()}_product_section_title", __( 'Latest Products', 'dokan-lite' ) );
    }

    /**
     * Get vendor store settings page section label.
     *
     * @since 3.3.6
     *
     * @return string
     */
    public function get_setting_label() {
        return __( 'Show latest products section', 'dokan-lite' );
    }

    /**
     * Get section products.
     *
     * @since 3.3.6
     *
     * @return \WP_Query
     */
    public function get_products( $vendor_id ) {
        return dokan_get_latest_products( $this->item_count, $vendor_id );
    }
}
