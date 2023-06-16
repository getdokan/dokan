<?php

namespace WeDevs\Dokan\Frontend\MyAccount;

/**
 * Dokan Become Vendor Class.
 *
 * @since DOKAN_SINCE
 *
 * @package dokan
 */
class BecomeVendor {
    /**
     * Class Constructor.
     *
     * @since DOKAN_SINCE
     */
    public function __construct() {
        $this->init_hooks();
    }

    /**
     * Init Hooks Method.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function init_hooks() {
        add_action( 'template_redirect', [ $this, 'become_a_seller_form_handler' ] );
        add_action( 'woocommerce_after_my_account', [ $this, 'render_become_a_vendor_section' ] );
        add_action( 'woocommerce_account_account-migration_endpoint', [ $this, 'load_customer_to_vendor_update_template' ] );

        // Remove "become a vendor" feature from older version of Dokan Pro.
        add_action( 'init', [ $this, 'remove_account_update_feature_from_dokan_pro' ], 5 );
    }

    /**
     * Remove Account Update Feature from Dokan Pro.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function remove_account_update_feature_from_dokan_pro() {
        // If Dokan Pro plugin activated.
        if ( ! defined( 'DOKAN_PRO_PLUGIN_VERSION' ) ) {
            return;
        }

        // If currently activated Dokan Pro version below "3.7.25".
        if ( version_compare( DOKAN_PRO_PLUGIN_VERSION, '3.7.25', '>=' ) ) {
            return;
        }

        // Remove actions related to Dokan Pro "Become A Vendor" feature.
        remove_action( 'init', [ dokan_pro(), 'account_migration_endpoint' ] );
        remove_action( 'woocommerce_account_account-migration_endpoint', [ dokan_pro(), 'account_migration' ] );
        remove_action( 'woocommerce_after_my_account', [ dokan_pro(), 'dokan_account_migration_button' ] );
    }

    /**
     * Become A Seller Form Handler.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function become_a_seller_form_handler() {
        if ( ! isset( $_POST['dokan_migration'] ) || ! isset( $_POST['dokan_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['dokan_nonce'] ) ), 'account_migration' ) ) {
            return;
        }

        $user   = get_userdata( get_current_user_id() );
        $errors = [];

        if ( ! $user ) {
            wc_add_notice( __( 'You need to login before applying for vendor.', 'dokan' ), 'error' );
            return;
        }

        if ( dokan_is_user_seller( $user->ID ) ) {
            wc_add_notice( __( 'You are already a vendor.', 'dokan' ), 'error' );
            return;
        }

        $required_field_checks = apply_filters(
            'dokan_customer_migration_required_fields',
            [
                'fname'    => __( 'Enter your first name', 'dokan' ),
                'shopname' => __( 'Enter your shop name', 'dokan' ),
                'phone'    => __( 'Enter your phone number', 'dokan' ),
            ]
        );

        foreach ( $required_field_checks as $field => $error ) {
            if ( empty( sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) ) ) {
                $errors[] = $error;
                wc_add_notice( $error, 'error' );
            }
        }

        if ( $errors ) {
            return;
        }

        dokan_user_update_to_seller(
            $user, [
                'fname'    => isset( $_POST['fname'] ) ? sanitize_text_field( wp_unslash( $_POST['fname'] ) ) : '',
                'lname'    => isset( $_POST['lname'] ) ? sanitize_text_field( wp_unslash( $_POST['lname'] ) ) : '',
                'shopname' => isset( $_POST['shopname'] ) ? sanitize_text_field( wp_unslash( $_POST['shopname'] ) ) : '',
                'address'  => isset( $_POST['address'] ) ? sanitize_text_field( wp_unslash( $_POST['address'] ) ) : '',
                'phone'    => isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '',
                'shopurl'  => isset( $_POST['shopurl'] ) ? sanitize_text_field( wp_unslash( $_POST['shopurl'] ) ) : '',
            ]
        );

        $url = dokan_get_navigation_url();

        if ( 'off' === dokan_get_option( 'disable_welcome_wizard', 'dokan_selling', 'off' ) ) {
            $url = apply_filters( 'dokan_seller_setup_wizard_url', site_url( '?page=dokan-seller-setup' ) );
        }

        wp_safe_redirect( apply_filters( 'dokan_customer_migration_redirect', $url ) );
        exit();
    }

    /**
     * Render Become A Vendor Section.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function render_become_a_vendor_section() {
        // If user is already a seller.
        if ( dokan_is_user_seller( get_current_user_id() ) ) {
            return;
        }

        dokan_get_template_part( 'account/become-a-vendor-section', '' );
    }

    /**
     * Load Customer to Vendor Update Form Template.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function load_customer_to_vendor_update_template() {
        dokan_get_template_part( 'account/update-customer-to-vendor', '' );
    }
}
