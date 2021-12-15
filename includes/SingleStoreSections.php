<?php

namespace WeDevs\Dokan;

/**
 * Single store sections class.
 *
 * For displaying additional sections to single store page.
 *
 * @since 3.3.3
 *
 * @package dokan
 */
class SingleStoreSections {

    /**
     * Products section appearance settings.
     *
     * @since 3.3.3
     *
     * @var array
     */
    public $products_section_appearance = [];

    /**
     * Products to display in each additional sections.
     *
     * @since 3.3.3
     *
     * @var int
     */
    public $items_to_show = 3;

    /**
     * If there is any additional products section.
     *
     * @since 3.3.3
     *
     * @var bool
     */
    public $has_additional_products_section = false;

    /**
     * Vendor ID.
     *
     * @since 3.3.3
     *
     * @var int
     */
    public $vendor_id = 0;

    /**
     * Store info.
     *
     * @since 3.3.3
     *
     * @var array
     */
    public $store_info = [];

    /**
     * SingleStoreSections constructor.
     *
     * @since 3.3.3
     */
    public function __construct() {
        $this->products_section_appearance = dokan_get_option( 'store_products_section', 'dokan_appearance' );
        $this->items_to_show               = apply_filters( 'dokan_store_products_section_number_of_items', get_option( 'woocommerce_catalog_columns', 3 ) );

        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_products_sections' ], 5, 2 );
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_title_for_regular_products' ], 99 );
    }

    /**
     * Render additional products section.
     *
     * @since 3.3.3
     *
     * @param object $store_user Store user data
     * @param array  $store_info Store info data
     *
     * @return void
     */
    public function render_additional_products_sections( $store_user, $store_info ) {
        $this->vendor_id  = $store_user->ID;
        $this->store_info = $store_info;

        // Render additional products sections.
        $this->render_featured_products_section();
        $this->render_latest_products_section();
        $this->render_best_selling_products_section();
        $this->render_top_rated_products_section();
    }

    /**
     * Render featured products section.
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function render_featured_products_section() {
        // Get featured products section.
        $this->get_addtional_products_section(
            'featured_products',
            'dokan_get_featured_products',
            'dokan-featured-products',
            __( 'Featured Products', 'dokan-lite' )
        );
    }

    /**
     * Render latest products section.
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function render_latest_products_section() {
        // Get latest products section.
        $this->get_addtional_products_section(
            'latest_products',
            'dokan_get_latest_products',
            'dokan-latest-products',
            __( 'Latest Products', 'dokan-lite' )
        );
    }

    /**
     * Render best selling products section.
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function render_best_selling_products_section() {
        // Get best selling products section.
        $this->get_addtional_products_section(
            'best_sell_products',
            'dokan_get_best_selling_products',
            'dokan-best-selling-products',
            __( 'Best Selling Products', 'dokan-lite' )
        );
    }

    /**
     * Render top rated products section.
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function render_top_rated_products_section() {
        // Get top rated products section.
        $this->get_addtional_products_section(
            'top_rated_products',
            'dokan_get_top_rated_products',
            'dokan-top-rated-products',
            __( 'Top Rated Products', 'dokan-lite' )
        );
    }

    /**
     * Render additional title for regular products block.
     *
     * @since 3.3.3
     *
     * @return void
     */
    public function render_additional_title_for_regular_products() {
        // Check if there is any additional procucts block
        if ( empty( $this->has_additional_products_section ) ) {
            return;
        }

        ?>
            <h2 class="products-list-heading"><?php esc_html_e( 'All Products', 'dokan-lite' ); ?></h2>
        <?php
    }

    /**
     * Get additional products section based on requirements.
     *
     * @since 3.3.3
     *
     * @param string $handle        Products handle for generating customizer and settings keys
     * @param string $function_name Function name for getting desired products
     * @param string $section_id    Section id for using at HTML markup
     * @param string $section_title Section title to preview as heading
     *
     * @return void
     */
    public function get_addtional_products_section( $handle, $function_name, $section_id, $section_title ) {
        // Customizer and settings keys to check products section visibility
        $customizer_key = 'hide_' . $handle;
        $settings_key   = 'show_' . $handle;

        // Check if desired products section visibility enabled by admin and vendor.
        if ( ! $this->is_products_block_visible( $customizer_key, $settings_key ) ) {
            return;
        }

        // Get products.
        $products = $function_name( $this->items_to_show, $this->vendor_id );

        // Check if there is any product.
        if ( ! $products->have_posts() ) {
            return;
        }

        // Include product template after passing all checks.
        dokan_get_template_part(
            'store-products-block', '', [
                'products_type' => $products,
                'section_id'    => $section_id,
                'section_title' => $section_title,
            ]
        );

        // Turn additional products section to true
        $this->has_additional_products_section = true;
    }


    /**
     * Check products block visibility settings by admin and vendor.
     *
     * @since 3.3.3
     *
     * @param string $customizer_key Cusomizer key for checking products section visibility by admin
     * @param string $settings_key   Settings key for checking products section visibility by vendor
     *
     * @return bool
     */
    public function is_products_block_visible( $customizer_key, $settings_key ) {
        // Check if current products section enabled by admin.
        if ( ! isset( $this->products_section_appearance[ $customizer_key ] ) || 'on' === $this->products_section_appearance[ $customizer_key ] ) {
            return false;
        }

        // Check if current products section enabled by vendor.
        if ( isset( $this->store_info[ $settings_key ] ) && 'no' === $this->store_info[ $settings_key ] ) {
            return false;
        }

        return true;
    }
}
