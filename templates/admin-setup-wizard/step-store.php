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
                    <?php foreach ( $recipients as $key => $value ) : ?>
                    <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $key, $shipping_fee_recipient ); ?>>
                        <?php echo esc_html( $value ); ?>
                    </option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php esc_html_e( 'Shipping fees will go to', 'dokan-lite' ); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="tax_fee_recipient"><?php esc_html_e( 'Tax Fee Recipient', 'dokan-lite' ); ?></label></th>
            <td>
                <select class="wc-enhanced-select" id="tax_fee_recipient" name="tax_fee_recipient">
                    <?php foreach ( $recipients as $key => $value ) : ?>
                    <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $key, $tax_fee_recipient ); ?>>
                        <?php echo esc_html( $value ); ?>
                    </option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php esc_html_e( 'Tax fees will go to', 'dokan-lite' ); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="map_api_source"><?php esc_html_e( 'Map API Source', 'dokan-lite' ); ?></label></th>
            <td>
                <select class="wc-enhanced-select" id="map_api_source" name="map_api_source">
                    <?php foreach ( $map_api_source_options as $key => $value ) : ?>
                    <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $key, $map_api_source ); ?>>
                        <?php echo esc_html( $value ); ?>
                    </option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php esc_html_e( 'Which Map API source you want to use in your site?', 'dokan-lite' ); ?></p>
            </td>
        </tr>
        <tr id="google_maps_api_wrapper">
            <th scope="row"><label for="gmap_api_key"><?php esc_html_e( 'Google Map API Key', 'dokan-lite' ); ?></label></th>
            <td>
                <input type="text" id="gmap_api_key" name="gmap_api_key" class="location-input" value="<?php echo esc_attr( $gmap_api_key ); ?>" />
                <p class="description">
                    <?php
                    printf(
                        /* translators: %1$s: opening anchor tag, %2$s: closing anchor tag */
                        esc_html__( '%1$sAPI Key%2$s is needed to display map on store page', 'dokan-lite' ),
                        '<a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">',
                        '</a>'
                    );
                    ?>
                </p>
            </td>
        </tr>
        <tr id="mapbox_api_wrapper">
            <th scope="row"><label for="mapbox_access_token"><?php esc_html_e( 'Mapbox Access Token', 'dokan-lite' ); ?></label></th>
            <td>
                <input type="text" id="mapbox_access_token" name="mapbox_access_token" class="location-input" value="<?php echo esc_attr( $mapbox_access_token ); ?>" />
                <p class="description">
                    <?php
                    echo sprintf(
                        /* translators: %1$s: opening anchor tag, %2$s: closing anchor tag */
                        esc_html__( '%1$sAccess Token%2$s is needed to display map on store page', 'dokan-lite' ),
                        '<a href="https://docs.mapbox.com/help/how-mapbox-works/access-tokens/" target="_blank" rel="noopener noreferrer">',
                        '</a>'
                    );
                    ?>
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
                    <?php
                    wp_kses(
                        sprintf(
                            /* translators: %1$s: opening anchor tag with link, %2$s: closing anchor tag */
                            __( 'Want to help make Dokan even more awesome? Allow Dokan Multivendor Marketplace to collect non-sensitive diagnostic data and usage information. %1$sWhat we collect%2$s', 'dokan-lite' ),
                            '<a class="insights-data-we-collect" href="#">',
                            '</a>'
                        ),
                        [
                            'a' => [
                                'class'  => [],
                                'href'   => [],
                                'target' => [],
                            ],
                        ]
                    );
                    ?>
                </span>
                <p id="collection-info" class="description" style="display:none;">
                    <?php
                    wp_kses(
                        sprintf(
                            /* translators: %1$s: Appsero hypertext with link, %2$s: opening anchor tag with link, %3$s: closing anchor tag */
                            __( 'Server environment details (php, mysql, server, WordPress versions), Number of users in your site, Site language, Number of active and inactive plugins, Site name and url, Your name and email address. No sensitive data is tracked. We are using %1$s to collect your data. %2$sLearn more%3$s about how %1$s collects and handles your data.', 'dokan-lite' ),
                            '<a href="https://appsero.com" target="_blank">Appsero</a>',
                            '<a href="https://appsero.com/privacy-policy/" target="_blank">',
                            '</a>'
                        ),
                        [
                            'a' => [
                                'class'  => [],
                                'href'   => [],
                                'target' => [],
                            ],
                        ]
                    );
                    ?>
                </p>
            </td>
        </tr>

        <?php do_action( 'dokan_admin_setup_wizard_step_store_after', $setup_wizard ); ?>
    </table>
    <p class="wc-setup-actions step">
        <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step" />
        <a href="<?php echo esc_url( $setup_wizard->get_next_step_link() ); ?>" class="button button-large button-next"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
        <?php wp_nonce_field( 'dokan-setup' ); ?>
    </p>
</form>

<script type="text/javascript">
    function handleMapApiSource() {
        if (jQuery('#map_api_source').val() === 'mapbox') {
            jQuery('#google_maps_api_wrapper').hide();
            jQuery('#mapbox_api_wrapper').show();
        } else {
            jQuery('#google_maps_api_wrapper').show();
            jQuery('#mapbox_api_wrapper').hide();
        }
    }
    jQuery(document).ready(function () {
        handleMapApiSource();
    });
    jQuery('#map_api_source').on('change', function (e) {
        e.preventDefault();
        handleMapApiSource();
    });
    jQuery('.insights-data-we-collect').on('click', function(e) {
        e.preventDefault();
        jQuery('#collection-info').slideToggle('fast');
    });
</script>
