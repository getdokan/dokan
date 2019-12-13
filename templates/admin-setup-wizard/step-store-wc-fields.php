<?php
$address        = WC()->countries->get_base_address();
$address_2      = WC()->countries->get_base_address_2();
$city           = WC()->countries->get_base_city();
$state          = WC()->countries->get_base_state();
$country        = WC()->countries->get_base_country();
$postcode       = WC()->countries->get_base_postcode();
$currency       = get_option( 'woocommerce_currency', 'GBP' );
$product_type   = get_option( 'woocommerce_product_type', 'both' );
$sell_in_person = get_option( 'woocommerce_sell_in_person', 'none_selected' );

if ( empty( $country ) ) {
    $user_location = WC_Geolocation::geolocate_ip();
    $country       = $user_location['country'];
    $state         = $user_location['state'];
}

$locale_info         = include WC()->plugin_path() . '/i18n/locale-info.php';
$currency_by_country = wp_list_pluck( $locale_info, 'currency_code' );
?>
<tr>
    <th><label for="store_country"><?php esc_html_e( 'Where is your store based?', 'dokan-lite' ); ?></label></th>
    <td>
        <select id="store_country" name="store_country" required data-placeholder="<?php esc_attr_e( 'Choose a country&hellip;', 'dokan-lite' ); ?>" aria-label="<?php esc_attr_e( 'Country', 'dokan-lite' ); ?>" class="location-input wc-enhanced-select dropdown">
            <?php foreach ( WC()->countries->get_countries() as $code => $label ) : ?>
                <option <?php selected( $code, $country ); ?> value="<?php echo esc_attr( $code ); ?>"><?php echo esc_html( $label ); ?></option>
            <?php endforeach; ?>
        </select>
    </td>
</tr>

<tr>
    <th><label><?php esc_html_e( 'Address', 'dokan-lite' ); ?></label></th>
    <td>
        <div class="margin-bottom-10">
            <label>
                <?php esc_html_e( 'Address line 1', 'dokan-lite' ); ?>
                <input type="text" id="store_address" class="location-input" name="store_address" required value="<?php echo esc_attr( $address ); ?>" />
            </label>
        </div>

        <div class="margin-bottom-10">
            <label>
                <?php esc_html_e( 'Address line 2', 'dokan-lite' ); ?>
                <input type="text" id="store_address_2" class="location-input" name="store_address_2" value="<?php echo esc_attr( $address_2 ); ?>" />
            </label>
        </div>

        <div class="margin-bottom-10">
            <label>
                <?php esc_html_e( 'City', 'dokan-lite' ); ?>
                <input type="text" id="store_city" class="location-input" name="store_city" required value="<?php echo esc_attr( $city ); ?>" />
            </label>
        </div>

        <div class="margin-bottom-10 store-state-container hidden">
            <label>
                <?php esc_html_e( 'State', 'dokan-lite' ); ?>
                <select id="store_state" name="store_state" data-placeholder="<?php esc_attr_e( 'Choose a state&hellip;', 'dokan-lite' ); ?>" aria-label="<?php esc_attr_e( 'State', 'dokan-lite' ); ?>" class="location-input wc-enhanced-select dropdown"></select>
            </label>
        </div>

        <div>
            <label class="location-prompt" for="store_postcode"><?php esc_html_e( 'Postcode / ZIP', 'dokan-lite' ); ?></label>
            <input type="text" id="store_postcode" class="location-input" name="store_postcode" required value="<?php echo esc_attr( $postcode ); ?>" />
        </div>
    </td>
</tr>

<tr>
    <th>
        <label for="currency_code">
            <?php esc_html_e( 'What currency do you accept payments in?', 'dokan-lite' ); ?>
        </label>
    </th>
    <td>
        <select
            id="currency_code"
            name="currency_code"
            required
            data-placeholder="<?php esc_attr_e( 'Choose a currency&hellip;', 'dokan-lite' ); ?>"
            class="location-input wc-enhanced-select dropdown"
        >
            <option value=""><?php esc_html_e( 'Choose a currency&hellip;', 'dokan-lite' ); ?></option>
            <?php foreach ( get_woocommerce_currencies() as $code => $name ) : ?>
                <option value="<?php echo esc_attr( $code ); ?>" <?php selected( $currency, $code ); ?>>
                    <?php
                    $symbol = get_woocommerce_currency_symbol( $code );

                    if ( $symbol === $code ) {
                        /* translators: 1: currency name 2: currency code */
                        echo esc_html( sprintf( __( '%1$s (%2$s)', 'dokan-lite' ), $name, $code ) );
                    } else {
                        /* translators: 1: currency name 2: currency symbol, 3: currency code */
                        echo esc_html( sprintf( __( '%1$s (%2$s %3$s)', 'dokan-lite' ), $name, get_woocommerce_currency_symbol( $code ), $code ) );
                    }
                    ?>
                </option>
            <?php endforeach; ?>
        </select>
        <script type="text/javascript">
            var wc_setup_currencies = JSON.parse( decodeURIComponent( '<?php echo rawurlencode( wp_json_encode( $currency_by_country ) ); ?>' ) );
            var wc_base_state       = "<?php echo esc_js( $state ); ?>";
        </script>
    </td>
</tr>

<tr>
    <th>
        <label for="product_type">
            <?php esc_html_e( 'What type of products do you plan to sell?', 'dokan-lite' ); ?>
        </label>
    </th>
    <td>
        <div class="margin-bottom-10">
            <select id="product_type" name="product_type" required class="location-input wc-enhanced-select dropdown">
                <option value="both" <?php selected( $product_type, 'both' ); ?>><?php esc_html_e( 'I plan to sell both physical and digital products', 'dokan-lite' ); ?></option>
                <option value="physical" <?php selected( $product_type, 'physical' ); ?>><?php esc_html_e( 'I plan to sell physical products', 'dokan-lite' ); ?></option>
                <option value="virtual" <?php selected( $product_type, 'virtual' ); ?>><?php esc_html_e( 'I plan to sell digital products', 'dokan-lite' ); ?></option>
            </select>
        </div>
        <input type="checkbox" name="sell_in_person" id="sell_in_person" class="switch-input" <?php checked( $sell_in_person, true ); ?>>
        <label for="sell_in_person" class="switch-label">
            <span class="toggle--on"><?php esc_html_e( 'I will also be selling products or services in person.', 'dokan-lite' ); ?></span>
            <span class="toggle--off"><?php esc_html_e( 'I will also be selling products or services in person.', 'dokan-lite' ); ?></span>
        </label>
    </td>
</tr>
