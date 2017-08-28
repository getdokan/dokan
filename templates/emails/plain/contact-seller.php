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

echo "= " . $email_heading . " =\n\n";
?>
<?php _e( 'From : '.$data['customer_name']. '(' .$data['customer_email']. ')', 'dokan-lite'); ?>

------------------------------------------------------------

<?php echo $data['message']; echo " \n\n";  ?>

------------------------------------------------------------

<?php

echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) );
