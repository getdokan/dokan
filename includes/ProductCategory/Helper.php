<?php

namespace WeDevs\Dokan\ProductCategory;

use WeDevs\Dokan\ProductCategory\Categories;

/**
 * Product category helper class.
 *
 * @since 3.6.2
 */
class Helper {

    /**
     * Returns 'true' if category type selection for Products is single, 'false' if type is multiple
     *
     * @since 3.6.2
     *
     * @return boolean
     */
    public static function product_category_selection_is_single() {
        return 'single' === dokan_get_option( 'product_category_style', 'dokan_selling', 'single' );
    }

    /**
     * Returns 'true' if select any category option is turned on.
     *
     * @since 3.7.15
     *
     * @return boolean
     */
    public static function is_any_category_selection_enabled() {
        return 'on' === dokan_get_option( 'dokan_any_category_selection', 'dokan_selling', 'off' );
    }

    /**
     * Returns products category.
     *
     * @since 3.6.2
     *
     * @param integer $post_id
     * @param boolean $get_default_cat
     *
     * @return array
     */
    public static function get_saved_products_category( $post_id = 0, $get_default_cat = true ) {
        $is_single           = self::product_category_selection_is_single();
        $chosen_cat          = self::get_product_chosen_category( $post_id );
        $data                = [
            'chosen_cat'          => [],
            'is_single'           => $is_single,
            'default_product_cat' => $get_default_cat ? get_term( get_option( 'default_product_cat' ) ) : null,
        ];

        // if post id is empty return default data
        if ( ! $post_id ) {
            return $data;
        }

        // if chosen cat is already exists in database return existing chosen cat
        if ( is_array( $chosen_cat ) && ! empty( $chosen_cat ) ) {
            $data['chosen_cat'] = $is_single ? [ reset( $chosen_cat ) ] : $chosen_cat;
            return $data;
        }

        // get product terms
        $terms = wp_get_post_terms( $post_id, 'product_cat', [ 'fields' => 'ids' ] );

        $chosen_cat = self::generate_chosen_categories( $terms );

        // check if single category is selected, in that case get the first item
        $data['chosen_cat'] = $is_single ? [ reset( $chosen_cat ) ] : $chosen_cat;
        if ( ! empty( $data['chosen_cat'] ) ) {
            self::set_object_terms_from_chosen_categories( $post_id, $data['chosen_cat'] );
        }

        return $data;
    }

    /**
     * Fotomat's chosen cates for generate chosen cats.
     *
     * @since 3.7.0
     *
     * @param  array $all_children
     * @param  array $all_ancestors
     *
     * @return array
     */
    private static function get_formatted_chosen_cat( $all_children, $all_ancestors ) {
        return [
            'children'  => $all_children,
            'ancestors' => $all_ancestors,
        ];
    }

    /**
     * Generates chosen categories from categories/terms array
     *
     * @since 3.6.4
     *
     * @param object $terms
     *
     * @return array
     */
    public static function generate_chosen_categories( $terms ) {
        $all_parents = [];

        // If any category selection option is turned we don't need to generate chosen categories, all terms are also chosen category.
        if ( self::is_any_category_selection_enabled() ) {
            return $terms;
        }

        foreach ( $terms as $term_id ) {
            $all_ancestors = get_ancestors( $term_id, 'product_cat' );
            $all_children  = get_term_children( $term_id, 'product_cat' );
            $old_parent    = empty( $all_ancestors ) ? $term_id : end( $all_ancestors );

            // If current terms most old parent is not in the $all_parents array.
            if ( ! array_key_exists( $old_parent, $all_parents ) ) {
                $all_parents[ $old_parent ][ $term_id ] = self::get_formatted_chosen_cat( $all_children, $all_ancestors );
            } else {
                foreach ( $all_parents[ $old_parent ] as $item_id => $item ) {
                    $existing_chosen       = array_merge( [ $item_id ], $item['children'] );
                    $current_chosen        = array_merge( [ $term_id ], $all_children );
                    $common_children_count = count( array_intersect( $existing_chosen, $current_chosen ) );

                    // If current term and saved chosen cat terms are same bloodline category and current term,
                    // has more ancestors means current term is the youngest term.
                    if ( $common_children_count > 0 && count( $all_ancestors ) > count( $item['ancestors'] ) ) {
                        unset( $all_parents[ $old_parent ][ $item_id ] );

                        $all_parents[ $old_parent ][ $term_id ] = self::get_formatted_chosen_cat( $all_children, $all_ancestors );
                        // If current term and saved chosen cat terms are same bloodline category but not the youngest child.
                    } elseif ( $common_children_count > 0 && count( $all_ancestors ) < count( $item['ancestors'] ) ) {
                        break;
                    } elseif ( $common_children_count < 1 ) {
                        $all_parents[ $old_parent ][ $term_id ] = self::get_formatted_chosen_cat( $all_children, $all_ancestors );
                    }
                }
            }
        }

        // Extracting out the chosen categories.
        $chosen_cats = [];
        foreach ( $all_parents as $parent ) {
            $chosen_cats = array_merge( $chosen_cats, array_keys( $parent ) );
        }

        return $chosen_cats;
    }

    /**
     * Set all ancestors to a product from chosen product categories
     *
     * @since 3.6.2
     *
     * @param int $post_id
     * @param array $chosen_categories
     *
     * @return void
     */
    public static function set_object_terms_from_chosen_categories( $post_id, $chosen_categories = [] ) {
        if ( empty( $chosen_categories ) || ! is_array( $chosen_categories ) ) {
            return;
        }

        /**
         * If enabled any one middle category in dokan product multi-step category selection.
         */
        $any_category_selection = self::is_any_category_selection_enabled();

        $all_ancestors = [];

        // If category middle selection is true, then we will save only the chosen categories or we will save all the ancestors.
        if ( $any_category_selection ) {
            $all_ancestors = $chosen_categories;
        } else {
            // we need to assign all ancestor of chosen category to add to the given product
            foreach ( $chosen_categories as $term_id ) {
                $all_ancestors = array_merge( $all_ancestors, get_ancestors( $term_id, 'product_cat' ), [ $term_id ] );
            }
        }

        // save chosen cat to database
        update_post_meta( $post_id, 'chosen_product_cat', $chosen_categories );
        // add all ancestor and chosen cat as product category

        // We have to convert all the categories into integer because if an category is string ex: '23' not int ex: 23
        // wp_set_object_terms will create a new term named 23. we don't want that.
        $all_ancestors = array_map( 'absint', $all_ancestors );

        wp_set_object_terms( $post_id, array_unique( $all_ancestors ), 'product_cat' );
    }

    /**
     * Get category ancestors HTML;
     *
     * @since 3.6.2
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
            $name = get_term_field( 'name', $value, 'product_cat' );
            $name = is_wp_error( $name ) ? '' : $name;
            $label = '<span class="dokan-selected-category-product">' . $name . '</span><span class="dokan-selected-category-icon"><i class="fas fa-chevron-right"></i></span>';
            $html .= $label;
        }

        $name = get_term_field( 'name', $term, 'product_cat' );
        $name = is_wp_error( $name ) ? '' : $name;
        $html .= '<span class="dokan-selected-category-product dokan-cat-selected">' . $name . '</span>';

        return $html;
    }

    /**
     * Enqueue styles and scripts and localize for dokan multi-step category.
     *
     * @since 3.7.0
     *
     * @return void
     */
    public static function enqueue_and_localize_dokan_multistep_category() {
        wp_enqueue_style( 'dokan-product-category-ui-css' );
        wp_enqueue_script( 'product-category-ui' );

        $categories = new Categories();
        $all_categories = $categories->get();

        $data = [
            'categories' => $all_categories,
            'is_single'  => self::product_category_selection_is_single(),
            'any_category_selection'  => self::is_any_category_selection_enabled(),
            'i18n'       => [
                'select_a_category'  => __( 'Select a category', 'dokan-lite' ),
                'duplicate_category' => __( 'This category has already been selected', 'dokan-lite' ),
            ],
        ];

        wp_localize_script( 'product-category-ui', 'dokan_product_category_data', $data );
    }

    /**
     * Returns the chosen category of a product.
     *
     * @since 3.7.0
     *
     * @param int $product_id
     *
     * @return array
     */
    public static function get_product_chosen_category( $product_id ) {
        return get_post_meta( $product_id, 'chosen_product_cat', true );
    }

    /**
     * Generates and sets products categories.
     *
     * @since 3.7.16
     *
     * @param int $product_id
     *
     * @return array $chosen_categories
     */
    public static function generate_and_set_chosen_categories( $product_id, $chosen_categories = [] ) {
        if ( empty( $chosen_categories ) ) {
            $terms             = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'ids' ] );
            $chosen_categories = self::generate_chosen_categories( $terms );
        }

        self::set_object_terms_from_chosen_categories( $product_id, $chosen_categories );

        return $chosen_categories;
    }
}
