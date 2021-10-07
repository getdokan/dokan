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

<div>
    <h2 style=" padding: 25px; display: none; background-color: palevioletred" id="vendor-dashboard-payment-settings-error"></h2>
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: #EEEEEE">
        <h2 style="margin: 5px 0; flex-grow: 1">Payment Methods</h2>
        <div id="vendor-dashboard-payment-settings-toggle-dropdown" style="flex-grow: 2; text-align: right">
            <button id="toggle-vendor-payment-method-drop-down" style="border-radius: 3px; padding: 5px; background-color: #2B78E4">Add Payment Method</button>
            <div style="position: relative;">
                <div id="vendor-payment-method-drop-down" style=" border: 1px black solid; padding: 0 5px; position: absolute; top: 0; right: 0; background-color: white">
                    <?php
                    $profile_methods = array_keys( $profile_info['payment'] );
                    $unused_methods = array_diff( $methods, $profile_methods );

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
                                <div style="display: flex; align-items: center; border-bottom: 1px gray solid; padding: 5px 0">
                                    <div style="width: calc( 12px + 2vw );">
                                        <i class="fa <?php echo get_payment_method_icon_class( $method_key ); ?>" style="color: black; font-size: calc( 12px + 1.5vw );"></i>
                                    </div>
                                    <span style="margin-left: 10px; color: #333333"> <?php
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
                            All payment methods are used
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
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: #CCCCCC solid 1px">
                <div style="display: flex; align-items: center">
                    <div style="width: calc( 12px + 4vw );">
                        <i class="fa <?php echo get_payment_method_icon_class( $method_key ); ?>" style="color: black; font-size: calc( 12px + 3vw );"></i>
                    </div>
                    <span style="margin-left: 10px; color: #333333">
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
                        <button disabled tabindex="-1" class="dokan-btn-sm" style="background-color: gray; margin-bottom: 3px">Default</button>
                    <?php } else { ?>
                        <button class="dokan-btn-sm dokan-btn-success" data-dokan-payment-method="<?php echo esc_attr( $method_key ) ?>" style="margin-bottom: 3px">
                            Make Default
                        </button>
                    <?php } ?>
                    <a href="<?php echo esc_url(  home_url( "dashboard/settings/payment/manage-" . $method_key . "/edit" ) ); ?>">
                        <button class="dokan-btn-sm dokan-btn-theme">Manage</button>
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
do_action( 'dokan_payment_settings_after_form', $current_user, $profile_info );

function get_payment_method_icon_class( $method ) {
    if ( stripos( $method, 'stripe' ) !== false ) {
        return 'fa-cc-stripe';
    } elseif ( stripos( $method, 'paypal' ) !== false ) {
        return 'fa-cc-paypal';
    } elseif ( stripos( $method, 'bank' ) !== false ) {
        return 'fa-university';
    } else {
        return 'fa-credit-card';
    }
}
?>
