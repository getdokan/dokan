<?php
/**
 * Dokan Withdraw Request Form Template
 *
 * @since   2.4
 * @since   3.3.1 Appearance changed.
 *
 * @package dokan
 */
?>
<?php if ( ! empty( $payment_methods ) ) : ?>
    <div class="dokan-form-horizontal withdraw" id="dokan-handle-withdraw-request">
        <div class="dokan-form-group">
            <label for="withdraw-amount" class="dokan-w4 dokan-control-label">
                <?php esc_html_e( 'Withdraw Amount', 'dokan-lite' ); ?>
            </label>

            <div class="dokan-w5 dokan-text-left">
                <div class="dokan-input-group">
                    <span class="dokan-input-group-addon"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
                    <input name="withdraw_amount" required class="wc_input_price dokan-form-control" id="withdraw-amount" type="text" placeholder="0<?php echo esc_attr( wc_get_price_decimal_separator() ); ?>00" value="<?php echo esc_attr( wc_format_localized_price( $amount ) ); ?>">
                </div>
            </div>
        </div>

        <div class="dokan-form-group">
            <label for="withdraw-method" class="dokan-w4 dokan-control-label">
                <?php esc_html_e( 'Withdraw Method', 'dokan-lite' ); ?>
            </label>
            <div class="dokan-w5 dokan-text-left">
                <select class="dokan-form-control" required name="withdraw_method" id="withdraw-method">
                    <?php foreach ( $payment_methods as $method_name ) : ?>
                        <option value="<?php echo esc_attr( $method_name ); ?>" <?php selected( $withdraw_method, $method_name ); ?>><?php echo esc_html( dokan_withdraw_get_method_title( $method_name ) ); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <div class="dokan-form-group">
            <div class="ajax_prev footer">
                <?php wp_nonce_field( 'dokan_withdraw', 'dokan_withdraw_nonce' ); ?>
                <button type="submit" id="dokan-withdraw-request-submit" class="dokan-btn dokan-btn-theme"><?php esc_html_e( 'Submit Request', 'dokan-lite' ); ?></button>
                <input type="hidden" name="dokan_handle_withdraw_request" value="approval">
            </div>
        </div>
    </div>
<?php else : ?>
    <div class="dokan-alert dokan-alert-warning">
        <strong><?php echo sprintf( '%s <a href="%s">%s</a>', esc_attr__( 'No withdraw method is available. Please update your payment method to withdraw funds.', 'dokan-lite' ), esc_url( dokan_get_navigation_url( 'settings/payment' ) ), esc_attr__( 'Payment Settings Setup', 'dokan-lite' ) ); ?></strong>
    </div>
<?php endif; ?>
