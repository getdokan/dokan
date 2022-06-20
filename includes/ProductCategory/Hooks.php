<?php

namespace WeDevs\Dokan\ProductCategory;

use WeDevs\Dokan\Cache;

/**
 * Hooks class for product categories.
 *
 * @since DOKAN_SINCE
 */
class Hooks {

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        add_action( 'edit_product_cat', [ $this, 'clear_multistep_category_cache' ], 10, 1 );
        add_action( 'pre_delete_term', [ $this, 'clear_multistep_category_cache' ], 10, 1 );

        add_action( 'pre_delete_term', [ $this, 'delete_references_for_chosen_products_cats' ], 10, 1 );
    }

    /**
     * Delete product category cache
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function clear_multistep_category_cache() {
        $transient_key = function_exists( 'wpml_get_current_language' ) ? 'multistep_categories_' . wpml_get_current_language() : 'multistep_categories';
        Cache::delete_transient( $transient_key );
    }

    /**
     * Delete all references for chosen_product_cat with category id under postmeta table.
     *
     * @since DOKAN_SINCE
     *
     * @param int $category_id
     *
     * @return void
     */
    public function delete_references_for_chosen_products_cats( $category_id ) {

    }
}
