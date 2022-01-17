<?php
/**
 * The template for display additional products section
 *
 * @since 3.3.7
 *
 * @var string $section_id
 * @var string $section_title
 * @var \WeDevs\Dokan\Vendor\Vendor $vendor
 *
 */
?>

<?php do_action( "dokan_store_before_{$section_id}_product_section", $vendor ); ?>

<div id="dokan_store_section_<?php echo esc_attr( $section_id ); ?>" class="dokan-store-product-section">
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

<?php do_action( "dokan_store_after_{$section_id}_product_section", $vendor ); ?>
