<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;
use WeDevs\Dokan\Registration;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Checks and saves vendor sign-ups sent from the Vendor Registration Form block.
 *
 * The block posts through WooCommerce's registration handler; this class applies the
 * page's own form setup on top of Dokan's checks.
 *
 * @since DOKAN_SINCE
 */
class Submission implements Hookable {

    /** User meta holding the page a vendor signed up on. */
    const SIGNUP_PAGE_META = 'dokan_vreg_signup_page';

    /** Built-in rows Dokan's own required-field check reads, by row ID => posted field. */
    const DOKAN_REQUIRED_FIELDS = [
        'first_name' => 'fname',
        'last_name'  => 'lname',
        'phone'      => 'phone',
        'shop_name'  => 'shopname',
        'shop_url'   => 'shopurl',
    ];

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
        add_filter( 'dokan_seller_registration_required_fields', [ $this, 'filter_required_fields' ], 20 );
        add_filter( 'woocommerce_process_registration_errors', [ $this, 'validate' ], 20 );
        add_action( 'woocommerce_created_customer', [ $this, 'save' ], 20 );
    }

    /**
     * Get the ID of the block page a sign-up was posted from, or 0 for other forms.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_posted_page_id(): int {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the registration nonce first.
        return isset( $_POST[ FormRenderer::FORM_FIELD ] ) ? absint( wp_unslash( $_POST[ FormRenderer::FORM_FIELD ] ) ) : 0;
    }

    /**
     * Whether the sign-up was posted from the registration block.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_block_request(): bool {
        return isset( $_POST[ FormRenderer::SETUP_FIELD ] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the registration nonce first.
    }

    /**
     * Get the setup the sign-up was shown with: the block's signed copy, or for other forms the Vendor Onboarding page's block.
     *
     * The setup's `view` says how it was shown: `visitor` for the block, `myaccount` for WooCommerce's form.
     *
     * @since DOKAN_SINCE
     *
     * @return array|null Null for forms without a block setup, or when the posted setup was tampered with.
     */
    public function get_posted_setup(): ?array {
        if ( ! $this->is_block_request() ) {
            // Dokan's own forms carry the vendor-form marker; a stale copy of one keeps its old rules.
            if ( isset( $_POST[ Registration::VENDOR_FORM_NONCE_FIELD ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- presence check only.
                return null;
            }

            $master = $this->setup->get_master_setup();

            if ( $master ) {
                $master['view'] = 'myaccount';
            }

            return $master;
        }

        // phpcs:disable WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the registration nonce first.
        $payload   = isset( $_POST[ FormRenderer::SETUP_FIELD ] ) && is_string( $_POST[ FormRenderer::SETUP_FIELD ] ) ? sanitize_text_field( wp_unslash( $_POST[ FormRenderer::SETUP_FIELD ] ) ) : '';
        $signature = isset( $_POST[ FormRenderer::SIGNATURE_FIELD ] ) && is_string( $_POST[ FormRenderer::SIGNATURE_FIELD ] ) ? sanitize_text_field( wp_unslash( $_POST[ FormRenderer::SIGNATURE_FIELD ] ) ) : '';
        // phpcs:enable WordPress.Security.NonceVerification.Missing

        $page_id    = $this->get_posted_page_id();
        $attributes = $this->renderer->verify_setup( $payload, $signature, $page_id );

        if ( null === $attributes ) {
            return null;
        }

        $setup = $this->setup->build( $attributes );

        $setup['page_id']    = $page_id;
        $setup['has_block']  = true;
        $setup['attributes'] = $attributes;
        $setup['view']       = 'visitor';

        return $setup;
    }

    /**
     * Ask Dokan only for the built-in fields this page's form shows as required.
     *
     * @since DOKAN_SINCE
     *
     * @param array $fields Posted field => error message.
     *
     * @return array
     */
    public function filter_required_fields( $fields ) {
        $setup = $this->get_posted_setup();

        if ( ! $setup ) {
            return $fields;
        }

        $fields   = is_array( $fields ) ? $fields : [];
        $required = [];

        foreach ( $this->get_visible_rows( $setup, [ 'view' => $setup['view'] ] ) as $row ) {
            $field = self::DOKAN_REQUIRED_FIELDS[ $row['id'] ] ?? '';

            if ( '' !== $field && $row['required'] ) {
                /* translators: %s: field label */
                $required[ $field ] = $fields[ $field ] ?? sprintf( __( '%s is required.', 'dokan-lite' ), $row['label'] );
            }
        }

        // Keep fields add-ons require (e.g. a subscription pack); drop Dokan's built-in ones this form doesn't ask for.
        foreach ( $fields as $field => $message ) {
            if ( ! in_array( $field, self::DOKAN_REQUIRED_FIELDS, true ) ) {
                $required[ $field ] = $message;
            }
        }

        return $required;
    }

    /**
     * Check a block sign-up against its page's form setup.
     *
     * @since DOKAN_SINCE
     *
     * @param WP_Error $errors Registration errors.
     *
     * @return WP_Error
     */
    public function validate( $errors ) {
        if ( ! is_wp_error( $errors ) ) {
            return $errors;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the registration nonce first.
        if ( empty( $_POST['role'] ) || 'seller' !== $_POST['role'] ) {
            return $errors;
        }

        // Logged-in users only see a preview of the visitor form; they become vendors through the customer form.
        if ( $this->is_block_request() && is_user_logged_in() ) {
            $errors->add( 'dokan_vreg_logged_in', __( 'You are already logged in.', 'dokan-lite' ) );

            return $errors;
        }

        $setup = $this->get_posted_setup();

        if ( ! $setup ) {
            if ( $this->is_block_request() ) {
                $errors->add( 'dokan_vreg_form', __( 'This sign-up form is no longer available. Please reload the page and try again.', 'dokan-lite' ) );
            }

            return $errors;
        }

        foreach ( $this->get_visible_rows( $setup, [ 'view' => $setup['view'] ] ) as $row ) {
            $error = $this->validate_row( $row );

            if ( is_wp_error( $error ) ) {
                $errors->add( $error->get_error_code(), $error->get_error_message() );
            }
        }

        $this->validate_shop_url( $errors );

        return $errors;
    }

    /**
     * Save a block sign-up's custom answers and the page it came from.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id New user ID.
     *
     * @return void
     */
    public function save( $user_id ): void {
        $setup = $this->get_posted_setup();

        if ( ! $setup || ! dokan_is_user_seller( (int) $user_id ) ) {
            return;
        }

        $this->save_answers( (int) $user_id, $setup, [ 'view' => $setup['view'] ] );
    }

    /**
     * Save the posted custom answers of a setup for a user, and remember the sign-up page.
     *
     * @since DOKAN_SINCE
     *
     * @param int   $user_id User ID.
     * @param array $setup   Form setup.
     * @param array $context Render context the form was shown in.
     *
     * @return void
     */
    public function save_answers( int $user_id, array $setup, array $context = [] ): void {
        $posted = $this->get_posted_answers();

        foreach ( $this->get_visible_rows( $setup, $context ) as $row ) {
            if ( ! empty( $row['custom'] ) ) {
                $value = $this->sanitize_answer( $row, $posted[ $row['meta_key'] ] ?? null );

                if ( null !== $value ) {
                    update_user_meta( $user_id, $row['meta_key'], $value );
                }

                continue;
            }

            if ( is_callable( $row['save_callback'] ?? null ) ) {
                call_user_func( $row['save_callback'], $user_id, $row );
            }
        }

        update_user_meta( $user_id, self::SIGNUP_PAGE_META, (int) $setup['page_id'] );

        /**
         * Fires after a vendor's answers from the Vendor Registration Form block are saved.
         *
         * @since DOKAN_SINCE
         *
         * @param int   $user_id User ID.
         * @param array $setup   Form setup the vendor signed up with.
         */
        do_action( 'dokan_vendor_registration_answers_saved', $user_id, $setup );
    }

    /**
     * Rows the visitor saw, for the form's setup and context.
     *
     * @since DOKAN_SINCE
     *
     * @param array $setup   Form setup.
     * @param array $context Render context.
     *
     * @return array[]
     */
    public function get_visible_rows( array $setup, array $context = [] ): array {
        $context = wp_parse_args(
            $context,
            [
                'view'      => 'visitor',
                'terms_url' => $this->renderer->get_terms_url( $setup['attributes'] ?? [] ),
            ]
        );
        $rows    = [];

        foreach ( $this->renderer->get_render_steps( $setup, $context ) as $step ) {
            foreach ( $step['sections'] as $section ) {
                foreach ( $section['rows'] as $row ) {
                    $rows[] = $row;
                }
            }
        }

        return $rows;
    }

    /**
     * Validate one row the visitor saw.
     *
     * @since DOKAN_SINCE
     *
     * @param array $row Setup row.
     *
     * @return WP_Error|true
     */
    public function validate_row( array $row ) {
        // phpcs:disable WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the registration nonce first.
        if ( is_callable( $row['validate_callback'] ?? null ) ) {
            $result = call_user_func( $row['validate_callback'], $row );

            return is_wp_error( $result ) ? $result : true;
        }

        /* translators: %s: field label */
        $missing = new WP_Error( 'dokan_vreg_required_' . $row['id'], sprintf( __( '%s is required.', 'dokan-lite' ), $row['label'] ) );

        if ( ! empty( $row['custom'] ) ) {
            return $this->validate_custom_answer( $row, $this->get_posted_answers()[ $row['meta_key'] ] ?? null );
        }

        if ( 'terms' === $row['id'] ) {
            return $row['required'] && empty( $_POST['tc_agree'] )
                ? new WP_Error( 'dokan_vreg_terms', __( 'Please accept the Terms & Conditions.', 'dokan-lite' ) )
                : true;
        }

        if ( in_array( $row['id'], [ 'street_1', 'street_2', 'city', 'zip', 'country', 'state' ], true ) ) {
            $address = isset( $_POST['dokan_address'] ) && is_array( $_POST['dokan_address'] ) ? wc_clean( wp_unslash( $_POST['dokan_address'] ) ) : [];
            $value   = trim( (string) ( $address[ $row['id'] ] ?? '' ) );

            if ( 'country' === $row['id'] && '' !== $value && ! array_key_exists( $value, WC()->countries->get_allowed_countries() ) ) {
                return new WP_Error( 'dokan_vreg_country', __( 'Please choose a valid country.', 'dokan-lite' ) );
            }

            // A country without states needs no state.
            if ( 'state' === $row['id'] ) {
                $states = WC()->countries->get_states( (string) ( $address['country'] ?? '' ) );

                if ( is_array( $states ) && empty( $states ) ) {
                    return true;
                }
            }

            return $row['required'] && '' === $value ? $missing : true;
        }
        // phpcs:enable WordPress.Security.NonceVerification.Missing

        // Name, email, shop, phone, username and password are checked by Dokan and WooCommerce.
        return true;
    }

    /**
     * Validate a custom field's answer.
     *
     * @since DOKAN_SINCE
     *
     * @param array $row    Custom row.
     * @param mixed $answer Posted answer.
     *
     * @return WP_Error|true
     */
    public function validate_custom_answer( array $row, $answer ) {
        $values = array_filter( array_map( 'trim', array_map( 'strval', array_filter( (array) $answer, 'is_scalar' ) ) ), 'strlen' );

        if ( 'checkbox' === $row['type'] ) {
            $values = in_array( 'yes', $values, true ) ? [ 'yes' ] : [];
        }

        if ( empty( $values ) ) {
            /* translators: %s: field label */
            return $row['required'] ? new WP_Error( 'dokan_vreg_required_' . $row['id'], sprintf( __( '%s is required.', 'dokan-lite' ), $row['label'] ) ) : true;
        }

        $value = reset( $values );
        $valid = true;

        switch ( $row['type'] ) {
            case 'email':
                $valid = (bool) is_email( $value );
                break;

            case 'url':
                // Format only: wp_http_validate_url() would resolve the host over the network.
                $valid = false !== filter_var( $value, FILTER_VALIDATE_URL ) && in_array( wp_parse_url( $value, PHP_URL_SCHEME ), [ 'http', 'https' ], true );
                break;

            case 'number':
                $valid = is_numeric( $value );
                break;

            case 'phone':
                $valid = (bool) preg_match( '/^[0-9+\-().\s]{3,}$/', $value );
                break;

            case 'date':
                $date  = date_create_from_format( 'Y-m-d', $value );
                $valid = $date && $date->format( 'Y-m-d' ) === $value;
                break;

            case 'select':
            case 'radio':
            case 'multiselect':
                $allowed = wp_list_pluck( $row['options'], 'value' );
                $valid   = 'multiselect' === $row['type'] ? ! array_diff( $values, $allowed ) : in_array( $value, $allowed, true );
                break;
        }

        /* translators: %s: field label */
        return $valid ? true : new WP_Error( 'dokan_vreg_invalid_' . $row['id'], sprintf( __( 'Please enter a valid value for %s.', 'dokan-lite' ), $row['label'] ) );
    }

    /**
     * Sanitize a custom field's answer for storage.
     *
     * @since DOKAN_SINCE
     *
     * @param array $row    Custom row.
     * @param mixed $answer Posted answer.
     *
     * @return string|string[]|null Null when there is nothing to save.
     */
    public function sanitize_answer( array $row, $answer ) {
        if ( 'multiselect' === $row['type'] ) {
            $allowed = wp_list_pluck( $row['options'], 'value' );
            $values  = array_values( array_intersect( array_map( 'sanitize_text_field', array_map( 'strval', array_filter( (array) $answer, 'is_scalar' ) ) ), $allowed ) );

            return $values ? $values : null;
        }

        if ( 'checkbox' === $row['type'] ) {
            return in_array( 'yes', array_map( 'strval', array_filter( (array) $answer, 'is_scalar' ) ), true ) ? 'yes' : 'no';
        }

        if ( ! is_scalar( $answer ) || '' === trim( (string) $answer ) ) {
            return null;
        }

        $answer = (string) $answer;

        switch ( $row['type'] ) {
            case 'textarea':
                return sanitize_textarea_field( $answer );

            case 'email':
                return sanitize_email( $answer );

            case 'url':
                return esc_url_raw( $answer );

            default:
                return sanitize_text_field( $answer );
        }
    }

    /**
     * Get the posted custom answers keyed by meta key.
     *
     * @return array
     */
    protected function get_posted_answers(): array {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- WooCommerce verifies the nonce first; each answer is sanitized by its field type.
        $posted = isset( $_POST['dokan_vreg'] ) && is_array( $_POST['dokan_vreg'] ) ? wp_unslash( $_POST['dokan_vreg'] ) : [];

        return is_array( $posted ) ? $posted : [];
    }

    /**
     * Refuse a shop URL another user already has, compared the way WordPress will save it.
     *
     * @param WP_Error $errors Registration errors.
     *
     * @return void
     */
    protected function validate_shop_url( WP_Error $errors ): void {
        if ( in_array( 'shop-url-error', $errors->get_error_codes(), true ) ) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the registration nonce first.
        $shop_url = isset( $_POST['shopurl'] ) ? sanitize_title( sanitize_user( wp_unslash( $_POST['shopurl'] ), true ) ) : '';

        if ( '' !== $shop_url && get_user_by( 'slug', $shop_url ) ) {
            $errors->add( 'shop-url-error', __( 'Shop URL is not available', 'dokan-lite' ) );
        }
    }
}
