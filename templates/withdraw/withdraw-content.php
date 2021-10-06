<?php
/**
 * Dokan Dashboard Withdraw Content
 *
 * @since 3.3.12
 *
 * @package dokan
 */
?>
<div class="dokan-panel dokan-panel-default">
    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Balance', 'dokan-lite' ); ?></strong></div>
    <div class="dokan-panel-body general-details">
        <div class="dokan-clearfix dokan-panel-inner-container">
            <div class="dokan-w8">
                <?php
                $balance        = dokan_get_seller_balance( dokan_get_current_user_id(), true );
                $withdraw_limit = dokan_get_option( 'withdraw_limit', 'dokan_withdraw', -1 );
                $threshold      = dokan_get_withdraw_threshold( dokan_get_current_user_id() );
                ?>
                <p>
                    <strong><?php esc_html_e( 'Your Balance:', 'dokan-lite' ); ?></strong> <?php echo $balance; ?><br>
                    <?php if ( $withdraw_limit !== -1 ) : ?>
                    <strong><?php esc_html_e( 'Minimum Withdraw Amount:', 'dokan-lite' ); ?></strong> <?php echo wc_price( $withdraw_limit ); ?><br>
                    <?php
                        endif;
                        if ( $threshold !== -1 ) :
                    ?>
                    <strong><?php esc_html_e( 'Withdraw Threshold:', 'dokan-lite' ); ?></strong> <?php echo sprintf( _n( '%s day', '%s days', $threshold, 'dokan-lite' ), number_format_i18n( $threshold ) ); ?>
                    <?php endif; ?>
                </p>

                <?php do_action( 'dokan-withdraw-content-after-balance' ); ?>

            </div>
            <div class="dokan-w5">
                <button class="dokan-btn dokan-btn-theme" id="dokan-request-withdraw-button"><?php esc_html_e( 'Request Withdraw', 'dokan-lite' ); ?></button>
                <?php do_action( 'dokan-withdraw-content-after-balance-button' ); ?>
            </div>
        </div>

    </div>
</div>

<?php do_action( 'dokan-withdraw-content-after-balance-section' ); ?>

<div class="dokan-panel dokan-panel-default">
    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Payment Details', 'dokan-lite' ); ?></strong></div>
    <div class="dokan-panel-body general-details">
        <div class="dokan-clearfix dokan-panel-inner-container">
            <div class="dokan-w8">
                <?php

                $last_withdraw = dokan()->withdraw->get_withdraw_requests(  dokan_get_current_user_id(), 1, 1 );
                $payment_details = __( 'You do not have any approved withdraw yet.', 'dokan-lite' );
                if ( ! empty( $last_withdraw ) ) {
                    $last_withdraw_amount      = wc_price( $last_withdraw['amount'] );
                    $last_withdraw_date        = dokan_format_date( $last_withdraw['date'] );
                    $last_withdraw_method_used = dokan_withdraw_get_method_title( $last_withdraw['method'] );
                    $payment_details = sprintf( __( '%1$s on %2$s to %3$s', 'dokan-lite' ), $last_withdraw_amount, $last_withdraw_date, $last_withdraw_method_used );
                }
                ?>
                <p>
                    <strong><?php esc_html_e( 'Last Payment', 'dokan-lite' ); ?></strong><br>
                    <?php echo esc_html( $payment_details ); ?>
                </p>

                <?php do_action( 'dokan-withdraw-content-after-last-payment' ); ?>

            </div>
            <div class="dokan-w5">
                <button class="dokan-btn dokan-btn-theme" id="dokan-request-withdraw-button"><?php esc_html_e( 'View Payments', 'dokan-lite' ); ?></button>
                <?php do_action( 'dokan-withdraw-content-after-last-payment-button' ); ?>
            </div>
        </div>

        <?php do_action( 'dokan-withdraw-content-after-last-payment-section' ); ?>

    </div>
</div>

<?php do_action( 'dokan-withdraw-content-after-payment-details-section' ); ?>


<div class="dokan-panel dokan-panel-default">
    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Payment Methods', 'dokan-lite' ); ?></strong></div>
    <div class="dokan-panel-body general-details">
        <?php
        $active_methods = dokan_withdraw_get_active_methods();
        $default_method = 'paypal'; // TODO: make it dynamic.

        foreach ( $active_methods as $method ) :
            $method_icon    = dokan_withdraw_get_method_icon( $method );
            $method_info    = dokan_withdraw_get_method_additional_info( $method );
            ?>
            <div class="dokan-clearfix dokan-panel-inner-container">
                <div class="dokan-w8">
                    <?php
                    echo wp_kses_post( $method_icon );
                    echo ' <strong>' . esc_html( dokan_withdraw_get_method_title( $method ) ) . '</strong> ';
                    echo esc_html( $method_info );

                    ?>
                </div>
                <div class="dokan-w5">
                    <?php if ( $default_method === $method ) : ?>
                    <button class="dokan-btn dokan-btn-theme" disabled data-withdraw-method="<?php esc_attr( $method ); ?>"><?php esc_html_e( 'Default', 'dokan-lite' ); ?></button>
                   <?php else: ?>
                   <button class="dokan-btn dokan-btn-theme dokan-withdraw-make-default-button" data-withdraw-method="<?php esc_attr( $method ); ?>"><?php esc_html_e( 'Make Default', 'dokan-lite' ); ?></button>
                   <?php endif; ?>
                </div>
            </div>
        <?php
        unset( $method_icon, $method_info );
        endforeach;
        ?>

        <?php do_action( 'dokan-withdraw-content-after-payment-methods-list' ); ?>

    </div>
</div>
<?php do_action( 'dokan-withdraw-content-after-payment-methods-section' ); ?>
