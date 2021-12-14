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
    public $products_section_appearance;

    /**
     * Products to display in each additional sections.
     *
     * @since 3.3.3
     *
     * @var int
     */
    public $items_to_show;

    /**
     * If there is any additional products section.
     *
     * @since 3.3.3
     *
     * @var int
     */
    public $has_additional_products_section;

    /**
     * SingleStoreSections constructor.
     *
     * @since 3.3.3
     */
    public function __construct() {
        $this->products_section_appearance = dokan_get_option( 'store_products_section', 'dokan_appearance' );
        $this->items_to_show               = apply_filters( 'dokan_store_products_section_number_of_items', get_option( 'woocommerce_catalog_columns', 3 ) );

        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_featured_products_section' ], 5, 2 );
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_latest_products_section' ], 5, 2 );
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_best_selling_products_section' ], 5, 2 );
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_top_rated_products_section' ], 5, 2 );
        add_action( 'dokan_store_profile_frame_after', [ $this, 'render_additional_title_for_regular_products' ], 99 );
    }

    /**
     * Render featured products section.
     *
     * @since 3.3.3
     *
     * @param object $store_user_data
     * @param array  $store_info
     *
     * @return void
     */
    public function render_featured_products_section( $store_user, $store_info ) {
        // Check if featured products section visibility enabled by admin and vendor.
        if ( ! $this->is_products_block_visible( $store_info, 'hide_featured_products' ) ) {
            return;
        }

        // Get featured products section.
        $this->get_addtional_products_section(
            'dokan_get_featured_products',
            $store_user->ID,
            'dokan-featured-products',
            __( 'Featured Products', 'dokan-lite' )
        );
    }

    /**
     * Render latest products section.
     *
     * @since 3.3.3
     *
     * @param object $store_user_data
     * @param array  $store_info
     *
     * @return void
     */
    public function render_latest_products_section( $store_user, $store_info ) {
        // Check if latest products section visibility enabled by admin and vendor.
        if ( ! $this->is_products_block_visible( $store_info, 'hide_latest_products' ) ) {
            return;
        }

        // Get latest products section.
        $this->get_addtional_products_section(
            'dokan_get_latest_products',
            $store_user->ID,
            'dokan-latest-products',
            __( 'Latest Products', 'dokan-lite' )
        );
    }

    /**
     * Render best selling products section.
     *
     * @since 3.3.3
     *
     * @param object $store_user_data
     * @param array  $store_info
     *
     * @return void
     */
    public function render_best_selling_products_section( $store_user, $store_info ) {
        // Check if best selling products section visibility enabled by admin and vendor.
        if ( ! $this->is_products_block_visible( $store_info, 'hide_best_sell_products' ) ) {
            return;
        }

        // Get best selling products section.
        $this->get_addtional_products_section(
            'dokan_get_best_selling_products',
            $store_user->ID,
            'dokan-best-selling-products',
            __( 'Best Selling Products', 'dokan-lite' )
        );
    }

    /**
     * Render top rated products section.
     *
     * @since 3.3.3
     *
     * @param object $store_user_data
     * @param array  $store_info
     *
     * @return void
     */
    public function render_top_rated_products_section( $store_user, $store_info ) {
        // Check if top rated products section visibility enabled by admin and vendor.
        if ( ! $this->is_products_block_visible( $store_info, 'hide_top_rated_products' ) ) {
            return;
        }

        // Get top rated products section.
        $this->get_addtional_products_section(
            'dokan_get_top_rated_products',
            $store_user->ID,
            'dokan-top-rated-products',
            __( 'Top Rated Products', 'dokan-lite' )
        );
    }

    public function get_addtional_products_section( $function_name, $vendor_id, $section_id, $section_title ) {
        // Get products.
        $products = $function_name( $this->items_to_show, $vendor_id );

        // Check if there is any product.
        if ( ! $products->have_posts() ) {
            return;
        }

        // Include product template after passing all checks.
        dokan_get_template_part( 'store-products-block', '', [
            'products_type' => $products,
            'section_id'    => $section_id,
            'section_title' => $section_title,
        ] );

        // Turn additional products section to true
        $this->has_additional_products_section = true;
    }


    /**
     * Checks products block visibility settings by admin and vendor.
     *
     * @since 3.3.3
     *
     * @param array  $store_info
     * @param string $key
     *
     * @return bool
     */
    public function is_products_block_visible( $store_info, $key ) {
        // Check if current products section enabled by admin.
        if ( ! isset( $this->products_section_appearance[ $key ] ) || 'on' === $this->products_section_appearance[ $key ] ) {
            return false;
        }

        // Check if current products section enabled by vendor.
        if ( isset( $store_info[ $key ] ) && 'yes' === $store_info[ $key ] ) {
            return false;
        }

        return true;
    }

    /**
     * Render additional title for regualr products block.
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
            <h2 class="products-list-heading"><?php esc_html_e( 'All Products' ); ?></h2>
        <?php
    }
}
