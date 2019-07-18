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
echo "= " . esc_html( $email_heading ) . " =\n\n";
?>

<?php esc_html_e( 'Hi '. $data['username'], 'dokan-lite' ); echo " \n";?>

<?php esc_html_e( 'Your withdraw request has been approved, congrats!', 'dokan-lite' ); echo " \n";?>

<?php esc_html_e( 'You sent a withdraw request of:', 'dokan-lite' );  echo " \n";?>

<?php esc_html_e( 'Amount : '.$data['amount'], 'dokan-lite' ); echo " \n";?>
<?php esc_html_e( 'Method : '.$data['method'], 'dokan-lite' ); echo " \n";?>

<?php esc_html_e( 'We\'ll transfer this amount to your preferred destination shortly.', 'dokan-lite' ); echo " \n";?>

<?php esc_html_e( 'Thanks for being with us.', 'dokan-lite' );  echo " \n";?>

<?php
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
