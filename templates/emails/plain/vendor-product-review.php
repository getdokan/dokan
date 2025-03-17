<?php
/**
 * New Product Review Email (plain text)
 *
 * After a product has been reviewed, an email is sent to the vendor containing information about the review.
 * The email may include details such as the reviewer’s name, the product’s name and description, the review rating, and the review text.
 * The email may also contain a link to the review page where the vendor can view the review and respond to it if necessary.
 *
 * @class    \WeDevs\Dokan\Emails\VendorProductReview
 *
 * @since    3.9.2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

esc_html_e( 'Hello there,', 'dokan-lite' );
echo " \n\n";

printf(
// translators: 1) product name, 2) customer name, 3) rating
    esc_html__( 'We are happy to inform you that your product %1$s has received a new review on our website. The review was written by %2$s and has a rating of %3$s out of 5 stars.', 'dokan-lite' ),
    esc_html( $data['{product_name}'] ),
    esc_html( $data['{customer_name}'] ),
    esc_html( $data['{rating}'] )
);
echo " \n\n";

esc_html_e( 'The review text is as follows:', 'dokan-lite' );

echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

echo esc_html( wp_strip_all_tags( wptexturize( $data['{review_text}'] ) ) );

echo "\n\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

esc_html_e( 'You can view the review by visiting the following link:', 'dokan-lite' );

printf(
    ' %s',
    esc_url( $data['{review_link}'] )
);

echo "\n\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

esc_html_e( 'We appreciate your participation in our platform and hope that you will continue to offer quality products and services to our customers.', 'dokan-lite' );

echo "\n\n";

esc_html_e( 'Thank you for your attention.', 'dokan-lite' );

echo "\n\n----------------------------------------\n\n";

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( ! empty( $additional_content ) ) {
    echo esc_html( wp_strip_all_tags( wptexturize( $additional_content ) ) );
    echo "\n\n----------------------------------------\n\n";
}

echo wp_kses_post( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
