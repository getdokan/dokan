<?php
/**
 * The template for display additional products section
 *
 * @since 3.3.6
 */
?>

<?php do_action( "dokan_store_before_{$products_type}_products_section" ); ?>

<div id="<?php echo esc_attr( $section_id ); ?>" class="dokan-products-display_section">
    <h2 class="products-list-heading"><?php echo esc_html( $section_title ); ?></h2>
    <div class="seller-items">

        <?php woocommerce_product_loop_start(); ?>

            <?php while ( $products->have_posts() ) : $products->the_post(); ?>

                <?php wc_get_template_part( 'content', 'product' ); ?>

            <?php endwhile; ?>

        <?php woocommerce_product_loop_end(); ?>

        <?php wp_reset_postdata(); ?>

    </div>
</div>

<?php do_action( "dokan_store_after_{$products_type}_products_section" ); ?>
