<?php

/**
 * Pageviews - for counting product post views.
 */
class Dokan_Pageviews {

    private $meta_key = 'pageview';

    public function __construct() {
        /* Registers the entry views extension scripts if we're on the correct page. */
        add_action( 'template_redirect', array( $this, 'load_views' ), 25 );

        /* Add the entry views AJAX actions to the appropriate hooks. */
        add_action( 'wp_ajax_dokan_pageview', array( $this, 'update_ajax' ) );
        add_action( 'wp_ajax_nopriv_dokan_pageview', array( $this, 'update_ajax' ) );

        /* Register vendor registration shortcode */
        add_shortcode( 'dokan-vendor-registration', array( $this, 'vendor_registration_shortcode' ) );
    }

    public function load_scripts() {
        $nonce = wp_create_nonce( 'dokan_pageview' );

        echo '<script type="text/javascript">
            jQuery(document).ready( function($) {
                var data = {
                    action: "dokan_pageview",
                    _ajax_nonce: "'. $nonce .'",
                    post_id: ' . get_the_ID() . ',
                }
                $.post( "' . admin_url( 'admin-ajax.php' ) . '", data );
            } );
            </script>';
    }

    public function load_views() {
        if ( is_singular( 'product' ) ) {
            global $post;

            if ( empty( $_COOKIE['dokan_product_viewed'] ) ) {
                $dokan_viewed_products = array();
            } else {
                $dokan_viewed_products = (array) explode( ',', $_COOKIE['dokan_product_viewed'] );
            }

            if ( ! in_array( $post->ID, $dokan_viewed_products ) ) {
                $dokan_viewed_products[] = $post->ID;

                wp_enqueue_script( 'jquery' );
                add_action( 'wp_footer', array($this, 'load_scripts') );
            }
            // Store for single product view
            setcookie( 'dokan_product_viewed', implode( ',', $dokan_viewed_products ) );
        }
    }

    public function update_view( $post_id = '' ) {
        if ( ! empty( $post_id ) ) {
            $old_views = get_post_meta( $post_id, $this->meta_key, true );
            $new_views = absint( $old_views ) + 1;

            update_post_meta( $post_id, $this->meta_key, $new_views, $old_views );
        }
    }

    public function update_ajax() {
        check_ajax_referer( 'dokan_pageview' );

        if ( isset( $_POST['post_id'] ) ) {
            $post_id = absint( $_POST['post_id'] );
        }

        if ( ! empty( $post_id ) ) {
            $this->update_view( $post_id );
        }

        wp_die();
    }

    /**
     * Vendor regsitration form shortcode callback
     *
     * @return html
     */
    public function vendor_registration_shortcode() {
        if ( is_user_logged_in() ) {
            _e( 'You are already logged in', 'dokan-lite' );
            return;
        }

        $postdata = wc_clean( $_POST ); // WPCS: CSRF ok, input var ok.
        $role = isset( $postdata['role'] ) ? $postdata['role'] : 'customer';
        ob_start();

        $notices = wc_get_notices();

        if ( count( $notices ) > 0 ) {
            wc_print_notices( $notices );
        }
        ?>

        <form id="register" method="post" class="register">
            <?php do_action( 'woocommerce_register_form_start' ); ?>

            <?php if ( 'no' === get_option( 'woocommerce_registration_generate_username' ) ) : ?>
                <p class="form-row form-group form-row-wide">
                    <label for="reg_username"><?php _e( 'Username', 'dokan-lite' ); ?> <span class="required">*</span></label>
                    <input type="text" class="input-text form-control" name="username" id="reg_username" value="<?php if ( ! empty( $_POST['username'] ) ) esc_attr( $_POST['username'] ); ?>" required="required" />
                </p>
            <?php endif; ?>

            <p class="form-row form-group form-row-wide">
                <label for="reg_email"><?php _e( 'Email address', 'dokan-lite' ); ?> <span class="required">*</span></label>
                <input type="email" class="input-text form-control" name="email" id="reg_email" value="<?php if ( ! empty( $_POST['email'] ) ) esc_attr($_POST['email']); ?>" required="required" />
                <label generated="true" class="reg_email_error"></label>
            </p>

            <?php if ( 'no' === get_option( 'woocommerce_registration_generate_password' ) ) : ?>
                <p class="form-row form-group form-row-wide">
                    <label for="reg_password"><?php _e( 'Password', 'dokan-lite' ); ?> <span class="required">*</span></label>
                    <input type="password" class="input-text form-control" name="password" id="reg_password" value="<?php if ( ! empty( $_POST['password'] ) ) esc_attr( $_POST['password'] ); ?>" required="required" minlength="6" />
                </p>
            <?php endif; ?>
            <!-- Spam Trap -->
            <div style="left:-999em; position:absolute;"><label for="trap"><?php _e( 'Anti-spam', 'dokan-lite' ); ?></label><input type="text" name="email_2" id="trap" tabindex="-1" /></div>

            <div class="split-row form-row-wide">
                <p class="form-row form-group">
                    <label for="first-name"><?php _e( 'First Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
                    <input type="text" class="input-text form-control" name="fname" id="first-name" value="<?php if ( ! empty( $postdata['fname'] ) ) echo esc_attr($postdata['fname']); ?>" required="required" />
                </p>

                <p class="form-row form-group">
                    <label for="last-name"><?php _e( 'Last Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
                    <input type="text" class="input-text form-control" name="lname" id="last-name" value="<?php if ( ! empty( $postdata['lname'] ) ) echo esc_attr($postdata['lname']); ?>" required="required" />
                </p>
            </div>

            <p class="form-row form-group form-row-wide">
                <label for="company-name"><?php _e( 'Shop Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
                <input type="text" class="input-text form-control" name="shopname" id="company-name" value="<?php if ( ! empty( $postdata['shopname'] ) ) echo esc_attr($postdata['shopname']); ?>" required="required" />
            </p>

            <p class="form-row form-group form-row-wide">
                <label for="seller-url" class="pull-left"><?php _e( 'Shop URL', 'dokan-lite' ); ?> <span class="required">*</span></label>
                <strong id="url-alart-mgs" class="pull-right"></strong>
                <input type="text" class="input-text form-control" name="shopurl" id="seller-url" value="<?php if ( ! empty( $postdata['shopurl'] ) ) echo esc_attr($postdata['shopurl']); ?>" required="required" />
                <small><?php echo home_url() . '/' . dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ); ?>/<strong id="url-alart"></strong></small>
            </p>

            <p class="form-row form-group form-row-wide">
                <label for="shop-phone"><?php _e( 'Phone Number', 'dokan-lite' ); ?><span class="required">*</span></label>
                <input type="text" class="input-text form-control" name="phone" id="shop-phone" value="<?php if ( ! empty( $postdata['phone'] ) ) echo esc_attr($postdata['phone']); ?>" required="required" />
                <input type="hidden" name="role" value="<?php echo esc_attr('seller') ?>">
            </p>

            <?php
            $show_toc = dokan_get_option( 'enable_tc_on_reg', 'dokan_general' );

            if ( $show_toc == 'on' ) {
                $toc_page_id = dokan_get_option( 'reg_tc_page', 'dokan_pages' );
                if ( $toc_page_id != -1 ) {
                    $toc_page_url = get_permalink( $toc_page_id ); ?>
                    <p class="form-row form-group form-row-wide">
                        <input class="tc_check_box" type="checkbox" id="tc_agree" name="tc_agree" required="required">
                        <label style="display: inline" for="tc_agree"><?php echo sprintf( __( 'I have read and agree to the <a target="_blank" href="%s">Terms &amp; Conditions</a>.', 'dokan-lite' ), $toc_page_url ); ?></label>
                    </p>
                <?php } ?>
            <?php } ?>
            <?php do_action( 'dokan_seller_registration_field_after' ); ?>

            <?php do_action( 'register_form' ); ?>
            <p class="form-row">
                <?php wp_nonce_field( 'woocommerce-register', '_wpnonce' ); ?>
                <input type="submit" class="dokan-btn dokan-btn-theme" name="register" value="<?php _e( 'Register', 'dokan-lite' ); ?>" />
            </p>
            <?php do_action( 'woocommerce_register_form_end' ); ?>
        </form>
        <?php
        wp_enqueue_script( 'wc-password-strength-meter' );
        ?>
        <script>
        // Dokan Register
        jQuery(function($) {
            $('#reg_email').on('change', function() {
                var self = $(this);
                var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
                if ( $('#reg_email').val() == '' || !re.test( $('#reg_email').val() ) ) {
                    $('.reg_email_error').text('Please enter a valid email address.').show();
                } else {
                    $('.reg_email_error').hide();
                }
            });
            $('.user-role input[type=radio]').on('change', function() {
                var value = $(this).val();
                if ( value === 'seller') {
                    $('.show_if_seller').slideDown();
                    if ( $( '.tc_check_box' ).length > 0 )
                        $('input[name=register]').attr('disabled','disabled');
                } else {
                    $('.show_if_seller').slideUp();
                    if ( $( '.tc_check_box' ).length > 0 )
                        $( 'input[name=register]' ).removeAttr( 'disabled' );
                }
            });
           $( '.tc_check_box' ).on( 'click', function () {
                var chk_value = $( this ).val();
                if ( $( this ).prop( "checked" ) ) {
                    $( 'input[name=register]' ).removeAttr( 'disabled' );
                    $( 'input[name=dokan_migration]' ).removeAttr( 'disabled' );
                } else {
                    $( 'input[name=register]' ).attr( 'disabled', 'disabled' );
                    $( 'input[name=dokan_migration]' ).attr( 'disabled', 'disabled' );
                }
            } );
            if ( $( '.tc_check_box' ).length > 0 ){
                $( 'input[name=dokan_migration]' ).attr( 'disabled', 'disabled' );
            }
            $('#company-name').on('focusout', function() {
                var value = $(this).val().toLowerCase().replace(/-+/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                $('#seller-url').val(value);
                $('#url-alart').text( value );
                $('#seller-url').focus();
            });
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
                $('#url-alart').text( $(this).val() );
            });
            $('#shop-phone').keydown(function(e) {
                // Allow: backspace, delete, tab, escape, enter and .
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 91, 107, 109, 110, 187, 189, 190]) !== -1 ||
                     // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                     // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                         // let it happen, don't do anything
                         return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
            $('#seller-url').on('focusout', function() {
                var self = $(this),
                data = {
                    action : 'shop_url',
                    url_slug : self.val(),
                    _nonce : dokan.nonce,
                };
                if ( self.val() === '' ) {
                    return;
                }
                var row = self.closest('.form-row');
                row.block({ message: null, overlayCSS: { background: '#fff url(' + dokan.ajax_loader + ') no-repeat center', opacity: 0.6 } });
                $.post( dokan.ajaxurl, data, function(resp) {
                    if ( resp == 0){
                        $('#url-alart').removeClass('text-success').addClass('text-danger');
                        $('#url-alart-mgs').removeClass('text-success').addClass('text-danger').text(dokan.seller.notAvailable);
                    } else {
                        $('#url-alart').removeClass('text-danger').addClass('text-success');
                        $('#url-alart-mgs').removeClass('text-danger').addClass('text-success').text(dokan.seller.available);
                    }
                    row.unblock();
                } );
            });
        });
        </script>
        <?php return ob_get_clean();
    }
}