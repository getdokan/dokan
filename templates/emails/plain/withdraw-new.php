<?php
/**
 * New Withdraw request Email.
 *
 * An email sent to the admin when a new withdraw request is created by vendor.
 *
 * @class       Dokan_Vendor_Withdraw_Request
 * @version     2.6.8
 *
 */

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
echo "= " . esc_attr( $email_heading ) . " =\n\n";
?>
<?php esc_attr_e( 'Hi,', 'dokan-lite' );  echo " \n";?>

<?php esc_attr_e( 'A new withdraw request has been made by - '.$data['username'], 'dokan-lite' );  echo " \n";?>

<?php esc_attr_e( 'Request Amount : '.$data['amount'], 'dokan-lite' );  echo " \n";?>
<?php esc_attr_e( 'Payment Method : '.$data['method'], 'dokan-lite' );  echo " \n";?>

<?php esc_attr_e( 'Username : '.$data['username'], 'dokan-lite' );  echo " \n";?>
<?php esc_attr_e( 'Profile : '.$data['profile_url'], 'dokan-lite' );  echo " \n";?>

<?php esc_attr_e( 'You can approve or deny it by going here : '.$data['withdraw_page'], 'dokan-lite' );  echo " \n";?>

<?php
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
