<?php
/**
 * Withdraw request cancelled Email.
 *
 * An email sent to the vendor when a new withdraw request is cancelled by admin.
 *
 * @class       Dokan_Email_Withdraw_Cancelled
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>
<p>
    <?php
    // translators: user name
    echo sprintf( esc_html__( 'Hi %s', 'dokan-lite' ), esc_html( $data['{store_name}'] ) );
    ?>
</p>
<p>
    <?php esc_html_e( 'Your withdraw request was cancelled!', 'dokan-lite' ); ?>
</p>
<p>
    <?php esc_html_e( 'You sent a withdraw request of:', 'dokan-lite' ); ?>
    <br>
    <?php
    // translators: 1) withdraw amount
    echo sprintf( esc_html__( 'Amount : %s', 'dokan-lite' ), esc_html( $data['{amount}'] ) );
    ?>
    <br>
    <?php
    // translators: 1) withdraw method title
    echo sprintf( esc_html__( 'Method : %s', 'dokan-lite' ), esc_html( $data['{method}'] ) );
    ?>
</p>
<p>
    <?php esc_html_e( 'Here\'s the reason, why : ', 'dokan-lite' ); ?>
    <br>
    <i><?php echo esc_html( $data['{note}'] ); ?></i>
</p>

<?php

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( $additional_content ) {
    echo wp_kses_post( wpautop( wptexturize( $additional_content ) ) );
}
do_action( 'woocommerce_email_footer', $email );
