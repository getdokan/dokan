<?php
/**
 * New Product Email ( plain text )
 *
 * An email sent to the admin when a new Product is created by vendor.
 *
 * @class       Dokan_Email_New_Product
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

esc_html_e( 'Hello there,', 'dokan-lite' );
echo " \n\n";

esc_html_e( 'A new product is submitted to your site.', 'dokan-lite' );
echo " \n\n";

esc_html_e( 'Summary of the product:', 'dokan-lite' );

echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

// translators: 1) product title
echo sprintf( esc_html__( 'Title: %1$s', 'dokan-lite' ), esc_html( $data['title'] ) );
echo " \n";

// translators: 1) product price
echo sprintf( esc_html__( 'Price: %1$s', 'dokan-lite' ), esc_html( wc_price( $data['price'] ) ) );
echo " \n";

// translators: 1) product seller name
echo sprintf( esc_html__( 'Vendor: %1$s', 'dokan-lite' ), esc_html( $data['seller_name'] ) );
echo " \n";

// translators: 1) product category
echo sprintf( esc_html__( 'Category: %1$s', 'dokan-lite' ), esc_html( $data['category'] ) );
echo " \n";

echo esc_html__( 'The product is currently in "publish" state. So everyone can view the product.', 'dokan-lite' );
echo " \n";

echo wp_kses_post(
    sprintf(
        // translators: 1) product url
        __( 'In case it needs to be moderated  <a href="%s"> click here </a>', 'dokan-lite' ),
        esc_url( $data['product_link'] )
    )
);

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( ! empty( $additional_content ) ) {
    echo esc_html( wp_strip_all_tags( wptexturize( $additional_content ) ) );
    echo "\n\n----------------------------------------\n\n";
}

echo wp_kses_post( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
