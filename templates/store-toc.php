<?php
/**
 * The Template for displaying all reviews.
 *
 * @package dokan
 * @package dokan - 2014 1.0
 */

$vendor      = dokan()->vendor->get( get_query_var( 'author' ) );
$vendor_info = $vendor->get_shop_info();

get_header( 'shop' );
?>

<?php do_action( 'woocommerce_before_main_content' ); ?>

<?php if ( dokan_get_option( 'enable_theme_store_sidebar', 'dokan_general', 'off' ) == 'off' ) { ?>
    <div id="dokan-secondary" class="dokan-clearfix dokan-w3 dokan-store-sidebar" role="complementary" style="margin-right:3%;">
        <div class="dokan-widget-area widget-collapse">
            <?php
            if ( ! dynamic_sidebar( 'sidebar-store' ) ) {

                $args = array(
                    'before_widget' => '<aside class="widget %s">',
                    'after_widget'  => '</aside>',
                    'before_title'  => '<h3 class="widget-title">',
                    'after_title'   => '</h3>',
                );

                if ( class_exists( 'Dokan_Store_Location' ) ) {
                    the_widget( 'Dokan_Store_Category_Menu', array( 'title' => __( 'Store Product Category', 'dokan-lite' ) ), $args );

                    if ( dokan_get_option( 'store_map', 'dokan_general', 'on' ) == 'on' ) {
                        the_widget( 'Dokan_Store_Location', array( 'title' => __( 'Store Location', 'dokan-lite' ) ), $args );
                    }

                    if ( dokan_get_option( 'store_open_close', 'dokan_general', 'on' ) == 'on' ) {
                        the_widget( 'Dokan_Store_Open_Close', array( 'title' => __( 'Store Time', 'dokan-lite' ) ), $args );
                    }

                    if ( dokan_get_option( 'contact_seller', 'dokan_general', 'on' ) == 'on' ) {
                        the_widget( 'Dokan_Store_Contact_Form', array( 'title' => __( 'Contact Vendor', 'dokan-lite' ) ), $args );
                    }
                }

            }
            ?>

            <?php do_action( 'dokan_sidebar_store_after', $vendor->data, $vendor_info ); ?>
        </div>
    </div><!-- #secondary .widget-area -->
<?php
} else {
    get_sidebar( 'store' );
}
?>

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
