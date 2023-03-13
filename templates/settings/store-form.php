<?php
/**
 * Dokan Dashboard Settings Store Form Template
 *
 * @since 2.4
 */
?>
<?php
$gravatar_id    = ! empty( $profile_info['gravatar'] ) ? $profile_info['gravatar'] : 0;
$banner_id      = ! empty( $profile_info['banner'] ) ? $profile_info['banner'] : 0;
$storename      = isset( $profile_info['store_name'] ) ? $profile_info['store_name'] : '';
$store_ppp      = ! empty( $profile_info['store_ppp'] ) ? $profile_info['store_ppp'] : '';
$phone          = isset( $profile_info['phone'] ) ? $profile_info['phone'] : '';
$show_email     = isset( $profile_info['show_email'] ) ? $profile_info['show_email'] : 'no';
$show_more_ptab = isset( $profile_info['show_more_ptab'] ) ? $profile_info['show_more_ptab'] : 'yes';

$address         = isset( $profile_info['address'] ) ? $profile_info['address'] : '';
$address_street1 = isset( $profile_info['address']['street_1'] ) ? $profile_info['address']['street_1'] : '';
$address_street2 = isset( $profile_info['address']['street_2'] ) ? $profile_info['address']['street_2'] : '';
$address_city    = isset( $profile_info['address']['city'] ) ? $profile_info['address']['city'] : '';
$address_zip     = isset( $profile_info['address']['zip'] ) ? $profile_info['address']['zip'] : '';
$address_country = isset( $profile_info['address']['country'] ) ? $profile_info['address']['country'] : '';
$address_state   = isset( $profile_info['address']['state'] ) ? $profile_info['address']['state'] : '';

$map_location   = isset( $profile_info['location'] ) ? $profile_info['location'] : '';
$map_address    = isset( $profile_info['find_address'] ) ? $profile_info['find_address'] : '';
$dokan_category = isset( $profile_info['dokan_category'] ) ? $profile_info['dokan_category'] : '';
$enable_tnc     = isset( $profile_info['enable_tnc'] ) ? $profile_info['enable_tnc'] : '';
$store_tnc      = isset( $profile_info['store_tnc'] ) ? $profile_info['store_tnc'] : '';

$dokan_appearance         = dokan_get_option( 'store_header_template', 'dokan_appearance', 'default' );
$show_store_open_close    = dokan_get_option( 'store_open_close', 'dokan_appearance', 'on' );
$dokan_days               = dokan_get_translated_days();
$all_times                = isset( $profile_info['dokan_store_time'] ) ? $profile_info['dokan_store_time'] : '';
$dokan_store_time_enabled = isset( $profile_info['dokan_store_time_enabled'] ) ? $profile_info['dokan_store_time_enabled'] : '';
$dokan_store_open_notice  = isset( $profile_info['dokan_store_open_notice'] ) ? $profile_info['dokan_store_open_notice'] : '';
$dokan_store_close_notice = isset( $profile_info['dokan_store_close_notice'] ) ? $profile_info['dokan_store_close_notice'] : '';

$store_status = [
    'close' => __( 'Close', 'dokan-lite' ),
    'open'  => __( 'Open', 'dokan-lite' ),
];

$args = [
    'dokan_days'   => $dokan_days,
    'store_info'   => $all_times,
    'dokan_status' => $store_status,
];

/**
 * @since 3.3.7
 */
$location = apply_filters( 'dokan_store_time_template', 'settings/store-time' );
$args     = apply_filters( 'dokan_store_time_arguments', $args, $all_times );
?>
<?php do_action( 'dokan_settings_before_form', $current_user, $profile_info ); ?>

<form method="post" id="store-form" action="" class="dokan-form-horizontal">

    <?php wp_nonce_field( 'dokan_store_settings_nonce' ); ?>

    <div class="dokan-banner">

        <div class="image-wrap<?php echo $banner_id ? '' : ' dokan-hide'; ?>">
            <?php $banner_url = $banner_id ? wp_get_attachment_url( $banner_id ) : ''; ?>
            <input type="hidden" class="dokan-file-field" value="<?php echo esc_attr( $banner_id ); ?>" name="dokan_banner">
            <img class="dokan-banner-img" src="<?php echo esc_url( $banner_url ); ?>">

            <a class="close dokan-remove-banner-image">&times;</a>
        </div>

        <div class="button-area<?php echo $banner_id ? ' dokan-hide' : ''; ?>">
            <i class="fas fa-cloud-upload-alt"></i>
            <a href="#" class="dokan-banner-drag dokan-btn dokan-btn-info dokan-theme dokan-btn-theme"><?php esc_html_e( 'Upload banner', 'dokan-lite' ); ?></a>
            <p class="help-block">
                <?php
                /**
                 * Filter `dokan_banner_upload_help`
                 *
                 * @since 2.4.10
                 */
                $general_settings = get_option( 'dokan_general', [] );
                $banner_width     = dokan_get_vendor_store_banner_width();
                $banner_height    = dokan_get_vendor_store_banner_height();

                $help_text = sprintf(
                    // translators: 1) store banner width 2) store banner height
                    __( 'Upload a banner for your store. Banner size is (%1$sx%2$s) pixels.', 'dokan-lite' ),
                    $banner_width, $banner_height
                );

                echo esc_html( apply_filters( 'dokan_banner_upload_help', $help_text ) );
                ?>
            </p>
        </div>
    </div> <!-- .dokan-banner -->

    <?php do_action( 'dokan_settings_after_banner', $current_user, $profile_info ); ?>

    <div class="dokan-form-group">
        <label class="dokan-w3 dokan-control-label" for="dokan_gravatar"><?php esc_html_e( 'Profile Picture', 'dokan-lite' ); ?></label>

        <div class="dokan-w5 dokan-gravatar">
            <div class="dokan-left gravatar-wrap<?php echo $gravatar_id ? '' : ' dokan-hide'; ?>">
                <?php $gravatar_url = $gravatar_id ? wp_get_attachment_url( $gravatar_id ) : ''; ?>
                <input type="hidden" class="dokan-file-field" value="<?php echo esc_attr( $gravatar_id ); ?>" name="dokan_gravatar">
                <img class="dokan-gravatar-img" src="<?php echo esc_url( $gravatar_url ); ?>">
                <a class="dokan-close dokan-remove-gravatar-image">&times;</a>
            </div>
            <div class="gravatar-button-area<?php echo esc_attr( $gravatar_id ) ? ' dokan-hide' : ''; ?>">
                <a href="#" class="dokan-pro-gravatar-drag dokan-btn dokan-btn-default"><i class="fas fa-cloud-upload-alt"></i> <?php esc_html_e( 'Upload Photo', 'dokan-lite' ); ?></a>
            </div>
        </div>
    </div>

    <div class="dokan-form-group">
        <label class="dokan-w3 dokan-control-label" for="dokan_store_name"><?php esc_html_e( 'Store Name', 'dokan-lite' ); ?></label>

        <div class="dokan-w5 dokan-text-left">
            <input id="dokan_store_name" required value="<?php echo esc_attr( $storename ); ?>" name="dokan_store_name" placeholder="<?php esc_attr_e( 'store name', 'dokan-lite' ); ?>" class="dokan-form-control" type="text">
        </div>
    </div>

    <?php do_action( 'dokan_settings_after_store_name', $current_user, $profile_info ); ?>

    <div class="dokan-form-group">
        <label class="dokan-w3 dokan-control-label" for="dokan_store_ppp"><?php esc_html_e( 'Store Products Per Page', 'dokan-lite' ); ?></label>

        <div class="dokan-w5 dokan-text-left">
            <input id="dokan_store_ppp" value="<?php echo ! empty( $store_ppp ) ? absint( $store_ppp ) : ''; ?>" name="dokan_store_ppp"
                    <?php // translators: 1) store page per product count ?>
                    placeholder="<?php printf( esc_attr__( 'Products to display on store page, default value is %s', 'dokan-lite' ), dokan_get_option( 'store_products_per_page', 'dokan_general', 12 ) ); ?>" class="dokan-form-control" type="number">
        </div>
    </div>
    <!--address-->

    <?php
    if ( ! function_exists( 'dokan_pro' ) || ( function_exists( 'dokan_pro' ) && ! dokan_pro()->module->is_active( 'delivery_time' ) ) ) {
        $verified = false;

        if ( function_exists( 'dokan_pro' ) && dokan_pro()->module->is_active( 'vendor_verification' ) && isset( $profile_info['dokan_verification']['info']['store_address']['v_status'] ) ) {
            if ( $profile_info['dokan_verification']['info']['store_address']['v_status'] === 'approved' ) {
                $verified = true;
            }
        }

        dokan_seller_address_fields( $verified );
    }
    ?>
    <!--address-->

    <div class="dokan-form-group">
        <label class="dokan-w3 dokan-control-label" for="setting_phone"><?php esc_html_e( 'Phone No', 'dokan-lite' ); ?></label>
        <div class="dokan-w5 dokan-text-left">
            <input id="setting_phone" value="<?php echo esc_attr( $phone ); ?>" name="setting_phone" placeholder="<?php esc_attr_e( '+123456..', 'dokan-lite' ); ?>" class="dokan-form-control input-md" type="text">
        </div>
    </div>

    <?php do_action( 'dokan_settings_after_store_phone', $current_user, $profile_info ); ?>

    <?php do_action( 'dokan_settings_before_store_email', $current_user, $profile_info ); ?>

    <?php if ( ! dokan_is_vendor_info_hidden( 'email' ) ) : ?>
        <div class="dokan-form-group">
            <label class="dokan-w3 dokan-control-label"><?php esc_html_e( 'Email', 'dokan-lite' ); ?></label>
            <div class="dokan-w5 dokan-text-left">
                <div class="checkbox">
                    <label>
                        <input type="hidden" name="setting_show_email" value="no">
                        <input type="checkbox" name="setting_show_email" value="yes"<?php checked( $show_email, 'yes' ); ?>> <?php esc_html_e( 'Show email address in store', 'dokan-lite' ); ?>
                    </label>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <div class="dokan-form-group">
        <label class="dokan-w3 dokan-control-label"><?php esc_html_e( 'More products', 'dokan-lite' ); ?></label>
        <div class="dokan-w5 dokan-text-left">
            <div class="checkbox">
                <label>
                    <input type="hidden" name="setting_show_more_ptab" value="no">
                    <input type="checkbox" name="setting_show_more_ptab" value="yes"<?php checked( $show_more_ptab, 'yes' ); ?>> <?php esc_html_e( 'Enable tab on product single page view', 'dokan-lite' ); ?>
                </label>
            </div>
        </div>
    </div>

    <?php do_action( 'dokan_settings_after_store_more_products', $current_user, $profile_info ); ?>

    <?php do_action( 'dokan_settings_before_store_map', $current_user, $profile_info ); ?>

    <?php if ( dokan_has_map_api_key() ) { ?>
        <div class="dokan-form-group">
            <label class="dokan-w3 dokan-control-label" for="setting_map"><?php esc_html_e( 'Map', 'dokan-lite' ); ?></label>

            <div class="dokan-w6 dokan-text-left">
                <?php
                dokan_get_template(
                    'maps/dokan-maps-with-search.php', [
                        'map_location' => $map_location,
                        'map_address'  => $map_address,
                    ]
                );
                ?>
            </div> <!-- col.md-4 -->
        </div> <!-- .dokan-form-group -->
    <?php } ?>

    <!--terms and conditions enable or not -->
    <?php
    $tnc_enable = dokan_get_option( 'seller_enable_terms_and_conditions', 'dokan_general', 'off' );

    if ( $tnc_enable === 'on' ) {
        ?>
        <div class="dokan-form-group">
            <label class="dokan-w3 dokan-control-label"><?php esc_html_e( 'Terms and Conditions', 'dokan-lite' ); ?></label>
            <div class="dokan-w5 dokan-text-left dokan_tock_check">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" id="dokan_store_tnc_enable" value="on" <?php echo $enable_tnc === 'on' ? 'checked' : ''; ?> name="dokan_store_tnc_enable"> <?php esc_html_e( 'Show terms and conditions in store page', 'dokan-lite' ); ?>
                    </label>
                </div>
            </div>
        </div>
        <div class="dokan-form-group" id="dokan_tnc_text">
            <label class="dokan-w3 dokan-control-label" for="dokan_store_tnc"><?php esc_html_e( 'TOC Details', 'dokan-lite' ); ?></label>
            <div class="dokan-w8 dokan-text-left">
                <?php
                $settings = [
                    'editor_height' => 200,
                    'media_buttons' => false,
                    'teeny'         => true,
                    'quicktags'     => false,
                ];

                wp_editor( $store_tnc, 'dokan_store_tnc', $settings );
                ?>
            </div>
        </div>

        <?php
    }
    ?>

    <?php if ( $show_store_open_close === 'on' ) { ?>
        <div class="dokan-form-group store-open-close-time">
            <label class="dokan-w3 dokan-control-label" for="dokan-store-close">
                <?php esc_html_e( 'Store Schedule', 'dokan-lite' ); ?>
            </label>

            <div class="dokan-w5 dokan-text-left dokan_tock_check">
                <div class="checkbox">
                    <label for="dokan-store-time-enable" class="control-label">
                        <input type="checkbox" name="dokan_store_time_enabled" id="dokan-store-time-enable" value="yes" <?php echo $dokan_store_time_enabled === 'yes' ? 'checked' : ''; ?>>
                        <?php esc_html_e( 'Store has open close time', 'dokan-lite' ); ?>
                    </label>
                </div>
            </div>
        </div>

        <div class="dokan-form-group store-open-close">

            <!-- Load store time templates here. -->
            <?php dokan_get_template_part( $location, '', $args ); ?>

        </div>

        <div class="dokan-form-group store-open-close">
            <label class="dokan-w3 dokan-control-label" for="dokan-store-time-notice">
                <?php esc_html_e( 'Store Open Notice', 'dokan-lite' ); ?>
            </label>
            <div class="dokan-w6">
                <input type="text" class="dokan-form-control input-md" name="dokan_store_open_notice" placeholder="<?php esc_attr_e( 'Store is open', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $dokan_store_open_notice ); ?>">
            </div>
        </div>
        <div class="dokan-form-group store-open-close">
            <label class="dokan-w3 dokan-control-label" for="dokan-store-time-notice">
                <?php esc_html_e( 'Store Close Notice', 'dokan-lite' ); ?>
            </label>
            <div class="dokan-w6">
                <input type="text" class="dokan-form-control input-md" name="dokan_store_close_notice" placeholder="<?php esc_attr_e( 'Store is closed', 'dokan-lite' ); ?>" value="<?php echo esc_attr( $dokan_store_close_notice ); ?>">
            </div>
        </div>
    <?php } ?>

    <?php do_action( 'dokan_settings_form_bottom', $current_user, $profile_info ); ?>

    <div class="dokan-form-group">

        <div class="dokan-w4 ajax_prev dokan-text-left" style="margin-left:24%;">
            <input type="submit" name="dokan_update_store_settings" class="dokan-btn dokan-btn-danger dokan-btn-theme" value="<?php esc_attr_e( 'Update Settings', 'dokan-lite' ); ?>">
        </div>
    </div>
</form>

<?php do_action( 'dokan_settings_after_form', $current_user, $profile_info ); ?>

<style>
    .dokan-settings-content .dokan-settings-area .dokan-banner {
        width: <?php echo esc_attr( $banner_width ) . 'px'; ?>;
        height: <?php echo esc_attr( $banner_height ) . 'px'; ?>;
    }

    .dokan-settings-content .dokan-settings-area .dokan-banner .dokan-remove-banner-image {
        height: <?php echo esc_attr( $banner_height ) . 'px'; ?>;
    }

</style>
<script type="text/javascript">

    (function($) {
        // dokan store open close scripts starts //
        var store_opencolse = $( '.store-open-close' );
        store_opencolse.hide();

        $( '#dokan-store-time-enable' ).on( 'change', function() {
            var self = $(this);

            if ( self.prop( 'checked' ) ) {
                store_opencolse.hide().fadeIn();
            } else {
                store_opencolse.fadeOut();
            }
        } );

        $('#dokan-store-time-enable').trigger('change');

        // Show & hide our opening, closing time fields by using this change event.
        $( '.dokan-on-off' ).on( 'change', function() {
            const self = $( this );

            if ( self.val() === 'open' ) {
                self.closest('.dokan-form-group').find('.time').css({'visibility': 'visible'});
            } else {
                self.closest('.dokan-form-group').find('.time').css({'visibility': 'hidden'});
                self.closest('.store-open-close').find('.dokan-w6').removeClass('dokan-text-left');
                self.closest('.store-open-close').find('.dokan-w6').css({'width': 'auto'});
            }

        } );

        <?php if ( ! dokan()->is_pro_exists() ) : ?>
            // Set timepicker jquery here.
            $( '.dokan-store-times .time .dokan-form-control' ).timepicker({
                step          : 30,
                lang          : dokan_helper.timepicker_locale,
                minTime       : '12:00 am',
                maxTime       : '11:30 pm',
                timeFormat    : '<?php echo addcslashes( esc_attr( wc_time_format() ), '\\' ); ?>',
                scrollDefault : 'now',
            });

            // Add validation for store time when changed.
            $( '.dokan-store-times' ).on( 'change', '.dokan-form-group', function () {
                const self              = $( this ),
                    openValue           = self.find( '.opening-time' ).val(),
                    closeValue          = self.find( '.closing-time' ).val(),
                    formattedOpenValue  = moment( openValue, 'hh:mm a' ).format( 'HH:mm' ),
                    formattedCloseValue = moment( closeValue, 'hh:mm a' ).format( 'HH:mm' );

                if ( formattedOpenValue > formattedCloseValue ) {
                    self.find( 'input.dokan-form-control' ).css({ 'border-color': '#F87171', 'color': '#F87171' });
                } else {
                    self.find( 'input.dokan-form-control' ).css({ 'border-color': '#bbb', 'color': '#4e4e4e' });
                }
            });

            $( 'input[name="dokan_update_store_settings"]' ).on( 'click', function ( e ) {
                $( '.dokan-store-times' ).each( function () {
                    const self              = $( this ),
                        open_or_close       = self.find( '.dokan-on-off' ).val();

                    // check if today is open
                    if ( 'close' === open_or_close ) {
                        return;
                    }

                    const openValue         = self.find( '.opening-time' ).val(),
                        closeValue          = self.find( '.closing-time' ).val();

                    if ( ! openValue || ! closeValue ) {
                        self.find( 'input.dokan-form-control' ).css({ 'border-color': '#F87171', 'color': '#F87171' });
                        if ( ! openValue ) {
                            self.find( '.opening-time' ).focus();
                        } else {
                            self.find( '.closing-time' ).focus();
                        }
                        e.preventDefault();
                        return false;
                    }

                    const formattedOpenValue  = moment( openValue, 'hh:mm a' ).format( 'HH:mm' ),
                        formattedCloseValue = moment( closeValue, 'hh:mm a' ).format( 'HH:mm' );

                    if ( formattedOpenValue >= formattedCloseValue ) {
                        self.find( 'input.dokan-form-control' ).css({ 'border-color': '#F87171', 'color': '#F87171' });
                        self.find( '.opening-time' ).focus();
                        e.preventDefault();
                        return false;
                    }

                    self.find( 'input.dokan-form-control' ).css({ 'border-color': '#bbb', 'color': '#4e4e4e' });
                });
            });
        <?php endif; ?>


        $(function() {

            const savedState = '<?php echo esc_html( $address_state ); ?>';

            if ( ! savedState || 'N/A' === savedState ) {
                $('#dokan-states-box').hide();
            }

            $('#setting_phone').on( 'keydown', function(e) {
                let cKey     = 67,
                    vKey     = 86,
                    cmdKey   = 91,
                    ctrlKey  = 17,
                    ctrlDown = false;

                if (e.keyCode === ctrlKey || e.keyCode === cmdKey) {
                    ctrlDown = true;
                }

                if (
                    // Allow: backspace, delete, tab, escape, enter etc.
                    $.inArray(e.keyCode, [8, 9, 13, 27, 46, 48, 53, 57, 59, 61, 91, 107, 109, 110, 169, 173, 187, 189, 190]) !== -1 ||
                    // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    //Allow Ctrl+v
                    (e.keyCode === vKey && ctrlDown) ||
                    // Allow: Ctrl+c
                    (e.keyCode === cKey && ctrlDown) ||
                    // Allow: home, end, left, right.
                    (e.keyCode >= 35 && e.keyCode <= 39)
                ) {
                    // Let it happen, don't do anything.
                    return;
                }

                if ( ( e.shiftKey && ! isNaN( Number(e.key) ) ) ) {
                    return;
                }

                // Ensure that it is a number and stop the keypress.
                if ( isNaN( Number(e.key) ) ) {
                    e.preventDefault();
                }
            });
        });
    })(jQuery);
</script>
