<?php
/**
 * New Product Email ( plain text )
 *
 * An email sent to the admin when a new Product is created by vendor.
 *
 * @class       Dokan_Email_New_Product
 * @version     2.6.8
 * 
 */

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
echo "= " . $email_heading . " =\n\n";
?>

<?php _e( 'Hello there,', 'dokan-lite' );  echo " \n\n";?>

<?php _e( 'A new product is submitted to your site and pending review', 'dokan-lite' ); echo " \n\n"; ?>

<?php _e( 'Summary of the product:', 'dokan-lite' );  ?>

<?php echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n"; ?>

<?php _e( 'Title: '. $data['title'], 'dokan-lite' ); echo " \n"; ?> 
<?php _e( 'Price: '. wc_price( $data['price'] ), 'dokan-lite' ); echo " \n"; ?>
<?php _e( 'Vendor: '. $data['seller_name'], 'dokan-lite' ); echo " \n"; ?>
<?php _e( 'Category: '. $data['category'], 'dokan-lite' ); echo " \n"; ?>

<?php _e( 'The product is currently in "pending" state.', 'dokan-lite' ); echo " \n";?>

<?php echo sprintf( __( 'In case it needs to be moderated  <a href="%s"> click here </a>', 'dokan-lite' ), $data['product_link'] ); ?>

<?php

echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) );
