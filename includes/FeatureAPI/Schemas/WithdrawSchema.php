<?php
/**
 * Withdraw Schema for Feature API
 *
 * @package WeDevs\Dokan\FeatureAPI\Schemas
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Schemas;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Withdraw Schema
 *
 * @since 4.0.0
 */
class WithdrawSchema {

    /**
     * Get withdrawals list input schema
     *
     * @return array
     */
    public static function get_withdrawals_list_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'number' => [
                    'type' => 'integer',
                    'description' => __( 'Number of withdrawals to return', 'dokan-lite' ),
                    'minimum' => 1,
                    'maximum' => 100,
                    'default' => 10,
                ],
                'offset' => [
                    'type' => 'integer',
                    'description' => __( 'Number of withdrawals to skip', 'dokan-lite' ),
                    'minimum' => 0,
                    'default' => 0,
                ],
                'orderby' => [
                    'type' => 'string',
                    'description' => __( 'Order by field', 'dokan-lite' ),
                    'enum' => [ 'date', 'ID', 'amount' ],
                    'default' => 'date',
                ],
                'order' => [
                    'type' => 'string',
                    'description' => __( 'Order direction', 'dokan-lite' ),
                    'enum' => [ 'ASC', 'DESC' ],
                    'default' => 'DESC',
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => [ 'pending', 'approved', 'cancelled' ],
                    'description' => __( 'Withdrawal status', 'dokan-lite' ),
                ],
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Filter by vendor ID', 'dokan-lite' ),
                ],
                'date_from' => [
                    'type' => 'string',
                    'format' => 'date',
                    'description' => __( 'Start date (YYYY-MM-DD)', 'dokan-lite' ),
                ],
                'date_to' => [
                    'type' => 'string',
                    'format' => 'date',
                    'description' => __( 'End date (YYYY-MM-DD)', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get withdrawal create input schema
     *
     * @return array
     */
    public static function get_withdrawal_create_schema() {
        return [
            'type' => 'object',
            'required' => [ 'vendor_id', 'amount', 'method' ],
            'properties' => [
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'amount' => [
                    'type' => 'number',
                    'description' => __( 'Withdrawal amount', 'dokan-lite' ),
                    'minimum' => 0,
                ],
                'method' => [
                    'type' => 'string',
                    'description' => __( 'Withdrawal method', 'dokan-lite' ),
                ],
                'note' => [
                    'type' => 'string',
                    'description' => __( 'Withdrawal note', 'dokan-lite' ),
                    'maxLength' => 500,
                ],
            ],
        ];
    }

    /**
     * Get withdrawal update input schema
     *
     * @return array
     */
    public static function get_withdrawal_update_schema() {
        return [
            'type' => 'object',
            'required' => [ 'id' ],
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Withdrawal ID', 'dokan-lite' ),
                ],
                'amount' => [
                    'type' => 'number',
                    'description' => __( 'Withdrawal amount', 'dokan-lite' ),
                    'minimum' => 0,
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => [ 'pending', 'approved', 'cancelled' ],
                    'description' => __( 'Withdrawal status', 'dokan-lite' ),
                ],
                'note' => [
                    'type' => 'string',
                    'description' => __( 'Withdrawal note', 'dokan-lite' ),
                    'maxLength' => 500,
                ],
            ],
        ];
    }

    /**
     * Get withdrawal output schema
     *
     * @return array
     */
    public static function get_withdrawal_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Withdrawal ID', 'dokan-lite' ),
                ],
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'vendor_name' => [
                    'type' => 'string',
                    'description' => __( 'Vendor name', 'dokan-lite' ),
                ],
                'amount' => [
                    'type' => 'number',
                    'description' => __( 'Withdrawal amount', 'dokan-lite' ),
                ],
                'method' => [
                    'type' => 'string',
                    'description' => __( 'Withdrawal method', 'dokan-lite' ),
                ],
                'method_label' => [
                    'type' => 'string',
                    'description' => __( 'Withdrawal method label', 'dokan-lite' ),
                ],
                'status' => [
                    'type' => 'string',
                    'description' => __( 'Withdrawal status', 'dokan-lite' ),
                ],
                'date_created' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => __( 'Date created', 'dokan-lite' ),
                ],
                'date_modified' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => __( 'Date modified', 'dokan-lite' ),
                ],
                'note' => [
                    'type' => 'string',
                    'description' => __( 'Withdrawal note', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get withdrawals list output schema
     *
     * @return array
     */
    public static function get_withdrawals_list_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'withdrawals' => [
                    'type' => 'array',
                    'description' => __( 'List of withdrawals', 'dokan-lite' ),
                    'items' => self::get_withdrawal_output_schema(),
                ],
                'total' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of withdrawals', 'dokan-lite' ),
                ],
                'total_pages' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of pages', 'dokan-lite' ),
                ],
                'current_page' => [
                    'type' => 'integer',
                    'description' => __( 'Current page number', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get withdrawal methods output schema
     *
     * @return array
     */
    public static function get_withdrawal_methods_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'methods' => [
                    'type' => 'array',
                    'description' => __( 'List of withdrawal methods', 'dokan-lite' ),
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'key' => [
                                'type' => 'string',
                                'description' => __( 'Method key', 'dokan-lite' ),
                            ],
                            'label' => [
                                'type' => 'string',
                                'description' => __( 'Method label', 'dokan-lite' ),
                            ],
                            'enabled' => [
                                'type' => 'boolean',
                                'description' => __( 'Whether method is enabled', 'dokan-lite' ),
                            ],
                        ],
                    ],
                ],
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID (if filtered)', 'dokan-lite' ),
                ],
            ],
        ];
    }
} 