<?php
/**
 * Product published Email. ( plain text )
 *
 * An email sent to the vendor when a new Product is published from pending.
 *
 * @class       Dokan_Email_Product_Published
 * @version     2.6.8
 *
 */

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
echo "= " . esc_attr( $email_heading ) . " =\n\n";

?><?php esc_attr_e( 'Hello '. $data['seller-name'], 'dokan-lite' ); echo " \n\n";?>

<?php esc_attr_e( 'Your product '.$data['product-title'], 'dokan-lite' ); ?> <?php esc_html_e( 'has been approved by one of our admin, congrats!', 'dokan-lite' ); echo " \n\n"; ?>

<?php esc_attr_e( 'View product : '.$data['product_url'], 'dokan-lite' ); echo " \n\n"; ?>
<?php esc_attr_e( 'Update : '.$data['product_edit_link'], 'dokan-lite' ); echo " \n\n"; ?>
<?php

echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
