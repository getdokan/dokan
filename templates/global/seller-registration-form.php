<?php
/**
 * Dokan Seller registration form
 *
 * @since 2.4
 */
?>

<div class="show_if_seller" style="<?php echo esc_attr( $role_style ); ?>">

    <div class="split-row form-row-wide">
        <p class="form-row form-group">
            <label for="first-name"><?php esc_html_e( 'First Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="fname" id="first-name" value="<?php echo ! empty( $data['fname'] ) ? esc_attr( $data['fname'] ) : ''; ?>" required="required" />
        </p>

        <p class="form-row form-group">
            <label for="last-name"><?php esc_html_e( 'Last Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
            <input type="text" class="input-text form-control" name="lname" id="last-name" value="<?php echo ! empty( $data['lname'] ) ? esc_attr( $data['lname'] ) : ''; ?>" required="required" />
        </p>
    </div>

    <p class="form-row form-group form-row-wide">
        <label for="company-name"><?php esc_html_e( 'Shop Name', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <input type="text" class="input-text form-control" name="shopname" id="company-name" value="<?php echo ! empty( $data['shopname'] ) ? esc_attr( $data['shopname'] ) : ''; ?>" required="required" />
    </p>

    <p class="form-row form-group form-row-wide">
        <label for="seller-url" class="pull-left"><?php esc_html_e( 'Shop URL', 'dokan-lite' ); ?> <span class="required">*</span></label>
        <strong id="url-alart-mgs" class="pull-right"></strong>
        <input type="text" class="input-text form-control" name="shopurl" id="seller-url" value="<?php echo ! empty( $data['shopurl'] ) ? esc_attr( $data['shopurl'] ) : ''; ?>" required="required" />
        <small><?php echo esc_url( home_url() . '/' . dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ) ); ?>/<strong id="url-alart"></strong></small>
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

    <p class="form-row form-group form-row-wide">
        <label for="shop-phone"><?php esc_html_e( 'Phone Number', 'dokan-lite' ); ?><span class="required">*</span></label>
        <input type="text" class="input-text form-control" name="phone" id="shop-phone" value="<?php echo ! empty( $data['phone'] ) ? esc_attr( $data['phone'] ) : ''; ?>" required="required" />
    </p>

    <?php
    $show_terms_condition = dokan_get_option( 'enable_tc_on_reg', 'dokan_general' );
    $terms_condition_url  = dokan_get_terms_condition_url();

    if ( 'on' === $show_terms_condition && $terms_condition_url ) {
        ?>
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
        <?php
    }
    do_action( 'dokan_seller_registration_field_after' );
    ?>
</div>

<?php do_action( 'dokan_reg_form_field' ); ?>

<p class="form-row form-group user-role vendor-customer-registration">

    <label class="radio">
        <input type="radio" name="role" value="customer"<?php checked( $role, 'customer' ); ?>>
        <?php esc_html_e( 'I am a customer', 'dokan-lite' ); ?>
    </label>
    <br/>
    <label class="radio">
        <input type="radio" name="role" value="seller"<?php checked( $role, 'seller' ); ?>>
        <?php esc_html_e( 'I am a vendor', 'dokan-lite' ); ?>
    </label>
    <?php do_action( 'dokan_registration_form_role', $role ); ?>

</p>
