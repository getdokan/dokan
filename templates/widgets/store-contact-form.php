<?php
/**
 * Dokan Store Contact Form widget Template
 *
 * @since   2.4
 * @version DOKAN_SINCE
 *
 * @package dokan
 *
 * @var int    $seller_id
 * @var array  $store_info
 * @var string $username
 * @var string $email
 * @var array  $args Optional text overrides from the store contact form block; empty keeps today's wording.
 */

$form_text = wp_parse_args(
    isset( $args ) ? $args : [],
    [
        'button_text'         => '',
        'name_placeholder'    => '',
        'email_placeholder'   => '',
        'message_placeholder' => '',
    ]
);

$button_text         = \WeDevs\Dokan\Blocks\Styles::text( $form_text['button_text'], __( 'Send Message', 'dokan-lite' ) );
$name_placeholder    = \WeDevs\Dokan\Blocks\Styles::text( $form_text['name_placeholder'], __( 'Your Name', 'dokan-lite' ) );
$email_placeholder   = \WeDevs\Dokan\Blocks\Styles::text( $form_text['email_placeholder'], __( 'you@example.com', 'dokan-lite' ) );
$message_placeholder = \WeDevs\Dokan\Blocks\Styles::text( $form_text['message_placeholder'], __( 'Type your message...', 'dokan-lite' ) );
?>

<form id="dokan-form-contact-seller" action="" method="post" class="seller-form clearfix">
    <div class="ajax-response"></div>
    <ul>
        <li class="dokan-form-group">
            <input type="text" name="name" value="<?php echo esc_attr( $username ); ?>" placeholder="<?php echo esc_attr( $name_placeholder ); ?>" class="dokan-form-control" minlength="5" required="required">
        </li>
        <li class="dokan-form-group">
            <input type="email" name="email" value="<?php echo esc_attr( $email ); ?>" placeholder="<?php echo esc_attr( $email_placeholder ); ?>" class="dokan-form-control" required="required">
        </li>
        <li class="dokan-form-group">
            <textarea name="message" maxlength="1000" cols="25" rows="6" value="" placeholder="<?php echo esc_attr( $message_placeholder ); ?>" class="dokan-form-control" required="required"></textarea>
        </li>
    </ul>

    <?php do_action( 'dokan_contact_form', $seller_id ); ?>

    <?php wp_nonce_field( 'dokan_contact_seller', 'dokan_contact_seller_nonce' ); ?>
    <input type="hidden" name="seller_id" value="<?php echo esc_html( $seller_id ); ?>">
    <input type="hidden" name="action" value="dokan_contact_seller">
    <input type="submit" name="store_message_send" value="<?php echo esc_attr( $button_text ); ?>" class="dokan-right dokan-btn dokan-btn-theme">
</form>
