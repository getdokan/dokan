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
    <?php esc_html_e( 'Hi '.$data['username'], 'dokan-lite' ); ?>
</p>
<p>
    <?php esc_html_e( 'Your withdraw request was cancelled!', 'dokan-lite' ); ?>
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
    <?php esc_html_e( 'Here\'s the reason, why : ', 'dokan-lite' ); ?>
    <br>
    <i><?php echo esc_html( $data['note'] ); ?></i>
</p>

<?php
do_action( 'woocommerce_email_footer', $email );
