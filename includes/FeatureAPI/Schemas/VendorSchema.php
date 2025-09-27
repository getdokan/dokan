<?php
/**
 * Vendor Schema for Feature API
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
 * Vendor Schema
 *
 * @since 4.0.0
 */
class VendorSchema {

    /**
     * Get vendors list input schema
     *
     * @return array
     */
    public static function get_vendors_list_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'number' => [
                    'type' => 'integer',
                    'description' => __( 'Number of vendors to return', 'dokan-lite' ),
                    'minimum' => 1,
                    'maximum' => 100,
                    'default' => 10,
                ],
                'offset' => [
                    'type' => 'integer',
                    'description' => __( 'Number of vendors to skip', 'dokan-lite' ),
                    'minimum' => 0,
                    'default' => 0,
                ],
                'orderby' => [
                    'type' => 'string',
                    'description' => __( 'Order by field', 'dokan-lite' ),
                    'enum' => [ 'registered', 'display_name', 'user_login', 'user_email' ],
                    'default' => 'registered',
                ],
                'order' => [
                    'type' => 'string',
                    'description' => __( 'Order direction', 'dokan-lite' ),
                    'enum' => [ 'ASC', 'DESC' ],
                    'default' => 'DESC',
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => [ 'approved', 'pending', 'inactive' ],
                    'description' => __( 'Vendor status', 'dokan-lite' ),
                ],
                'featured' => [
                    'type' => 'boolean',
                    'description' => __( 'Filter by featured status', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get vendor create input schema
     *
     * @return array
     */
    public static function get_vendor_create_schema() {
        return [
            'type' => 'object',
            'required' => [ 'email', 'store_name' ],
            'properties' => [
                'email' => [
                    'type' => 'string',
                    'format' => 'email',
                    'description' => __( 'Vendor email address', 'dokan-lite' ),
                ],
                'store_name' => [
                    'type' => 'string',
                    'description' => __( 'Store name', 'dokan-lite' ),
                    'minLength' => 1,
                    'maxLength' => 100,
                ],
                'first_name' => [
                    'type' => 'string',
                    'description' => __( 'First name', 'dokan-lite' ),
                    'maxLength' => 50,
                ],
                'last_name' => [
                    'type' => 'string',
                    'description' => __( 'Last name', 'dokan-lite' ),
                    'maxLength' => 50,
                ],
                'phone' => [
                    'type' => 'string',
                    'description' => __( 'Phone number', 'dokan-lite' ),
                ],
                'address' => [
                    'type' => 'object',
                    'description' => __( 'Address information', 'dokan-lite' ),
                    'properties' => [
                        'street1' => [
                            'type' => 'string',
                            'description' => __( 'Street address 1', 'dokan-lite' ),
                        ],
                        'street2' => [
                            'type' => 'string',
                            'description' => __( 'Street address 2', 'dokan-lite' ),
                        ],
                        'city' => [
                            'type' => 'string',
                            'description' => __( 'City', 'dokan-lite' ),
                        ],
                        'zip' => [
                            'type' => 'string',
                            'description' => __( 'ZIP/Postal code', 'dokan-lite' ),
                        ],
                        'country' => [
                            'type' => 'string',
                            'description' => __( 'Country', 'dokan-lite' ),
                        ],
                        'state' => [
                            'type' => 'string',
                            'description' => __( 'State/Province', 'dokan-lite' ),
                        ],
                    ],
                ],
                'payment' => [
                    'type' => 'object',
                    'description' => __( 'Payment information', 'dokan-lite' ),
                    'properties' => [
                        'paypal' => [
                            'type' => 'string',
                            'description' => __( 'PayPal email', 'dokan-lite' ),
                        ],
                        'bank' => [
                            'type' => 'object',
                            'description' => __( 'Bank account details', 'dokan-lite' ),
                            'properties' => [
                                'ac_name' => [
                                    'type' => 'string',
                                    'description' => __( 'Account holder name', 'dokan-lite' ),
                                ],
                                'ac_number' => [
                                    'type' => 'string',
                                    'description' => __( 'Account number', 'dokan-lite' ),
                                ],
                                'bank_name' => [
                                    'type' => 'string',
                                    'description' => __( 'Bank name', 'dokan-lite' ),
                                ],
                                'bank_addr' => [
                                    'type' => 'string',
                                    'description' => __( 'Bank address', 'dokan-lite' ),
                                ],
                                'routing_number' => [
                                    'type' => 'string',
                                    'description' => __( 'Routing number', 'dokan-lite' ),
                                ],
                                'iban' => [
                                    'type' => 'string',
                                    'description' => __( 'IBAN', 'dokan-lite' ),
                                ],
                                'swift' => [
                                    'type' => 'string',
                                    'description' => __( 'SWIFT code', 'dokan-lite' ),
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get vendor update input schema
     *
     * @return array
     */
    public static function get_vendor_update_schema() {
        return [
            'type' => 'object',
            'required' => [ 'id' ],
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'store_name' => [
                    'type' => 'string',
                    'description' => __( 'Store name', 'dokan-lite' ),
                    'minLength' => 1,
                    'maxLength' => 100,
                ],
                'first_name' => [
                    'type' => 'string',
                    'description' => __( 'First name', 'dokan-lite' ),
                    'maxLength' => 50,
                ],
                'last_name' => [
                    'type' => 'string',
                    'description' => __( 'Last name', 'dokan-lite' ),
                    'maxLength' => 50,
                ],
                'phone' => [
                    'type' => 'string',
                    'description' => __( 'Phone number', 'dokan-lite' ),
                ],
                'address' => [
                    'type' => 'object',
                    'description' => __( 'Address information', 'dokan-lite' ),
                    'properties' => [
                        'street1' => [
                            'type' => 'string',
                            'description' => __( 'Street address 1', 'dokan-lite' ),
                        ],
                        'street2' => [
                            'type' => 'string',
                            'description' => __( 'Street address 2', 'dokan-lite' ),
                        ],
                        'city' => [
                            'type' => 'string',
                            'description' => __( 'City', 'dokan-lite' ),
                        ],
                        'zip' => [
                            'type' => 'string',
                            'description' => __( 'ZIP/Postal code', 'dokan-lite' ),
                        ],
                        'country' => [
                            'type' => 'string',
                            'description' => __( 'Country', 'dokan-lite' ),
                        ],
                        'state' => [
                            'type' => 'string',
                            'description' => __( 'State/Province', 'dokan-lite' ),
                        ],
                    ],
                ],
                'payment' => [
                    'type' => 'object',
                    'description' => __( 'Payment information', 'dokan-lite' ),
                    'properties' => [
                        'paypal' => [
                            'type' => 'string',
                            'description' => __( 'PayPal email', 'dokan-lite' ),
                        ],
                        'bank' => [
                            'type' => 'object',
                            'description' => __( 'Bank account details', 'dokan-lite' ),
                            'properties' => [
                                'ac_name' => [
                                    'type' => 'string',
                                    'description' => __( 'Account holder name', 'dokan-lite' ),
                                ],
                                'ac_number' => [
                                    'type' => 'string',
                                    'description' => __( 'Account number', 'dokan-lite' ),
                                ],
                                'bank_name' => [
                                    'type' => 'string',
                                    'description' => __( 'Bank name', 'dokan-lite' ),
                                ],
                                'bank_addr' => [
                                    'type' => 'string',
                                    'description' => __( 'Bank address', 'dokan-lite' ),
                                ],
                                'routing_number' => [
                                    'type' => 'string',
                                    'description' => __( 'Routing number', 'dokan-lite' ),
                                ],
                                'iban' => [
                                    'type' => 'string',
                                    'description' => __( 'IBAN', 'dokan-lite' ),
                                ],
                                'swift' => [
                                    'type' => 'string',
                                    'description' => __( 'SWIFT code', 'dokan-lite' ),
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get vendor search input schema
     *
     * @return array
     */
    public static function get_vendor_search_schema() {
        return [
            'type' => 'object',
            'required' => [ 'search' ],
            'properties' => [
                'search' => [
                    'type' => 'string',
                    'description' => __( 'Search term', 'dokan-lite' ),
                    'minLength' => 2,
                ],
                'number' => [
                    'type' => 'integer',
                    'description' => __( 'Number of vendors to return', 'dokan-lite' ),
                    'minimum' => 1,
                    'maximum' => 50,
                    'default' => 10,
                ],
                'offset' => [
                    'type' => 'integer',
                    'description' => __( 'Number of vendors to skip', 'dokan-lite' ),
                    'minimum' => 0,
                    'default' => 0,
                ],
            ],
        ];
    }

    /**
     * Get vendor output schema
     *
     * @return array
     */
    public static function get_vendor_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'store_name' => [
                    'type' => 'string',
                    'description' => __( 'Store name', 'dokan-lite' ),
                ],
                'email' => [
                    'type' => 'string',
                    'description' => __( 'Vendor email', 'dokan-lite' ),
                ],
                'phone' => [
                    'type' => 'string',
                    'description' => __( 'Vendor phone', 'dokan-lite' ),
                ],
                'address' => [
                    'type' => 'object',
                    'description' => __( 'Vendor address', 'dokan-lite' ),
                    'properties' => [
                        'street1' => [
                            'type' => 'string',
                            'description' => __( 'Street address 1', 'dokan-lite' ),
                        ],
                        'street2' => [
                            'type' => 'string',
                            'description' => __( 'Street address 2', 'dokan-lite' ),
                        ],
                        'city' => [
                            'type' => 'string',
                            'description' => __( 'City', 'dokan-lite' ),
                        ],
                        'zip' => [
                            'type' => 'string',
                            'description' => __( 'ZIP/Postal code', 'dokan-lite' ),
                        ],
                        'country' => [
                            'type' => 'string',
                            'description' => __( 'Country', 'dokan-lite' ),
                        ],
                        'state' => [
                            'type' => 'string',
                            'description' => __( 'State/Province', 'dokan-lite' ),
                        ],
                    ],
                ],
                'status' => [
                    'type' => 'string',
                    'description' => __( 'Vendor status', 'dokan-lite' ),
                ],
                'featured' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether vendor is featured', 'dokan-lite' ),
                ],
                'trusted' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether vendor is trusted', 'dokan-lite' ),
                ],
                'enabled' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether vendor is enabled', 'dokan-lite' ),
                ],
                'admin_commission_type' => [
                    'type' => 'string',
                    'description' => __( 'Admin commission type', 'dokan-lite' ),
                ],
                'admin_commission' => [
                    'type' => 'number',
                    'description' => __( 'Admin commission amount', 'dokan-lite' ),
                ],
                'created_at' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => __( 'Date created', 'dokan-lite' ),
                ],
                'updated_at' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => __( 'Date updated', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get vendors list output schema
     *
     * @return array
     */
    public static function get_vendors_list_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'vendors' => [
                    'type' => 'array',
                    'description' => __( 'List of vendors', 'dokan-lite' ),
                    'items' => self::get_vendor_output_schema(),
                ],
                'total' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of vendors', 'dokan-lite' ),
                ],
                'total_pages' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of pages', 'dokan-lite' ),
                ],
                'current_page' => [
                    'type' => 'integer',
                    'description' => __( 'Current page number', 'dokan-lite' ),
                ],
                'per_page' => [
                    'type' => 'integer',
                    'description' => __( 'Number of vendors per page', 'dokan-lite' ),
                ],
            ],
        ];
    }
} 