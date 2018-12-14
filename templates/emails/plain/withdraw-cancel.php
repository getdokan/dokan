<?php
/**
 * New Withdraw request Email. ( plain text )
 *
 * An email sent to the admin when a new withdraw request is created by vendor.
 *
 * @class       Dokan_Email_Withdraw_Cancelled
 * @version     2.6.8
 *
 */

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
echo "= " . esc_attr( $email_heading ) . " =\n\n";
?>

<?php esc_attr_e( 'Hi '. $data['username'], 'dokan-lite' ); echo " \n";?>

<?php esc_attr_e( 'Your withdraw request was cancelled', 'dokan-lite' ); echo " \n";?>

<?php esc_attr_e( 'You sent a withdraw request of:', 'dokan-lite' );  echo " \n";?>

<?php esc_attr_e( 'Amount : '.$data['amount'], 'dokan-lite' ); echo " \n";?>
<?php esc_attr_e( 'Method : '.$data['method'], 'dokan-lite' ); echo " \n";?>

<?php esc_attr_e( 'Here\'s the reason, why : ', 'dokan-lite' ); echo " \n";?>
<?php echo esc_html( $data['note'] ); echo " \n";?>
<?php
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
