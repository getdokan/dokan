<?php
/**
 * New Withdraw request Email.
 *
 * An email sent to the admin when a new withdraw request is created by vendor.
 *
 * @class       Dokan_Email_Withdraw_Approved
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>
<p>
    <?php
    // translators: user name
    echo sprintf( esc_html__( 'Hi %s', 'dokan-lite' ), esc_html( $data['username'] ) );
    ?>
</p>
<p>
    <?php esc_html_e( 'Your withdraw request has been approved, congrats!', 'dokan-lite' ); ?>
</p>
<p>
    <?php esc_html_e( 'You sent a withdraw request of:', 'dokan-lite' ); ?>
    <br>
    <?php esc_html_e( 'Amount : ', 'dokan-lite' ); ?>
    <?php echo wp_kses_post( $data['amount'] ); ?>
    <br>
    <?php
    // translators: 1) withdraw method title
    echo sprintf( esc_html__( 'Method : %s', 'dokan-lite' ), esc_html( $data['method'] ) );
    ?>
</p>
<p>
    <?php esc_html_e( 'We\'ll transfer this amount to your preferred payment method shortly.', 'dokan-lite' ); ?>

    <?php esc_html_e( 'Thanks for being with us.', 'dokan-lite' ); ?>
</p>

<?php
do_action( 'woocommerce_email_footer', $email );
