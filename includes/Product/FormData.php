<?php

namespace WeDevs\Dokan\Product;

class FormData {

    /**
     * Get product brands recursively.
     *
     * @param int $parent_id The ID of the parent term (0 for top-level).
     *
     * @return array
     *
     * @since DOKAN_SINCE
     */
    public static function get_products_brands( int $parent_id = 0 ): array {
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
        $results = [];

        if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
            foreach ( $terms as $term ) {
                $children = self::get_products_brands( $term->term_id );

                $data = [
                    'value' => $term->term_id,
                    'slug'  => $term->slug,
                    'label' => $term->name,
                    'parent' => $parent_id,
                ];

                if ( ! empty( $children ) ) {
                    $data['children'] = $children;
                }

                $results[] = $data;
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
