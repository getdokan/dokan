<?php

namespace WeDevs\Dokan\ProductCategory;

/**
 * Product category helper class.
 *
 * @since DOKAN_SINCE
 */
class Helper {

    /**
     * Returns 'true' if category type selection for Products is single, 'false' if type is multiple
     *
     * @since DOKAN_SINCE
     *
     * @return boolean
     */
    public static function product_category_selection_is_single() {
        return dokan_get_option( 'product_category_style', 'dokan_selling', 'single' ) === 'single';
    }

    /**
     * Returns products category.
     *
     * @since DOKAN_SINCE
     *
     * @param integer $post_id
     *
     * @return array
     */
    public static function get_saved_products_category( $post_id ) {
        $is_single  = self::product_category_selection_is_single();
        $terms      = wp_get_post_terms( $post_id, 'product_cat', array( 'fields' =>  'all') );
        $chosen_cat = get_post_meta( $post_id, 'chosen_product_cat', true );

        // If no chosen category found.
        if ( ! $chosen_cat || ! is_array( $chosen_cat ) || count( $chosen_cat ) < 1 ) {
            // If product has only one category, choose it as the chosen category.
            // Or if multiple category is selected, choose the common parents child as chosen category.
            if ( count( $terms ) === 1 ) {
                $chosen_cat = [ reset( $terms )->term_id ];
            } else {
                $chosen_cat   = $terms;
                $all_parents  = [];

                foreach ( $chosen_cat as $key => $cat ) {
                    $term_id       = ! empty( $cat->term_id ) ? $cat->term_id: $cat;
                    $all_ancestors = get_ancestors( $term_id, 'product_cat' );
                    $old_parent    = end( $all_ancestors );

                    $old_parent = empty( $old_parent ) ? $term_id : $old_parent;

                    if( ! array_key_exists( $old_parent, $all_parents ) || $all_parents[ $old_parent ]['size'] < count( $all_ancestors ) ) {
                        $all_parents[ $old_parent ]['size']   = count( $all_ancestors );
                        $all_parents[ $old_parent ]['parent'] = $old_parent;
                        $all_parents[ $old_parent ]['child']  = $term_id;
                    }
                }

                $chosen_cat = array_map( function( $value ) {
                    return $value['child'];
                }, $all_parents );

                $chosen_cat = array_values( $chosen_cat );
            }
        }

        if ( $is_single ) {
            $terms      = [ reset( $terms ) ];
            $chosen_cat = [ reset( $chosen_cat ) ];
        }
        $default_product_cat = get_term( get_option('default_product_cat') );

        return [
            'terms'               => $terms,
            'chosen_cat'          => $chosen_cat,
            'is_single'           => $is_single,
            'default_product_cat' => $default_product_cat,
        ];
    }

    /**
     * Get category ancestors HTML;
     *
     * @since DOKAN_SINCE
     *
     * @param integer $term
     *
     * @return string
     */
    public static function get_ancestors_html( $term ) {
        $all_parents   = get_ancestors( $term, 'product_cat' );
        $all_parents   = array_reverse( $all_parents );
        $parents_count = count( $all_parents );
        $html          = '';

        foreach ( $all_parents as $index => $value ) {
            $label = "<span class='dokan-selected-category-product'>" . get_term_field( 'name', $value, 'product_cat' ) . "</span><span class='dokan-selected-category-icon'><i class='fas fa-chevron-right'></i></span>";
            $html .= $label;
        }
        $html .= "<span class='dokan-selected-category-product dokan-cat-selected'>" . get_term_field( 'name', $term, 'product_cat' ) . "</span>";

        return $html;
    }
}
