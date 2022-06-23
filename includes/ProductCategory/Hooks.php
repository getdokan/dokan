<?php

namespace WeDevs\Dokan\ProductCategory;

use WeDevs\Dokan\ProductCategory\ProductCategoryCache;

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
        add_action( 'pre_delete_term', [ $this, 'add_chosen_categories_to_action_queue' ], 10, 1 );
        add_action( 'dokan_delete_reference_category_from_chosen_cat', [ $this, 'delete_reference_category_from_chosen_cat' ], 10, 1 );

        // Manage product category cache.
        new ProductCategoryCache();
    }

    /**
     * Delete all references for chosen_product_cat with category id under postmeta table.
     *
     * @since DOKAN_SINCE
     *
     * @param array $results
     *
     * @return void
     */
    public function delete_reference_category_from_chosen_cat( $results = [] ) {
        global $wpdb;

        // validating results task.
        if ( ! isset( $results['task'] ) || 'delete_refrence_chosen_cats' !== $results['task'] ) {
            return;
        }

        $categories = isset( $results['data'] ) ? $results['data'] : [];
        $replace_by = isset( $results['replace_by'] ) ? $results['replace_by'] : '';
        $replaceable_cat = isset( $results['replaceable'] ) ? $results['replaceable'] : '';

        // Validating data and replace by category.
        if ( empty( $categories ) || ! is_array( $categories ) || empty( $replace_by ) || empty( $replaceable_cat ) ) {
            return;
        }

        foreach ( $categories as $category ) {
            $data = maybe_unserialize( $category['meta_value'] );
            $searched = array_search( $replaceable_cat, $data, true );

            if ( false !== $searched ) {
                $data[ $searched ] = $replace_by;
                $ids = maybe_serialize( $data );

                $wpdb->update(
                    $wpdb->prefix . 'postmeta',
                    [
                        'meta_value' => $ids,
                    ],
                    [
                        'meta_id' => $category['meta_id'],
                    ]
                );
            }
        }
    }

    /**
     * Add categories to action scheduler queue to delete the chosen cat reference from post meta.
     *
     * @param int $category_id
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function add_chosen_categories_to_action_queue( $category_id ) {
        global $wpdb;
        $limit               = 20;
        $offset              = 0;
        $results             = [];
        $deleting_term       = get_term( $category_id );
        $default_product_cat = get_option( 'default_product_cat' );

        while ( null !== $results ) {
            $results = $wpdb->get_results(
                $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}postmeta where meta_key='chosen_product_cat' AND meta_value LIKE %s LIMIT %d OFFSET %d", '%' . $category_id . '%', $limit, $offset ),
                ARRAY_A
            );

            if ( ! empty( $results ) ) {
                $args = [
                    'task'        => 'delete_refrence_chosen_cats',
                    'data'        => $results,
                    'replaceable' => $category_id,
                    'replace_by'  => 0 !== absint( $deleting_term->parent ) ? $deleting_term->parent : $default_product_cat,
                ];

                wc()->queue()->add( 'dokan_delete_reference_category_from_chosen_cat', [ $args ] );

                $offset += $limit;
            } else {
                $results = null;
            }
        }
    }
}
