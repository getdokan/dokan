<?php
/**
 * User profile related tasks for wp-admin
 *
 * @package Dokan
 */
class Dokan_Admin_User_Profile {

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
        if ( in_array( $page, array( 'profile.php', 'user-edit.php' )) ) {
            wp_enqueue_media();
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

        if ( !user_can( $user, 'dokandar' ) ) {
            return;
        }

        $selling           = get_user_meta( $user->ID, 'dokan_enable_selling', true );
        $publishing        = get_user_meta( $user->ID, 'dokan_publishing', true );
        $store_settings    = dokan_get_store_info( $user->ID );
        $banner            = isset( $store_settings['banner'] ) ? absint( $store_settings['banner'] ) : 0;
        $seller_percentage = get_user_meta( $user->ID, 'dokan_seller_percentage', true );
        $feature_seller    = get_user_meta( $user->ID, 'dokan_feature_seller', true );

        $social_fields     = dokan_get_social_profile_fields();

        $address           = isset( $store_settings['address'] ) ? $store_settings['address'] : '';
        $address_street1   = isset( $store_settings['address']['street_1'] ) ? $store_settings['address']['street_1'] : '';
        $address_street2   = isset( $store_settings['address']['street_2'] ) ? $store_settings['address']['street_2'] : '';
        $address_city      = isset( $store_settings['address']['city'] ) ? $store_settings['address']['city'] : '';
        $address_zip       = isset( $store_settings['address']['zip'] ) ? $store_settings['address']['zip'] : '';
        $address_country   = isset( $store_settings['address']['country'] ) ? $store_settings['address']['country'] : '';
        $address_state     = isset( $store_settings['address']['state'] ) ? $store_settings['address']['state'] : '';

        $country_state     = array(
            'country' => array(
                'label'       => __( 'Country', 'dokan' ),
                'description' => '',
                'class'       => 'js_field-country',
                'type'        => 'select',
                'options'     => array( '' => __( 'Select a country&hellip;', 'dokan' ) ) + WC()->countries->get_allowed_countries()
            ),
            'state' => array(
                'label'       => __( 'State/County', 'dokan' ),
                'description' => __( 'State/County or state code', 'dokan' ),
                'class'       => 'js_field-state'
            ),
        );
        ?>
        <h3><?php _e( 'Dokan Options', 'dokan' ); ?></h3>

        <table class="form-table">
            <tbody>
                <tr>
                    <th><?php _e( 'Banner', 'dokan' ); ?></th>
                    <td>
                        <div class="dokan-banner">
                            <div class="image-wrap<?php echo $banner ? '' : ' dokan-hide'; ?>">
                                <?php $banner_url = $banner ? wp_get_attachment_url( $banner ) : ''; ?>
                                <input type="hidden" class="dokan-file-field" value="<?php echo $banner; ?>" name="dokan_banner">
                                <img class="dokan-banner-img" src="<?php echo esc_url( $banner_url ); ?>">

                                <a class="close dokan-remove-banner-image">&times;</a>
                            </div>

                            <div class="button-area<?php echo $banner ? ' dokan-hide' : ''; ?>">
                                <a href="#" class="dokan-banner-drag button button-primary"><?php _e( 'Upload banner', 'dokan' ); ?></a>
                                <p class="description"><?php _e( '(Upload a banner for your store. Banner size is (825x300) pixels. )', 'dokan' ); ?></p>
                            </div>
                        </div> <!-- .dokan-banner -->
                    </td>
                </tr>

                <tr>
                    <th><?php _e( 'Store name', 'dokan' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_name" class="regular-text" value="<?php echo esc_attr( $store_settings['store_name'] ); ?>">
                    </td>
                </tr>

                <tr>
                    <th><?php _e( 'Address 1', 'dokan' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_address[street_1]" class="regular-text" value="<?php echo esc_attr( $address_street1 ) ?>">
                    </td>
                </tr>

                <tr>
                    <th><?php _e( 'Address 2', 'dokan' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_address[street_2]" class="regular-text" value="<?php echo esc_attr( $address_street2 ) ?>">
                    </td>
                </tr>

                <tr>
                    <th><?php _e( 'Town/City', 'dokan' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_address[city]" class="regular-text" value="<?php echo esc_attr( $address_city ) ?>">
                    </td>
                </tr>

                <tr>
                    <th><?php _e( 'Zip Code', 'dokan' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_address[zip]" class="regular-text" value="<?php echo esc_attr( $address_zip ) ?>">
                    </td>
                </tr>

                <?php foreach ( $country_state as $key => $field ) : ?>
                    <tr>
                        <th><label for="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $field['label'] ); ?></label></th>
                        <td>
                            <?php if ( ! empty( $field['type'] ) && 'select' == $field['type'] ) : ?>
                                <select name="dokan_store_address[<?php echo esc_attr( $key ); ?>]" id="<?php echo esc_attr( $key ); ?>" class="<?php echo ( ! empty( $field['class'] ) ? $field['class'] : '' ); ?>" style="width: 25em;">
                                    <?php
                                        if ( $key == 'country') {
                                            $selected = esc_attr( $address_country );
                                        } else {
                                            $selected = esc_attr( $address_state );
                                        }
                                        foreach ( $field['options'] as $option_key => $option_value ) : ?>
                                        <option value="<?php echo esc_attr( $option_key ); ?>" <?php selected( $selected, $option_key, true ); ?>><?php echo esc_attr( $option_value ); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            <?php else : ?>
                                <?php
                                if ( $key == 'country') {
                                    $value = esc_attr( $address_country );
                                } else {
                                    $value = esc_attr( $address_state );
                                }
                                ?>
                                <input type="text" name="dokan_store_address[<?php echo esc_attr( $key ); ?>]" id="<?php echo esc_attr( $key ); ?>" value="<?php echo $value; ?>" class="<?php echo ( ! empty( $field['class'] ) ? $field['class'] : 'regular-text' ); ?>" />
                            <?php endif; ?>

                            <span class="description"><?php echo wp_kses_post( $field['description'] ); ?></span>
                        </td>
                    </tr>
                <?php endforeach; ?>


                <tr>
                    <th><?php _e( 'Phone Number', 'dokan' ); ?></th>
                    <td>
                        <input type="text" name="dokan_store_phone" class="regular-text" value="<?php echo esc_attr( $store_settings['phone'] ); ?>">
                    </td>
                </tr>

                <?php foreach ($social_fields as $key => $value) { ?>

                    <tr>
                        <th><?php echo $value['title']; ?></th>
                        <td>
                            <input type="text" name="dokan_social[<?php echo $key; ?>]" class="regular-text" value="<?php echo isset( $store_settings['social'][$key] ) ? esc_url( $store_settings['social'][$key] ) : ''; ?>">
                        </td>
                    </tr>

                <?php } ?>

                <tr>
                    <th><?php _e( 'Payment Options : ', 'dokan' ); ?></th>
                </tr>

                <?php if( isset( $store_settings['payment']['paypal']['email'] ) ) { ?>
                    <tr>
                        <th><?php _e( 'Paypal Email ', 'dokan' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo esc_attr( $store_settings['payment']['paypal']['email'] ); ?>">
                        </td>
                    </tr>
                <?php } ?>
                <?php if( isset( $store_settings['payment']['skrill']['email'] ) ) { ?>
                    <tr>
                        <th><?php _e( 'Skrill Email ', 'dokan' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo esc_attr( $store_settings['payment']['skrill']['email'] ); ?>">
                        </td>
                    </tr>
                <?php } ?>

                <?php if( isset( $store_settings['payment']['bank'] ) ) { ?>
                    <tr>
                        <th><?php _e( 'Bank name ', 'dokan' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['bank_name'] ) ? esc_attr( $store_settings['payment']['bank']['bank_name'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php _e( 'Account Name ', 'dokan' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['ac_name'] ) ? esc_attr( $store_settings['payment']['bank']['ac_name'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php _e( 'Account Number ', 'dokan' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['ac_number'] ) ? esc_attr( $store_settings['payment']['bank']['ac_number'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php _e( 'Bank Address ', 'dokan' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['bank_addr'] ) ? esc_attr( $store_settings['payment']['bank']['bank_addr'] ) : ''; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th><?php _e( 'Bank Swift ', 'dokan' ); ?></th>
                        <td>
                            <input type="text" disabled class="regular-text" value="<?php echo isset( $store_settings['payment']['bank']['swift'] ) ? esc_attr( $store_settings['payment']['bank']['swift'] ) : ''; ?>">
                        </td>
                    </tr>
                <?php } ?>
                <tr>
                    <th><?php _e( 'Selling', 'dokan' ); ?></th>
                    <td>
                        <label for="dokan_enable_selling">
                            <input type="hidden" name="dokan_enable_selling" value="no">
                            <input name="dokan_enable_selling" type="checkbox" id="dokan_enable_selling" value="yes" <?php checked( $selling, 'yes' ); ?> />
                            <?php _e( 'Enable Adding Products', 'dokan' ); ?>
                        </label>

                        <p class="description"><?php _e( 'Enable or disable product adding capability', 'dokan' ) ?></p>
                    </td>
                </tr>

                <tr>
                    <th><?php _e( 'Publishing', 'dokan' ); ?></th>
                    <td>
                        <label for="dokan_publish">
                            <input type="hidden" name="dokan_publish" value="no">
                            <input name="dokan_publish" type="checkbox" id="dokan_publish" value="yes" <?php checked( $publishing, 'yes' ); ?> />
                            <?php _e( 'Publish product directly', 'dokan' ); ?>
                        </label>

                        <p class="description"><?php _e( 'Bypass pending, publish products directly', 'dokan' ) ?></p>
                    </td>
                </tr>

                <tr>
                    <th><?php _e( 'Vendor Commission %', 'dokan' ); ?></th>
                    <td>
                        <input type="text" class="small-text" name="dokan_seller_percentage" value="<?php echo esc_attr( $seller_percentage ); ?>">

                        <p class="description"><?php _e( 'It will overrride the default % vendor gets from each order', 'dokan' ) ?></p>
                    </td>
                </tr>

                <tr>
                    <th><?php _e( 'Featured vendor', 'dokan' ); ?></th>
                    <td>
                        <label for="dokan_feature">
                            <input type="hidden" name="dokan_feature" value="no">
                            <input name="dokan_feature" type="checkbox" id="dokan_feature" value="yes" <?php checked( $feature_seller, 'yes' ); ?> />
                            <?php _e( 'Mark as featured vendor', 'dokan' ); ?>
                        </label>

                        <p class="description"><?php _e( 'This vendor will be marked as a featured vendor.', 'dokan' ) ?></p>
                    </td>
                </tr>

                <?php do_action( 'dokan_seller_meta_fields', $user ); ?>

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

        if ( ! isset( $_POST['dokan_enable_selling'] ) ) {
            return;
        }

        $selling        = sanitize_text_field( $_POST['dokan_enable_selling'] );
        $publishing     = sanitize_text_field( $_POST['dokan_publish'] );
        $percentage     = empty( $_POST['dokan_seller_percentage'] ) ? '' : floatval( $_POST['dokan_seller_percentage'] );
        $feature_seller = sanitize_text_field( $_POST['dokan_feature'] );
        $store_settings = dokan_get_store_info( $user_id );

        $social         = $_POST['dokan_social'];
        $social_fields  = dokan_get_social_profile_fields();

        $store_settings['banner']     = intval( $_POST['dokan_banner'] );
        $store_settings['store_name'] = sanitize_text_field( $_POST['dokan_store_name'] );
        $store_settings['address']    = isset( $_POST['dokan_store_address'] ) ? $_POST['dokan_store_address'] : array();
        $store_settings['phone']      = sanitize_text_field( $_POST['dokan_store_phone'] );

        // social settings
        if ( is_array( $social ) ) {
            foreach ($social as $key => $value) {
                if ( isset( $social_fields[ $key ] ) ) {
                    $store_settings['social'][ $key ] = filter_var( $social[ $key ], FILTER_VALIDATE_URL );
                }
            }
        }

        update_user_meta( $user_id, 'dokan_profile_settings', $store_settings );
        update_user_meta( $user_id, 'dokan_enable_selling', $selling );
        update_user_meta( $user_id, 'dokan_publishing', $publishing );
        update_user_meta( $user_id, 'dokan_seller_percentage', $percentage );
        update_user_meta( $user_id, 'dokan_feature_seller', $feature_seller );
        update_user_meta( $user_id, 'dokan_store_name', $store_settings['store_name'] );

        do_action( 'dokan_process_seller_meta_fields', $user_id );
    }
}