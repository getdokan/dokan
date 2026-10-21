<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;
use WP_Error;
use WP_User;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Turns a logged-in customer into a vendor from the Vendor Registration Form block.
 *
 * @since DOKAN_SINCE
 */
class CustomerUpgrade implements Hookable {

    /** @var Submission */
    protected Submission $submission;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param Submission $submission Sign-up checks.
     */
    public function __construct( Submission $submission ) {
        $this->submission = $submission;
    }

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'template_redirect', [ $this, 'handle' ], 5 );
    }

    /**
     * Handle a "Become a Vendor" submit from the block.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function handle(): void {
        if ( ! isset( $_POST[ FormRenderer::CUSTOMER_SUBMIT ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- checked in upgrade().
            return;
        }

        $result = $this->upgrade( wp_get_current_user() );

        if ( is_wp_error( $result ) ) {
            foreach ( $result->get_error_messages() as $message ) {
                wc_add_notice( $message, 'error' );
            }

            return;
        }

        $url = dokan_get_navigation_url();

        if ( 'off' === dokan_get_option( 'disable_welcome_wizard', 'dokan_selling', 'off' ) ) {
            /** This filter is documented in includes/Vendor/SetupWizard.php */
            $url = apply_filters( 'dokan_seller_setup_wizard_url', site_url( '?page=dokan-seller-setup' ) );
        }

        /** This filter is documented in includes/Frontend/MyAccount/BecomeAVendor.php */
        wp_safe_redirect( apply_filters( 'dokan_customer_migration_redirect', $url ) );
        exit;
    }

    /**
     * Check the posted form and make the customer a vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_User $user Current user.
     *
     * @return true|WP_Error
     */
    public function upgrade( WP_User $user ) {
        // phpcs:disable WordPress.Security.NonceVerification.Missing -- the nonce is checked first below.
        $nonce = isset( $_POST[ FormRenderer::CUSTOMER_NONCE ] ) ? sanitize_key( wp_unslash( $_POST[ FormRenderer::CUSTOMER_NONCE ] ) ) : '';

        if ( ! $nonce || ! wp_verify_nonce( $nonce, FormRenderer::CUSTOMER_SUBMIT ) ) {
            return new WP_Error( 'dokan_vreg_nonce', __( 'Your session expired. Please reload the page and try again.', 'dokan-lite' ) );
        }

        if ( ! $user->exists() ) {
            return new WP_Error( 'dokan_vreg_login', __( 'You need to log in before becoming a vendor.', 'dokan-lite' ) );
        }

        // dokan_user_update_to_seller() replaces every role, so privileged users are refused, as in the block's preview.
        if ( dokan_is_user_seller( $user->ID ) || user_can( $user, 'edit_others_pages' ) ) {
            return new WP_Error( 'dokan_vreg_role', __( 'Only customers can become vendors from this form.', 'dokan-lite' ) );
        }

        // Same spam trap as the visitor form.
        if ( ! empty( $_POST['email_2'] ) ) {
            return new WP_Error( 'dokan_vreg_spam', __( 'Your sign-up could not be processed.', 'dokan-lite' ) );
        }

        $setup = $this->submission->is_block_request() ? $this->submission->get_posted_setup() : null;

        if ( ! $setup ) {
            return new WP_Error( 'dokan_vreg_form', __( 'This sign-up form is no longer available. Please reload the page and try again.', 'dokan-lite' ) );
        }

        $context = [ 'view' => 'customer' ];
        $errors  = new WP_Error();

        foreach ( $this->submission->get_visible_rows( $setup, $context ) as $row ) {
            $field = Submission::DOKAN_REQUIRED_FIELDS[ $row['id'] ] ?? '';

            // Built-in fields Dokan's own form requires; the WooCommerce handler isn't involved here.
            if ( '' !== $field && $row['required'] && '' === trim( isset( $_POST[ $field ] ) && is_string( $_POST[ $field ] ) ? sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) : '' ) ) {
                /* translators: %s: field label */
                $errors->add( 'dokan_vreg_required_' . $row['id'], sprintf( __( '%s is required.', 'dokan-lite' ), $row['label'] ) );
                continue;
            }

            $result = $this->submission->validate_row( $row );

            if ( is_wp_error( $result ) ) {
                $errors->add( $result->get_error_code(), $result->get_error_message() );
            }
        }

        // Fields add-ons require, e.g. a subscription pack; Submission keeps them when narrowing Dokan's list.
        /** This filter is documented in includes/Registration.php */
        $required = (array) apply_filters( 'dokan_seller_registration_required_fields', [] );
        /** This filter is documented in includes/Frontend/MyAccount/BecomeAVendor.php */
        $required = array_merge( (array) apply_filters( 'dokan_customer_migration_required_fields', [] ), $required );

        foreach ( $required as $field => $message ) {
            if ( in_array( $field, Submission::DOKAN_REQUIRED_FIELDS, true ) || ! empty( $_POST[ $field ] ) ) {
                continue;
            }

            $errors->add( 'dokan_vreg_required_' . sanitize_key( $field ), (string) $message );
        }

        $shop_url = isset( $_POST['shopurl'] ) && is_string( $_POST['shopurl'] ) ? sanitize_title( sanitize_user( wp_unslash( $_POST['shopurl'] ), true ) ) : '';
        $owner    = '' !== $shop_url ? get_user_by( 'slug', $shop_url ) : false;

        if ( '' === $shop_url ) {
            // Typed characters can all be stripped; never fall back to another URL silently.
            $errors->add( 'shop-url-error', __( 'Please enter a valid shop URL.', 'dokan-lite' ) );
        } elseif ( $owner && $owner->ID !== $user->ID ) {
            // The customer's own current nicename is theirs to keep.
            $errors->add( 'shop-url-error', __( 'Shop URL is not available', 'dokan-lite' ) );
        }

        /**
         * Filter the errors of a customer becoming a vendor from the registration block.
         *
         * @since DOKAN_SINCE
         *
         * @param WP_Error $errors Errors.
         * @param WP_User  $user   Customer.
         * @param array    $setup  Form setup.
         */
        $errors = apply_filters( 'dokan_vendor_registration_customer_errors', $errors, $user, $setup );

        if ( is_wp_error( $errors ) && $errors->has_errors() ) {
            return $errors;
        }

        dokan_user_update_to_seller(
            $user,
            [
                'fname'    => isset( $_POST['fname'] ) && is_string( $_POST['fname'] ) ? sanitize_text_field( wp_unslash( $_POST['fname'] ) ) : $user->first_name,
                'lname'    => isset( $_POST['lname'] ) && is_string( $_POST['lname'] ) ? sanitize_text_field( wp_unslash( $_POST['lname'] ) ) : $user->last_name,
                'shopname' => isset( $_POST['shopname'] ) && is_string( $_POST['shopname'] ) ? sanitize_text_field( wp_unslash( $_POST['shopname'] ) ) : '',
                'address'  => isset( $_POST['dokan_address'] ) && is_array( $_POST['dokan_address'] ) ? wc_clean( wp_unslash( $_POST['dokan_address'] ) ) : '',
                'phone'    => isset( $_POST['phone'] ) && is_string( $_POST['phone'] ) ? dokan_sanitize_phone_number( wp_unslash( $_POST['phone'] ) ) : '',
                'shopurl'  => $shop_url,
            ]
        );
        // phpcs:enable WordPress.Security.NonceVerification.Missing

        $this->submission->save_answers( $user->ID, $setup, $context );

        /**
         * Fires after a customer became a vendor from the registration block.
         *
         * Add-ons that save their sign-up fields on `woocommerce_created_customer` hook in here for this path.
         *
         * @since DOKAN_SINCE
         *
         * @param int   $user_id User ID.
         * @param array $setup   Form setup.
         */
        do_action( 'dokan_vendor_registration_customer_upgraded', $user->ID, $setup );

        return true;
    }
}
