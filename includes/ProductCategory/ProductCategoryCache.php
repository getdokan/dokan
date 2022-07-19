<?php

namespace WeDevs\Dokan\ProductCategory;

use WeDevs\Dokan\Cache;

/**
 * Product category Cache class.
 *
 * Manage all caches for product category related functionalities.
 *
 * @since 3.6.2
 *
 * @see \WeDevs\Dokan\Cache
 */
class ProductCategoryCache {

    public function __construct() {
        add_action( 'edit_product_cat', [ $this, 'clear_multistep_category_cache' ], 10, 1 );
        add_action( 'pre_delete_term', [ $this, 'clear_multistep_category_cache' ], 10, 1 );
        add_action( 'create_product_cat', [ $this, 'clear_multistep_category_cache' ], 10);
    }

    /**
     * Delete product category cache
     *
     * @since 3.6.2
     *
     * @return void
     */
    public function clear_multistep_category_cache() {
        $transient_key = function_exists( 'wpml_get_current_language' ) ? 'multistep_categories_' . wpml_get_current_language() : 'multistep_categories';
        Cache::delete_transient( $transient_key );
    }
}
