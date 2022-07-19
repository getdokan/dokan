<?php

namespace WeDevs\Dokan\ProductCategory;

use WeDevs\Dokan\ProductCategory\ProductCategoryCache;

/**
 * Hooks class for product categories.
 *
 * @since 3.6.2
 */
class Hooks {

    /**
     * Class constructor.
     *
     * @since 3.6.2
     */
    public function __construct() {
        add_action( 'pre_delete_term', [ $this, 'add_chosen_categories_to_action_queue' ], 10, 1 );
        add_action( 'dokan_delete_reference_category_from_chosen_cat', [ $this, 'delete_reference_category_from_chosen_cat' ], 10, 1 );

        // Manage product category cache.
        new ProductCategoryCache();
    }

    /**
     * Delete all references for chosen_product_cat with category id under postmeta table.
     *
     * @since 3.6.2
     *
     * @param array $results
     *
     * @return void
     */
    public function delete_reference_category_from_chosen_cat( $results = [] ) {
        // validating results task.
        if ( ! isset( $results['task'] ) || 'delete_refrence_chosen_cats' !== $results['task'] ) {
            return;
        }

        $meta_datas      = ! empty( $results['data'] ) ? $results['data'] : [];
        $replace_by      = ! empty( $results['replace_by'] ) ? $results['replace_by'] : '';
        $replaceable_cat = ! empty( $results['replaceable_cat'] ) ? $results['replaceable_cat'] : '';

        // Validating data and replace by category.
        if ( empty( $meta_datas ) || ! is_array( $meta_datas ) || empty( $replace_by ) || empty( $replaceable_cat ) ) {
            return;
        }

        foreach ( $meta_datas as $meta_data ) {
            $meta_value = maybe_unserialize( $meta_data['meta_value'] );
            $meta_value = array_map( 'absint', $meta_value );
            $searched   = array_search( $replaceable_cat, $meta_value, true );

            if ( ! isset( $meta_value[ $searched ] ) ) {
                continue;
            }

            // replace parent category id / default category
            $meta_value[ $searched ] = $replace_by;

            // save updated data
            update_post_meta( $meta_data['post_id'], 'chosen_product_cat', $meta_value );
        }
    }

    /**
     * Add categories to action scheduler queue to delete the chosen cat reference from post meta.
     *
     * @param int $category_id
     *
     * @since 3.6.2
     *
     * @return void
     */
    public function add_chosen_categories_to_action_queue( $category_id ) {
        global $wpdb;
        $limit               = 10;
        $offset              = 0;
        $results             = [];
        $deleting_term       = get_term( $category_id );
        $default_product_cat = get_option( 'default_product_cat' );
        $search_key          = '%' . $wpdb->esc_like( $category_id ) . '%';

        while ( null !== $results ) {
            $results = $wpdb->get_results(
                $wpdb->prepare( "SELECT post_id, meta_value FROM {$wpdb->prefix}postmeta where meta_key='chosen_product_cat' AND meta_value LIKE %s LIMIT %d OFFSET %d", $search_key, $limit, $offset ),
                ARRAY_A
            );

            if ( ! empty( $results ) ) {
                $args = [
                    'task'            => 'delete_refrence_chosen_cats',
                    'data'            => $results,
                    'replaceable_cat' => $category_id,
                    'replace_by'      => $deleting_term->parent ? $deleting_term->parent : $default_product_cat,
                ];

                WC()->queue()->add( 'dokan_delete_reference_category_from_chosen_cat', [ $args ] );
            } else {
                $results = null;
            }

            $offset += $limit;
        }
    }
}
