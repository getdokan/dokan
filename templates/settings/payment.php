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
            <div style="position: relative;">
                <div id="vendor-payment-method-drop-down">
                    <?php
                    $profile_methods = array_keys( $profile_info['payment'] );
                    $unused_methods  = array_diff( $methods, $profile_methods );

                    $mis_match_methods = [ 'stripe', 'moip' ];
                    $mis_match_methods = array_filter( $mis_match_methods, function ( $key ) use( $profile_methods ) {
                        return in_array( $key,  $profile_methods);
                    } );

                    $unused_methods = array_filter( $unused_methods, function ( $key ) use ( $mis_match_methods ) {
                        $found = false;

                        foreach ( $mis_match_methods as $mis_match_method ) {
                            $found = $found || ( false !== stripos( $key, $mis_match_method ) );
                        }

                        return ! $found;
                    } );
                    ?>
                    <ul style="list-style: none; margin: 0">
                    <?php foreach ( $unused_methods as $method_key ) {
                        $method = dokan_withdraw_get_method( $method_key );

                        if ( ! empty( $method ) ) {
                            $has_methods_dropdown = true;
                        } else {
                            continue;
                        }

                        ?>
                        <li>
                            <a href="<?php echo esc_url(  home_url( "dashboard/settings/payment/manage-" . $method_key ) ); ?>">
                                <div>
                                    <img src="<?php echo esc_url( DOKAN_PLUGIN_ASSEST . "/images/dashboard-settings/payment/$method_key.svg" ); ?>" alt="<?php echo esc_attr( $method_key ); ?>" />
                                    <span> <?php
                                        //translators: %s: payment method title
                                        echo sprintf( __( 'Direct to %s', 'dokan-lite' ), esc_html__( $method['title'], 'dokan-lite' ) );
                                        ?>
                                    </span>
                                </div>
                            </a>
                        </li>
                    <?php } ?>
                    </ul>

                    <?php if ( ! $has_methods_dropdown ) { ?>
                        <div>
                            <?php esc_html_e( 'All payment methods are used', 'dokan-lite' ); ?>
                        </div>
                    <?php } ?>
                </div>
            </div>
        </div>
    </div>
    <ul style="list-style: none">

    <?php wp_nonce_field( 'dokan_payment_settings_nonce' );
    $mis_match_map = [
        'dokan-stripe-connect' => 'stripe',
        'dokan-moip-connect'   => 'moip'
    ];

    foreach ( $methods as $method_key ) {
        if ( ! isset( $profile_info['payment'][$method_key] ) && ! isset( $profile_info['payment'][$mis_match_map[$method_key]] ) ) {
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
                    <img src="<?php echo esc_url( DOKAN_PLUGIN_ASSEST . "/images/dashboard-settings/payment/$method_key.svg" ); ?>" alt="<?php echo esc_attr( $method_key ); ?>" />
                    <span>
                        <?php
                        esc_html_e( $method['title'], 'dokan-lite' );

                        if ( isset( $profile_info['payment'][$method_key]['email'] ) ) {
                            echo " (" . $profile_info['payment'][$method_key]['email'] . ")";
                        }
                        ?>
                    </span>
                </div>
                <div>
                    <?php if ( isset( $profile_info['payment']['default-method'] ) && $profile_info['payment']['default-method'] === $method_key ) {?>
                        <button disabled tabindex="-1" class="dokan-btn-sm" style="background-color: gray; margin-bottom: 3px"><?php esc_html_e( 'Default', 'dokan-lite' ); ?></button>
                    <?php } else { ?>
                        <button class="dokan-btn-sm dokan-btn-success" data-dokan-payment-method="<?php echo esc_attr( $method_key ) ?>" style="margin-bottom: 3px">
                            <?php esc_html_e( 'Make Default', 'dokan-lite' ); ?>
                        </button>
                    <?php } ?>
                    <a href="<?php echo esc_url(  home_url( "dashboard/settings/payment/manage-" . $method_key . "/edit" ) ); ?>">
                        <button style="margin-bottom: 3px; margin-left: 3px" class="dokan-btn-sm dokan-btn-theme"><?php esc_html_e( 'Manage', 'dokan-lite' ); ?></button>
                    </a>
                </div>
            </div>
        </li>
    <?php } ?>
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
