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
        // Check if featured products section enabled by admin.
        if ( ! isset( $this->products_section_appearance['hide_featured_products'] ) || 'on' === $this->products_section_appearance['hide_featured_products'] ) {
            return;
        }

        // Check if featured products section enabled by vendor.
        if ( isset( $store_info['hide_featured_products'] ) && 'yes' === $store_info['hide_featured_products'] ) {
            return;
        }

        // Get featured products
        $featured_products = dokan_get_featured_products( $this->items_to_show, $store_user->ID );

        // Check if there is featured products to preview.
        if ( ! $featured_products->have_posts() ) {
            return;
        }

        // Include product tempate after passing all checks.
        dokan_get_template_part( 'store-products-block', '', [
            'products_type' => $featured_products,
            'section_id'    => 'dokan-featured-products',
            'section_title' => __( 'Featured Products', 'dokan-lite' ),
        ] );
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
        // Check if latest products section enabled by admin.
        if ( ! isset( $this->products_section_appearance['hide_latest_products'] ) || 'on' === $this->products_section_appearance['hide_latest_products'] ) {
            return;
        }

        // Check if latest products section enabled by vendor.
        if ( isset( $store_info['hide_latest_products'] ) && 'yes' === $store_info['hide_latest_products'] ) {
            return;
        }

        // Get latest products.
        $latest_products = dokan_get_latest_products( $this->items_to_show, $store_user->ID );

        // Check if there is latest products to preview.
        if ( ! $latest_products->have_posts() ) {
            return;
        }

        // Include product tempate after passing all checks.
        dokan_get_template_part( 'store-products-block', '', [
            'products_type' => $latest_products,
            'section_id'    => 'dokan-latest-products',
            'section_title' => __( 'Latest Products', 'dokan-lite' ),
        ] );
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
        // Check if best selling products section enabled by admin.
        if ( ! isset( $this->products_section_appearance['hide_best_sell_products'] ) || 'on' === $this->products_section_appearance['hide_best_sell_products'] ) {
            return;
        }

        // Check if best selling products section enabled by vendor.
        if ( isset( $store_info['hide_best_sell_products'] ) && 'yes' === $store_info['hide_best_sell_products'] ) {
            return;
        }

        // Get best selling products.
        $best_selling_products = dokan_get_best_selling_products( $this->items_to_show, $store_user->ID );

        // Check if there is best selling products to preview.
        if ( ! $best_selling_products->have_posts() ) {
            return;
        }

        // Include product tempate after passing all checks.
        dokan_get_template_part( 'store-products-block', '', [
            'products_type' => $best_selling_products,
            'section_id'    => 'dokan-best-selling-products',
            'section_title' => __( 'Best Selling Products', 'dokan-lite' ),
        ] );
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
        // Check if top rated products section enabled by admin.
        if ( ! isset( $this->products_section_appearance['hide_top_rated_products'] ) || 'on' === $this->products_section_appearance['hide_top_rated_products'] ) {
            return;
        }

        // Check if top rated products section enabled by vendor.
        if ( isset( $store_info['hide_top_rated_products'] ) && 'yes' === $store_info['hide_top_rated_products'] ) {
            return;
        }

        // Get top rated products.
        $top_rated_products = dokan_get_top_rated_products( $this->items_to_show, $store_user->ID );

        // Check if there is top rated products to preview.
        if ( ! $top_rated_products->have_posts() ) {
            return;
        }

        // Include product tempate after passing all checks.
        dokan_get_template_part( 'store-products-block', '', [
            'products_type' => $top_rated_products,
            'section_id'    => 'dokan-top-rated-products',
            'section_title' => __( 'Top Rated Products', 'dokan-lite' ),
        ] );
    }
}
