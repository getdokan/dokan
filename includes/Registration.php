<?php

namespace WeDevs\Dokan;

use WP_Error;

/**
 * Vendor Registration
 *
 * @since 2.8
 */
class Registration {

    /**
     * Nonce action marking a request as coming from Dokan's own vendor sign-up form.
     *
     * @since 5.0.19
     *
     * @var string
     */
    const VENDOR_FORM_NONCE_ACTION = 'dokan_vendor_registration_form';

    /**
     * Field carrying the vendor sign-up form marker.
     *
     * @since 5.0.19
     *
     * @var string
     */
    const VENDOR_FORM_NONCE_FIELD = 'dokan_vendor_registration_form_nonce';

    public function __construct() {
        // validate registration
        add_filter( 'woocommerce_process_registration_errors', [ $this, 'validate_registration' ] );
        add_filter( 'woocommerce_registration_errors', [ $this, 'validate_registration' ] );

        // after registration
        add_filter( 'woocommerce_new_customer_data', [ $this, 'set_new_vendor_names' ] );
        add_action( 'woocommerce_created_customer', [ $this, 'save_vendor_info' ], 10, 2 );

        // stamp the dedicated vendor form so the two sign-up forms can be told apart on submit
        add_action( 'dokan_vendor_reg_form_start', [ $this, 'render_vendor_form_marker' ] );
        add_filter( 'dokan_vendor_reg_form', [ $this, 'inject_vendor_form_marker' ] );
    }

    /**
     * Build the marker identifying Dokan's dedicated vendor sign-up form.
     *
     * @since 5.0.19
     *
     * @return string
     */
    protected function get_vendor_form_marker() {
        return wp_nonce_field( self::VENDOR_FORM_NONCE_ACTION, self::VENDOR_FORM_NONCE_FIELD, false, false );
    }

    /**
     * Print the marker identifying Dokan's dedicated vendor sign-up form.
     *
     * @since 5.0.19
     *
     * @return void
     */
    public function render_vendor_form_marker() {
        echo $this->get_vendor_form_marker(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_nonce_field() builds its own escaped markup.
    }

    /**
     * Add the marker to a rendered vendor sign-up form that did not print it itself.
     *
     * A theme override copied before the marker existed never fires the action, and the toggle would
     * then close that site's own vendor page with no way to tell why. Stamping the rendered markup
     * keeps such an override working, whatever it did to the form.
     *
     * @since 5.0.19
     *
     * @param string $content Rendered vendor sign-up markup.
     *
     * @return string
     */
    public function inject_vendor_form_marker( $content ) {
        if ( ! is_string( $content ) || false !== strpos( $content, self::VENDOR_FORM_NONCE_FIELD ) ) {
            return $content;
        }

        $closing_tag = strrpos( $content, '</form>' );

        // Onboarding renders the login form too, so only stamp markup that actually asks for a role.
        if ( false === $closing_tag || ! preg_match( '/<input[^>]+name=["\']?role["\'\s>]/i', $content ) ) {
            return $content;
        }

        // The sign-up form is the last one on both the shortcode and the onboarding layout.
        return substr_replace( $content, $this->get_vendor_form_marker(), $closing_tag, 0 );
    }

    /**
     * Roles a visitor may register as through the request being processed.
     *
     * The appearance setting only hides the vendor option in the WooCommerce form's template, so a
     * role that form never offered has to be refused server side too.
     *
     * @since 5.0.19
     *
     * @return array
     */
    public function get_allowed_registration_roles() {
        $roles = [ 'customer' ];

        // Dokan's dedicated vendor pages exist to sign vendors up, so a setting naming the WooCommerce form must not close them.
        if ( $this->is_vendor_form_request() || 'off' !== dokan_get_option( 'show_register_as_vendor', 'dokan_appearance', 'on' ) ) {
            $roles[] = 'seller';
        }

        return apply_filters( 'dokan_register_user_role', $roles );
    }

    /**
     * Whether the request was submitted from Dokan's dedicated vendor sign-up form.
     *
     * @since 5.0.19
     *
     * @return bool
     */
    protected function is_vendor_form_request() {
        // A site that turned the register-nonce check off drives its own sign-up forms; do not strand them.
        if ( ! apply_filters( 'dokan_register_nonce_check', true ) ) {
            return true;
        }

        // Only that form prints this marker, so a request that never rendered it cannot claim to be one.
        $nonce = isset( $_POST[ self::VENDOR_FORM_NONCE_FIELD ] ) ? sanitize_key( wp_unslash( $_POST[ self::VENDOR_FORM_NONCE_FIELD ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- this is the nonce check.

        return (bool) wp_verify_nonce( $nonce, self::VENDOR_FORM_NONCE_ACTION );
    }

    /**
     * Validate vendor registration
     *
     * @param \WP_Error $error
     *
     * @return \WP_Error
     */
    public function validate_registration( $error ) {
        if ( is_checkout() ) {
            return $error;
        }

        if ( defined( 'WP_CLI' ) || defined( 'REST_REQUEST' ) ) {
            return $error;
        }

        if ( ! $this->validate_nonce() ) {
            return new WP_Error( 'nonce_verification_failed', __( 'Nonce verification failed', 'dokan-lite' ) );
        }

        $allowed_roles = $this->get_allowed_registration_roles();

        // is the role name allowed or user is trying to manipulate?
        if ( empty( $_POST['role'] ) || ( ! in_array( $_POST['role'], $allowed_roles, true ) ) ) {
            return new WP_Error( 'role-error', __( 'Cheating, eh?', 'dokan-lite' ) );
        }

        $role            = sanitize_text_field( wp_unslash( $_POST['role'] ) );
        $shop_url        = isset( $_POST['shopurl'] ) ? sanitize_text_field( wp_unslash( $_POST['shopurl'] ) ) : '';
        $required_fields = apply_filters(
            'dokan_seller_registration_required_fields', [
                'fname'    => __( 'Please enter your first name.', 'dokan-lite' ),
                'lname'    => __( 'Please enter your last name.', 'dokan-lite' ),
                'phone'    => __( 'Please enter your phone number.', 'dokan-lite' ),
                'shopname' => __( 'Please provide a shop name.', 'dokan-lite' ),
                'shopurl'  => __( 'Please provide a unique shop URL.', 'dokan-lite' ),
            ]
        );

        if ( $role === 'seller' ) {
            foreach ( $required_fields as $field => $msg ) {
                $field_value = isset( $_POST[ $field ] ) ? trim( sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) ) : '';
                if ( empty( $field_value ) ) {
                    return new WP_Error( "$field-error", $msg );
                }
            }

            // Check if the shop URL already not in use.
            if ( ! empty( get_user_by( 'slug', $shop_url ) ) ) {
                return new WP_Error( 'shop-url-error', __( 'Shop URL is not available', 'dokan-lite' ) );
            }
        }

        return $error;
    }

    /**
     * Inject first and last name to WooCommerce for new vendor registraion
     *
     * @param array $data
     *
     * @return array
     */
    public function set_new_vendor_names( $data ) {
		if ( ! $this->validate_nonce() ) {
            return $data;
        }

        $allowed_roles = $this->get_allowed_registration_roles();
        $role          = ( isset( $_POST['role'] ) && in_array( $_POST['role'], $allowed_roles, true ) ) ? sanitize_text_field( wp_unslash( $_POST['role'] ) ) : 'customer';

        $data['role'] = $role;

        if ( $role !== 'seller' ) {
            return $data;
        }

        $data['first_name']    = isset( $_POST['fname'] ) ? sanitize_text_field( wp_unslash( $_POST['fname'] ) ) : '';
        $data['last_name']     = isset( $_POST['lname'] ) ? sanitize_text_field( wp_unslash( $_POST['lname'] ) ) : '';
        $data['user_nicename'] = isset( $_POST['shopurl'] ) ? sanitize_user( wp_unslash( $_POST['shopurl'] ) ) : '';

        return $data;
    }

    /**
     * Adds default dokan store settings when a new vendor registers
     *
     * @param int   $user_id
     * @param array $data
     *
     * @return void
     */
    public function save_vendor_info( $user_id, $data ) {

        if ( ! $this->validate_nonce() ) {
            return;
        }

        if ( ! isset( $data['role'] ) || $data['role'] !== 'seller' ) {
            return;
        }

        $social_profiles = [];

        foreach ( dokan_get_social_profile_fields() as $key => $item ) {
            $social_profiles[ $key ] = '';
        }

        $dokan_settings = [
            'store_name'     => isset( $_POST['shopname'] ) ? sanitize_text_field( wp_unslash( $_POST['shopname'] ) ) : '',
            'social'         => $social_profiles,
            'payment'        => [],
            'address'        => isset( $_POST['dokan_address'] ) ? wc_clean( wp_unslash( $_POST['dokan_address'] ) ) : '',
            'phone'          => isset( $_POST['phone'] ) ? dokan_sanitize_phone_number( wp_unslash( $_POST['phone'] ) ) : '',
            'show_email'     => 'no',
            'location'       => '',
            'find_address'   => '',
            'dokan_category' => '',
            'banner'         => 0,
        ];

        // Intially add values on profile completion progress bar
        $dokan_settings['profile_completion']['store_name']    = 10;
        $dokan_settings['profile_completion']['phone']         = 10;
        $dokan_settings['profile_completion']['next_todo']     = 'banner_val';
        $dokan_settings['profile_completion']['progress']      = 20;
        $dokan_settings['profile_completion']['progress_vals'] = [
            'banner_val'          => 15,
            'profile_picture_val' => 15,
            'store_name_val'      => 10,
            'address_val'         => 10,
            'phone_val'           => 10,
            'map_val'             => 15,
            'payment_method_val'  => 15,
            'social_val'          => [
                'fb'       => 4,
                'twitter'  => 2,
                'youtube'  => 2,
                'linkedin' => 2,
            ],
        ];

        $dokan_settings = $this->check_and_set_address_profile_completion( $user_id, $dokan_settings, $dokan_settings );

        update_user_meta( $user_id, 'dokan_profile_settings', $dokan_settings );
        update_user_meta( $user_id, 'dokan_store_name', $dokan_settings['store_name'] );

        do_action( 'dokan_new_seller_created', $user_id, $dokan_settings );
    }

    /**
     * Adds address profile completion value in dokan settings.
     *
     * @3.10.2
     *
     * @param int   $vendor_id
     * @param array $new_dokan_settings
     * @param array $old_profile_settings
     *
     * @return array
     */
    public function check_and_set_address_profile_completion( $vendor_id, $new_dokan_settings, $old_profile_settings ) {
        // Check address and add manually values on Profile Completion also increase progress value
        if ( ! empty( $new_dokan_settings['profile_completion']['progress_vals']['address_val'] ) ) {
            $new_dokan_settings['profile_completion']['address'] = $new_dokan_settings['profile_completion']['progress_vals']['address_val'];
        }

        if ( empty( $new_dokan_settings['address']['street_1'] ) ) {
            unset( $new_dokan_settings['profile_completion']['address'] );
        }

        if ( empty( $new_dokan_settings['address']['city'] ) && ! empty( $new_dokan_settings['profile_completion']['address'] ) ) {
            unset( $new_dokan_settings['profile_completion']['address'] );
        }

        if ( empty( $new_dokan_settings['address']['zip'] ) && ! empty( $new_dokan_settings['profile_completion']['address'] ) ) {
            unset( $new_dokan_settings['profile_completion']['address'] );
        }

        if ( empty( $new_dokan_settings['address']['country'] ) && ! empty( $new_dokan_settings['profile_completion']['address'] ) ) {
            unset( $new_dokan_settings['profile_completion']['address'] );
        } else {
            $country = isset( $new_dokan_settings['address']['country'] ) ? $new_dokan_settings['address']['country'] : '';

            if ( isset( $states[ $country ] ) && is_array( $states[ $country ] ) && empty( $new_dokan_settings['address']['state'] ) && ! empty( $new_dokan_settings['profile_completion']['address'] ) ) {
                unset( $new_dokan_settings['profile_completion']['address'] );
            }
        }

        if ( ! empty( $new_dokan_settings['profile_completion']['address'] ) ) {
            $progress = empty( $old_profile_settings['profile_completion']['progress'] ) ? 0 : $old_profile_settings['profile_completion']['progress'];
            $new_dokan_settings['profile_completion']['progress'] = $progress + $new_dokan_settings['profile_completion']['progress_vals']['address_val'];
        }

        return $new_dokan_settings;
    }

    /**
     * Validate nonce for seller registration.
     * This function checks the nonce value to ensure the request is valid and secure.
     * If the "dokan_register_nonce_check" filter returns false, the validation is bypassed,
     * third-party developers to override the nonce check if necessary.
     *
     * @return bool True if nonce is valid or validation is bypassed, false otherwise.
     */
	protected function validate_nonce() {
		if ( apply_filters( 'dokan_register_nonce_check', true ) ) {
			$nonce_value = isset( $_POST['_wpnonce'] ) ? sanitize_key( $_POST['_wpnonce'] ) : '';
			$nonce_value = isset( $_POST['woocommerce-register-nonce'] ) ? sanitize_key( $_POST['woocommerce-register-nonce'] ) : $nonce_value;

			return ! empty( $nonce_value ) && wp_verify_nonce( $nonce_value, 'woocommerce-register' );
		}

		// Bypass validation if the filter returns false
		return true;
	}
}
