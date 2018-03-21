<?php
/**
 * Vendor enable email to vendors.
 *
 * An email sent to the vendor(s) when a he or she is enabled by the admin
 *
 * @class       Dokan_Email_Vendor_Enable
 * @version     2.7.9
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "= " . $email_heading . " =\n\n";
?>

------------------------------------------------------------

<?php _e( 'Congratulations!', 'dokan' ); echo " \n\n";  ?>

------------------------------------------------------------

<p>
    <?php _e( 'Your vendor account is activated', 'dokan' ); ?>
</p>
<p>
    <?php echo sprintf( __( 'You can <a href="%s" target="_blank">login here</a> ', 'dokan' ), wc_get_page_permalink( 'myaccount' ) ) ; ?>
</p>

<?php

echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) );
