<?php
/**
 * Dokan Settings Payment Template
 *
 * @since 2.2.2 Insert action before payment settings form
 *
 * @package dokan
 */
$has_methods = false; ?>

<form method="post" id="payment-form"  action="" class="dokan-form-horizontal">

    <?php wp_nonce_field( 'dokan_payment_settings_nonce' ); ?>

    <?php
        $method = dokan_withdraw_get_method( $method_key );

        if ( ! empty( $method ) ) {
            $has_methods = true;
        }

        if ( isset( $method['callback'] ) && is_callable( $method['callback'] ) ) {
        ?>
            <fieldset class="payment-field-<?php echo esc_attr( $method_key ); ?>">
                <div class="dokan-form-group">
                    <?php if ( $method_key === 'bank' ) {
                        $augmented_profile                   = $profile_info;
                        $augmented_profile['is_edit_method'] = $is_edit_method;
                        call_user_func( $method['callback'], $augmented_profile );
                    } else { ?>
                        <label class="dokan-w3 dokan-control-label" for="dokan_setting"><?php echo esc_html( $method['title'] ) ?></label>
                        <div class="dokan-w6">
                            <?php call_user_func( $method['callback'], $profile_info ); ?>
                        </div> <!-- .dokan-w6 -->
                    <?php } ?>
                </div>
            </fieldset>
        <?php } ?>
    <?php
    /**
     * @since DOKAN_LITE_SINCE Insert action on botton of payment settings form
     */
    do_action( 'dokan_payment_settings_form_bottom', $current_user, $profile_info ); ?>

    <?php if ( $has_methods && $method_key !== 'bank' ): ?>
        <div class="dokan-form-group">
            <div class="dokan-w4 ajax_prev dokan-text-left" style="margin-left:24%;">
                <input type="submit" name="dokan_update_payment_settings" class="dokan-btn dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Update Settings', 'dokan-lite' ); ?>">
            </div>
        </div>
    <?php endif ?>

</form>

<?php
    if ( ! $has_methods ) {
        dokan_get_template_part( 'global/dokan-error', '', array( 'deleted' => false, 'message' => __( 'No withdraw method is available. Please contact site admin.', 'dokan-lite' ) ) );
    }
?>
