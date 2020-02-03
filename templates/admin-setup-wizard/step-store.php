<h1><?php esc_html_e( 'Store Setup', 'dokan-lite' ); ?></h1>
<form method="post">
    <table class="form-table">
        <?php do_action( 'dokan_admin_setup_wizard_step_store_start', $setup_wizard ); ?>

        <tr>
            <th scope="row"><label for="custom_store_url"><?php esc_html_e( 'Vendor Store URL', 'dokan-lite' ); ?></label></th>
            <td>
                <input type="text" id="custom_store_url" name="custom_store_url" class="location-input" value="<?php echo esc_attr( $custom_store_url ); ?>" />
                <p class="description"><?php esc_html_e( 'Define vendor store URL', 'dokan-lite' ); ?> (<?php echo esc_url( site_url() ); ?>/[this-text]/[seller-name])</p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="shipping_fee_recipient"><?php esc_html_e( 'Shipping Fee Recipient', 'dokan-lite' ); ?></label></th>
            <td>
                <select class="wc-enhanced-select" id="shipping_fee_recipient" name="shipping_fee_recipient">
                    <?php
                        foreach ( $recipients as $key => $value ) {
                            $selected = ( $shipping_fee_recipient == $key ) ? ' selected="true"' : '';
                            echo '<option value="' . esc_attr( $key ) . '" ' . esc_attr( $selected ) . '>' . esc_html( $value ) . '</option>';
                        }
                    ?>
                </select>
                <p class="description"><?php esc_html_e( 'Shipping fees will go to', 'dokan-lite' ); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="tax_fee_recipient"><?php esc_html_e( 'Tax Fee Recipient', 'dokan-lite' ); ?></label></th>
            <td>
                <select class="wc-enhanced-select" id="tax_fee_recipient" name="tax_fee_recipient">
                    <?php
                        foreach ( $recipients as $key => $value ) {
                            $selected = ( $tax_fee_recipient == $key ) ? ' selected="true"' : '';
                            echo '<option value="' . esc_attr( $key ) . '" ' . esc_attr( $selected ) . '>' . esc_html( $value ) . '</option>';
                        }
                    ?>
                </select>
                <p class="description"><?php esc_html_e( 'Tax fees will go to', 'dokan-lite' ); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="map_api_source"><?php esc_html_e( 'Map API Source', 'dokan-lite' ); ?></label></th>
            <td>
                <select class="wc-enhanced-select" id="map_api_source" name="map_api_source">
                    <?php
                        foreach ( $map_api_source_options as $key => $value ) {
                            $selected = ( $map_api_source == $key ) ? ' selected="true"' : '';
                            echo '<option value="' . esc_attr( $key ) . '" ' . esc_attr( $selected ) . '>' . esc_html( $value ) . '</option>';
                        }
                    ?>
                </select>
                <p class="description"><?php esc_html_e( 'Which Map API source you want to use in your site?', 'dokan-lite' ); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="gmap_api_key"><?php esc_html_e( 'Google Map API Key', 'dokan-lite' ); ?></label></th>
            <td>
                <input type="text" id="gmap_api_key" name="gmap_api_key" class="location-input" value="<?php echo esc_attr( $gmap_api_key ); ?>" />
                <p class="description">
                    <?php
                        printf(
                            esc_html__( '%sAPI Key%s is needed to display map on store page', 'dokan-lite' ),
                            '<a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">',
                            '</a>'
                        );
                    ?>
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="mapbox_access_token"><?php esc_html_e( 'Mapbox Access Token', 'dokan-lite' ); ?></label></th>
            <td>
                <input type="text" id="mapbox_access_token" name="mapbox_access_token" class="location-input" value="<?php echo esc_attr( $mapbox_access_token ); ?>" />
                <p class="description">
                    <?php echo __( '<a href="https://docs.mapbox.com/help/how-mapbox-works/access-tokens/" target="_blank" rel="noopener noreferrer">Access Token</a> is needed to display map on store page', 'dokan-lite' ) ?>
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="share_essentials"><?php esc_html_e( 'Share Essentials', 'dokan-lite' ); ?></label></th>

            <td>
                <input type="checkbox" name="share_essentials" id="share_essentials" class="switch-input">
                <label for="share_essentials" class="switch-label">
                    <span class="toggle--on"><?php esc_html_e( 'On', 'dokan-lite' ); ?></span>
                    <span class="toggle--off"><?php esc_html_e( 'Off', 'dokan-lite' ); ?></span>
                </label>
                <span class="description">
                    <?php esc_html_e( 'Want to help make Dokan even more awesome? Allow Dokan Multivendor Marketplace to collect non-sensitive diagnostic data and usage information', 'dokan-lite' ); ?>
                    <?php printf( '<a class="insights-data-we-collect" href="#">%s</a>', esc_html__( 'What we collect', 'dokan-lite' ) ); ?>
                </span>
                <p id="collection-info" class="description" style="display:none;">
                    <?php esc_html_e( 'Server environment details (php, mysql, server, WordPress versions), Number of users in your site, Site language, Number of active and inactive plugins, Site name and url, Your name and email address. No sensitive data is tracked.', 'dokan-lite' ); ?>
                    <?php printf( __( 'We are using %1$s to collect your data. <a href="%2$s" target="_blank">Learn more</a> about how %1$s collects and handle your data.', 'dokan-lite' ), '<a href="https://appsero.com" target="_blank">Appsero</a>', 'https://appsero.com/privacy-policy/' ); ?>
                </p>
            </td>
        </tr>
    </table>
    <p class="wc-setup-actions step">
        <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step" />
        <a href="<?php echo esc_url( $setup_wizard->get_next_step_link() ); ?>" class="button button-large button-next"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
        <?php wp_nonce_field( 'dokan-setup' ); ?>
    </p>
</form>

<script type="text/javascript">
    jQuery('.insights-data-we-collect').on('click', function(e) {
        e.preventDefault();
        jQuery('#collection-info').slideToggle('fast');
    });
</script>
