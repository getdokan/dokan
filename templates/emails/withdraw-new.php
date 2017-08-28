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
    <?php _e( 'Hi,', 'dokan-lite' ); ?>
</p>
<p>
    <?php _e( 'A new withdraw request has been made by', 'dokan-lite' ); ?> <?php echo $data ['username']; ?>.
</p>
<hr>
<ul>
    <li>
        <strong>
            <?php _e( 'Username : ', 'dokan-lite' ); ?>
        </strong>
        <?php 
        printf( '<a href="%s">%s</a>', $data['profile_url'], $data['username']  ); ?>
    </li>
    <li>
        <strong>
            <?php _e( 'Request Amount:', 'dokan-lite' ); ?>
        </strong>
        <?php echo $data['amount']; ?>
    </li>
    <li>
        <strong>
            <?php _e( 'Payment Method: ', 'dokan-lite' ); ?>
        </strong>
        <?php echo $data['method'] ?>
    </li>
</ul>

<?php echo sprintf( __( 'You can approve or deny it by going <a href="%s"> here </a>', 'dokan-lite' ), $data['withdraw_page'] ); ?>

<?php

do_action( 'woocommerce_email_footer', $email );
