<?php
/**
 * New Withdraw request Email. ( plain text )
 *
 * An email sent to the admin when a new withdraw request is created by vendor.
 *
 * @class       Dokan_Email_Withdraw_Cancelled
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

// translators: 1) user name
echo sprintf( esc_html__( 'Hi %s', 'dokan-lite' ), esc_html( $data['{store_name}'] ) );
echo " \n";

esc_attr_e( 'Your withdraw request was cancelled', 'dokan-lite' );
echo " \n";

esc_attr_e( 'You sent a withdraw request of:', 'dokan-lite' );
echo " \n";

// translators: 1) withdraw amount
echo sprintf( esc_html__( 'Amount : %s', 'dokan-lite' ), esc_html( $data['{amount}'] ) );
echo " \n";

// translators: 1) withdraw method
echo sprintf( esc_html__( 'Method : %s', 'dokan-lite' ), esc_html( $data['{method}'] ) );
echo " \n";

esc_attr_e( 'Here\'s the reason, why : ', 'dokan-lite' );
echo " \n";

echo esc_html( $data['{note}'] );
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
