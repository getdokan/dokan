<?php
/**
 * Product published Email.
 *
 * An email sent to the vendor when a new Product is published from pending.
 *
 * @class       Dokan_Email_Product_Published
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>
<p>
    <?php
    // translators: 1) seller name
    echo sprintf( __( 'Hello %s', 'dokan-lite' ), esc_html( $data['seller-name'] ) );
    ?>
</p>
<p>
    <?php
    // translators: 1) Product url 2) Product title
    echo wp_kses_post( sprintf( __( 'Your product : <a href="%1$s">%2$s</a> is approved by the admin, congrats!', 'dokan-lite' ), esc_html( $data['product_url'] ), esc_html( $data['product-title'] ) ) );
    ?>
</p>
<p>
    <?php
    // translators: 1) product edit link
    echo wp_kses_post( sprintf( __( 'To Edit product click : <a href="%s">here</a>', 'dokan-lite' ), esc_html( $data['product_edit_link'] ) ) );
    ?>
</p>
<?php

do_action( 'woocommerce_email_footer', $email );
