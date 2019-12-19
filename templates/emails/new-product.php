<?php
/**
 * New Product Email.
 *
 * An email sent to the admin when a new Product is created by vendor.
 *
 * @class       Dokan_Email_New_Product
 * @version     2.6.8
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>

<p><?php esc_attr_e( 'Hello,', 'dokan-lite' ); ?></p>

<p><?php esc_attr_e( 'A new product is submitted to your site', 'dokan-lite' ); ?> <a href="<?php echo esc_url( $data['site_url'] ); ?>" ><?php echo esc_attr( $data['site_name'] ); ?></a> </p>
<p><?php esc_attr_e( 'Summary of the product:', 'dokan-lite' ); ?></p>
<hr>
<ul>
    <li>
        <strong>
            <?php esc_attr_e( 'Title :', 'dokan-lite' ); ?>
        </strong>
        <?php printf( '<a href="%s">%s</a>', esc_url( $data['product_link'] ), esc_attr( $data['product-title'] ) ); ?>
    </li>
    <li>
        <strong>
            <?php esc_attr_e( 'Price :', 'dokan-lite' ); ?>
        </strong>
        <?php echo wp_kses_post( wc_price( esc_attr( $data['price'] ) ) ); ?>
    </li>
    <li>
        <strong>
            <?php esc_attr_e( 'Vendor :', 'dokan-lite' ); ?>
        </strong>
        <?php
        printf( '<a href="%s">%s</a>', esc_url( $data['seller_url'] ), esc_attr( $data['seller-name'] ) ); ?>
    </li>
    <li>
        <strong>
            <?php esc_attr_e( 'Category :', 'dokan-lite' ); ?>
        </strong>
        <?php echo esc_html( $data['category'] ) ?>
    </li>

</ul>
<p><?php esc_attr_e( 'The product is currently in "publish" status. So, everyone can view the product.', 'dokan-lite' ); ?></p>

<?php

do_action( 'woocommerce_email_footer', $email );
