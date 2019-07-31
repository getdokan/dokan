<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class TopRatedProduct extends DokanShortcode {

    protected $shortcode = 'dokan-top-rated-product';

    /**
     * Render top rated products via shortcode
     *
     * @param  array  $atts
     *
     * @return string
     */
    public function render_shortcode( $atts ) {
        /**
         * Filter return the number of top rated product per page.
         *
         * @since 2.2
         *
         * @param array
         */
        $per_page = shortcode_atts( apply_filters( 'dokan_top_rated_product_per_page', array(
            'no_of_product' => 8
        ), $atts ), $atts );

        ob_start();
        ?>
        <ul class="products">
            <?php
                $best_selling_query = dokan_get_top_rated_products();

                while ( $best_selling_query->have_posts() ) {
                    $best_selling_query->the_post();

                    wc_get_template_part( 'content', 'product' );
                }
            ?>
        </ul>
        <?php

        return ob_get_clean();
    }
}
