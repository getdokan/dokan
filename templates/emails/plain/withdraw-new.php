<?php
/**
 * New Withdraw request Email.
 *
 * An email sent to the admin when a new withdraw request is created by vendor.
 *
 * @class       Dokan_Vendor_Withdraw_Request
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

esc_attr_e( 'Hi,', 'dokan-lite' );
echo " \n";

// translators: 1) user name
echo sprintf( esc_html__( 'A new withdraw request has been made by - %s', 'dokan-lite' ), esc_html( $data['username'] ) );
echo " \n";

// translators: 1) withdraw request amount
echo sprintf( esc_html__( 'Request Amount : %s', 'dokan-lite' ), esc_html( $data['amount'] ) );
echo " \n";

// translators: 1) withdraw payment method
echo sprintf( esc_html__( 'Payment Method : %s', 'dokan-lite' ), esc_html( $data['method'] ) );
echo " \n";

// translators: 1) user name
echo sprintf( esc_html__( 'Username : %s', 'dokan-lite' ), esc_html( $data['username'] ) );
echo " \n";

// translators: 1) vendor profile url
echo sprintf( esc_html__( 'Profile : %s', 'dokan-lite' ), esc_url( $data['profile_url'] ) );
echo " \n";

// translators: 1) with menu url
echo sprintf( esc_html__( 'You can approve or deny it by going here : %s', 'dokan-lite' ), esc_html( $data['withdraw_page'] ) );
echo " \n";

echo "\n\n----------------------------------------\n\n";

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( ! empty( $additional_content ) ) {
    echo esc_html( wp_strip_all_tags( wptexturize( $additional_content ) ) );
    echo "\n\n----------------------------------------\n\n";
}

echo wp_kses_post( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
