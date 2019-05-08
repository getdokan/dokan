<?php
/**
 * Contact Seller Email. (plain text)
 *
 * An email sent to the vendor when a vendor is contacted via customer.
 *
 * @class       Dokan_Email_Contact_Seller
 * @version     2.6.8
 *
 */

if ( !defined( 'ABSPATH' ) ) {
    exit;
}

echo "= " . esc_attr( $email_heading ) . " =\n\n";
?>
<?php esc_attr_e( 'From : '.$data['customer_name']. '(' .$data['customer_email']. ')', 'dokan-lite'); ?>

------------------------------------------------------------

<?php echo esc_attr( $data['message'] ); echo " \n\n";  ?>

------------------------------------------------------------

<?php

echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
