<?php
/**
 * Product published Email.
 *
 * An email sent to the vendor when a new Product is published from pending.
 *
 * @class       Dokan_Email_Product_Published
 * @version     2.6.8
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>
<p>
    <?php esc_html_e( 'Hello '.$data['seller-name'], 'dokan-lite' ); ?>
<p/>
<p>
    <?php echo sprintf( __( 'Your product : <a href="%s">%s</a> is approved by the admin, congrats!', 'dokan-lite' ), esc_attr( $data['product_url'] ), esc_attr( $data['product-title'] ) ); ?>
</p>
<p>
    <?php echo sprintf( __( 'To Edit product click : <a href="%s">here</a>', 'dokan-lite' ), esc_attr( $data['product_edit_link'] ) ); ?>
</p>
<?php

do_action( 'woocommerce_email_footer', $email );
