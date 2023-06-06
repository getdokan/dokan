<?php
/**
 * Dokan Update Customer to Vendor Template.
 *
 * @since DOKAN_LITE_SINCE
 *
 * @package dokan
 */
$user_id   = get_current_user_id();
$hide_form = false;

if ( ! function_exists( 'wc_add_notice' ) || ! function_exists( 'wc_print_notices' ) ) {
    return;
}

if ( ! $user_id ) {
    $hide_form = true;
    wc_add_notice( __( 'You need to login before applying for vendor.', 'dokan-lite' ), 'error' );
}

if ( $user_id && dokan_is_user_seller( $user_id ) ) {
    $hide_form = true;
    wc_add_notice( __( 'You are already a vendor.', 'dokan-lite' ), 'error' );
}

if ( $user_id && current_user_can( 'manage_options' ) ) {
    $hide_form = true;
    wc_add_notice( __( 'You are an administrator. Please use dokan admin settings to enable your selling capabilities.', 'dokan-lite' ), 'error' );
}

wc_print_notices();

if ( $hide_form ) {
    return;
}

$f_name         = get_user_meta( $user_id, 'first_name', true );
$l_name         = get_user_meta( $user_id, 'last_name', true );
$nonce_verified = isset( $_POST['dokan_nonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_POST['dokan_nonce'] ) ), 'account_migration' );

if (
    empty( $f_name )
    && isset( $_POST['fname'] )

) {
    $f_name = sanitize_text_field( wp_unslash( $_POST['fname'] ) );
}

if (
    empty( $l_name )
    && isset( $_POST['lname'] )
    && $nonce_verified
) {
    $l_name = sanitize_text_field( wp_unslash( $_POST['lname'] ) );
}
$cu_slug = get_user_meta( $user_id, 'nickname', true );

if (
    empty( $cu_slug )
    && ! empty( $_POST['shopurl'] )
    && $nonce_verified
) {
    $shop_url = sanitize_text_field( wp_unslash( $_POST['shopurl'] ) );
} else {
    $shop_url = $cu_slug;
}
?>


<h2><?php esc_html_e( 'Update account to Vendor', 'dokan-lite' ); ?></h2>
<form method="post" action="" class="register">

    <div class="dokan-become-seller">

        <div class="split-row form-row-wide">
            <p class="form-row form-group">
                <label for="first-name"><?php esc_html_e( 'First Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
                <input type="text" class="input-text form-control" name="fname" id="first-name" value="<?php echo esc_attr( $f_name ); ?>" required="required" />
            </p>

            <p class="form-row form-group">
                <label for="last-name"><?php esc_html_e( 'Last Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
                <input type="text" class="input-text form-control" name="lname" id="last-name" value="<?php echo esc_attr( $l_name ); ?>" required="required" />
            </p>
        </div>

        <p class="form-row form-group form-row-wide">
            <label for="company-name"><?php esc_html_e( 'Shop Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="shopname" id="company-name" value="<?php echo esc_attr( isset( $_POST['shopname'] ) ? sanitize_text_field( wp_unslash( $_POST['shopname'] ) ) : '' ); ?>" required="required" />
        </p>

        <p class="form-row form-group form-row-wide">
            <label for="seller-url" class="pull-left"><?php esc_html_e( 'Shop URL', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <strong id="url-alart-mgs" class="pull-right"></strong>
            <input type="text" class="input-text form-control" name="shopurl" id="seller-url" value="<?php echo esc_attr( $shop_url ); ?>" required="required" />
            <small><?php echo home_url() . '/' . dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ); ?>/<strong id="url-alart"></strong></small>
        </p>

        <p class="form-row form-group form-row-wide">
            <label for="shop-phone"><?php esc_html_e( 'Phone Number', 'dokan-lite' ); ?><span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="phone" id="shop-phone" value="<?php echo esc_attr( ! empty( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '' ); ?>" required="required" />
        </p>

        <?php

            /**
             * Hook for adding fields after vendor migration.
             *
             * @since DOKAN_LITE_SINCE
             */
            do_action( 'dokan_after_seller_migration_fields' );
        ?>

        <?php
        $show_toc = dokan_get_option( 'enable_tc_on_reg', 'dokan_general', 'on' );

        if ( $show_toc === 'on' ) {
            $toc_page_id = (int) dokan_get_option( 'reg_tc_page', 'dokan_pages' );
            if ( $toc_page_id !== -1 ) {
                $toc_page_url = get_permalink( $toc_page_id );
                ?>
                <p class="form-row form-group form-row-wide">
                    <input class="tc_check_box" type="checkbox" id="tc_agree" name="tc_agree" required="required">
                    <label style="display: inline" for="tc_agree">
                        <?php
                        $tc_link = sprintf( '<a target="_blank" href="%1$s">%2$s</a>', esc_url( $toc_page_url ), __( 'Terms &amp; Conditions', 'dokan-lite' ) );
                        // translators: 1. Terms and conditions of agreement link.
                        echo sprintf( __( 'I have read and agree to the %1$s.', 'dokan-lite' ), $tc_link );
                        ?>
                    </label>
                </p>
            <?php } ?>
        <?php } ?>

        <p class="form-row">
        <?php wp_nonce_field( 'account_migration', 'dokan_nonce' ); ?>
            <input type="hidden" name="user_id" value="<?php echo esc_attr( $user_id ); ?>">
            <input type="submit" class="dokan-btn dokan-btn-default" name="dokan_migration" value="<?php esc_attr_e( 'Become a Vendor', 'dokan-lite' ); ?>" />
        </p>
    </div>
</form>
