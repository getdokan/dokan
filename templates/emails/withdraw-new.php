<?php
/**
 * New Withdraw request Email.
 *
 * An email sent to the admin when a new withdraw request is created by vendor.
 *
 * @class       Dokan_Vendor_Withdraw_Request
 * @version     2.6.8
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>
<p>
    <?php esc_html_e( 'Hi,', 'dokan-lite' ); ?>
</p>
<p>
    <?php esc_html_e( 'A new withdraw request has been made by', 'dokan-lite' ); ?> <?php echo esc_attr( $data ['username'] ); ?>.
</p>
<hr>
<ul>
    <li>
        <strong>
            <?php esc_html_e( 'Username : ', 'dokan-lite' ); ?>
        </strong>
        <?php
        printf( '<a href="%s">%s</a>', esc_attr( $data['profile_url'] ), esc_attr( $data['username'] ) ); ?>
    </li>
    <li>
        <strong>
            <?php esc_html_e( 'Request Amount:', 'dokan-lite' ); ?>
        </strong>
        <?php echo $data['amount']; ?>
    </li>
    <li>
        <strong>
            <?php esc_html_e( 'Payment Method: ', 'dokan-lite' ); ?>
        </strong>
        <?php echo esc_attr( $data['method'] ); ?>
    </li>
</ul>

<?php echo sprintf( __( 'You can approve or deny it by going <a href="%s"> here </a>', 'dokan-lite' ), esc_attr( $data['withdraw_page'] ) ); ?>

<?php

do_action( 'woocommerce_email_footer', $email );
