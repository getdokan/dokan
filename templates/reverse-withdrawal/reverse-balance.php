<?php
/**
 * @var $balance float
 * @var $min_payable_amount float
 * @var $billing_type string
 * @var $billing_day int
 * @var $due_period int
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
    <span class="reverse-threshold">
        <?php
        esc_html_e( 'Minimum Payable Amount: ' );
        if ( $min_payable_amount < 0 ) {
            echo '( ' . wc_price( abs( $min_payable_amount ) ) . ' )';
        } else {
            echo wc_price( $min_payable_amount );
        }
        ?>
    </span>
    <?php if ( $balance > 0 ): ?>
        <span class="reverse-pay-form">
            <input type="number" id="reverse_pay_balance" step="0.5" min="<?php echo esc_attr( $min_payable_amount ); ?>" max="<?php echo esc_attr( $balance ); ?>" value="<?php echo esc_attr( wc_format_localized_price( $balance ) ); ?>" />
            <input type="button" id="reverse_pay" class="button dokan-btn dokan-btn-success dokan-btn-lg dokan-theme" value="<?php esc_attr_e( 'Pay Now', 'dokan-lite' ); ?>" />
        </span>
    <?php endif; ?>
    <?php if ( 'by_month' === $billing_type ): ?>

    <?php endif; ?>
</div>
