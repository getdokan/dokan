<?php
/**
 * New Product Email.
 *
 * An email sent to the admin when a new Product is created by vendor.
 *
 * @class       Dokan_Email_New_Product_Pending
 * @version     2.6.8
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>

<p><?php esc_html_e( 'Hello,', 'dokan-lite' ); ?></p>

<p><?php esc_html_e( 'A new product is submitted to your site and is pending review', 'dokan-lite' ); ?> <a href="<?php echo esc_url( $data['site_url'] ); ?>" ><?php echo esc_html( $data['site_name'] ); ?></a> </p>
<p><?php esc_html_e( 'Summary of the product:', 'dokan-lite' ); ?></p>
<hr>
<ul>
    <li>
        <strong>
            <?php esc_html_e( 'Title :', 'dokan-lite' ); ?>
        </strong>
        <?php printf( '<a href="%s">%s</a>', esc_url( $data['product_link'] ), esc_html( $data['product-title'] ) ); ?>
    </li>
    <li>
        <strong>
            <?php esc_html_e( 'Price :', 'dokan-lite' ); ?>
        </strong>
        <?php echo wc_price( esc_attr( $data['price'] ) ); ?>
    </li>
    <li>
        <strong>
            <?php esc_html_e( 'Vendor :', 'dokan-lite' ); ?>
        </strong>
        <?php
        printf( '<a href="%s">%s</a>', esc_url( $data['seller_url'] ), esc_html( $data['seller-name'] ) ); ?>
    </li>
    <li>
        <strong>
            <?php esc_html_e( 'Category :', 'dokan-lite' ); ?>
        </strong>
        <?php echo esc_html( $data['category'] ); ?>
    </li>

</ul>
<p><?php esc_html_e( 'The product is currently in "pending" status.', 'dokan-lite' ); ?></p>

<?php

do_action( 'woocommerce_email_footer', $email );
