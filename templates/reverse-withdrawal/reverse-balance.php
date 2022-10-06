<?php
/**
 * @since 3.5.1
 *
 * @var $balance        float
 * @var $payable_amount float
 * @var $threshold      float
 * @var $billing_type   string
 * @var $billing_day    int
 * @var $due_period     int
 */
?>
<div class="reverse-balance-section">
    <div class="reverse-balance">
        <?php
        esc_html_e( 'Reverse Pay Balance: ', 'dokan-lite' );
        if ( $balance < 0 ) {
            echo '( ' . wc_price( abs( $balance ) ) . ' )';
        } else {
            echo wc_price( $balance );
        }
        ?>
    </div>
    <div class="reverse-threshold">
        <?php
        if ( 'by_amount' === $billing_type ) {
            printf( '<span class="payment-threshold">%s %s</span>', esc_html__( 'Threshold: ', 'dokan-lite' ), wc_price( $threshold ) );
        } elseif ( 'by_month' === $billing_type ) {
            printf(
                '<span class="payable-amount">%s %s</span>',
                esc_html__( 'Payable Amount: ', 'dokan-lite' ),
                $payable_amount >= 0 ? wc_price( $payable_amount ) : '( ' . wc_price( abs( $payable_amount ) ) . ' )'
            );
        }
        ?>
    </div>
    <?php if ( $payable_amount > 0 ) : ?>
        <div class="reverse-pay-form">
            <input type="text" id="reverse_pay_balance" value="<?php echo esc_attr( wc_format_localized_price( wc_format_decimal( $payable_amount, wc_get_price_decimals() ) ) ); ?>" readonly="readonly"/>
            <input type="button" id="reverse_pay" class="button dokan-btn dokan-btn-success dokan-btn-lg dokan-theme" value="<?php esc_attr_e( 'Pay Now', 'dokan-lite' ); ?>"/>
        </div>
    <?php endif; ?>
</div>
