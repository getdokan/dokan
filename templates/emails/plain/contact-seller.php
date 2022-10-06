<?php
/**
 * Contact Seller Email. (plain text)
 *
 * An email sent to the vendor when a vendor is contacted via customer.
 *
 * @class       Dokan_Email_Contact_Seller
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

// translators: 1) customer name 2) customer email
echo sprintf( esc_html__( 'From : %1$s (%2$s)', 'dokan-lite' ), esc_html( $data['customer_name'] ), esc_html( $data['customer_email'] ) );

echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo esc_html( wp_strip_all_tags( wptexturize( $data['message'] ) ) );

echo "\n\n----------------------------------------\n\n";

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( ! empty( $additional_content ) ) {
    echo esc_html( wp_strip_all_tags( wptexturize( $additional_content ) ) );
    echo "\n\n----------------------------------------\n\n";
}

echo wp_kses_post( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
