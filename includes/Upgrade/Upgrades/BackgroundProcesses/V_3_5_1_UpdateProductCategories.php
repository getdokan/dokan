<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Select all parent categories based on child category id.
 *
 * @since DOKAN_SINCE
 */
class V_3_5_1_UpdateProductCategories extends DokanBackgroundProcesses {

    /**
     * Save all ancestors ids based on child id.
     *
     * @param array $products
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function task( $products ) {
        if ( empty( $products ) ) {
            return false;
        }

        foreach ( $products as $key => $product ) {
            $terms = get_the_terms( $product->ID, 'product_cat' );

            $all_cats_with_parents = [];
            $all_parents           = [];

            foreach ( $terms as $index => $term ) {
                $category        = $term->term_id;
                $all_ancestors   = get_ancestors( $category, 'product_cat' );
                $most_old_parent = end( $all_ancestors );
                $all_categories  = $category !== 0 ? $all_ancestors : [];
                $all_categories  = wp_parse_args( $all_categories, [ $category ] );

                empty( $most_old_parent ) ? $most_old_parent = $category : '';

                // If the child already in the array and the current child is more younger than the previous child we are
                // updating as the chosen category.
                if ( ! array_key_exists( $most_old_parent, $all_parents ) || $all_parents[ $most_old_parent ]['size'] < count( $all_ancestors ) ) {
                    $all_parents[ $most_old_parent ]['size']   = count( $all_ancestors );
                    $all_parents[ $most_old_parent ]['parent'] = $most_old_parent;
                    $all_parents[ $most_old_parent ]['child']  = $category;
                }
                $all_cats_with_parents = array_unique( array_merge( $all_cats_with_parents, $all_categories ) );
            }

            // phpcs:disable
            $chosen_cat = array_map( function( $value ) {
                return $value['child'];
            }, $all_parents );
            $chosen_cat = array_values( $chosen_cat );
            // phpcs:enable

            update_post_meta( $product->ID, 'chosen_product_cat', $chosen_cat );
            wp_set_object_terms( $product->ID, $all_cats_with_parents, 'product_cat' );
        }

        return false;
    }
}
