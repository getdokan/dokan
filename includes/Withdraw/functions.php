<?php
/**
 * Get default withdraw methods for vendor
 *
 * @since 1.0.0
 *
 * @return array
 */
function dokan_withdraw_register_methods() {
    $methods = [
        'paypal' => [
            'title'    => __( 'PayPal', 'dokan-lite' ),
            'callback' => 'dokan_withdraw_method_paypal',
        ],
        'bank' => [
            'title'    => __( 'Bank Transfer', 'dokan-lite' ),
            'callback' => 'dokan_withdraw_method_bank',
        ],
    ];

    return apply_filters( 'dokan_withdraw_methods', $methods );
}

/**
 * Get registered withdraw methods suitable for Settings Api
 *
 * @return array
 */
function dokan_withdraw_get_methods() {
    $methods    = [];
    $registered = dokan_withdraw_register_methods();

    foreach ( $registered as $key => $value ) {
        $methods[ $key ] = $value['title'];
    }

    return $methods;
}

/**
 * Get active withdraw methods.( Default is paypal )
 *
 * @return array
 */
function dokan_withdraw_get_active_methods() {
    $methods = dokan_get_option( 'withdraw_methods', 'dokan_withdraw', [ 'paypal' ] );

    return $methods;
}

/**
 * Get active withdraw methods for seller.
 *
 * @since 3.0.0 add $vendor_id param
 *
 * @param int $vendor_id Seller vendor id
 *
 * @return array
 */
function dokan_get_seller_active_withdraw_methods( $vendor_id = 0 ) {
    $vendor_id = $vendor_id ? $vendor_id : dokan_get_current_user_id();

    $payment_methods = get_user_meta( $vendor_id, 'dokan_profile_settings' );
    $paypal          = isset( $payment_methods[0]['payment']['paypal']['email'] ) && $payment_methods[0]['payment']['paypal']['email'] !== false ? 'paypal' : '';
    $bank            = isset( $payment_methods[0]['payment']['bank']['ac_number'] ) && $payment_methods[0]['payment']['bank']['ac_number'] !== '' ? 'bank' : '';
    $skrill          = isset( $payment_methods[0]['payment']['skrill']['email'] ) && $payment_methods[0]['payment']['skrill']['email'] !== false ? 'skrill' : '';

    $payment_methods        = [ $paypal, $bank, $skrill ];
    $active_payment_methods = [];

    foreach ( $payment_methods as $payment_method ) {
        if ( ! empty( $payment_method ) ) {
            array_push( $active_payment_methods, $payment_method );
        }
    }

    return apply_filters( 'dokan_get_seller_active_withdraw_methods', $active_payment_methods, $vendor_id );
}

/**
 * Get a single withdraw method based on key
 *
 * @param string $method_key
 *
 * @return bool|array
 */
function dokan_withdraw_get_method( $method_key ) {
    $methods = dokan_withdraw_register_methods();

    if ( isset( $methods[ $method_key ] ) ) {
        return $methods[ $method_key ];
    }

    return false;
}

/**
 * Get title from a withdraw method
 *
 * @param string $method_key
 *
 * @return string
 */
function dokan_withdraw_get_method_title( $method_key ) {
    $registered = dokan_withdraw_register_methods();

    if ( isset( $registered[ $method_key ] ) ) {
        return $registered[ $method_key ]['title'];
    }

    return '';
}

/**
 * Callback for PayPal in store settings
 *
 * @global WP_User $current_user
 *
 * @param array $store_settings
 */
function dokan_withdraw_method_paypal( $store_settings ) {
    global $current_user;

    $email = isset( $store_settings['payment']['paypal']['email'] ) ? esc_attr( $store_settings['payment']['paypal']['email'] ) : $current_user->user_email; ?>
    <div class="dokan-form-group">
        <div class="dokan-w8">
            <div class="dokan-input-group">
                <span class="dokan-input-group-addon"><?php esc_html_e( 'E-mail', 'dokan-lite' ); ?></span>
                <input value="<?php echo esc_attr( $email ); ?>" name="settings[paypal][email]" class="dokan-form-control email" placeholder="you@domain.com" type="text">
            </div>
        </div>
    </div>
    <?php
}

/**
 * Callback for Skrill in store settings
 *
 * @global WP_User $current_user
 *
 * @param array $store_settings
 */
function dokan_withdraw_method_skrill( $store_settings ) {
    global $current_user;

    $email = isset( $store_settings['payment']['skrill']['email'] ) ? esc_attr( $store_settings['payment']['skrill']['email'] ) : $current_user->user_email;
    ?>
    <div class="dokan-form-group">
        <div class="dokan-w8">
            <div class="dokan-input-group">
                <span class="dokan-input-group-addon"><?php esc_htmlt_e( 'E-mail', 'dokan-lite' ); ?></span>
                <input value="<?php echo esc_attr( $email ); ?>" name="settings[skrill][email]" class="dokan-form-control email" placeholder="you@domain.com" type="text">
            </div>
        </div>
    </div>
    <?php
}

/**
 * Callback for Bank in store settings
 *
 * @global WP_User $current_user
 *
 * @param array $store_settings
 */
function dokan_withdraw_method_bank( $store_settings ) {
    $account_name   = isset( $store_settings['payment']['bank']['ac_name'] ) ? $store_settings['payment']['bank']['ac_name'] : '';
    $account_number = isset( $store_settings['payment']['bank']['ac_number'] ) ? $store_settings['payment']['bank']['ac_number'] : '';
    $bank_name      = isset( $store_settings['payment']['bank']['bank_name'] ) ? $store_settings['payment']['bank']['bank_name'] : '';
    $bank_addr      = isset( $store_settings['payment']['bank']['bank_addr'] ) ? $store_settings['payment']['bank']['bank_addr'] : '';
    $routing_number = isset( $store_settings['payment']['bank']['routing_number'] ) ? $store_settings['payment']['bank']['routing_number'] : '';
    $iban           = isset( $store_settings['payment']['bank']['iban'] ) ? $store_settings['payment']['bank']['iban'] : '';
    $swift_code     = isset( $store_settings['payment']['bank']['swift'] ) ? $store_settings['payment']['bank']['swift'] : '';
    ?>
    <div class="dokan-form-group">
        <div class="dokan-w8">
            <input name="settings[bank][ac_name]" value="<?php echo esc_attr( $account_name ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Your bank account name', 'dokan-lite' ); ?>" type="text">
        </div>
    </div>

    <div class="dokan-form-group">
        <div class="dokan-w8">
            <input name="settings[bank][ac_number]" value="<?php echo esc_attr( $account_number ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Your bank account number', 'dokan-lite' ); ?>" type="text">
        </div>
    </div>

    <div class="dokan-form-group">
        <div class="dokan-w8">
            <input name="settings[bank][bank_name]" value="<?php echo esc_attr( $bank_name ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Name of bank', 'dokan-lite' ); ?>" type="text">
        </div>
    </div>

    <div class="dokan-form-group">
        <div class="dokan-w8">
            <textarea name="settings[bank][bank_addr]" rows="5" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Address of your bank', 'dokan-lite' ); ?>"><?php echo esc_html( $bank_addr ); ?></textarea>
        </div>
    </div>

    <div class="dokan-form-group">
        <div class="dokan-w8">
            <input name="settings[bank][routing_number]" value="<?php echo esc_attr( $routing_number ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Routing number', 'dokan-lite' ); ?>" type="text">
        </div>
    </div>

    <div class="dokan-form-group">
        <div class="dokan-w8">
            <input name="settings[bank][iban]" value="<?php echo esc_attr( $iban ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'IBAN', 'dokan-lite' ); ?>" type="text">
        </div>
    </div>

    <div class="dokan-form-group">
        <div class="dokan-w8">
            <input value="<?php echo esc_attr( $swift_code ); ?>" name="settings[bank][swift]" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Swift code', 'dokan-lite' ); ?>" type="text">
        </div>
    </div> <!-- .dokan-form-group -->
    <?php
}

/**
 * Get withdraw counts, used in admin area
 *
 * @global WPDB $wpdb
 *
 * @return array
 */
function dokan_get_withdraw_count( $user_id = null ) {
    global $wpdb;

    $cache_key = 'dokan_withdraw_count-' . $user_id;
    $counts    = wp_cache_get( $cache_key );

    if ( false === $counts ) {
        $counts = [
            'pending'   => 0,
            'completed' => 0,
            'cancelled' => 0,
        ];

        if ( ! empty( $user_id ) ) {
            $result = $wpdb->get_results( $wpdb->prepare( "SELECT COUNT(id) as count, status FROM {$wpdb->dokan_withdraw} WHERE user_id=%d GROUP BY status", $user_id ) );
        } else {
            $result = $wpdb->get_results( "SELECT COUNT(id) as count, status FROM {$wpdb->dokan_withdraw} WHERE 1=1 GROUP BY status" );
        }

        if ( $result ) {
            foreach ( $result as $row ) {
                if ( $row->status === '0' ) {
                    $counts['pending'] = (int) $row->count;
                } elseif ( $row->status === '1' ) {
                    $counts['completed'] = (int) $row->count;
                } elseif ( $row->status === '2' ) {
                    $counts['cancelled'] = (int) $row->count;
                }
            }
        }
    }

    return $counts;
}

/**
 * Get active withdraw order status.
 *
 * Default is 'completed', 'processing', 'on-hold'
 *
 * @return array
 */
function dokan_withdraw_get_active_order_status() {
    $order_status  = dokan_get_option( 'withdraw_order_status', 'dokan_withdraw', [ 'wc-completed' ] );
    $saving_status = [ 'wc-refunded' ];

    foreach ( $order_status as $key => $status ) {
        if ( ! empty( $status ) ) {
            $saving_status[] = $status;
        }
    }

    return apply_filters( 'dokan_withdraw_active_status', $saving_status );
}

/**
 * Get comma seperated value from "dokan_withdraw_get_active_order_status()" return array
 *
 * @param array array
 */
function dokan_withdraw_get_active_order_status_in_comma() {
    $order_status = dokan_withdraw_get_active_order_status();
    $status       = "'" . implode( "', '", $order_status ) . "'";

    return $status;
}
