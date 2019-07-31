<?php
/**
 * The Template for displaying all reviews.
 *
 * @package dokan
 * @package dokan - 2014 1.0
 */

$vendor       = dokan()->vendor->get( get_query_var( 'author' ) );
$vendor_info  = $vendor->get_shop_info();
$map_location = $vendor->get_location();

get_header( 'shop' );
?>

<?php do_action( 'woocommerce_before_main_content' ); ?>

<?php dokan_get_template_part( 'store', 'sidebar', array( 'store_user' => $vendor, 'store_info' => $vendor_info, 'map_location' => $map_location ) ); ?>

<div id="primary" class="content-area dokan-single-store dokan-w8">
    <div id="dokan-content" class="site-content store-review-wrap woocommerce" role="main">

        <?php dokan_get_template_part( 'store-header' ); ?>

        <div id="store-toc-wrapper">
            <div id="store-toc">
                <?php
                if( ! empty( $vendor->get_store_tnc() ) ):
                ?>
                    <h2 class="headline"><?php esc_html_e( 'Terms And Conditions', 'dokan-lite' ); ?></h2>
                    <div>
                        <?php
                            echo wp_kses_post( nl2br( $vendor->get_store_tnc() ) );
                        ?>
                    </div>
                <?php
                endif;
                ?>
            </div><!-- #store-toc -->
        </div><!-- #store-toc-wrap -->

    </div><!-- #content .site-content -->
</div><!-- #primary .content-area -->

<div class="dokan-clearfix"></div>

<?php do_action( 'woocommerce_after_main_content' ); ?>

<?php get_footer(); ?>
