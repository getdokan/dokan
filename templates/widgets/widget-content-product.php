<?php
/**
 * Dokan Widget Content Product Template
 *
 * @since   2.4
 *
 * @package dokan
 */

$img_kses = apply_filters(
    'dokan_product_image_attributes', [
        'img' => [
            'alt'         => [],
            'class'       => [],
            'height'      => [],
            'src'         => [],
            'width'       => [],
            'srcset'      => [],
            'data-srcset' => [],
            'data-src'    => [],
        ],
    ]
);

?>

<?php if ( $r->have_posts() ) : ?>
    <ul class="dokan-bestselling-product-widget product_list_widget">
        <?php
        while ( $r->have_posts() ) :
            $r->the_post();
            global $product;
            ?>
            <li>
                <a href="<?php echo esc_url( get_permalink( dokan_get_prop( $product, 'id' ) ) ); ?>" title="<?php echo esc_attr( $product->get_title() ); ?>">
                    <?php echo wp_kses( $product->get_image(), $img_kses ); ?>
                    <span class="product-title"><?php echo esc_html( $product->get_title() ); ?></span>
                </a>

                <?php
                if ( ! empty( $show_rating ) ) {
                    echo wc_get_rating_html( $product->get_average_rating() );
                }
                ?>

                <?php echo wp_kses_post( $product->get_price_html() ); ?>
            </li>
        <?php endwhile; ?>
    </ul>
<?php else : ?>
    <p><?php esc_html_e( 'No products found', 'dokan-lite' ); ?></p>
<?php endif; ?>
