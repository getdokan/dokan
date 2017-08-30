<?php
/**
 * New Withdraw request Email.
 *
 * An email sent to the admin when a new withdraw request is created by vendor.
 *
 * @class       Dokan_Email_Withdraw_Approved
 * @version     2.6.8
 * 
 */

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
echo "= " . $email_heading . " =\n\n";
?>

<?php _e( 'Hi '. $data['username'], 'dokan-lite' ); echo " \n";?>

<?php _e( 'Your withdraw request has been approved, congrats!', 'dokan-lite' ); echo " \n";?>

<?php _e( 'You sent a withdraw request of:', 'dokan-lite' );  echo " \n";?>

<?php _e( 'Amount : '.$data['amount'], 'dokan-lite' ); echo " \n";?>
<?php _e( 'Method : '.$data['method'], 'dokan-lite' ); echo " \n";?>

<?php _e( 'We\'ll transfer this amount to your preferred destination shortly.', 'dokan-lite' ); echo " \n";?>

<?php _e( 'Thanks for being with us.', 'dokan-lite' );  echo " \n";?>

<?php
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) );
