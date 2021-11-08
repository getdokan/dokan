<?php
/**
 * Dokan Settings Payment Template
 *
 * @since 2.2.2 Insert action before payment settings form
 *
 * @package dokan
 */
$has_methods = false;
$has_methods_dropdown = false;

do_action( 'dokan_payment_settings_before_form', $current_user, $profile_info ); ?>

<div class="dokan-payment-settings-summary">
    <h2 id="vendor-dashboard-payment-settings-error"></h2>
    <div class="payment-methods-listing-header">
        <h2> <?php esc_html_e( 'Payment Methods', 'dokan-lite' ); ?></h2>
        <div id="vendor-dashboard-payment-settings-toggle-dropdown">
            <button id="toggle-vendor-payment-method-drop-down" class="dokan-btn dokan-btn-success"> <?php esc_html_e( 'Add Payment Method', 'dokan-lite' ); ?></button>
            <div id="vendor-payment-method-drop-down-wrapper">
                <div id="vendor-payment-method-drop-down">
                    <?php
                    $icon_mismatch_map = [
                        'dokan-stripe-connect'     => 'stripe',
                        'dokan-paypal-marketplace' => 'paypal'
                    ];
                    $mis_match_methods = [ 'stripe', 'moip' ];
                    $unused_methods    = get_unused_payment_methods( $methods, $profile_info['payment'], $mis_match_methods );
                    ?>
                    <ul>
                    <?php foreach ( $unused_methods as $method_key ) :
                        $method = dokan_withdraw_get_method( $method_key );

                        if ( ! empty( $method ) ) {
                            $has_methods_dropdown = true;
                        } else {
                            continue;
                        }
                        ?>
                        <li>
                            <a href="<?php echo esc_url( home_url( "dashboard/settings/payment/manage-" . $method_key ) ); ?>">
                                <div>
                                    <img src="<?php echo esc_url( dokan_withdraw_get_method_icon( isset( $icon_mismatch_map[ $method_key ] ) ? $icon_mismatch_map[ $method_key ] : $method_key ) ); ?>" alt="<?php echo esc_attr( $method_key ); ?>" />
                                    <span> <?php
                                        //translators: %s: payment method title
                                        echo sprintf( __( 'Direct to %s', 'dokan-lite' ), esc_html__( $method['title'], 'dokan-lite' ) );
                                        ?>
                                    </span>
                                </div>
                            </a>
                        </li>
                    <?php endforeach; ?>
                    </ul>

                    <?php if ( ! $has_methods_dropdown ) : ?>
                        <div>
                            <?php esc_html_e( 'All payment methods are used', 'dokan-lite' ); ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    <ul>

    <?php
    wp_nonce_field( 'dokan_withdraw_make_default' );
    $default_method = dokan_withdraw_get_default_method( $current_user );
    $mis_match_map  = [
        'dokan-stripe-connect' => 'stripe',
        'dokan-moip-connect'   => 'moip'
    ];

    foreach ( $methods as $method_key ) :
        if ( ! isset( $profile_info['payment'][ $method_key ] ) && ! isset( $profile_info['payment'][ $mis_match_map[ $method_key ] ] ) ) {
            continue;
        }

        $method = dokan_withdraw_get_method( $method_key );

        if ( ! empty( $method ) ) {
            $has_methods = true;
        } else {
            continue;
        }
        ?>
        <li>
            <div>
                <div>
                    <img src="<?php echo esc_url( dokan_withdraw_get_method_icon( isset( $icon_mismatch_map[ $method_key ] ) ? $icon_mismatch_map[ $method_key ] : $method_key ) ); ?>" alt="<?php echo esc_attr( $method_key ); ?>" />
                    <span>
                        <?php
                        esc_html_e( $method['title'], 'dokan-lite' );

                        if ( isset( $profile_info['payment'][ $method_key ] ) && isset( $profile_info['payment'][ $method_key ]['email'] ) ) {
                            echo " (" . $profile_info['payment'][ $method_key ]['email'] . ")";
                        }
                        ?>
                    </span>
                </div>
                <div>
                    <?php if ( $default_method === $method_key ) {?>
                        <button disabled tabindex="-1" class="dokan-btn-sm"><?php esc_html_e( 'Default', 'dokan-lite' ); ?></button>
                    <?php } else { ?>
                        <button class="dokan-btn-sm dokan-btn-success" data-dokan-payment-method="<?php echo esc_attr( $method_key ) ?>">
                            <?php esc_html_e( 'Make Default', 'dokan-lite' ); ?>
                        </button>
                    <?php } ?>
                    <a href="<?php echo esc_url(  home_url( "dashboard/settings/payment/manage-" . $method_key . "/edit" ) ); ?>">
                        <button class="dokan-btn-theme dokan-btn-sm"><?php esc_html_e( 'Manage', 'dokan-lite' ); ?></button>
                    </a>
                </div>
            </div>
        </li>
    <?php endforeach; ?>
    </ul>
</div>

<?php
    if ( ! $has_methods ) {
        dokan_get_template_part( 'global/dokan-error', '', array( 'deleted' => false, 'message' => __( 'No withdraw method is available. Please contact site admin.', 'dokan-lite' ) ) );
    }
?>


<?php
/**
 * @since 2.2.2 Insert action after social settings form
 */
do_action( 'dokan_payment_settings_after_form', $current_user, $profile_info ); ?>
