<?php
/**
 * New Product Review Email
 *
 * After a product has been reviewed, an email is sent to the vendor containing information about the review.
 * The email may include details such as the reviewer’s name, the product’s name and description, the review rating, and the review text.
 * The email may also contain a link to the review page where the vendor can view the review and respond to it if necessary.
 *
 * @class     \WeDevs\Dokan\Emails\VendorProductReview
 * @since     3.9.2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>

    <p><?php esc_attr_e( 'Hello there,', 'dokan-lite' ); ?></p>

    <p>
        <?php
        printf(
            wp_kses_post(
            // translators: 1) product name, 2) customer name, 3) rating
                __( 'We are happy to inform you that your product <strong>%1$s</strong> has received a new review on our website. The review was written by <strong>%2$s</strong> and has a rating of <strong>%3$s</strong> out of 5 stars.', 'dokan-lite' )
            ),
            esc_html( $data['{product_name}'] ),
            esc_html( $data['{customer_name}'] ),
            esc_html( $data['{rating}'] )
        );
        ?>
    </p>

    <p><?php esc_html_e( 'The review text is as follows:', 'dokan-lite' ); ?></p>
    <hr>
    <p><?php echo wp_kses_post( $data['{review_text}'] ); ?></p>
    <hr>
    <p><?php esc_html_e( 'You can view the review by visiting the following link:', 'dokan-lite' ); ?></p>
    <p>
        <?php
        printf(
            '<a href="%1$s">%2$s</a>',
            esc_url( $data['{review_link}'] ),
            esc_html( $data['{product_name}'] )
        );
        ?>
    </p>
    <hr>
    <p><?php esc_html_e( 'We appreciate your participation in our platform and hope that you will continue to offer quality products and services to our customers.', 'dokan-lite' ); ?></p>
    <p><?php esc_html_e( 'Thank you for your attention.', 'dokan-lite' ); ?></p>
<?php

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( $additional_content ) {
    echo wp_kses_post( wpautop( wptexturize( $additional_content ) ) );
}

do_action( 'woocommerce_email_footer', $email );
