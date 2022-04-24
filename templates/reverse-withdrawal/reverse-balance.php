<?php
/**
 * @var $balance float
 * @var $min_payable_amount float
 * @var $threshold float
 * @var $billing_type string
 * @var $billing_day int
 * @var $due_period int
 */

use Automattic\WooCommerce\Utilities\NumberUtil;

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
        }

        printf( '<span class="payment-min-payable">%s %s</span>',
            esc_html__( 'Minimum Payable: ', 'dokan-lite' ),
            $min_payable_amount >= 0 ? wc_price( $min_payable_amount ) : '( ' . wc_price( abs( $min_payable_amount ) ) . ' )'
        );
        ?>
    </div>
    <?php if ( $balance > 0 ): ?>
        <div class="reverse-pay-form">
            <input type="text" id="reverse_pay_balance" data-step="0.5" data-min="<?php echo esc_attr( $min_payable_amount ); ?>" data-max="<?php echo esc_attr( $balance ); ?>" value="<?php echo esc_attr( wc_format_localized_price( NumberUtil::round( $balance, wc_get_price_decimals() ) ) ); ?>" />
            <input type="button" id="reverse_pay" class="button dokan-btn dokan-btn-success dokan-btn-lg dokan-theme" value="<?php esc_attr_e( 'Pay Now', 'dokan-lite' ); ?>" />
        </div>
    <?php endif; ?>
    <?php if ( 'by_month' === $billing_type ): ?>

    <?php endif; ?>
</div>
