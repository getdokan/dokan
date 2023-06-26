<?php
/**
 * Dokan Update Customer to Vendor Template.
 *
 * @since 3.7.21
 *
 * @var int    $user_id
 * @var string $first_name
 * @var string $last_name
 * @var string $shop_url
 * @var string $show_toc
 * @var string $shop_name
 * @var string $phone
 * @var string $toc_page_id
 */
?>

<h2><?php esc_html_e( 'Update account to Vendor', 'dokan-lite' ); ?></h2>
<form method="post" action="" class="update-customer-to-vendor register">
    <div class="dokan-become-seller">
        <div class="split-row form-row-wide">
            <p class="form-row form-group">
                <label for="first-name"><?php esc_html_e( 'First Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
                <input type="text" class="input-text form-control" name="fname" id="first-name" value="<?php echo esc_attr( $first_name ); ?>" required="required" />
            </p>
            <p class="form-row form-group">
                <label for="last-name"><?php esc_html_e( 'Last Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
                <input type="text" class="input-text form-control" name="lname" id="last-name" value="<?php echo esc_attr( $last_name ); ?>" required="required" />
            </p>
        </div>

        <p class="form-row form-group form-row-wide">
            <label for="company-name"><?php esc_html_e( 'Shop Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="shopname" id="company-name" value="<?php echo esc_attr( $shop_name ); ?>" required="required" />
        </p>

        <p class="form-row form-group form-row-wide">
            <label for="seller-url" class="pull-left"><?php esc_html_e( 'Shop URL', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <strong id="url-alart-mgs" class="pull-right"></strong>
            <input type="text" class="input-text form-control" name="shopurl" id="seller-url" value="<?php echo esc_attr( $shop_url ); ?>" required="required" />
            <small><?php echo home_url() . '/' . dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ); ?>/<strong id="url-alart"></strong></small>
        </p>

        <p class="form-row form-group form-row-wide">
            <label for="shop-phone"><?php esc_html_e( 'Phone Number', 'dokan-lite' ); ?><span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="phone" id="shop-phone" value="<?php echo esc_attr( $phone ); ?>" required="required" />
        </p>

        <?php
        /**
         * Hook for adding fields after vendor migration.
         *
         * @since 3.7.21
         */
        do_action( 'dokan_after_seller_migration_fields' );

        if ( $show_toc === 'on' && ! empty( $toc_page_id ) ) {
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

        <p class="form-row">
            <?php wp_nonce_field( 'account_migration', 'dokan_nonce' ); ?>
            <input type="hidden" name="user_id" value="<?php echo esc_attr( $user_id ); ?>">
            <input type="submit" class="dokan-btn dokan-btn-default" name="dokan_migration" value="<?php esc_attr_e( 'Become a Vendor', 'dokan-lite' ); ?>" />
        </p>
    </div>
</form>

<script>
    (function($) {
        // Sanitize phone input characters.
        $( 'form.update-customer-to-vendor.register input#shop-phone' ).on( 'keydown', dokan_sanitize_phone_number );
    })(jQuery);
</script>
