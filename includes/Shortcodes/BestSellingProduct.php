<?php

namespace WeDevs\Dokan\Shortcodes;

use WeDevs\Dokan\Abstracts\DokanShortcode;

class BestSellingProduct extends DokanShortcode {

    protected $shortcode = 'dokan-best-selling-product';

    /**
     * Render best selling products
     *
     * @param  array  $atts
     *
     * @return string
     */
    public function render_shortcode( $atts ) {
        /**
        * Filter return the number of best selling product per page.
        *
        * @since 2.2
        *
        * @param array
        */
        $atts_val = shortcode_atts(
            apply_filters(
                'dokan_best_selling_product_per_page', array(
					'no_of_product' => 8,
					'seller_id' => '',
                ), $atts
            ), $atts
        );

        ob_start();
        ?>
        <ul class="products">
            <?php
            $best_selling_query = dokan_get_best_selling_products( $atts_val['no_of_product'], $atts_val['seller_id'] );
            ?>
            <?php
            while ( $best_selling_query->have_posts() ) :
				$best_selling_query->the_post();
				?>

                <?php wc_get_template_part( 'content', 'product' ); ?>

            <?php endwhile; ?>
        </ul>
        <?php
        wp_reset_postdata();
        return ob_get_clean();
    }
}
