<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class Stores extends DokanShortcode {

    protected $shortcode = 'dokan-stores';

     /**
     * Displays the store lists
     *
     * @since 2.4
     *
     * @param  array $atts
     *
     * @return string
     */
    public function render_shortcode( $atts ) {
        $defaults = array(
            'per_page' => 10,
            'search'   => 'yes',
            'per_row'  => 3,
            'featured' => 'no'
        );

        /**
         * Filter return the number of store listing number per page.
         *
         * @since 2.2
         *
         * @param array
         */
        $attr   = shortcode_atts( apply_filters( 'dokan_store_listing_per_page', $defaults ), $atts );
        $paged  = (int) is_front_page() ? max( 1, get_query_var( 'page' ) ) : max( 1, get_query_var( 'paged' ) );
        $limit  = $attr['per_page'];
        $offset = ( $paged - 1 ) * $limit;

        $seller_args = array(
            'number' => $limit,
            'offset' => $offset
        );

        $_get_data = wp_unslash( $_GET );

        // if search is enabled, perform a search
        if ( 'yes' == $attr['search'] ) {
            if ( ! empty( $_get_data['dokan_seller_search'] ) ) {
                $seller_args['meta_query'] = [
                    [
                        'key'     => 'dokan_store_name',
                        'value'   => wc_clean( $_get_data['dokan_seller_search'] ),
                        'compare' => 'LIKE'
                    ]
                ];
            }
        }

        if ( $attr['featured'] == 'yes' ) {
            $seller_args['featured'] = 'yes';
        }

        $sellers = dokan_get_sellers( apply_filters( 'dokan_seller_listing_args', $seller_args, $_GET ) );

        /**
         * Filter for store listing args
         *
         * @since 2.4.9
         */
        $template_args = apply_filters( 'dokan_store_list_args', array(
            'sellers'    => $sellers,
            'limit'      => $limit,
            'offset'     => $offset,
            'paged'      => $paged,
            'image_size' => 'full',
            'search'     => $attr['search'],
            'per_row'    => $attr['per_row']
        ) );

        ob_start();
        dokan_get_template_part( 'store-lists', false, $template_args );
        $content = ob_get_clean();

        return apply_filters( 'dokan_seller_listing', $content, $attr );
    }
}
