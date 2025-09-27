<?php
/**
 * Order Validator for Feature API
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
 * Order Validator
 *
 * @since 4.0.0
 */
class OrderValidator {

    /**
     * Validate orders list parameters
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
            $valid_orderby = [ 'date', 'ID', 'title', 'total' ];
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
            $valid_statuses = [ 'pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed' ];
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
     * Validate order status update parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_status_update_params( $context ) {
        $args = [];

        // Validate ID (required)
        if ( empty( $context['id'] ) ) {
            return new \WP_Error( 'missing_id', __( 'Order ID is required', 'dokan-lite' ) );
        }
        $order_id = absint( $context['id'] );
        if ( $order_id <= 0 ) {
            return new \WP_Error( 'invalid_id', __( 'Invalid order ID', 'dokan-lite' ) );
        }
        $args['id'] = $order_id;

        // Validate status (required)
        if ( empty( $context['status'] ) ) {
            return new \WP_Error( 'missing_status', __( 'Order status is required', 'dokan-lite' ) );
        }
        $valid_statuses = [ 'pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed' ];
        if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
            return new \WP_Error( 'invalid_status', __( 'Invalid order status', 'dokan-lite' ) );
        }
        $args['status'] = $context['status'];

        // Validate note
        if ( isset( $context['note'] ) ) {
            $args['note'] = sanitize_textarea_field( $context['note'] );
            if ( strlen( $args['note'] ) > 500 ) {
                return new \WP_Error( 'note_too_long', __( 'Note cannot exceed 500 characters', 'dokan-lite' ) );
            }
        }

        return $args;
    }

    /**
     * Validate order commission update parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_commission_update_params( $context ) {
        $args = [];

        // Validate ID (required)
        if ( empty( $context['id'] ) ) {
            return new \WP_Error( 'missing_id', __( 'Order ID is required', 'dokan-lite' ) );
        }
        $order_id = absint( $context['id'] );
        if ( $order_id <= 0 ) {
            return new \WP_Error( 'invalid_id', __( 'Invalid order ID', 'dokan-lite' ) );
        }
        $args['id'] = $order_id;

        // Validate commission (required)
        if ( ! isset( $context['commission'] ) ) {
            return new \WP_Error( 'missing_commission', __( 'Commission amount is required', 'dokan-lite' ) );
        }
        $commission = floatval( $context['commission'] );
        if ( $commission < 0 ) {
            return new \WP_Error( 'negative_commission', __( 'Commission cannot be negative', 'dokan-lite' ) );
        }
        $args['commission'] = $commission;

        // Validate note
        if ( isset( $context['note'] ) ) {
            $args['note'] = sanitize_textarea_field( $context['note'] );
            if ( strlen( $args['note'] ) > 500 ) {
                return new \WP_Error( 'note_too_long', __( 'Note cannot exceed 500 characters', 'dokan-lite' ) );
            }
        }

        return $args;
    }

    /**
     * Validate vendor orders parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_vendor_orders_params( $context ) {
        $args = [];

        // Validate vendor_id (required)
        if ( empty( $context['vendor_id'] ) ) {
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
            $valid_statuses = [ 'pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed' ];
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