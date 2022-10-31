<?php
/**
 * Contact Seller Email.
 *
 * An email sent to the vendor when a vendor is contacted via customer.
 *
 * @class       Dokan_Email_Contact_Seller
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>

<p>
    <?php
    echo wp_kses_post(
        // translators: 1) customer name 2) customer email
        sprintf( __( 'From : %1$s (%2$s)', 'dokan-lite' ), esc_html( $data['customer_name'] ), esc_html( $data['customer_email'] ) )
    );
    ?>
    <br>
</p>
<hr>
<p>
    <?php echo esc_html( $data['message'] ); ?>
</p>
<hr>

<?php
do_action( 'woocommerce_email_footer', $email );
