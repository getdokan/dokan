<?php
/**
 * New Seller Email.
 *
 * An email sent to the admin when a new vendor is registered.
 *
 * @class       Dokan_Email_New_Seller
 * @version     2.6.8
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>
<p>
    <?php esc_html_e( 'Hello there,', 'dokan-lite' ); ?>
    <br>
    <?php esc_html_e( 'A new vendor has registered in your marketplace ', 'dokan-lite' ); ?>
    <?php echo esc_html( $data['site_name'] ); ?>
</p>
<p>
    <?php esc_html_e( 'Vendor Details:', 'dokan-lite' ); ?>
    <hr>
</p>
<ul>
    <li>
        <strong>
            <?php esc_html_e( 'Vendor :', 'dokan-lite' ); ?>
        </strong>
        <?php printf( '<a href="%s">%s</a>', esc_url( $data['seller_edit'] ), esc_html( $data['seller_name'] ) ); ?>
    </li>
    <li>
        <strong>
            <?php esc_html_e( 'Vendor Store :', 'dokan-lite' ); ?>
        </strong>
        <?php printf( '<a href="%s">%s</a>', esc_url( $data['store_url'] ), esc_html( $data['store_name'] ) ); ?>
    </li>
</ul>
<p>
    <?php echo sprintf( __( 'To edit vendor access and details <a href="%s">Click Here</a>', 'dokan-lite' ), esc_url( $data['seller_edit'] ) ); ?>
</p>

<?php

do_action( 'woocommerce_email_footer', $email );
