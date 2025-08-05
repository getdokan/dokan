<?php
/**
 * Withdraw Validator for Feature API
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
 * Withdraw Validator
 *
 * @since 4.0.0
 */
class WithdrawValidator {

    /**
     * Validate withdrawals list parameters
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
            $valid_orderby = [ 'date', 'ID', 'amount', 'vendor' ];
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
            $valid_statuses = [ 'pending', 'approved', 'cancelled' ];
            if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_status', __( 'Invalid status value', 'dokan-lite' ) );
            }
            $args['status'] = $context['status'];
        }

        // Validate vendor_id
        if ( isset( $context['vendor_id'] ) ) {
            $vendor_id = absint( $context['vendor_id'] );
            if ( $vendor_id <= 0 ) {
                return new \WP_Error( 'invalid_vendor_id', __( 'Invalid vendor ID', 'dokan-lite' ) );
            }
            $args['vendor_id'] = $vendor_id;
        }

        // Validate date_from
        if ( isset( $context['date_from'] ) ) {
            $date_from = sanitize_text_field( $context['date_from'] );
            if ( ! empty( $date_from ) && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ) {
                return new \WP_Error( 'invalid_date_from', __( 'Invalid date format. Use YYYY-MM-DD', 'dokan-lite' ) );
            }
            $args['date_from'] = $date_from;
        }

        // Validate date_to
        if ( isset( $context['date_to'] ) ) {
            $date_to = sanitize_text_field( $context['date_to'] );
            if ( ! empty( $date_to ) && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ) {
                return new \WP_Error( 'invalid_date_to', __( 'Invalid date format. Use YYYY-MM-DD', 'dokan-lite' ) );
            }
            $args['date_to'] = $date_to;
        }

        return $args;
    }

    /**
     * Validate withdrawal create parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_create_params( $context ) {
        $args = [];

        // Validate vendor_id (required)
        if ( ! isset( $context['vendor_id'] ) ) {
            return new \WP_Error( 'missing_vendor_id', __( 'Vendor ID is required', 'dokan-lite' ) );
        }

        $vendor_id = absint( $context['vendor_id'] );
        if ( $vendor_id <= 0 ) {
            return new \WP_Error( 'invalid_vendor_id', __( 'Invalid vendor ID', 'dokan-lite' ) );
        }
        $args['vendor_id'] = $vendor_id;

        // Validate amount (required)
        if ( ! isset( $context['amount'] ) ) {
            return new \WP_Error( 'missing_amount', __( 'Amount is required', 'dokan-lite' ) );
        }

        $amount = floatval( $context['amount'] );
        if ( $amount <= 0 ) {
            return new \WP_Error( 'invalid_amount', __( 'Amount must be greater than 0', 'dokan-lite' ) );
        }
        $args['amount'] = $amount;

        // Validate method (required)
        if ( ! isset( $context['method'] ) ) {
            return new \WP_Error( 'missing_method', __( 'Withdrawal method is required', 'dokan-lite' ) );
        }

        $method = sanitize_text_field( $context['method'] );
        if ( empty( $method ) ) {
            return new \WP_Error( 'invalid_method', __( 'Invalid withdrawal method', 'dokan-lite' ) );
        }
        $args['method'] = $method;

        // Validate note
        if ( isset( $context['note'] ) ) {
            $note = sanitize_textarea_field( $context['note'] );
            if ( strlen( $note ) > 500 ) {
                return new \WP_Error( 'invalid_note', __( 'Note must be 500 characters or less', 'dokan-lite' ) );
            }
            $args['note'] = $note;
        }

        return $args;
    }

    /**
     * Validate withdrawal update parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_update_params( $context ) {
        $args = [];

        // Validate amount
        if ( isset( $context['amount'] ) ) {
            $amount = floatval( $context['amount'] );
            if ( $amount < 0 ) {
                return new \WP_Error( 'invalid_amount', __( 'Amount must be non-negative', 'dokan-lite' ) );
            }
            $args['amount'] = $amount;
        }

        // Validate status
        if ( isset( $context['status'] ) ) {
            $valid_statuses = [ 'pending', 'approved', 'cancelled' ];
            if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_status', __( 'Invalid status value', 'dokan-lite' ) );
            }
            $args['status'] = $context['status'];
        }

        // Validate note
        if ( isset( $context['note'] ) ) {
            $note = sanitize_textarea_field( $context['note'] );
            if ( strlen( $note ) > 500 ) {
                return new \WP_Error( 'invalid_note', __( 'Note must be 500 characters or less', 'dokan-lite' ) );
            }
            $args['note'] = $note;
        }

        return $args;
    }

    /**
     * Validate withdrawal approval parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_approval_params( $context ) {
        $args = [];

        // Validate note
        if ( isset( $context['note'] ) ) {
            $note = sanitize_textarea_field( $context['note'] );
            if ( strlen( $note ) > 500 ) {
                return new \WP_Error( 'invalid_note', __( 'Note must be 500 characters or less', 'dokan-lite' ) );
            }
            $args['note'] = $note;
        }

        return $args;
    }

    /**
     * Validate withdrawal cancellation parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_cancellation_params( $context ) {
        $args = [];

        // Validate note
        if ( isset( $context['note'] ) ) {
            $note = sanitize_textarea_field( $context['note'] );
            if ( strlen( $note ) > 500 ) {
                return new \WP_Error( 'invalid_note', __( 'Note must be 500 characters or less', 'dokan-lite' ) );
            }
            $args['note'] = $note;
        }

        return $args;
    }

    /**
     * Validate vendor withdrawals parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_vendor_withdrawals_params( $context ) {
        $args = [];

        // Validate vendor_id (required)
        if ( ! isset( $context['vendor_id'] ) ) {
            return new \WP_Error( 'missing_vendor_id', __( 'Vendor ID is required', 'dokan-lite' ) );
        }

        $vendor_id = absint( $context['vendor_id'] );
        if ( $vendor_id <= 0 ) {
            return new \WP_Error( 'invalid_vendor_id', __( 'Invalid vendor ID', 'dokan-lite' ) );
        }
        $args['vendor_id'] = $vendor_id;

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

        // Validate status
        if ( isset( $context['status'] ) ) {
            $valid_statuses = [ 'pending', 'approved', 'cancelled' ];
            if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_status', __( 'Invalid status value', 'dokan-lite' ) );
            }
            $args['status'] = $context['status'];
        }

        // Validate date_from
        if ( isset( $context['date_from'] ) ) {
            $date_from = sanitize_text_field( $context['date_from'] );
            if ( ! empty( $date_from ) && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ) {
                return new \WP_Error( 'invalid_date_from', __( 'Invalid date format. Use YYYY-MM-DD', 'dokan-lite' ) );
            }
            $args['date_from'] = $date_from;
        }

        // Validate date_to
        if ( isset( $context['date_to'] ) ) {
            $date_to = sanitize_text_field( $context['date_to'] );
            if ( ! empty( $date_to ) && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ) {
                return new \WP_Error( 'invalid_date_to', __( 'Invalid date format. Use YYYY-MM-DD', 'dokan-lite' ) );
            }
            $args['date_to'] = $date_to;
        }

        return $args;
    }
} 