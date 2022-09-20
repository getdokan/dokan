<?php
/**
 * Dokan Dashboard Withdraw Content
 *
 * @since   3.3.1
 *
 * @package dokan
 */
?>
<div class="dokan-panel dokan-panel-default">
    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Balance', 'dokan-lite' ); ?></strong></div>
    <div class="dokan-panel-body general-details">
        <div class="dokan-clearfix dokan-panel-inner-container">
            <div class="dokan-w8">
                <p>
                    <?php esc_html_e( 'Your Balance:', 'dokan-lite' ); ?> <strong>
                        <?php if ( function_exists( 'dokan_pro' ) ) : ?>
                            <a href="<?php echo function_exists( 'dokan_pro' ) ? esc_url( add_query_arg( 'chart', 'sales_statement', dokan_get_navigation_url( 'reports' ) ) ) : ''; ?>"><?php echo wp_kses_post( $balance ); ?></a>
							<?php
                        else :
                            echo wp_kses_post( $balance );
                        endif;
                        ?>
                    </strong><br>
                    <?php if ( $withdraw_limit !== - 1 ) : ?>
                        <?php esc_html_e( 'Minimum Withdraw Amount:', 'dokan-lite' ); ?> <strong><?php echo wc_price( $withdraw_limit ); ?></strong><br>
						<?php
                    endif;
                    if ( $threshold !== - 1 ) :
                        ?>
                        <?php esc_html_e( 'Withdraw Threshold:', 'dokan-lite' ); ?>
                        <strong>
                            <?php
                            echo sprintf(
                                // translators: 1) withdraw threshold days
                                _n( '%s day', '%s days', $threshold, 'dokan-lite' ), number_format_i18n( $threshold )
                            );
                            ?>
                        </strong>
                    <?php endif; ?>
                </p>

                <?php do_action( 'dokan_withdraw_content_after_balance' ); ?>

            </div>
            <div class="dokan-w5">
                <?php if ( dokan_withdraw_is_manual_request_enabled() ) : ?>
                    <button class="dokan-btn" id="dokan-request-withdraw-button"><?php esc_html_e( 'Request Withdraw', 'dokan-lite' ); ?></button>
					<?php
                endif;
                do_action( 'dokan_withdraw_content_after_balance_button' );
                ?>
            </div>
        </div>

    </div>
</div>

<?php do_action( 'dokan_withdraw_content_after_balance_section' ); ?>

<div class="dokan-panel dokan-panel-default">
    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Payment Details', 'dokan-lite' ); ?></strong></div>
    <div class="dokan-panel-body general-details">
        <div class="dokan-clearfix dokan-panel-inner-container">
            <div class="dokan-w8">
                <p>
                    <strong><?php esc_html_e( 'Last Payment', 'dokan-lite' ); ?></strong><br>
                    <?php echo wp_kses_post( $payment_details ); ?>
                </p>

                <?php do_action( 'dokan_withdraw_content_after_last_payment' ); ?>

            </div>
            <div class="dokan-w5">
                <a href="<?php echo esc_url( dokan_get_navigation_url( 'withdraw-requests' ) ); ?>" class="dokan-btn" id="dokan-withdraw-display-requests-button"><?php esc_html_e( 'View Payments', 'dokan-lite' ); ?></a>
                <?php do_action( 'dokan_withdraw_content_after_last_payment_button' ); ?>
            </div>
        </div>

        <?php do_action( 'dokan_withdraw_content_after_last_payment_section' ); ?>

    </div>
</div>

<?php do_action( 'dokan_withdraw_content_after_payment_details_section' ); ?>


<div class="dokan-panel dokan-panel-default" id="dokan-withdraw-payment-method-list" data-security="<?php echo esc_attr( wp_create_nonce( 'dokan_withdraw_make_default' ) ); ?>">
    <div class="dokan-panel-heading"><strong><?php esc_html_e( 'Payment Methods', 'dokan-lite' ); ?></strong></div>
    <div class="dokan-panel-body general-details">
        <?php
        foreach ( $active_methods as $method ) :
            $method_icon = dokan_withdraw_get_method_icon( $method );
            $method_info = dokan_withdraw_get_method_additional_info( $method );
            $method_title = dokan_withdraw_get_method_title( $method );
            $has_information = in_array( $method, dokan_get_seller_active_withdraw_methods(), true );
            ?>
            <div class="dokan-clearfix dokan-panel-inner-container">
                <div class="dokan-w8">
                    <img src="<?php echo esc_url( $method_icon ); ?>" width="40" height="40" alt="<?php echo esc_attr( $method_title ); ?>" class="dokan-withdraw-method-logo"/>
                    <strong><?php echo esc_html( $method_title ); ?></strong>
                    <small><?php echo esc_html( $method_info ); ?></small>
                </div>
                <div class="dokan-w5">
                    <?php if ( $default_method === $method ) : ?>
                        <button class="dokan-btn dokan-btn-default" disabled data-method="<?php echo esc_attr( $method ); ?>"><?php esc_html_e( 'Default', 'dokan-lite' ); ?></button>
                    <?php elseif ( ! $has_information ) : ?>
                        <a href="<?php echo esc_url( dokan_get_navigation_url( 'settings/payment' ) ); ?>" class="dokan-btn" data-method="<?php echo esc_attr( $method ); ?>"><?php esc_html_e( 'Setup', 'dokan-lite' ); ?></a>
                    <?php else : ?>
                        <button class="dokan-btn dokan-withdraw-make-default-button" data-method="<?php echo esc_attr( $method ); ?>"><?php esc_html_e( 'Make Default', 'dokan-lite' ); ?></button>
                    <?php endif; ?>
                </div>
            </div>
            <?php
            unset( $method_icon, $method_info );
        endforeach;
        ?>

        <?php do_action( 'dokan_withdraw_content_after_payment_methods_list' ); ?>

    </div>
</div>

<?php do_action( 'dokan_withdraw_content_after_payment_methods_section' ); ?>
