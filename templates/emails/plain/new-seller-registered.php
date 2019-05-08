<?php
/**
 * New Seller Email ( plain text )
 *
 * An email sent to the admin when a new vendor is registered.
 *
 * @class       Dokan_Email_New_Seller
 * @version     2.6.8
 *
 */

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
echo "= " . esc_html( $email_heading ) . " =\n\n";
?>

<?php esc_html_e( 'Hello there,', 'dokan-lite' ); echo " \n";?>

<?php esc_html_e( 'A new vendor has registered in your marketplace  ', 'dokan-lite' );  echo " \n";?>
<?php esc_html_e( 'Vendor Details:', 'dokan-lite' ); echo " \n"; ?>

<?php echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n"; ?>

<?php esc_html_e( 'Vendor: '. $data['seller_name'], 'dokan-lite' ); echo " \n"; ?>
<?php esc_html_e( 'Vendor Store: '. $data['store_name'], 'dokan-lite' ); echo " \n"; ?>

<?php esc_html_e( 'To edit vendor access and details visit : '.$data['seller_edit'], 'dokan-lite' );  ?>
<?php
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
