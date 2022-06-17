<?php

namespace WeDevs\Dokan\Dashboard\Templates;

use WeDevs\Dokan\ProductCategory\Categories;

/**
 * Multi step category ui class.
 *
 * @since DOKAN_SINCE
 */
class MultiStepCategories {

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        add_action( 'dokan_before_product_content_area', array( $this, 'load_add_category_modal' ), 10 );
        add_action( 'dokan_before_new_product_content_area', array( $this, 'load_add_category_modal' ), 10 );
        add_action( 'dokan_before_listing_product', array( $this, 'load_add_category_modal' ), 10 );
    }

    /**
     * Returns new category select ui html elements.
     *
     * @since DOKAN_SINCE
     *
     * @return html
     */
    public function load_add_category_modal() {
        /**
         * Checking if dokan dashboard or add product page or product edit page or product list.
         * Because without those page we don't need to load category modal.
         */
        global $wp;
        if ( ( dokan_is_seller_dashboard() && isset( $wp->query_vars['products'] ) ) || ( isset( $wp->query_vars['products'], $_GET['product_id'] ) ) ) {
            $categories = new Categories();
            $all_categories = $categories->get();

            $data = [
                'categories' => $all_categories,
                'is_single'  => dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) == 'single' ? true : false,
            ];

            wp_localize_script( 'dokan-script', 'dokan_product_category_data', $data );

            dokan_get_template_part( 'products/dokan-category-ui', '', array() );
        }
    }

    /**
     * Returns every single category parents from all categories array.
     *
     * @since DOKAN_SINCE
     *
     * @param array $parents
     * @param array $all_categories
     * @param object $value
     * @param string $key
     *
     * @return array
     */
    private function dokan_get_category_parents ( $parents, $all_categories, $value, $key ) {
        foreach ( $all_categories as $category ) {
            if ( $category->term_id === $value->category_parent && $value->category_parent !== 0 ) {
                array_push( $parents, $category );
                $parents = $this->dokan_get_category_parents( $parents, $all_categories, $category, $key );
            }
        }

        return $parents;
    }
}
