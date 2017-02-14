<?php
/**
 * Dokan Withdraw Request Form Template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<form class="dokan-form-horizontal withdraw" role="form" method="post">
    <div class="dokan-form-group">
        <label for="withdraw-amount" class="dokan-w3 dokan-control-label">
            <?php _e( 'Withdraw Amount', 'dokan' ); ?>
        </label>

        <div class="dokan-w5 dokan-text-left">
            <div class="dokan-input-group">
                <span class="dokan-input-group-addon"><?php echo get_woocommerce_currency_symbol(); ?></span>
                <input name="witdraw_amount" required number min="<?php echo esc_attr( dokan_get_option( 'withdraw_limit', 'dokan_withdraw', 50 ) ); ?>" class="dokan-form-control" id="withdraw-amount" name="price" type="number" placeholder="0.00" value="<?php echo $amount; ?>"  >
            </div>
        </div>
    </div>

    <div class="dokan-form-group">
        <label for="withdraw-method" class="dokan-w3 dokan-control-label">
            <?php _e( 'Payment Method', 'dokan' ); ?>
        </label>

        <div class="dokan-w5 dokan-text-left">
            <select class="dokan-form-control" required name="withdraw_method" id="withdraw-method">
                <?php foreach ( $payment_methods as $method_name ) { ?>
                    <option <?php selected( $withdraw_method, $method_name );  ?>value="<?php echo esc_attr( $method_name ); ?>"><?php echo dokan_withdraw_get_method_title( $method_name ); ?></option>
                <?php } ?>
            </select>
        </div>
    </div>

    <div class="dokan-form-group">
        <div class="dokan-w3 ajax_prev" style="margin-left:19%; width: 200px;">
            <?php wp_nonce_field( 'dokan_withdraw', 'dokan_withdraw_nonce' ); ?>
            <input type="submit" class="dokan-btn dokan-btn-theme" value="<?php esc_attr_e( 'Submit Request', 'dokan' ); ?>" name="withdraw_submit">
        </div>
    </div>
</form>
