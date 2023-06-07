<?php
/**
 * Dokan Seller Single product tab Template
 *
 * @since   2.4
 *
 * @package dokan
 */
?>

<h2><?php esc_html_e( 'Vendor Information', 'dokan-lite' ); ?></h2>

<ul class="list-unstyled">
    <?php do_action( 'dokan_product_seller_tab_start', $author, $store_info ); ?>

    <?php if ( ! empty( $store_info['store_name'] ) ) : ?>
        <li class="store-name">
            <span><?php esc_html_e( 'Store Name:', 'dokan-lite' ); ?></span>
            <span class="details">
                <?php echo esc_html( $store_info['store_name'] ); ?>
            </span>
        </li>
        <li class="seller-name">
            <span>
                <?php esc_html_e( 'Vendor:', 'dokan-lite' ); ?>
            </span>

            <span class="details">
                <?php printf( '<a href="%1$s">%2$s</a>', esc_url( dokan_get_store_url( $author->ID ) ), esc_html( $store_info['store_name'] ) ); ?>
            </span>
        </li>
    <?php endif; ?>
    <?php if ( ! dokan_is_vendor_info_hidden( 'address' ) && ! empty( $store_info['address'] ) ) { ?>
        <li class="store-address">
            <span><b><?php esc_html_e( 'Address:', 'dokan-lite' ); ?></b></span>
            <span class="details">
                <?php echo wp_kses_post( dokan_get_seller_address( $author->ID ) ); ?>
            </span>
        </li>
    <?php } ?>
    <?php if ( ( dokan()->is_pro_exists() && dokan_pro()->module->is_active( 'store_reviews' ) ) || ( 'yes' === get_option( 'woocommerce_enable_reviews' ) ) ) : ?>
    <li class="clearfix">
        <?php echo wp_kses_post( dokan_get_readable_seller_rating( $author->ID ) ); ?>
    </li>
    <?php endif; ?>

    <?php do_action( 'dokan_product_seller_tab_end', $author, $store_info ); ?>
</ul>
