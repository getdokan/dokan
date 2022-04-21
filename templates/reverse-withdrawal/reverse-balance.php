<?php
/**
 * @var $threshold float
 * @var $balance float
 * //<span class="reverse-balance-notice"><?php esc_html_e( 'You have exceeded the threshold amount. Please reverse the payment.', 'dokan-lite' ); ?></span>
 */
?>
<div class="reverse-balance-section">
    <span class="reverse-balance">
        <?php
        esc_html_e( 'Reverse Pay Balance: ', 'dokan-lite' );
        if ( $balance < 0 ) {
            echo '( ' . wc_price( abs( $balance ) ) . ' )';
        } else {
            echo wc_price( $balance );
        }
        ?>
    </span>
    <span class="reverse-threshold"><?php esc_html_e( 'Threshold Amount: ' ); echo wc_price( $threshold ); ?></span>
    <?php if ( $balance > 0 ): ?>
        <span class="reverse-pay-form">
            <input type="number" id="reverse_pay_balance" step="0.1" max="<?php echo esc_attr( $balance ); ?>" value="<?php echo esc_attr( wc_format_localized_price( $balance ) ); ?>" />
            <input type="button" id="reverse_pay" class="button dokan-btn dokan-btn-success dokan-btn-lg dokan-theme" value="<?php esc_attr_e( 'Pay Now', 'dokan-lite' ); ?>" />
        </span>
    <?php endif; ?>
</div>
