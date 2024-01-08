<?php
/**
 * Product published Email. ( plain text )
 *
 * An email sent to the vendor when a new Product is published from pending.
 *
 * @class       Dokan_Email_Product_Published
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

// translators: 1) Seller name
echo sprintf( esc_html__( 'Hello %s', 'dokan-lite' ), esc_html( $data['{store_name}'] ) );
echo " \n\n";

// translators: 1) product title
echo sprintf( esc_html__( 'Your product %s', 'dokan-lite' ), esc_html( $data['{product_title}'] ) );
echo esc_html__( 'has been approved by one of our admin, congrats!', 'dokan-lite' );
echo " \n\n";

// translators: 1) product url
echo sprintf( esc_html__( 'View product : %s', 'dokan-lite' ), esc_url( $data['{product_url}'] ) );
echo " \n\n";

// translators: 1) product edit url
echo sprintf( esc_html__( 'Update : %s', 'dokan-lite' ), esc_url( $data['{product_edit_link}'] ) );
echo " \n\n";

echo "\n\n----------------------------------------\n\n";

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( ! empty( $additional_content ) ) {
    echo esc_html( wp_strip_all_tags( wptexturize( $additional_content ) ) );
    echo "\n\n----------------------------------------\n\n";
}

echo wp_kses_post( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
