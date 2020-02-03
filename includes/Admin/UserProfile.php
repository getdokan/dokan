<?php

namespace WeDevs\Dokan\Admin;

/**
 * User profile related tasks for wp-admin
 *
 * @package Dokan
 */
class UserProfile {

    public function __construct() {
        add_action( 'show_user_profile', array( $this, 'add_meta_fields' ), 20 );
        add_action( 'edit_user_profile', array( $this, 'add_meta_fields' ), 20 );

        add_action( 'personal_options_update', array( $this, 'save_meta_fields' ) );
        add_action( 'edit_user_profile_update', array( $this, 'save_meta_fields' ) );

        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
    }

    /**
     * Enqueue Script in admin profile
     *
     * @param  string $page
     *
     * @return void
     */
    function enqueue_scripts( $page ) {
        if ( in_array( $page, array( 'profile.php', 'user-edit.php' ) ) ) {
            wp_enqueue_media();

            $admin_admin_script = array(
                'ajaxurl'     => admin_url( 'admin-ajax.php' ),
                'nonce'       => wp_create_nonce( 'dokan_reviews' ),
                'ajax_loader' => DOKAN_PLUGIN_ASSEST . '/images/ajax-loader.gif',
                'seller'      => array(
                    'available'    => __( 'Available', 'dokan-lite' ),
                    'notAvailable' => __( 'Not Available', 'dokan-lite' ),
                ),
            );

            wp_enqueue_script( 'speaking-url' );
            wp_localize_script( 'jquery', 'dokan_user_profile', $admin_admin_script );
        }

    }

    /**
     * Add fields to user profile
     *
     * @param WP_User $user
     *
     * @return void|false
     */
    function add_meta_fields( $user ) {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        if ( ! user_can( $user, 'dokandar' ) ) {
            return;
        }

        $selling               = get_user_meta( $user->ID, 'dokan_enable_selling', true );
        $publishing            = get_user_meta( $user->ID, 'dokan_publishing', true );
        $store_settings        = dokan_get_store_info( $user->ID );
        $banner                = ! empty( $store_settings['banner'] ) ? absint( $store_settings['banner'] ) : 0;
        $admin_commission      = get_user_meta( $user->ID, 'dokan_admin_percentage', true );
        $admin_commission_type = get_user_meta( $user->ID, 'dokan_admin_percentage_type', true );
        $feature_seller        = get_user_meta( $user->ID, 'dokan_feature_seller', true );

        $social_fields     = dokan_get_social_profile_fields();

        $address           = isset( $store_settings['address'] ) ? $store_settings['address'] : '';
        $address_street1   = isset( $store_settings['address']['street_1'] ) ? $store_settings['address']['street_1'] : '';
        $address_street2   = isset( $store_settings['address']['street_2'] ) ? $store_settings['address']['street_2'] : '';
        $address_city      = isset( $store_settings['address']['city'] ) ? $store_settings['address']['city'] : '';
        $address_zip       = isset( $store_settings['address']['zip'] ) ? $store_settings['address']['zip'] : '';
        $address_country   = isset( $store_settings['address']['country'] ) ? $store_settings['address']['country'] : '';
        $address_state     = isset( $store_settings['address']['state'] ) ? $store_settings['address']['state'] : '';

        $banner_width    = dokan_get_option( 'store_banner_width', 'dokan_appearance', 625 );
        $banner_height   = dokan_get_option( 'store_banner_height', 'dokan_appearance', 300 );

        $country_state     = array(
            'country' => array(
                'label'       => __( 'Country', 'dokan-lite' ),
                'description' => '',
                'class'       => 'js_field-country',
                'type'        => 'select',
                'options'     => array( '' => __( 'Select a country&hellip;', 'dokan-lite' ) ) + WC()->countries->get_allowed_countries(),
            ),
            'state' => array(
                'label'       => __( 'State/County', 'dokan-lite' ),
                'description' => __( 'State/County or state code', 'dokan-lite' ),
                'class'       => 'js_field-state',
            ),
        );
        ?>
        <h3><?php esc_html_e( 'Dokan Options', 'dokan-lite' ); ?></h3>

        <table class="form-table">
            <tbody>
                <tr>
                    <th><?php esc_html_e( 'Banner', 'dokan-lite' ); ?></th>
                    <td>
                        <div class="dokan-banner">
                            <div class="image-wrap<?php echo $banner ? '' : ' dokan-hide'; ?>">
                                <?php $banner_url = $banner ? wp_get_attachment_url( $banner ) : ''; ?>
                                <input type="hidden" class="dokan-file-field" value="<?php echo esc_attr( $banner ); ?>" name="dokan_banner">
                                <img class="dokan-banner-img" src="<?php echo esc_url( $banner_url ); ?>">

                                <a class="close dokan-remove-banner-image">&times;</a>
                            </div>

                            <div class="button-area<?php echo esc_attr( $banner ) ? ' dokan-hide' : ''; ?>">
                                <a href="#" class="dokan-banner-drag button button-primary"><?php esc_html_e( 'Upload banner', 'dokan-lite' ); ?></a>
                                <p class="description">
                                    <?php
                                    echo sprintf(
                                        esc_attr__( 'Upload a banner for your store. Banner size is (%1$sx%2$s) pixels.', 'dokan-lite' ),
                                        esc_attr( $banner_width ),
                                        esc_attr( $banner_height )
                                    );
                                    ?>
                                </p>
                            </div>
                        </div> <!-- .dokan-banner -->
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Store name', 'dokan-lite' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_name" class="regular-text" value="<?php echo esc_attr( $store_settings['store_name'] ); ?>">
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Store URL', 'dokan-lite' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_url" data-vendor="<?php echo esc_attr( $user->ID ); ?>" class="regular-text" id="seller-url" value="<?php echo esc_attr( $user->data->user_nicename ); ?>"><strong id="url-alart-mgs"></strong>
                        <p><small><?php echo esc_url( home_url() . '/' . dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ) ); ?>/<strong id="url-alart"><?php echo esc_attr( $user->data->user_nicename ); ?></strong></small></p>
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Address 1', 'dokan-lite' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_address[street_1]" class="regular-text" value="<?php echo esc_attr( $address_street1 ); ?>">
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Address 2', 'dokan-lite' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_address[street_2]" class="regular-text" value="<?php echo esc_attr( $address_street2 ); ?>">
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Town/City', 'dokan-lite' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_address[city]" class="regular-text" value="<?php echo esc_attr( $address_city ); ?>">
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Zip Code', 'dokan-lite' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_address[zip]" class="regular-text" value="<?php echo esc_attr( $address_zip ); ?>">
                    </td>
                </tr>

                <?php foreach ( $country_state as $key => $field ) : ?>
                    <tr>
                        <th><label for="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $field['label'] ); ?></label></th>
                        <td>
                            <?php if ( ! empty( $field['type'] ) && 'select' == $field['type'] ) : ?>
                            <select name="dokan_store_address[<?php echo esc_attr( $key ); ?>]" id="<?php echo esc_attr( $key ); ?>" class="<?php echo ( ! empty( $field['class'] ) ? esc_attr( $field['class'] ) : '' ); ?>" style="width: 25em;">
                                    <?php
									if ( 'country' == $key ) {
										$selected = esc_attr( $address_country );
									} else {
										$selected = esc_attr( $address_state );
									}
									foreach ( $field['options'] as $option_key => $option_value ) :
                                        ?>
                                        <option value="<?php echo esc_attr( $option_key ); ?>" <?php selected( $selected, $option_key, true ); ?>><?php echo esc_attr( $option_value ); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            <?php else : ?>
                                <?php
                                if ( 'country' == $key ) {
                                    $value = esc_attr( $address_country );
                                } else {
                                    $value = esc_attr( $address_state );
                                }
                                ?>
                            <input type="text" name="dokan_store_address[<?php echo esc_attr( $key ); ?>]" id="<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $value ); ?>" class="<?php echo ( ! empty( $field['class'] ) ? esc_attr( $field['class'] ) : 'regular-text' ); ?>" />
                            <?php endif; ?>

                            <span class="description"><?php echo wp_kses_post( $field['description'] ); ?></span>
                        </td>
                    </tr>
                <?php endforeach; ?>


                <tr>
                    <th><?php esc_html_e( 'Phone Number', 'dokan-lite' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_phone" class="regular-text" value="<?php echo esc_attr( $store_settings['phone'] ); ?>">
                    </td>
                </tr>

                <?php foreach ( $social_fields as $key => $value ) { ?>

                    <tr>
                        <th><?php echo esc_attr( $value['title'] ); ?></th>
                        <td>
                            <input type="text" name="dokan_social[<?php echo esc_attr( $key ); ?>]" class="regular-text" value="<?php echo isset( $store_settings['social'][ $key ] ) ? esc_url( $store_settings['social'][ $key ] ) : ''; ?>">
                        </td>
                    </tr>

                <?php } ?>

                <tr>
                    <th><?php esc_html_e( 'Payment Options : ', 'dokan-lite' ); ?></th>
                </tr>

                <?php if ( isset( $store_settings['payment']['paypal']['email'] ) ) { ?>
                    <tr>
                        <th><?php esc_html_e( 'Paypal Email ', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo esc_attr( $store_settings['payment']['paypal']['email'] ); ?>">
                        </td>
                    </tr>
                <?php } ?>
                <?php if ( isset( $store_settings['payment']['skrill']['email'] ) ) { ?>
                    <tr>
                        <th><?php esc_html_e( 'Skrill Email ', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo esc_attr( $store_settings['payment']['skrill']['email'] ); ?>">
                        </td>
                    </tr>
                <?php } ?>

                <?php if ( isset( $store_settings['payment']['bank'] ) ) { ?>
                    <tr>
                        <th><?php esc_html_e( 'Bank name ', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['bank_name'] ) ? esc_attr( $store_settings['payment']['bank']['bank_name'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Account Name ', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['ac_name'] ) ? esc_attr( $store_settings['payment']['bank']['ac_name'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Account Number ', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['ac_number'] ) ? esc_attr( $store_settings['payment']['bank']['ac_number'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Bank Address ', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['bank_addr'] ) ? esc_attr( $store_settings['payment']['bank']['bank_addr'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Routing Number', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['routing_number'] ) ? esc_attr( $store_settings['payment']['bank']['routing_number'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Bank IBAN ', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['iban'] ) ? esc_attr( $store_settings['payment']['bank']['iban'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php esc_html_e( 'Bank Swift ', 'dokan-lite' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['swift'] ) ? esc_attr( $store_settings['payment']['bank']['swift'] ) : ''; ?>">
                        </td>
                    </tr>
                <?php } ?>
                <tr>
                    <th><?php esc_html_e( 'Selling', 'dokan-lite' ); ?></th>
                    <td>
                        <label for="dokan_enable_selling">
                            <input type="hidden" name="dokan_enable_selling" value="no">
                            <input name="dokan_enable_selling" type="checkbox" id="dokan_enable_selling" value="yes" <?php checked( $selling, 'yes' ); ?> />
                            <?php esc_html_e( 'Enable Adding Products', 'dokan-lite' ); ?>
                        </label>

                        <p class="description"><?php esc_html_e( 'Enable or disable product adding capability', 'dokan-lite' ); ?></p>
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Publishing', 'dokan-lite' ); ?></th>
                    <td>
                        <label for="dokan_publish">
                            <input type="hidden" name="dokan_publish" value="no">
                            <input name="dokan_publish" type="checkbox" id="dokan_publish" value="yes" <?php checked( $publishing, 'yes' ); ?> />
                            <?php esc_html_e( 'Publish product directly', 'dokan-lite' ); ?>
                        </label>

                        <p class="description"><?php esc_html_e( 'Bypass pending, publish products directly', 'dokan-lite' ); ?></p>
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Admin Commission Type ', 'dokan-lite' ); ?></th>
                    <td>
                        <select id="dokan_admin_percentage_type" name="dokan_admin_percentage_type">
                            <?php foreach ( dokan_commission_types() as $key => $value ) : ?>
                                <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $admin_commission_type, $key );  ?>><?php echo esc_attr( $value ); ?></option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description"><?php esc_html_e( 'Set the commmission type admin gets from this seller', 'dokan-lite' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th><?php esc_html_e( 'Admin Commission ', 'dokan-lite' ); ?></th>
                    <td>
                        <input type="number" min="0" class="small-text" id="admin-commission" name="dokan_admin_percentage" value="<?php echo esc_attr( $admin_commission ); ?>">
                        <?php do_action( 'dokan_seller_meta_fields_after_admin_commission', $user ); ?>
                        <p class="combine-commission-description"><?php esc_html_e( 'It will override the default commission admin gets from each sales', 'dokan-lite' ); ?></p>
                    </td>
                </tr>

                <tr>
                    <th><?php esc_html_e( 'Featured vendor', 'dokan-lite' ); ?></th>
                    <td>
                        <label for="dokan_feature">
                            <input type="hidden" name="dokan_feature" value="no">
                            <input name="dokan_feature" type="checkbox" id="dokan_feature" value="yes" <?php checked( $feature_seller, 'yes' ); ?> />
                            <?php esc_html_e( 'Mark as featured vendor', 'dokan-lite' ); ?>
                        </label>

                        <p class="description"><?php esc_html_e( 'This vendor will be marked as a featured vendor.', 'dokan-lite' ); ?></p>
                    </td>
                </tr>

                <?php do_action( 'dokan_seller_meta_fields', $user ); ?>

                <?php
                    wp_nonce_field( 'dokan_update_user_profile_info', 'dokan_update_user_profile_info_nonce' );
                ?>
            </tbody>
        </table>

        <style type="text/css">
        .dokan-hide { display: none; }
        .button-area { padding-top: 100px; }
        .dokan-banner {
            border: 4px dashed #d8d8d8;
            height: 255px;
            margin: 0;
            overflow: hidden;
            position: relative;
            text-align: center;
            max-width: 700px;
        }
        .dokan-banner img { max-width:100%; }
        .dokan-banner .dokan-remove-banner-image {
            position:absolute;
            width:100%;
            height:270px;
            background:#000;
            top:0;
            left:0;
            opacity:.7;
            font-size:100px;
            color:#f00;
            padding-top:70px;
            display:none
        }
        .dokan-banner:hover .dokan-remove-banner-image {
            display:block;
            cursor: pointer;
        }
        .text-success {
            color: green;
        }
        .text-danger {
            color: red;
        }
        </style>

        <script type="text/javascript">
        jQuery(function($){
            var Dokan_Settings = {

                init: function() {
                    $('a.dokan-banner-drag').on('click', this.imageUpload);
                    $('a.dokan-remove-banner-image').on('click', this.removeBanner);
                },

                imageUpload: function(e) {
                    e.preventDefault();

                    var file_frame,
                        self = $(this);

                    if ( file_frame ) {
                        file_frame.open();
                        return;
                    }

                    // Create the media frame.
                    file_frame = wp.media.frames.file_frame = wp.media({
                        title: jQuery( this ).data( 'uploader_title' ),
                        button: {
                            text: jQuery( this ).data( 'uploader_button_text' )
                        },
                        multiple: false
                    });

                    file_frame.on( 'select', function() {
                        var attachment = file_frame.state().get('selection').first().toJSON();

                        var wrap = self.closest('.dokan-banner');
                        wrap.find('input.dokan-file-field').val(attachment.id);
                        wrap.find('img.dokan-banner-img').attr('src', attachment.url);
                        $('.image-wrap', wrap).removeClass('dokan-hide');

                        $('.button-area').addClass('dokan-hide');
                    });

                    file_frame.open();

                },

                removeBanner: function(e) {
                    e.preventDefault();

                    var self = $(this);
                    var wrap = self.closest('.image-wrap');
                    var instruction = wrap.siblings('.button-area');

                    wrap.find('input.dokan-file-field').val('0');
                    wrap.addClass('dokan-hide');
                    instruction.removeClass('dokan-hide');
                },
            };

            Dokan_Settings.init();

            $('#seller-url').keydown(function(e) {
                var text = $(this).val();

                // Allow: backspace, delete, tab, escape, enter and .
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 91, 109, 110, 173, 189, 190]) !== -1 ||
                     // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                     // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                         // let it happen, don't do anything
                        return;
                }

                if ((e.shiftKey || (e.keyCode < 65 || e.keyCode > 90) && (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) ) {
                    e.preventDefault();
                }
            });

            $('#seller-url').keyup(function(e) {
                $('#url-alart').text( getSlug( $(this).val() ) );
            });

            $('#seller-url').on('focusout', function() {
                var self = $(this),
                data = {
                    action : 'shop_url',
                    url_slug : self.val(),
                    vendor_id: self.data('vendor'),
                    _nonce : dokan_user_profile.nonce,
                };

                if ( self.val() === '' ) {
                    return;
                }

                var row = self.closest('td');

                row.block({ message: null, overlayCSS: { background: '#f1f1f1 url(' + dokan_user_profile.ajax_loader + ') no-repeat center', opacity: 0.3 } });

                $.post( dokan_user_profile.ajaxurl, data, function(resp) {

                    if ( resp.success === true ) {
                        $('#url-alart').removeClass('text-danger').addClass('text-success');
                        $('#url-alart-mgs').removeClass('text-danger').addClass('text-success').text(dokan_user_profile.seller.available);
                    } else {
                        $('#url-alart').removeClass('text-success').addClass('text-danger');
                        $('#url-alart-mgs').removeClass('text-success').addClass('text-danger').text(dokan_user_profile.seller.notAvailable);
                    }

                    row.unblock();
                } );
            });
        });
        </script>
        <?php
    }

    /**
     * Save user data
     *
     * @param int $user_id
     *
     * @return void
     */
    function save_meta_fields( $user_id ) {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        $post_data = wp_unslash( $_POST );

        if ( isset( $post_data['dokan_update_user_profile_info_nonce'] ) && ! wp_verify_nonce( $post_data['dokan_update_user_profile_info_nonce'], 'dokan_update_user_profile_info' ) ) {
            return;
        }

        if ( ! isset( $post_data['dokan_enable_selling'] ) ) {
            return;
        }

        $selling         = sanitize_text_field( $post_data['dokan_enable_selling'] );
        $publishing      = sanitize_text_field( $post_data['dokan_publish'] );
        $percentage      = isset( $post_data['dokan_admin_percentage'] ) && $post_data['dokan_admin_percentage'] != '' ? floatval( $post_data['dokan_admin_percentage'] ) : '';
        $percentage_type = empty( $post_data['dokan_admin_percentage_type'] ) ? 'percentage' : sanitize_text_field( $post_data['dokan_admin_percentage_type'] );
        $feature_seller  = sanitize_text_field( $post_data['dokan_feature'] );
        $store_settings  = dokan_get_store_info( $user_id );

        $social         = $post_data['dokan_social'];
        $social_fields  = dokan_get_social_profile_fields();

        $store_settings['banner']     = intval( $post_data['dokan_banner'] );
        $store_settings['store_name'] = sanitize_text_field( $post_data['dokan_store_name'] );
        $store_settings['address']    = isset( $post_data['dokan_store_address'] ) ? array_map( 'sanitize_text_field', $post_data['dokan_store_address'] ) : array();
        $store_settings['phone']      = sanitize_text_field( $post_data['dokan_store_phone'] );

        // social settings
        if ( is_array( $social ) ) {
            foreach ( $social as $key => $value ) {
                if ( isset( $social_fields[ $key ] ) ) {
                    $store_settings['social'][ $key ] = esc_url_raw( $social[ $key ] );
                }
            }
        }

        wp_update_user( array(
			'ID'            => $user_id,
			'user_nicename' => sanitize_title( $post_data['dokan_store_url'] ),
        ) );

        update_user_meta( $user_id, 'dokan_profile_settings', $store_settings );
        update_user_meta( $user_id, 'dokan_enable_selling', $selling );
        update_user_meta( $user_id, 'dokan_publishing', $publishing );
        update_user_meta( $user_id, 'dokan_admin_percentage', $percentage );
        update_user_meta( $user_id, 'dokan_admin_percentage_type', $percentage_type );
        update_user_meta( $user_id, 'dokan_feature_seller', $feature_seller );
        update_user_meta( $user_id, 'dokan_store_name', $store_settings['store_name'] );

        do_action( 'dokan_process_seller_meta_fields', $user_id );
    }
}
