<?php

if ( function_exists( 'wc_print_notices' ) ) {
    wc_print_notices();
}

$home_url         = untrailingslashit( home_url() );
$custom_store_url = dokan_get_option( 'custom_store_url', 'dokan_general', 'store' );

?>

<form id="dokan-vendor-register" method="post" class="register dokan-vendor-register">

    <?php do_action( 'dokan_vendor_reg_form_start' ); ?>

    <div class="split-row name-field form-row-wide">
        <p class="form-row form-group">
            <label for="first-name"><?php esc_html_e( 'First Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="fname" id="first-name" value="<?php echo ! empty( $data['fname'] ) ? esc_attr( $data['fname'] ) : ''; ?>" required="required" />
        </p>

        <p class="form-row form-group">
            <label for="last-name"><?php esc_html_e( 'Last Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="lname" id="last-name" value="<?php echo ! empty( $data['lname'] ) ? esc_attr( $data['lname'] ) : ''; ?>" required="required" />
        </p>
    </div>

    <?php if ( 'no' === get_option( 'woocommerce_registration_generate_username' ) ) : ?>
        <p class="form-row form-group form-row-wide">
            <label for="reg_username"><?php esc_html_e( 'Username', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="username" id="reg_username" value="<?php echo ! empty( $data['username'] ) ? esc_attr( $data['username'] ) : ''; ?>" required="required" />
        </p>
    <?php endif; ?>

    <p class="form-row form-group form-row-wide">
        <label for="reg_email"><?php esc_html_e( 'Email address', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <input type="email" class="input-text form-control" name="email" id="reg_email" value="<?php echo ! empty( $data['email'] ) ? esc_attr( $data['email'] ) : ''; ?>" required="required" />
        <label class="reg_email_error"></label>
        <?php if ( get_option( 'woocommerce_registration_generate_password', 'no' ) === 'yes' ) : ?>
        <small><?php echo __( 'A link to set a new password will be sent to your email address.', 'dokan-lite' ); ?></small>
        <?php endif; ?>
    </p>

    <p class="form-row form-group form-row-wide">
        <label for="shop-phone"><?php esc_html_e( 'Phone Number', 'dokan-lite' ); ?><span class="required">*</span></label>
        <input type="text" class="input-text form-control" name="phone" id="shop-phone" value="<?php echo ! empty( $data['phone'] ) ? esc_attr( $data['phone'] ) : ''; ?>" required="required" />
        <input type="hidden" name="role" value="seller">
    </p>

    <?php if ( get_option( 'woocommerce_registration_generate_password', 'no' ) !== 'yes' ) : ?>
    <p class="form-row form-group form-row-wide">
        <label for="reg_password"><?php esc_html_e( 'Password', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <input type="password" class="input-text form-control" name="password" id="reg_password" value="<?php echo ! empty( $data['password'] ) ? esc_attr( $data['password'] ) : ''; ?>" required="required" minlength="6" />
    </p>
    <?php endif; ?>

    <!-- Spam Trap -->
    <div style="left:-999em; position:absolute;"><label for="trap"><?php esc_html_e( 'Anti-spam', 'dokan-lite' ); ?></label><input type="text" name="email_2" id="trap" tabindex="-1" /></div>

    <p class="form-row form-group form-row-wide">
        <label for="company-name"><?php esc_html_e( 'Shop Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <input type="text" class="input-text form-control" name="shopname" id="company-name" value="<?php echo ! empty( $data['shopname'] ) ? esc_attr( $data['shopname'] ) : ''; ?>" required="required" />
    </p>

    <p class="form-row form-group form-row-wide">
        <label for="seller-url" class="pull-left"><?php esc_html_e( 'Shop URL', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <strong id="url-alart-mgs" class="pull-right"></strong>
        <input type="text" class="input-text form-control" name="shopurl" id="seller-url" value="<?php echo ! empty( $data['shopurl'] ) ? esc_attr( $data['shopurl'] ) : ''; ?>" required="required" />
        <small><?php echo esc_url( $home_url . '/' . $custom_store_url ) . '/'; ?><strong id="url-alart"></strong></small>
    </p>

    <?php

    /**
     * Store Address Fields
     */

    if ( 'on' === dokan_get_option( 'enabled_address_on_reg', 'dokan_general', 'off' ) ) {
        dokan_seller_address_fields( false, true );
    }
    /**
     * @since 3.2.8
     */
    do_action( 'dokan_seller_registration_after_shopurl_field', [] );
    ?>

    <?php do_action( 'register_form' ); ?>

    <?php
    $show_terms_condition = dokan_get_option( 'enable_tc_on_reg', 'dokan_general' );
    $terms_condition_url  = dokan_get_terms_condition_url();
    ?>

    <?php if ( 'on' === $show_terms_condition && $terms_condition_url ) : ?>
        <p class="form-row form-group form-row-wide">
            <input class="tc_check_box" type="checkbox" id="tc_agree" name="tc_agree" required="required">
            <label style="display: inline" for="tc_agree">
                <?php
                printf(
                    /* translators: %1$s: opening anchor tag with link, %2$s: an ampersand %3$s: closing anchor tag */
                    __( 'I have read and agree to the %1$sTerms %2$s Conditions%3$s.', 'dokan-lite' ),
                    sprintf( '<a target="_blank" href="%s">', esc_url( $terms_condition_url ) ),
                    '&amp;',
                    '</a>'
                );
                ?>
            </label>
        </p>
    <?php endif; ?>

    <?php do_action( 'dokan_seller_registration_field_after' ); ?>

    <p class="form-row">
        <?php wp_nonce_field( 'woocommerce-register', 'woocommerce-register-nonce' ); ?>

        <input type="submit" class="dokan-btn dokan-btn-theme" name="register" value="<?php esc_attr_e( 'Register', 'dokan-lite' ); ?>" />
    </p>

    <?php do_action( 'dokan_vendor_reg_form_end' ); ?>
</form>
