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
    <?php esc_html_e( 'Hi '.$data['username'], 'dokan-lite' ); ?>
</p>
<p>
    <?php esc_html_e( 'Your withdraw request has been approved, congrats!', 'dokan-lite' ); ?>
</p>
<p>
    <?php esc_html_e( 'You sent a withdraw request of:', 'dokan-lite' ); ?>
    <br>
    <?php esc_html_e( 'Amount : ', 'dokan-lite' ); ?>
    <?php echo $data['amount']; ?>
    <br>
    <?php esc_html_e( 'Method : '.$data['method'], 'dokan-lite' ); ?>
</p>
<p>
    <?php esc_html_e( 'We\'ll transfer this amount to your preferred payment method shortly.', 'dokan-lite' ); ?>

    <?php esc_html_e( 'Thanks for being with us.', 'dokan-lite' ); ?>
</p>

<?php
do_action( 'woocommerce_email_footer', $email );
