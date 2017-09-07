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

<p><?php _e( 'Hello,', 'dokan-lite' ); ?></p>

<p><?php _e( 'A new product is submitted to your site and is pending review', 'dokan-lite' ); ?> <a href="<?php echo $data['site_url'] ?>" ><?php echo $data['site_name'] ?></a> </p>
<p><?php _e( 'Summary of the product:', 'dokan-lite' ); ?></p>
<hr>
<ul>
    <li>
        <strong>
            <?php _e( 'Title :', 'dokan-lite' ); ?>
        </strong>
        <?php printf( '<a href="%s">%s</a>', $data['product_link'], $data['product-title']  ); ?>
    </li>
    <li>
        <strong>
            <?php _e( 'Price :', 'dokan-lite' ); ?>
        </strong>
        <?php echo wc_price( $data['price'] ); ?>
    </li>
    <li>
        <strong>
            <?php _e( 'Vendor :', 'dokan-lite' ); ?>
        </strong>
        <?php 
        printf( '<a href="%s">%s</a>', $data['seller_url'], $data['seller-name']  ); ?>
    </li>
    <li>
        <strong>
            <?php _e( 'Category :', 'dokan-lite' ); ?>
        </strong>
        <?php echo $data['category'] ?>
    </li>
    
</ul>
<p><?php _e( 'The product is currently in "pending" status.', 'dokan-lite' ); ?></p>

<?php

do_action( 'woocommerce_email_footer', $email );
