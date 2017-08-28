<?php
/**
 * New Withdraw request Email.
 *
 * An email sent to the admin when a new withdraw request is created by vendor.
 *
 * @class       Dokan_Email_Withdraw_Approved
 * @version     2.6.8
 * 
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>
<p>
    <?php _e( 'Hi '.$data['username'], 'dokan-lite' ); ?>
</p>
<p>
    <?php _e( 'Your withdraw request has been approved, congrats!', 'dokan-lite' ); ?>
</p>
<p>
    <?php _e( 'You sent a withdraw request of:', 'dokan-lite' ); ?>
    <br>
    <?php _e( 'Amount : '.$data['amount'], 'dokan-lite' ); ?>
    <br>
    <?php _e( 'Method : '.$data['method'], 'dokan-lite' ); ?>
</p>
<p>
    <?php _e( 'We\'ll transfer this amount to your preferred payment method shortly.', 'dokan-lite' ); ?>

    <?php _e( 'Thanks for being with us.', 'dokan-lite' ); ?>
</p>

<?php
do_action( 'woocommerce_email_footer', $email );
