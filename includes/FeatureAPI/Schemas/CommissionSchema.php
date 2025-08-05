<?php
/**
 * Commission Schema for Feature API
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
 * Commission Schema
 *
 * @since 4.0.0
 */
class CommissionSchema {

    /**
     * Get commissions list input schema
     *
     * @return array
     */
    public static function get_commissions_list_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'number' => [
                    'type' => 'integer',
                    'description' => __( 'Number of commissions to return', 'dokan-lite' ),
                    'minimum' => 1,
                    'maximum' => 100,
                    'default' => 10,
                ],
                'offset' => [
                    'type' => 'integer',
                    'description' => __( 'Number of commissions to skip', 'dokan-lite' ),
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
                    'description' => __( 'Commission status', 'dokan-lite' ),
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
     * Get commission update input schema
     *
     * @return array
     */
    public static function get_commission_update_schema() {
        return [
            'type' => 'object',
            'required' => [ 'id' ],
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Commission ID', 'dokan-lite' ),
                ],
                'amount' => [
                    'type' => 'number',
                    'description' => __( 'Commission amount', 'dokan-lite' ),
                    'minimum' => 0,
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => [ 'pending', 'approved', 'cancelled' ],
                    'description' => __( 'Commission status', 'dokan-lite' ),
                ],
                'note' => [
                    'type' => 'string',
                    'description' => __( 'Commission note', 'dokan-lite' ),
                    'maxLength' => 500,
                ],
            ],
        ];
    }

    /**
     * Get commission output schema
     *
     * @return array
     */
    public static function get_commission_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Commission ID', 'dokan-lite' ),
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
                    'description' => __( 'Commission amount', 'dokan-lite' ),
                ],
                'method' => [
                    'type' => 'string',
                    'description' => __( 'Withdrawal method', 'dokan-lite' ),
                ],
                'status' => [
                    'type' => 'string',
                    'description' => __( 'Commission status', 'dokan-lite' ),
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
                    'description' => __( 'Commission note', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get commissions list output schema
     *
     * @return array
     */
    public static function get_commissions_list_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'commissions' => [
                    'type' => 'array',
                    'description' => __( 'List of commissions', 'dokan-lite' ),
                    'items' => self::get_commission_output_schema(),
                ],
                'total' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of commissions', 'dokan-lite' ),
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
     * Get commission summary output schema
     *
     * @return array
     */
    public static function get_commission_summary_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'total_commission' => [
                    'type' => 'number',
                    'description' => __( 'Total commission amount', 'dokan-lite' ),
                ],
                'pending_commission' => [
                    'type' => 'number',
                    'description' => __( 'Pending commission amount', 'dokan-lite' ),
                ],
                'approved_commission' => [
                    'type' => 'number',
                    'description' => __( 'Approved commission amount', 'dokan-lite' ),
                ],
                'cancelled_commission' => [
                    'type' => 'number',
                    'description' => __( 'Cancelled commission amount', 'dokan-lite' ),
                ],
                'period' => [
                    'type' => 'object',
                    'description' => __( 'Date period', 'dokan-lite' ),
                    'properties' => [
                        'from' => [
                            'type' => 'string',
                            'format' => 'date',
                            'description' => __( 'Start date', 'dokan-lite' ),
                        ],
                        'to' => [
                            'type' => 'string',
                            'format' => 'date',
                            'description' => __( 'End date', 'dokan-lite' ),
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