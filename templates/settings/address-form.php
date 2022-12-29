<?php
/**
 * Dokan Settings Address form Template
 *
 * @since   2.4
 *
 * @package dokan
 */

$address         = isset( $profile_info['address'] ) ? $profile_info['address'] : '';
$address_street1 = isset( $profile_info['address']['street_1'] ) ? $profile_info['address']['street_1'] : '';
$address_street2 = isset( $profile_info['address']['street_2'] ) ? $profile_info['address']['street_2'] : '';
$address_city    = isset( $profile_info['address']['city'] ) ? $profile_info['address']['city'] : '';
$address_zip     = isset( $profile_info['address']['zip'] ) ? $profile_info['address']['zip'] : '';
$address_country = isset( $profile_info['address']['country'] ) ? $profile_info['address']['country'] : '';
$address_state   = isset( $profile_info['address']['state'] ) ? $profile_info['address']['state'] : '';

$label_class     = dokan_is_seller_dashboard() ? 'dokan-w3' : 'dokan-hide';
$field_class     = dokan_is_seller_dashboard() ? 'dokan-w5' : '';

?>

<input type="hidden" id="dokan_selected_country" value="<?php echo esc_attr( $address_country ); ?>"/>
<input type="hidden" id="dokan_selected_state" value="<?php echo esc_attr( $address_state ); ?>"/>
<div class="dokan-form-group">
    <label class="<?php echo esc_attr( $label_class ); ?> dokan-control-label" for="setting_address"><?php esc_html_e( 'Address', 'dokan-lite' ); ?></label>

    <div class="<?php echo esc_attr( $field_class ); ?> dokan-text-left dokan-address-fields">
        <?php if ( $seller_address_fields['street_1'] ) { ?>
            <div class="dokan-form-group">
                <label class="control-label" for="dokan_address[street_1]"><?php esc_html_e( 'Street ', 'dokan-lite' ); ?>
                    <?php
                    $required_attr = '';
                    if ( $seller_address_fields['street_1']['required'] ) {
                        $required_attr = 'required';
                        ?>
                        <span class="required"> *</span>
                    <?php } ?>
                </label>
                <input <?php echo esc_attr( $required_attr ); ?> <?php echo esc_attr( $disabled ); ?>
                    id="dokan_address[street_1]"
                    value="<?php echo esc_attr( $address_street1 ); ?>"
                    name="dokan_address[street_1]"
                    placeholder="<?php esc_attr_e( 'Street address', 'dokan-lite' ); ?>"
                    class="dokan-form-control input-md" type="text">
            </div>
            <?php
        }
        if ( $seller_address_fields['street_2'] ) {
            ?>
            <div class="dokan-form-group">
                <label class="control-label" for="dokan_address[street_2]"><?php esc_html_e( 'Street 2', 'dokan-lite' ); ?>
                    <?php
                    $required_attr = '';
                    if ( $seller_address_fields['street_2']['required'] ) {
                        $required_attr = 'required';
                        ?>
                        <span class="required"> *</span>
                    <?php } ?>
                </label>
                <input <?php echo esc_attr( $required_attr ); ?> <?php echo esc_attr( $disabled ); ?>
                    id="dokan_address[street_2]"
                    value="<?php echo esc_attr( $address_street2 ); ?>"
                    name="dokan_address[street_2]"
                    placeholder="<?php esc_attr_e( 'Apartment, suite, unit etc. (optional)', 'dokan-lite' ); ?>"
                    class="dokan-form-control input-md" type="text">
            </div>
            <?php
        }
        if ( $seller_address_fields['city'] || $seller_address_fields['zip'] ) {
            ?>
            <div class="dokan-from-group">
                <?php if ( $seller_address_fields['city'] ) { ?>
                    <div class="dokan-form-group dokan-w6 dokan-left dokan-right-margin-30">
                        <label class="control-label" for="dokan_address[city]"><?php esc_html_e( 'City', 'dokan-lite' ); ?>
                            <?php
                            $required_attr = '';
                            if ( $seller_address_fields['city']['required'] ) {
                                $required_attr = 'required';
                                ?>
                                <span class="required"> *</span>
                            <?php } ?>
                        </label>
                        <input <?php echo esc_attr( $required_attr ); ?> <?php echo esc_attr( $disabled ); ?>
                            id="dokan_address[city]"
                            value="<?php echo esc_attr( $address_city ); ?>"
                            name="dokan_address[city]"
                            placeholder="<?php esc_attr_e( 'Town / City', 'dokan-lite' ); ?>"
                            class="dokan-form-control input-md" type="text">
                    </div>
                    <?php
                }
                if ( $seller_address_fields['zip'] ) {
                    ?>
                    <div class="dokan-form-group dokan-w5 dokan-left">
                        <label class="control-label" for="dokan_address[zip]"><?php esc_html_e( 'Post/ZIP Code', 'dokan-lite' ); ?>
                            <?php
                            $required_attr = '';
                            if ( $seller_address_fields['zip']['required'] ) {
                                $required_attr = 'required';
                                ?>
                                <span class="required"> *</span>
                            <?php } ?>
                        </label>
                        <input <?php echo esc_attr( $required_attr ); ?> <?php echo esc_attr( $disabled ); ?>
                            id="dokan_address[zip]"
                            value="<?php echo esc_attr( $address_zip ); ?>"
                            name="dokan_address[zip]"
                            placeholder="<?php esc_attr_e( 'Postcode / Zip', 'dokan-lite' ); ?>"
                            class="dokan-form-control input-md" type="text">
                    </div>
                <?php } ?>
                <div class="dokan-clearfix"></div>
            </div>
            <?php
        }

        if ( $seller_address_fields['country'] ) {
            $country_obj = new WC_Countries();
            $countries   = $country_obj->get_allowed_countries();
            $states      = $country_obj->states;
            ?>
            <div class="dokan-form-group">
                <label class="control-label" for="dokan_address[country]"><?php esc_html_e( 'Country ', 'dokan-lite' ); ?>
                    <?php
                    $required_attr = '';
                    if ( $seller_address_fields['country']['required'] ) {
                        $required_attr = 'required';
                        ?>
                        <span class="required"> *</span>
                    <?php } ?>
                </label>
                <select <?php echo esc_attr( $required_attr ); ?> <?php echo esc_attr( $disabled ); ?> name="dokan_address[country]" class="country_to_state dokan-form-control" id="dokan_address_country">
                    <?php dokan_country_dropdown( $countries, $address_country, false ); ?>
                </select>
            </div>
            <?php
        }
        if ( $seller_address_fields['state'] ) {
            $address_state_class = '';
            $is_input            = false;
            $no_states           = false;
            if ( isset( $states[ $address_country ] ) ) {
                if ( empty( $states[ $address_country ] ) ) {
                    $address_state_class = 'dokan-hide';
                    $no_states           = true;
                }
            } else {
                $is_input = true;
            }
            ?>
            <div id="dokan-states-box" class="dokan-form-group">
                <label class="control-label" for="dokan_address[state]"><?php esc_html_e( 'State ', 'dokan-lite' ); ?>
                    <?php
                    $required_attr = '';
                    if ( $seller_address_fields['state']['required'] ) {
                        $required_attr = 'required';
                        ?>
                        <span class="required"> *</span>
                    <?php } ?>
                </label>
                <?php
                if ( $is_input ) {
                    $required_attr = '';
                    if ( $seller_address_fields['state']['required'] ) {
                        $required_attr = 'required';
                    }
                    ?>
                    <input <?php echo esc_attr( $required_attr ); ?> <?php echo esc_attr( $disabled ); ?>
                        name="dokan_address[state]"
                        class="dokan-form-control <?php echo esc_attr( $address_state_class ); ?>"
                        id="dokan_address_state"
                        value="<?php echo esc_attr( $address_state ); ?>"/>
                    <?php
                } else {
                    $required_attr = '';
                    if ( $seller_address_fields['state']['required'] ) {
                        $required_attr = 'required';
                    }
                    ?>
                    <select <?php echo esc_attr( $required_attr ); ?> <?php echo esc_attr( $disabled ); ?> name="dokan_address[state]" class="dokan-form-control" id="dokan_address_state">
                        <?php dokan_state_dropdown( $states[ $address_country ], $address_state ); ?>
                    </select>
                <?php } ?>
            </div>
        <?php } ?>

        <?php
        /**
         * Add vendor address verification templates.
         *
         * @since 3.4.2
         *
         * @param array $address               Vendor address info.
         * @param array $seller_address_fields Vendor required addresses.
         */
        do_action( 'dokan_vendor_address_verification_template', $address, $seller_address_fields );

        ?>
    </div>
</div>
