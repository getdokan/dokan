<?php
/**
 * Withdraw request cancelled Email.
 *
 * An email sent to the vendor when a new withdraw request is cancelled by admin.
 *
 * @class       Dokan_Email_Withdraw_Cancelled
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
    <?php _e( 'Your withdraw request was cancelled!', 'dokan-lite' ); ?>
</p>
<p>
    <?php _e( 'You sent a withdraw request of:', 'dokan-lite' ); ?>
    <br>
    <?php _e( 'Amount : '.$data['amount'], 'dokan-lite' ); ?>
    <br>
    <?php _e( 'Method : '.$data['method'], 'dokan-lite' ); ?>
</p>
<p>
    <?php _e( 'Here\'s the reason, why : ', 'dokan-lite' ); ?>
    <br>
    <i><?php echo $data['note'] ?></i>
</p>

<?php
do_action( 'woocommerce_email_footer', $email );
