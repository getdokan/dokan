<?php
/**
 *
 */
?>
<div class="reverse-balance-section">
    <span class="reverse-balance"><?php esc_html_e( 'Reverse Pay Balance: ', 'dokan-lite' ); echo wc_price( 100 ) ?></span>
    <span class="reverse-threshold"><?php esc_html_e( 'Threshold Amount: ' ); echo wc_price( 150 ); ?></span>
    <span class="reverse-pay-form">
        <input type="text" id="reverse_pay_balance" value="<?php echo esc_attr( wc_format_localized_price(100) ); ?>">
        <input type="button" class="button dokan-btn dokan-btn-success dokan-btn-lg dokan-theme" value="<?php esc_attr_e( 'Pay Now', 'dokan-lite' ); ?>" />
    </span>
</div>
