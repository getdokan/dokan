<?php
/**
 * Dokan Widget Content Product Template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>

<?php if ( $r->have_posts() ) : ?>
    <ul class="dokan-bestselling-product-widget product_list_widget">
    <?php while ( $r->have_posts() ): $r->the_post() ?>
        <?php global $product; ?>
        <li>
            <a href="<?php echo esc_url( get_permalink( $product->id ) ); ?>" title="<?php echo esc_attr( $product->get_title() ); ?>">
                <?php echo $product->get_image(); ?>
                <span class="product-title"><?php echo $product->get_title(); ?></span>
            </a>
            <?php if ( ! empty( $show_rating ) ) echo $product->get_rating_html(); ?>
            <?php echo $product->get_price_html(); ?>
        </li>
        <?php endwhile; ?>
    </ul>
<?php else: ?>
    <p><?php _e( 'No products found', 'dokan' ); ?></p>
<?php endif; ?>
