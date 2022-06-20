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
        add_action( 'create_product_cat', [ $this, 'clear_multistep_category_cache' ], 10);

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
        global $wpdb;
        $deletable_term = get_term( $category_id );
        $results = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}postmeta where meta_key='chosen_product_cat' AND meta_value LIKE '%%%d%'", $category_id ), ARRAY_A );

        foreach ( $results as $result ) {
            $datas = maybe_unserialize( $result['meta_value'] );
            $searched = array_search( $category_id, $datas );

            if ( false !== $searched ) {
                $datas[ $searched ] = $deletable_term->parent;
                $ids = maybe_serialize( $datas );

                $wpdb->update(
                    $wpdb->prefix . 'postmeta',
                    [
                        'meta_value' => $ids,
                    ],
                    [
                        'meta_id' => $result['meta_id'],
                    ]
                );
            }
        }
    }
}
