<?php
/**
 * Dokan Seller registration form
 *
 * @since 2.6.9
 *
 * @package dokan
 */
?>

<div id="customer_login">
    <div class="col-md-12 reg-form">
        <h2><?php _e( 'Register', 'dokan' ); ?></h2>
        <form id="register" method="post" class="register" novalidate="novalidate">
            <?php do_action( 'woocommerce_register_form_start' ); ?>

            <?php if ( 'no' === get_option( 'woocommerce_registration_generate_username' ) ) : ?>

            <p class="form-row form-group form-row-wide has-error">
                <label for="reg_username"><?php _e( 'Username', 'dokan' ); ?> <span class="required">*</span></label>
                <input type="text" class="input-text form-control" name="username" id="reg_username" value="<?php if ( ! empty( $_POST['username'] ) ) esc_attr_e($_POST['username']); ?>" required="required" />
            </p>

            <?php endif; ?>

            <p class="form-row form-group form-row-wide">
                <label for="reg_email"><?php _e( 'Email address', 'dokan' ); ?>
                    <span class="required">*</span>
                </label>
                <input type="email" class="input-text form-control" name="email" id="reg_email" value="<?php if ( ! empty( $_POST['email'] ) ) esc_attr_e($_POST['email']); ?>" required="required" />
                
            </p>

            <?php if ( 'no' === get_option( 'woocommerce_registration_generate_password' ) ) : ?>

            <p class="form-row form-group form-row-wide">
                <label for="reg_password"><?php _e( 'Password', 'dokan' ); ?> <span class="required">*</span></label>
                <input type="password" class="input-text form-control" name="password" id="reg_password" value="<?php if ( ! empty( $_POST['password'] ) ) esc_attr_e( $_POST['password'] ); ?>" required="required" minlength="6" />
            </p>

            <?php endif; ?>

        <!-- Spam Trap -->
            <div style="left:-999em; position:absolute;"><label for="trap"><?php _e( 'Anti-spam', 'dokan' ); ?></label><input type="text" name="email_2" id="trap" tabindex="-1" /></div>

            <div class="show_if_seller"<?php echo $role_style; ?>>

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
                <label for="company-name">
                    <?php _e( 'Shop Name', 'dokan-lite' ); ?> <span class="required">*</span>
                </label>
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
                        <?php };
                    };

                do_action( 'dokan_seller_registration_field_after' );

            ?>

            </div>

                <?php do_action( 'dokan_reg_form_field' ); ?>

                <p class="form-row form-group user-role">
                	<input type="hidden" name="role" value="seller">
                    <?php do_action( 'dokan_registration_form_role', $role ); ?>
                </p>

                <p class="form-row">
                    <?php wp_nonce_field( 'woocommerce-register', '_wpnonce' ); ?>
                    <input type="submit" class="btn btn-theme" name="register" value="<?php _e( 'Register', 'dokan' ); ?>" />
                </p>
                <?php do_action( 'woocommerce_register_form_end' ); ?>
            </form>
    </div>
</div>


<script type="text/javascript">
// Dokan Register
jQuery(function($) {

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


