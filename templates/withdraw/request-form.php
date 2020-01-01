<?php
/**
 * Dokan Withdraw Request Form Template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<?php if ( ! empty( $payment_methods ) ) : ?>
<form class="dokan-form-horizontal withdraw" role="form" method="post">
    <div class="dokan-form-group">
        <label for="withdraw-amount" class="dokan-w3 dokan-control-label">
            <?php esc_html_e( 'Withdraw Amount', 'dokan-lite' ); ?>
        </label>

        <div class="dokan-w5 dokan-text-left">
            <div class="dokan-input-group">
                <span class="dokan-input-group-addon"><?php echo esc_html( get_woocommerce_currency_symbol() ); ?></span>
                <input name="withdraw_amount" required number min="<?php echo esc_attr( dokan_get_option( 'withdraw_limit', 'dokan_withdraw', 0 ) ); ?>" class="dokan-form-control" id="withdraw-amount" name="price" type="number" placeholder="0.00" value="<?php echo esc_attr( $amount ); ?>"  >
            </div>
        </div>
    </div>

    <div class="dokan-form-group">
        <label for="withdraw-method" class="dokan-w3 dokan-control-label">
            <?php esc_html_e( 'Payment Method', 'dokan-lite' ); ?>
        </label>

        <div class="dokan-w5 dokan-text-left">
            <select class="dokan-form-control" required name="withdraw_method" id="withdraw-method">
                <?php foreach ( $payment_methods as $method_name ) { ?>
                    <option <?php selected( $withdraw_method, $method_name );  ?>value="<?php echo esc_attr( $method_name ); ?>"><?php echo esc_html( dokan_withdraw_get_method_title( $method_name ) ); ?></option>
                <?php } ?>
            </select>
        </div>
    </div>

    <div class="dokan-form-group">
        <div class="dokan-w3 ajax_prev" style="margin-left:19%; width: 200px;">
            <?php wp_nonce_field( 'dokan_withdraw', 'dokan_withdraw_nonce' ); ?>
            <input type="submit" class="dokan-btn dokan-btn-theme" value="<?php esc_attr_e( 'Submit Request', 'dokan-lite' ); ?>">
            <input type="hidden" name="dokan_handle_withdraw_request" value="approval">
        </div>
    </div>
</form>
<?php else : ?>
    <div class="dokan-alert dokan-alert-warning">
        <strong><?php echo sprintf( '%s <a href="%s">%s</a>', esc_attr__( 'No withdraw method is available. Please update your payment method to withdraw funds.', 'dokan-lite' ), esc_url( dokan_get_navigation_url( 'settings/payment' ) ), esc_attr__( 'Payment Settings Setup', 'dokan-lite' ) ) ?></strong>
    </div>
<?php endif; ?>
