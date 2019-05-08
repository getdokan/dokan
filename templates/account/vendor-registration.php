<?php wc_print_notices(); ?>

<form id="dokan-vendor-register" method="post" class="register dokan-vendor-register">

    <?php do_action( 'dokan_vendor_reg_form_start' ); ?>

    <div class="split-row name-field form-row-wide">
        <p class="form-row form-group">
            <label for="first-name"><?php esc_html_e( 'First Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="fname" id="first-name" value="<?php if ( ! empty( $postdata['fname'] ) ) echo esc_attr($postdata['fname']); ?>" required="required" />
        </p>

        <p class="form-row form-group">
            <label for="last-name"><?php esc_html_e( 'Last Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="lname" id="last-name" value="<?php if ( ! empty( $postdata['lname'] ) ) echo esc_attr($postdata['lname']); ?>" required="required" />
        </p>
    </div>

    <?php if ( 'no' === get_option( 'woocommerce_registration_generate_username' ) ) : ?>
        <p class="form-row form-group form-row-wide">
            <label for="reg_username"><?php esc_html_e( 'Username', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="username" id="reg_username" value="<?php if ( ! empty( $postdata['username'] ) ) esc_attr( $postdata['username'] ); ?>" required="required" />
        </p>
    <?php endif; ?>

    <p class="form-row form-group form-row-wide">
        <label for="reg_email"><?php esc_html_e( 'Email address', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <input type="email" class="input-text form-control" name="email" id="reg_email" value="<?php if ( ! empty( $postdata['email'] ) ) esc_attr($postdata['email']); ?>" required="required" />
        <label generated="true" class="reg_email_error"></label>
    </p>

    <p class="form-row form-group form-row-wide">
        <label for="shop-phone"><?php esc_html_e( 'Phone Number', 'dokan-lite' ); ?><span class="required">*</span></label>
        <input type="text" class="input-text form-control" name="phone" id="shop-phone" value="<?php if ( ! empty( $postdata['phone'] ) ) echo esc_attr($postdata['phone']); ?>" required="required" />
        <input type="hidden" name="role" value="<?php echo esc_attr('seller') ?>">
    </p>

    <p class="form-row form-group form-row-wide">
        <label for="reg_password"><?php esc_html_e( 'Password', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <input type="password" class="input-text form-control" name="password" id="reg_password" value="<?php if ( ! empty( $postdata['password'] ) ) esc_attr( $postdata['password'] ); ?>" required="required" minlength="6" />
    </p>

    <!-- Spam Trap -->
    <div style="left:-999em; position:absolute;"><label for="trap"><?php esc_html_e( 'Anti-spam', 'dokan-lite' ); ?></label><input type="text" name="email_2" id="trap" tabindex="-1" /></div>

    <p class="form-row form-group form-row-wide">
        <label for="company-name"><?php esc_html_e( 'Shop Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <input type="text" class="input-text form-control" name="shopname" id="company-name" value="<?php if ( ! empty( $postdata['shopname'] ) ) echo esc_attr($postdata['shopname']); ?>" required="required" />
    </p>

    <p class="form-row form-group form-row-wide">
        <label for="seller-url" class="pull-left"><?php esc_html_e( 'Shop URL', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <strong id="url-alart-mgs" class="pull-right"></strong>
        <input type="text" class="input-text form-control" name="shopurl" id="seller-url" value="<?php if ( ! empty( $postdata['shopurl'] ) ) echo esc_attr($postdata['shopurl']); ?>" required="required" />
        <small><?php echo esc_url( home_url()  . '/' . dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ) ); ?>/<strong id="url-alart"></strong></small>
    </p>

    <?php do_action( 'register_form' ); ?>

    <?php
    $show_toc = dokan_get_option( 'enable_tc_on_reg', 'dokan_general' );

    if ( $show_toc == 'on' ) {
        $toc_page_id = dokan_get_option( 'reg_tc_page', 'dokan_pages' );

        if ( $toc_page_id != -1 ) {
            $toc_page_url = get_permalink( $toc_page_id ); ?>
            <p class="form-row form-group form-row-wide">
                <input class="tc_check_box" type="checkbox" id="tc_agree" name="tc_agree" required="required">
                <label style="display: inline" for="tc_agree"><?php echo sprintf( __( 'I have read and agree to the <a target="_blank" href="%s">Terms &amp; Conditions</a>.', 'dokan-lite' ), $toc_page_url ); // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped  ?></label>
            </p>
        <?php } ?>
    <?php } ?>

    <?php do_action( 'dokan_seller_registration_field_after' ); ?>

    <p class="form-row">
        <?php wp_nonce_field( 'woocommerce-register', 'woocommerce-register-nonce' ); ?>

        <input type="submit" class="dokan-btn dokan-btn-theme" name="register" value="<?php esc_attr_e( 'Register', 'dokan-lite' ); ?>" />
    </p>

    <?php do_action( 'dokan_vendor_reg_form_end' ); ?>
</form>
