<?php
/**
 * The Template for displaying all single posts.
 *
 * @package dokan
 * @package dokan - 2014 1.0
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

$store_user                = dokan()->vendor->get( get_query_var( 'author' ) );
$store_info                = $store_user->get_shop_info();
$map_location              = $store_user->get_location();
$layout                    = get_theme_mod( 'store_layout', 'left' );
$vendor_id                 = $store_user->id;
$products_block_appearance = dokan_get_option( 'store_products_section', 'dokan_appearance' );
$items_to_show             = apply_filters( 'dokan_store_products_section_number_of_items', get_option( 'woocommerce_catalog_columns', 3 ) );
$extra_product_block       = 0;

get_header( 'shop' );

if ( function_exists( 'yoast_breadcrumb' ) ) {
    yoast_breadcrumb( '<p id="breadcrumbs">', '</p>' );
}
?>
    <?php do_action( 'woocommerce_before_main_content' ); ?>

    <div class="dokan-store-wrap layout-<?php echo esc_attr( $layout ); ?>">

        <?php if ( 'left' === $layout ) { ?>
            <?php dokan_get_template_part( 'store', 'sidebar', array( 'store_user' => $store_user, 'store_info' => $store_info, 'map_location' => $map_location ) ); ?>
        <?php } ?>

        <div id="dokan-primary" class="dokan-single-store">
            <div id="dokan-content" class="store-page-wrap woocommerce" role="main">

                <?php
                dokan_get_template_part( 'store-header' );

                // Featured products section
                if ( empty( $products_block_appearance['hide_featured_products'] ) && ( empty( $store_info['show_featured_products'] ) || 'yes' === $store_info['show_featured_products'] ) ) {
                    $extra_product_block = 1;
                    $featured_products   = dokan_get_featured_products( $items_to_show, $vendor_id );
                    ?>
                <div id="dokan-featured-products" class="dokan-products-display_section">
                    <h2 class="products-list-heading"><?php esc_html_e( 'Featured Products', 'dokan-lite' ); ?></h2>

                <?php if ( $featured_products->have_posts() ) { ?>
                    <div class="seller-items">

                        <?php woocommerce_product_loop_start(); ?>

                            <?php while ( $featured_products->have_posts() ) : $featured_products->the_post(); ?>

                                <?php wc_get_template_part( 'content', 'product' ); ?>

                            <?php endwhile; ?>

                        <?php woocommerce_product_loop_end(); ?>

                    </div>

                <?php } else { ?>

                    <p class="dokan-info"><?php esc_html_e( 'No featured products were found of this vendor!', 'dokan-lite' ); ?></p>

                <?php } ?>
                </div>
                <?php
                }

                // Latest products section
                if ( empty( $products_block_appearance['hide_latest_products'] ) && ( empty( $store_info['show_latest_products'] ) || 'yes' === $store_info['show_latest_products'] ) ) {
                    $extra_product_block = 1;
                    $latest_products     = dokan_get_latest_products( $items_to_show, $vendor_id );
                    ?>
                <div id="dokan-latest-products" class="dokan-products-display_section">
                    <h2 class="products-list-heading"><?php esc_html_e( 'Latest Products', 'dokan-lite' ); ?></h2>

                <?php if ( $latest_products->have_posts() ) { ?>
                    <div class="seller-items">

                        <?php woocommerce_product_loop_start(); ?>

                            <?php while ( $latest_products->have_posts() ) : $latest_products->the_post(); ?>

                                <?php wc_get_template_part( 'content', 'product' ); ?>

                            <?php endwhile; ?>

                        <?php woocommerce_product_loop_end(); ?>

                    </div>

                <?php } else { ?>

                    <p class="dokan-info"><?php esc_html_e( 'No latest products were found of this vendor!', 'dokan-lite' ); ?></p>

                <?php } ?>
                </div>
                <?php
                }

                // Best selling products section
                if ( empty( $products_block_appearance['hide_best_selling_products'] ) && ( empty( $store_info['show_best_sell_products'] ) || 'yes' === $store_info['show_best_sell_products'] ) ) {
                    $extra_product_block   = 1;
                    $best_selling_products = dokan_get_best_selling_products( $items_to_show, $vendor_id );
                    ?>
                <div id="dokan-best-selling-products" class="dokan-products-display_section">
                    <h2 class="products-list-heading"><?php esc_html_e( 'Best Selling Products', 'dokan-lite' ); ?></h2>

                <?php if ( $best_selling_products->have_posts() ) { ?>
                    <div class="seller-items">

                        <?php woocommerce_product_loop_start(); ?>

                            <?php while ( $best_selling_products->have_posts() ) : $best_selling_products->the_post(); ?>

                                <?php wc_get_template_part( 'content', 'product' ); ?>

                            <?php endwhile; ?>

                        <?php woocommerce_product_loop_end(); ?>

                    </div>

                <?php } else { ?>

                    <p class="dokan-info"><?php esc_html_e( 'No best selling products were found of this vendor!', 'dokan-lite' ); ?></p>

                <?php } ?>
                </div>
                <?php
                }

                // Top rated products section
                if ( empty( $products_block_appearance['hide_top_rated_products'] ) && ( empty( $store_info['show_top_rated_products'] ) || 'yes' === $store_info['show_top_rated_products'] ) ) {
                    $extra_product_block = 1;
                    $top_rated_products  = dokan_get_top_rated_products( $items_to_show, $vendor_id );
                    ?>
                <div id="dokan-top-rated-products" class="dokan-products-display_section">
                    <h2 class="products-list-heading"><?php esc_html_e( 'Top Rated Products', 'dokan-lite' ); ?></h2>

                <?php if ( $top_rated_products->have_posts() ) { ?>
                    <div class="seller-items">

                        <?php woocommerce_product_loop_start(); ?>

                            <?php while ( $top_rated_products->have_posts() ) : $top_rated_products->the_post(); ?>

                                <?php wc_get_template_part( 'content', 'product' ); ?>

                            <?php endwhile; ?>

                        <?php woocommerce_product_loop_end(); ?>

                    </div>

                <?php } else { ?>

                    <p class="dokan-info"><?php esc_html_e( 'No top rated products were found of this vendor!', 'dokan-lite' ); ?></p>

                <?php } ?>
                </div>
                <?php
                }

                if ( ! empty( $extra_product_block ) ) {
                    ?>
                    <h2 class="products-list-heading"><?php esc_html_e( 'All Products', 'dokan-lite' ); ?></h2>
                    <?php
                }
                ?>

                <?php do_action( 'dokan_store_profile_frame_after', $store_user->data, $store_info ); ?>

                <?php if ( have_posts() ) { ?>

                    <div class="seller-items">

                        <?php woocommerce_product_loop_start(); ?>

                            <?php while ( have_posts() ) : the_post(); ?>

                                <?php wc_get_template_part( 'content', 'product' ); ?>

                            <?php endwhile; // end of the loop. ?>

                        <?php woocommerce_product_loop_end(); ?>

                    </div>

                    <?php dokan_content_nav( 'nav-below' ); ?>

                <?php } else { ?>

                    <p class="dokan-info"><?php esc_html_e( 'No products were found of this vendor!', 'dokan-lite' ); ?></p>

                <?php } ?>
            </div>

        </div><!-- .dokan-single-store -->

        <?php if ( 'right' === $layout ) { ?>
            <?php dokan_get_template_part( 'store', 'sidebar', array( 'store_user' => $store_user, 'store_info' => $store_info, 'map_location' => $map_location ) ); ?>
        <?php } ?>

    </div><!-- .dokan-store-wrap -->

    <?php do_action( 'woocommerce_after_main_content' ); ?>

<?php get_footer( 'shop' ); ?>
