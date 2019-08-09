<?php

namespace WeDevs\Dokan\Product;

use WP_Query;

/**
* Product manager Class
*
* @since 3.0.0
*/
class Manager {

    /**
     * Get all Product for a vendor
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function all( $args = [] ) {
        $post_statuses = apply_filters( 'dokan_get_product_status', [ 'publish', 'draft', 'pending', 'future' ] );

        $defaults = [
            'post_type'      => 'product',
            'post_status'    => $post_statuses,
            'posts_per_page' => -1,
            'orderby'        => 'post_date',
            'order'          => 'DESC',
            'paged'          => 1,
        ];

        $args = wp_parse_args( $args, $defaults );

        return new WP_Query( apply_filters( 'dokan_all_products_query', $args ) );
    }

    /**
     * Get featured products
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function featured( $args = [] ) {
        if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
            $product_visibility_term_ids = wc_get_product_visibility_term_ids();

            $args['tax_query'][] = [
                'taxonomy' => 'product_visibility',
                'field'    => 'term_taxonomy_id',
                'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
                'operator' => 'NOT IN',
            ];

            $args['tax_query'][] = [
                'taxonomy' => 'product_visibility',
                'field'    => 'term_taxonomy_id',
                'terms'    => $product_visibility_term_ids['featured'],
            ];
        } else {
            $args['meta_query'] = [
                [
                    'key'     => '_visibility',
                    'value'   => array( 'catalog', 'visible' ),
                    'compare' => 'IN'
                ],
                [
                    'key'   => '_featured',
                    'value' => 'yes'
                ]
            ];
        }

        return $this->all( apply_filters( 'dokan_featured_products_query', $args ) );
    }

    /**
     * Get latest product
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function latest( $args = [] ) {
        if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
            $product_visibility_term_ids = wc_get_product_visibility_term_ids();

            $args['tax_query'] = [
                'taxonomy' => 'product_visibility',
                'field'    => 'term_taxonomy_id',
                'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
                'operator' => 'NOT IN',
            ];
        } else {
            $args['meta_query']  = [
                [
                    'key'     => '_visibility',
                    'value'   => [ 'catalog', 'visible' ],
                    'compare' => 'IN'
                ]
            ];
        }

        return $this->all( apply_filters( 'dokan_latest_products_query', $args ) );
    }

    /**
     * Best Selling Products
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function best_selling( $args = [] ) {

        $args['meta_key'] = 'total_sales';
        $args['orderby']  = 'meta_value_num';

        if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
            $product_visibility_term_ids = wc_get_product_visibility_term_ids();
            $args['tax_query'] = [
                'taxonomy' => 'product_visibility',
                'field'    => 'term_taxonomy_id',
                'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
                'operator' => 'NOT IN',
            ];
        } else {
            $args['meta_query']  = [
                [
                    'key'     => '_visibility',
                    'value'   => array('catalog', 'visible'),
                    'compare' => 'IN'
                ]
            ];
        }

        return $this->all( apply_filters( 'dokan_best_selling_products_query', $args ) );
    }

    /**
     * Top rated product
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function top_rated( $args = array() ) {
        if ( version_compare( WC_VERSION, '2.7', '>' ) ) {
            $product_visibility_term_ids = wc_get_product_visibility_term_ids();

            $args['tax_query'] = [
                'taxonomy' => 'product_visibility',
                'field'    => 'term_taxonomy_id',
                'terms'    => is_search() ? $product_visibility_term_ids['exclude-from-search'] : $product_visibility_term_ids['exclude-from-catalog'],
                'operator' => 'NOT IN',
            ];
        } else {
            $args['meta_query']  = [
                [
                    'key'     => '_visibility',
                    'value'   => [ 'catalog', 'visible' ],
                    'compare' => 'IN'
                ]
            ];
        }

        add_filter( 'posts_clauses', [ 'WC_Shortcodes', 'order_by_rating_post_clauses' ] );
        $products = $this->all( apply_filters( 'dokan_top_rated_products_query', $args ) );
        remove_filter( 'posts_clauses', [ 'WC_Shortcodes', 'order_by_rating_post_clauses' ] );

        return $products;
    }
}
