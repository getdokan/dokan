<?php
/**
 * Dokan Settings Payment Template
 *
 * @package dokan
 */
?>

<?php if ( isset( $status_message ) && ! empty( $status_message ) ) : ?>
    <div class="dokan-alert <?php echo ( 'success' === $connect_status ) ? 'dokan-alert-success' : 'dokan-alert-danger'; ?>">
        <?php echo wp_kses_post( $status_message ); ?>
    </div>
<?php endif; ?>

<a href="<?php echo esc_url_raw( dokan_get_navigation_url( 'settings/payment' ) ); ?>">
    &larr; <?php esc_html_e( 'Back', 'dokan-lite' ); ?>
</a>

<form method="post" id="payment-form" action="" class="dokan-form-horizontal">

    <?php wp_nonce_field( 'dokan_payment_settings_nonce' ); ?>

    <fieldset class="payment-field-<?php echo esc_attr( $method_key ); ?>">
        <div class="dokan-form-group">
            <?php
            if ( 'bank' === $method_key ) :
                call_user_func( $method['callback'], $profile_info );
            else :
                ?>
                <label class="dokan-w3 dokan-control-label" for="dokan_setting"><?php echo esc_html( apply_filters( 'dokan_payment_method_title', $method['title'], $method ) ); ?></label>
                <div class="dokan-w6">
                    <?php call_user_func( $method['callback'], $profile_info ); ?>
                </div>
            <?php endif; ?>
        </div>
    </fieldset>

    <?php
    /**
     * @since DOKAN_LITE_SINCE Insert action on botton of payment settings form
     */
    do_action( 'dokan_payment_settings_form_bottom', $current_user, $profile_info );

    if ( 'bank' !== $method_key ) :
        ?>
        <div class="dokan-form-group">
            <div class="dokan-w4 ajax_prev save dokan-text-left">
                <input type="submit" name="dokan_update_payment_settings" class="dokan-btn dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Update Settings', 'dokan-lite' ); ?>">
            </div>
        </div>
    <?php endif; ?>
</form>
