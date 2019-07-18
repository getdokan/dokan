<?php
/**
 * Dokan Settings Payment Template
 *
 * @since 2.2.2 Insert action before payment settings form
 *
 * @package dokan
 */
do_action( 'dokan_payment_settings_before_form', $current_user, $profile_info ); ?>

<form method="post" id="payment-form"  action="" class="dokan-form-horizontal">

    <?php wp_nonce_field( 'dokan_payment_settings_nonce' ); ?>

    <?php foreach ( $methods as $method_key ) {
        $method = dokan_withdraw_get_method( $method_key );
        ?>
        <fieldset class="payment-field-<?php echo esc_attr( $method_key ); ?>">
            <div class="dokan-form-group">
                <label class="dokan-w3 dokan-control-label" for="dokan_setting"><?php echo esc_html( $method['title'] ) ?></label>
                <div class="dokan-w6">
                    <?php if ( is_callable( $method['callback'] ) ) {
                        call_user_func( $method['callback'], $profile_info );
                    } ?>
                </div> <!-- .dokan-w6 -->
            </div>
        </fieldset>
    <?php } ?>

    <?php
    /**
     * @since 2.2.2 Insert action on botton of payment settings form
     */
    do_action( 'dokan_payment_settings_form_bottom', $current_user, $profile_info ); ?>

    <div class="dokan-form-group">

        <div class="dokan-w4 ajax_prev dokan-text-left" style="margin-left:24%;">
            <input type="submit" name="dokan_update_payment_settings" class="dokan-btn dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Update Settings', 'dokan-lite' ); ?>">
        </div>
    </div>

</form>

<?php
/**
 * @since 2.2.2 Insert action after social settings form
 */
do_action( 'dokan_payment_settings_after_form', $current_user, $profile_info ); ?>
