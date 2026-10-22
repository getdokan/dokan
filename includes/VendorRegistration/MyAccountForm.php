<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * My Account follows the Vendor Onboarding page's block when it has one.
 *
 * "I am a vendor" draws that block's sign-up fields, and Become a Vendor goes to that page.
 *
 * @since DOKAN_SINCE
 */
class MyAccountForm implements Hookable {

    /** @var FormSetup */
    protected FormSetup $setup;

    /** @var FormRenderer */
    protected FormRenderer $renderer;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FormSetup    $setup    Form setup reader.
     * @param FormRenderer $renderer Form renderer.
     */
    public function __construct( FormSetup $setup, FormRenderer $renderer ) {
        $this->setup    = $setup;
        $this->renderer = $renderer;
    }

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        // Before Dokan's own fields (10), so they can be swapped out.
        add_action( 'woocommerce_register_form', [ $this, 'render_vendor_fields' ], 9 );
        add_action( 'template_redirect', [ $this, 'redirect_account_migration' ] );
        // Before the old migration handler (10).
        add_action( 'template_redirect', [ $this, 'refuse_legacy_migration' ], 1 );
    }

    /**
     * Refuse the old Become a Vendor form once the Vendor Onboarding page has the block.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function refuse_legacy_migration(): void {
        if ( ! isset( $_POST['dokan_migration'] ) || ! $this->setup->get_master_setup() ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- presence check only; the form is refused.
            return;
        }

        // The old handler checks this field first, so it stands down.
        unset( $_POST['dokan_migration'] );

        wc_add_notice( __( 'Please use the vendor sign-up form to become a vendor.', 'dokan-lite' ), 'notice' );
    }

    /**
     * Draw the block's sign-up fields in WooCommerce's sign-up form instead of Dokan's standard ones.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function render_vendor_fields(): void {
        $master = $this->setup->get_master_setup();

        // A site that unhooked Dokan's vendor fields from My Account keeps that choice.
        if ( ! $master || false === has_action( 'woocommerce_register_form', 'dokan_seller_reg_form_fields' ) ) {
            return;
        }

        remove_action( 'woocommerce_register_form', 'dokan_seller_reg_form_fields' );

        wp_enqueue_script( 'dokan-vendor-registration' );
        wp_enqueue_script( 'dokan-vendor-address' );
        // The block's front script keeps each field's "required" choice when Dokan's address script rebuilds the state field.
        wp_enqueue_script( generate_block_asset_handle( FormSetup::BLOCK_NAME, 'viewScript' ) );
        wp_enqueue_style( generate_block_asset_handle( FormSetup::BLOCK_NAME, 'style' ) );

        $data = dokan_get_seller_registration_form_data();
        $role = $data['role'];

        echo '<div class="show_if_seller dokan-address-fields dokan-vreg dokan-vreg--myaccount"' . ( 'customer' === $role ? ' style="display:none"' : '' ) . '>';
        echo $this->renderer->render_fields( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped while rendering.
            $master['attributes'],
            [
                'view'      => 'myaccount',
                'terms_url' => $this->renderer->get_terms_url( $master['attributes'] ),
            ]
        );
        echo '</div>';

        /** This action is documented in templates/global/seller-registration-form.php */
        do_action( 'dokan_reg_form_field' );
        ?>
        <p class="form-row form-group user-role vendor-customer-registration">
            <?php if ( 'off' !== dokan_get_option( 'show_register_as_vendor', 'dokan_appearance', 'on' ) ) : ?>
                <label class="radio">
                    <input type="radio" name="role" value="customer"<?php checked( $role, 'customer' ); ?> class="dokan-role-customer">
                    <?php esc_html_e( 'I am a customer', 'dokan-lite' ); ?>
                </label>
                <br/>
                <label class="radio">
                    <input type="radio" name="role" value="seller"<?php checked( $role, 'seller' ); ?> class="dokan-role-seller">
                    <?php esc_html_e( 'I am a vendor', 'dokan-lite' ); ?>
                </label>
            <?php else : ?>
                <input type="hidden" name="role" value="customer">
            <?php endif; ?>
            <?php
            /** This action is documented in templates/global/seller-registration-form.php */
            do_action( 'dokan_registration_form_role', $role );
            ?>
        </p>
        <?php
    }

    /**
     * Send My Account → Become a Vendor to the Vendor Onboarding page when it has the block.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function redirect_account_migration(): void {
        global $wp;

        // Dokan registers this endpoint as a plain rewrite endpoint, not a WooCommerce one.
        if ( ! function_exists( 'is_account_page' ) || ! is_account_page() || ! isset( $wp->query_vars['account-migration'] ) ) {
            return;
        }

        $url = $this->get_account_migration_redirect();

        if ( '' !== $url ) {
            wp_safe_redirect( $url );
            exit;
        }
    }

    /**
     * Where the account-migration screen sends logged-in customers, if anywhere.
     *
     * @since DOKAN_SINCE
     *
     * @return string Empty when the old screen should show.
     */
    public function get_account_migration_redirect(): string {
        if ( ! is_user_logged_in() ) {
            return '';
        }

        $master = $this->setup->get_master_setup();

        return $master ? (string) get_permalink( $master['page_id'] ) : '';
    }
}
