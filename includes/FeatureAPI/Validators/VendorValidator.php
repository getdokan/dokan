<?php
/**
 * Vendor Validator for Feature API
 *
 * @package WeDevs\Dokan\FeatureAPI\Validators
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Validators;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Vendor Validator
 *
 * @since 4.0.0
 */
class VendorValidator {

    /**
     * Validate list parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_list_params( $context ) {
        $args = [];

        // Validate number
        if ( isset( $context['number'] ) ) {
            $number = absint( $context['number'] );
            if ( $number < 1 || $number > 100 ) {
                return new \WP_Error( 'invalid_number', __( 'Number must be between 1 and 100', 'dokan-lite' ) );
            }
            $args['number'] = $number;
        }

        // Validate offset
        if ( isset( $context['offset'] ) ) {
            $offset = absint( $context['offset'] );
            if ( $offset < 0 ) {
                return new \WP_Error( 'invalid_offset', __( 'Offset must be non-negative', 'dokan-lite' ) );
            }
            $args['offset'] = $offset;
        }

        // Validate orderby
        if ( isset( $context['orderby'] ) ) {
            $valid_orderby = [ 'registered', 'display_name', 'user_login', 'user_email' ];
            if ( ! in_array( $context['orderby'], $valid_orderby, true ) ) {
                return new \WP_Error( 'invalid_orderby', __( 'Invalid orderby value', 'dokan-lite' ) );
            }
            $args['orderby'] = $context['orderby'];
        }

        // Validate order
        if ( isset( $context['order'] ) ) {
            $valid_order = [ 'ASC', 'DESC' ];
            if ( ! in_array( strtoupper( $context['order'] ), $valid_order, true ) ) {
                return new \WP_Error( 'invalid_order', __( 'Invalid order value', 'dokan-lite' ) );
            }
            $args['order'] = strtoupper( $context['order'] );
        }

        // Validate status
        if ( isset( $context['status'] ) ) {
            $valid_statuses = [ 'approved', 'pending', 'inactive' ];
            if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_status', __( 'Invalid status value', 'dokan-lite' ) );
            }
            $args['status'] = $context['status'];
        }

        // Validate featured
        if ( isset( $context['featured'] ) ) {
            $args['featured'] = (bool) $context['featured'];
        }

        return $args;
    }

    /**
     * Validate create parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_create_params( $context ) {
        $args = [];

        // Validate email
        if ( empty( $context['email'] ) ) {
            return new \WP_Error( 'missing_email', __( 'Email is required', 'dokan-lite' ) );
        }

        $email = sanitize_email( $context['email'] );
        if ( ! is_email( $email ) ) {
            return new \WP_Error( 'invalid_email', __( 'Invalid email address', 'dokan-lite' ) );
        }

        if ( email_exists( $email ) ) {
            return new \WP_Error( 'email_exists', __( 'Email already exists', 'dokan-lite' ) );
        }

        $args['email'] = $email;

        // Validate store_name
        if ( empty( $context['store_name'] ) ) {
            return new \WP_Error( 'missing_store_name', __( 'Store name is required', 'dokan-lite' ) );
        }

        $store_name = sanitize_text_field( $context['store_name'] );
        if ( strlen( $store_name ) > 100 ) {
            return new \WP_Error( 'invalid_store_name', __( 'Store name must be 100 characters or less', 'dokan-lite' ) );
        }

        $args['store_name'] = $store_name;

        // Validate first_name
        if ( isset( $context['first_name'] ) ) {
            $first_name = sanitize_text_field( $context['first_name'] );
            if ( strlen( $first_name ) > 50 ) {
                return new \WP_Error( 'invalid_first_name', __( 'First name must be 50 characters or less', 'dokan-lite' ) );
            }
            $args['first_name'] = $first_name;
        }

        // Validate last_name
        if ( isset( $context['last_name'] ) ) {
            $last_name = sanitize_text_field( $context['last_name'] );
            if ( strlen( $last_name ) > 50 ) {
                return new \WP_Error( 'invalid_last_name', __( 'Last name must be 50 characters or less', 'dokan-lite' ) );
            }
            $args['last_name'] = $last_name;
        }

        // Validate phone
        if ( isset( $context['phone'] ) ) {
            $args['phone'] = sanitize_text_field( $context['phone'] );
        }

        // Validate address
        if ( isset( $context['address'] ) && is_array( $context['address'] ) ) {
            $address = [];
            $address_fields = [ 'street1', 'street2', 'city', 'zip', 'country', 'state' ];
            
            foreach ( $address_fields as $field ) {
                if ( isset( $context['address'][ $field ] ) ) {
                    $address[ $field ] = sanitize_text_field( $context['address'][ $field ] );
                }
            }
            
            $args['address'] = $address;
        }

        // Validate payment
        if ( isset( $context['payment'] ) && is_array( $context['payment'] ) ) {
            $payment = [];
            
            // Validate PayPal email
            if ( isset( $context['payment']['paypal'] ) ) {
                $paypal_email = sanitize_email( $context['payment']['paypal'] );
                if ( ! empty( $paypal_email ) && ! is_email( $paypal_email ) ) {
                    return new \WP_Error( 'invalid_paypal_email', __( 'Invalid PayPal email address', 'dokan-lite' ) );
                }
                $payment['paypal'] = $paypal_email;
            }

            // Validate bank details
            if ( isset( $context['payment']['bank'] ) && is_array( $context['payment']['bank'] ) ) {
                $bank = [];
                $bank_fields = [ 'ac_name', 'ac_number', 'bank_name', 'bank_addr', 'routing_number', 'iban', 'swift' ];
                
                foreach ( $bank_fields as $field ) {
                    if ( isset( $context['payment']['bank'][ $field ] ) ) {
                        $bank[ $field ] = sanitize_text_field( $context['payment']['bank'][ $field ] );
                    }
                }
                
                $payment['bank'] = $bank;
            }
            
            $args['payment'] = $payment;
        }

        return $args;
    }

    /**
     * Validate update parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_update_params( $context ) {
        $args = [];

        // Validate store_name
        if ( isset( $context['store_name'] ) ) {
            $store_name = sanitize_text_field( $context['store_name'] );
            if ( strlen( $store_name ) > 100 ) {
                return new \WP_Error( 'invalid_store_name', __( 'Store name must be 100 characters or less', 'dokan-lite' ) );
            }
            $args['store_name'] = $store_name;
        }

        // Validate first_name
        if ( isset( $context['first_name'] ) ) {
            $first_name = sanitize_text_field( $context['first_name'] );
            if ( strlen( $first_name ) > 50 ) {
                return new \WP_Error( 'invalid_first_name', __( 'First name must be 50 characters or less', 'dokan-lite' ) );
            }
            $args['first_name'] = $first_name;
        }

        // Validate last_name
        if ( isset( $context['last_name'] ) ) {
            $last_name = sanitize_text_field( $context['last_name'] );
            if ( strlen( $last_name ) > 50 ) {
                return new \WP_Error( 'invalid_last_name', __( 'Last name must be 50 characters or less', 'dokan-lite' ) );
            }
            $args['last_name'] = $last_name;
        }

        // Validate phone
        if ( isset( $context['phone'] ) ) {
            $args['phone'] = sanitize_text_field( $context['phone'] );
        }

        // Validate address
        if ( isset( $context['address'] ) && is_array( $context['address'] ) ) {
            $address = [];
            $address_fields = [ 'street1', 'street2', 'city', 'zip', 'country', 'state' ];
            
            foreach ( $address_fields as $field ) {
                if ( isset( $context['address'][ $field ] ) ) {
                    $address[ $field ] = sanitize_text_field( $context['address'][ $field ] );
                }
            }
            
            $args['address'] = $address;
        }

        // Validate payment
        if ( isset( $context['payment'] ) && is_array( $context['payment'] ) ) {
            $payment = [];
            
            // Validate PayPal email
            if ( isset( $context['payment']['paypal'] ) ) {
                $paypal_email = sanitize_email( $context['payment']['paypal'] );
                if ( ! empty( $paypal_email ) && ! is_email( $paypal_email ) ) {
                    return new \WP_Error( 'invalid_paypal_email', __( 'Invalid PayPal email address', 'dokan-lite' ) );
                }
                $payment['paypal'] = $paypal_email;
            }

            // Validate bank details
            if ( isset( $context['payment']['bank'] ) && is_array( $context['payment']['bank'] ) ) {
                $bank = [];
                $bank_fields = [ 'ac_name', 'ac_number', 'bank_name', 'bank_addr', 'routing_number', 'iban', 'swift' ];
                
                foreach ( $bank_fields as $field ) {
                    if ( isset( $context['payment']['bank'][ $field ] ) ) {
                        $bank[ $field ] = sanitize_text_field( $context['payment']['bank'][ $field ] );
                    }
                }
                
                $payment['bank'] = $bank;
            }
            
            $args['payment'] = $payment;
        }

        return $args;
    }

    /**
     * Validate search parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_search_params( $context ) {
        $args = [];

        // Validate search term
        if ( empty( $context['search'] ) ) {
            return new \WP_Error( 'missing_search', __( 'Search term is required', 'dokan-lite' ) );
        }

        $search = sanitize_text_field( $context['search'] );
        if ( strlen( $search ) < 2 ) {
            return new \WP_Error( 'invalid_search', __( 'Search term must be at least 2 characters', 'dokan-lite' ) );
        }

        $args['search'] = $search;

        // Validate number
        if ( isset( $context['number'] ) ) {
            $number = absint( $context['number'] );
            if ( $number < 1 || $number > 50 ) {
                return new \WP_Error( 'invalid_number', __( 'Number must be between 1 and 50', 'dokan-lite' ) );
            }
            $args['number'] = $number;
        }

        // Validate offset
        if ( isset( $context['offset'] ) ) {
            $offset = absint( $context['offset'] );
            if ( $offset < 0 ) {
                return new \WP_Error( 'invalid_offset', __( 'Offset must be non-negative', 'dokan-lite' ) );
            }
            $args['offset'] = $offset;
        }

        return $args;
    }
} 