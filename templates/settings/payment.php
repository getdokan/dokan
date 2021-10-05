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
        <h2 style="margin: 5px 0">Payment Methods</h2>
        <div id="vendor-dashboard-payment-settings-toggle-dropdown">
            <button id="toggle-vendor-payment-method-drop-down" style="border-radius: 3px; padding: 5px; background-color: #2B78E4">Add Payment Method</button>
            <div style="position: relative;">
                <div id="vendor-payment-method-drop-down" style=" border: 1px black solid; padding: 0 5px; position: absolute; top: 0; background-color: white">
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
                                    <img src="<?php echo esc_url( DOKAN_PLUGIN_ASSEST . "/images/dashboard-settings/payment/$method_key.png" ); ?>" alt="$method_key"
                                        style="width: 3vw; min-width: 20px"/>
                                    <span style="margin-left: 10px; color: #333333"> <?php
                                        esc_html_e( $method['title'], 'dokan-lite' );
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
                    <img src="<?php echo esc_url( DOKAN_PLUGIN_ASSEST . "/images/dashboard-settings/payment/$method_key.png" ); ?>" alt="$method_key"
                        style="width: 5vw; min-width: 30px"/>
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
                        <button disabled tabindex="-1" style="border: 1px solid gray; background-color: #BBBBBB; color: black; padding: 2px 6px; border-radius: 3px">Default</button>
                    <?php } else { ?>
                        <button data-dokan-payment-method="<?php echo esc_attr( $method_key ) ?>"
                                style="border: 1px solid gray;
                                background-color: #DDDDDD;
                                color: black;
                                padding: 2px 6px;
                                border-radius: 3px">
                            Make Default
                        </button>
                    <?php } ?>
                    <a href="<?php echo esc_url(  home_url( "dashboard/settings/payment/manage-" . $method_key ) ); ?>">
                        <button style="border: 1px solid gray; background-color: #DDDDDD; color: black; padding: 2px 6px; border-radius: 3px">Manage</button>
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
