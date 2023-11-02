<?php

namespace WeDevs\Dokan\ProductCategory;

use WC_Product_Query;
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
        add_action( 'create_product_cat', [ $this, 'clear_multistep_category_cache' ], 10 );
        add_action( 'wpml_sync_term_hierarchy_done', [ $this, 'clear_multistep_category_cache' ], 99 );

        add_action( 'edit_product_cat', [ $this, 'clear_product_category_cache' ], 10, 1 );
        add_action( 'pre_delete_term', [ $this, 'clear_product_category_cache' ], 10, 1 );
    }

    /**
     * Delete product category cache
     *
     * @since 3.6.2
     *
     * @return void
     */
    public function clear_multistep_category_cache() {
        if ( function_exists( 'wpml_get_active_languages' ) ) {
            foreach ( wpml_get_active_languages() as $active_language ) {
                $transient_key = 'multistep_categories_' . $active_language['code'];
                Cache::delete_transient( $transient_key );
            }
        }

        Cache::delete_transient( 'multistep_categories' );
    }

    /**
     * This method will delete store category cache after a category is updated
     *
     * @since 3.2.10
     * @since 3.8.0 Moved this method from includes/wc-functions.php file
     *
     * @param int $term_id
     */
    public function clear_product_category_cache( $term_id ) {
        // get taxonomy slug
        $term = get_term_by( 'ID', $term_id, 'product_cat' );
        if ( false === $term || ! isset( $term->slug ) ) {
            return;
        }

        // get associated product id with this category
        $args = [
            'status'   => 'publish',
            'limit'    => - 1,
            'return'   => 'ids',
            'category' => [ $term->slug ],
        ];

        $query    = new WC_Product_Query( $args );
        $products = $query->get_products();

        if ( empty( $products ) ) {
            return;
        }

        global $wpdb;
        $products   = implode( ',', array_map( 'absint', (array) $products ) );
        $seller_ids = $wpdb->get_col( "SELECT DISTINCT post_author from {$wpdb->posts} WHERE ID in ($products)" ); // phpcs:ignore

        foreach ( $seller_ids as $seller_id ) {
            $transient_group = "seller_product_data_{$seller_id}";
            Cache::invalidate_transient_group( $transient_group );
        }
    }
}
