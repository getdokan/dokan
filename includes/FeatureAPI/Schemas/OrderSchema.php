<?php
/**
 * Order Schema for Feature API
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
 * Order Schema
 *
 * @since 4.0.0
 */
class OrderSchema {

    /**
     * Get orders list input schema
     *
     * @return array
     */
    public static function get_orders_list_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'number' => [
                    'type' => 'integer',
                    'description' => __( 'Number of orders to return', 'dokan-lite' ),
                    'minimum' => 1,
                    'maximum' => 100,
                    'default' => 10,
                ],
                'offset' => [
                    'type' => 'integer',
                    'description' => __( 'Number of orders to skip', 'dokan-lite' ),
                    'minimum' => 0,
                    'default' => 0,
                ],
                'orderby' => [
                    'type' => 'string',
                    'description' => __( 'Order by field', 'dokan-lite' ),
                    'enum' => [ 'date', 'ID', 'title', 'total' ],
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
                    'enum' => [ 'pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed' ],
                    'description' => __( 'Order status', 'dokan-lite' ),
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
     * Get order output schema
     *
     * @return array
     */
    public static function get_order_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => __( 'Order ID', 'dokan-lite' ),
                ],
                'number' => [
                    'type' => 'string',
                    'description' => __( 'Order number', 'dokan-lite' ),
                ],
                'status' => [
                    'type' => 'string',
                    'description' => __( 'Order status', 'dokan-lite' ),
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
                'total' => [
                    'type' => 'string',
                    'description' => __( 'Order total', 'dokan-lite' ),
                ],
                'subtotal' => [
                    'type' => 'string',
                    'description' => __( 'Order subtotal', 'dokan-lite' ),
                ],
                'tax_total' => [
                    'type' => 'string',
                    'description' => __( 'Tax total', 'dokan-lite' ),
                ],
                'shipping_total' => [
                    'type' => 'string',
                    'description' => __( 'Shipping total', 'dokan-lite' ),
                ],
                'discount_total' => [
                    'type' => 'string',
                    'description' => __( 'Discount total', 'dokan-lite' ),
                ],
                'currency' => [
                    'type' => 'string',
                    'description' => __( 'Order currency', 'dokan-lite' ),
                ],
                'payment_method' => [
                    'type' => 'string',
                    'description' => __( 'Payment method', 'dokan-lite' ),
                ],
                'payment_method_title' => [
                    'type' => 'string',
                    'description' => __( 'Payment method title', 'dokan-lite' ),
                ],
                'billing' => [
                    'type' => 'object',
                    'description' => __( 'Billing address', 'dokan-lite' ),
                    'properties' => [
                        'first_name' => [
                            'type' => 'string',
                            'description' => __( 'First name', 'dokan-lite' ),
                        ],
                        'last_name' => [
                            'type' => 'string',
                            'description' => __( 'Last name', 'dokan-lite' ),
                        ],
                        'company' => [
                            'type' => 'string',
                            'description' => __( 'Company', 'dokan-lite' ),
                        ],
                        'address_1' => [
                            'type' => 'string',
                            'description' => __( 'Address line 1', 'dokan-lite' ),
                        ],
                        'address_2' => [
                            'type' => 'string',
                            'description' => __( 'Address line 2', 'dokan-lite' ),
                        ],
                        'city' => [
                            'type' => 'string',
                            'description' => __( 'City', 'dokan-lite' ),
                        ],
                        'state' => [
                            'type' => 'string',
                            'description' => __( 'State/Province', 'dokan-lite' ),
                        ],
                        'postcode' => [
                            'type' => 'string',
                            'description' => __( 'ZIP/Postal code', 'dokan-lite' ),
                        ],
                        'country' => [
                            'type' => 'string',
                            'description' => __( 'Country', 'dokan-lite' ),
                        ],
                        'email' => [
                            'type' => 'string',
                            'description' => __( 'Email address', 'dokan-lite' ),
                        ],
                        'phone' => [
                            'type' => 'string',
                            'description' => __( 'Phone number', 'dokan-lite' ),
                        ],
                    ],
                ],
                'shipping' => [
                    'type' => 'object',
                    'description' => __( 'Shipping address', 'dokan-lite' ),
                    'properties' => [
                        'first_name' => [
                            'type' => 'string',
                            'description' => __( 'First name', 'dokan-lite' ),
                        ],
                        'last_name' => [
                            'type' => 'string',
                            'description' => __( 'Last name', 'dokan-lite' ),
                        ],
                        'company' => [
                            'type' => 'string',
                            'description' => __( 'Company', 'dokan-lite' ),
                        ],
                        'address_1' => [
                            'type' => 'string',
                            'description' => __( 'Address line 1', 'dokan-lite' ),
                        ],
                        'address_2' => [
                            'type' => 'string',
                            'description' => __( 'Address line 2', 'dokan-lite' ),
                        ],
                        'city' => [
                            'type' => 'string',
                            'description' => __( 'City', 'dokan-lite' ),
                        ],
                        'state' => [
                            'type' => 'string',
                            'description' => __( 'State/Province', 'dokan-lite' ),
                        ],
                        'postcode' => [
                            'type' => 'string',
                            'description' => __( 'ZIP/Postal code', 'dokan-lite' ),
                        ],
                        'country' => [
                            'type' => 'string',
                            'description' => __( 'Country', 'dokan-lite' ),
                        ],
                    ],
                ],
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'vendor_name' => [
                    'type' => 'string',
                    'description' => __( 'Vendor name', 'dokan-lite' ),
                ],
                'items' => [
                    'type' => 'array',
                    'description' => __( 'Order items', 'dokan-lite' ),
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'id' => [
                                'type' => 'integer',
                                'description' => __( 'Item ID', 'dokan-lite' ),
                            ],
                            'product_id' => [
                                'type' => 'integer',
                                'description' => __( 'Product ID', 'dokan-lite' ),
                            ],
                            'product_name' => [
                                'type' => 'string',
                                'description' => __( 'Product name', 'dokan-lite' ),
                            ],
                            'product_sku' => [
                                'type' => 'string',
                                'description' => __( 'Product SKU', 'dokan-lite' ),
                            ],
                            'quantity' => [
                                'type' => 'integer',
                                'description' => __( 'Quantity', 'dokan-lite' ),
                            ],
                            'total' => [
                                'type' => 'string',
                                'description' => __( 'Item total', 'dokan-lite' ),
                            ],
                            'subtotal' => [
                                'type' => 'string',
                                'description' => __( 'Item subtotal', 'dokan-lite' ),
                            ],
                            'tax_total' => [
                                'type' => 'string',
                                'description' => __( 'Item tax total', 'dokan-lite' ),
                            ],
                            'meta_data' => [
                                'type' => 'array',
                                'description' => __( 'Item meta data', 'dokan-lite' ),
                            ],
                        ],
                    ],
                ],
                'notes' => [
                    'type' => 'array',
                    'description' => __( 'Order notes', 'dokan-lite' ),
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'id' => [
                                'type' => 'integer',
                                'description' => __( 'Note ID', 'dokan-lite' ),
                            ],
                            'content' => [
                                'type' => 'string',
                                'description' => __( 'Note content', 'dokan-lite' ),
                            ],
                            'date_created' => [
                                'type' => 'string',
                                'format' => 'date-time',
                                'description' => __( 'Note date', 'dokan-lite' ),
                            ],
                            'is_customer_note' => [
                                'type' => 'boolean',
                                'description' => __( 'Whether note is visible to customer', 'dokan-lite' ),
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get orders list output schema
     *
     * @return array
     */
    public static function get_orders_list_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'orders' => [
                    'type' => 'array',
                    'description' => __( 'List of orders', 'dokan-lite' ),
                    'items' => self::get_order_output_schema(),
                ],
                'total' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of orders', 'dokan-lite' ),
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
     * Get commission output schema
     *
     * @return array
     */
    public static function get_commission_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'order_id' => [
                    'type' => 'integer',
                    'description' => __( 'Order ID', 'dokan-lite' ),
                ],
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'commission' => [
                    'type' => 'number',
                    'description' => __( 'Commission amount', 'dokan-lite' ),
                ],
                'order_total' => [
                    'type' => 'string',
                    'description' => __( 'Order total', 'dokan-lite' ),
                ],
                'commission_rate' => [
                    'type' => 'number',
                    'description' => __( 'Commission rate', 'dokan-lite' ),
                ],
                'commission_type' => [
                    'type' => 'string',
                    'description' => __( 'Commission type', 'dokan-lite' ),
                ],
            ],
        ];
    }
} 