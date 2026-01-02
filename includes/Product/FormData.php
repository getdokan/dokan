<?php

namespace WeDevs\Dokan\Product;

class FormData {

    /**
     * Get product brands recursively in a flat array for dropdowns.
     *
     * @param int   $parent_id The ID of the parent term (0 for top-level).
     * @param int   $level     The current recursion depth for indentation.
     * @param array $results   Pass-by-reference array to collect data.
     *
     * @return array
     *
     * @since DOKAN_SINCE
     */
    public static function get_products_brands( int $parent_id = 0, int $level = 0, array &$results = [] ): array {
        $args = apply_filters(
            'dokan_product_brands_args', [
                'taxonomy'   => 'product_brand',
                'hide_empty' => 0,
                'parent'     => $parent_id,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]
        );

        $terms = get_terms( $args );

        if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
            foreach ( $terms as $term ) {
                // Add to our flat results array
                $results[] = [
                    'value' => $term->term_id,
                    'slug'  => $term->slug,
                    'label' => $term->name,
                    'parent' => $parent_id,
                ];
                // Recursive call to find children of this term
                self::get_products_brands( $term->term_id, $level + 1, $results );
            }
        }

        return apply_filters( 'dokan_get_products_brands_data', $results );
    }

    /**
     * Search product tags
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_product_tags(): array {
        $drop_down_tags = apply_filters(
            'dokan_product_tags_args', [
                'taxonomy'   => 'product_tag',
                'hide_empty' => 0,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ]
        );

        $data = [];
        $product_tags = get_terms( $drop_down_tags );
        if ( $product_tags ) {
            foreach ( $product_tags as $term ) {
                $data[] = [
                    'value' => $term->term_id,
                    'slug'  => $term->slug,
                    'label' => $term->name,
                ];
            }
        }

        return $data;
    }
}
