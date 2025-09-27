<?php
/**
 * Analytics Feature Manager
 *
 * @package WeDevs\Dokan\FeatureAPI\Features\Analytics
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Features\Analytics;

use WeDevs\Dokan\FeatureAPI\Permissions\AdminPermissions;
use WP_Feature as FeatureTypes;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Analytics Manager
 *
 * @since 4.0.0
 */
class AnalyticsManager {

    /**
     * Register analytics features
     */
    public function register_features() {
        $this->register_analytics_resources();
    }

    /**
     * Register analytics resource features
     */
    private function register_analytics_resources() {
        // Get sales analytics
        wp_register_feature(
            [
				'id' => 'dokan/analytics/sales',
				'name' => __( 'Get Sales Analytics', 'dokan-lite' ),
				'description' => __( 'Get sales analytics data', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_sales_analytics' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_sales_analytics' ],
				'input_schema' => $this->get_sales_analytics_schema(),
				'output_schema' => $this->get_sales_analytics_output_schema(),
				'categories' => [ 'dokan', 'analytics', 'marketplace' ],
			]
        );

        // Get vendor analytics
        wp_register_feature(
            [
				'id' => 'dokan/analytics/vendor-analytics',
				'name' => __( 'Get Vendor Analytics', 'dokan-lite' ),
				'description' => __( 'Get analytics for a specific vendor', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_vendor_analytics' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_vendor_analytics' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'vendor_id' ],
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
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
				],
				'output_schema' => $this->get_vendor_analytics_output_schema(),
				'categories' => [ 'dokan', 'analytics', 'vendor', 'marketplace' ],
			]
        );

        // Get product analytics
        wp_register_feature(
            [
				'id' => 'dokan/analytics/products',
				'name' => __( 'Get Product Analytics', 'dokan-lite' ),
				'description' => __( 'Get product analytics data', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_product_analytics' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_product_analytics' ],
				'input_schema' => $this->get_product_analytics_schema(),
				'output_schema' => $this->get_product_analytics_output_schema(),
				'categories' => [ 'dokan', 'analytics', 'product', 'marketplace' ],
			]
        );
    }

    /**
     * Get sales analytics
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_sales_analytics( $context ) {
        $args = $this->validate_analytics_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        $date_from = $args['date_from'] ?? date( 'Y-m-d', strtotime( '-30 days' ) );
        $date_to = $args['date_to'] ?? date( 'Y-m-d' );

        // Get sales data
        $total_sales = $this->get_total_sales( $date_from, $date_to );
        $total_orders = $this->get_total_orders( $date_from, $date_to );
        $average_order_value = $total_orders > 0 ? $total_sales / $total_orders : 0;

        return [
            'total_sales' => $total_sales,
            'total_orders' => $total_orders,
            'average_order_value' => $average_order_value,
            'period' => [
                'from' => $date_from,
                'to' => $date_to,
            ],
        ];
    }

    /**
     * Get vendor analytics
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_vendor_analytics( $context ) {
        $vendor_id = absint( $context['vendor_id'] );

        if ( ! dokan_is_user_seller( $vendor_id ) ) {
            return new \WP_Error( 'vendor_not_found', __( 'Vendor not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $date_from = $context['date_from'] ?? date( 'Y-m-d', strtotime( '-30 days' ) );
        $date_to = $context['date_to'] ?? date( 'Y-m-d' );

        // Get vendor-specific data
        $vendor_sales = $this->get_vendor_sales( $vendor_id, $date_from, $date_to );
        $vendor_orders = $this->get_vendor_orders( $vendor_id, $date_from, $date_to );
        $vendor_products = $this->get_vendor_products_count( $vendor_id );

        return [
            'vendor_id' => $vendor_id,
            'vendor_name' => dokan_get_store_info( $vendor_id, 'store_name' ),
            'total_sales' => $vendor_sales,
            'total_orders' => $vendor_orders,
            'total_products' => $vendor_products,
            'average_order_value' => $vendor_orders > 0 ? $vendor_sales / $vendor_orders : 0,
            'period' => [
                'from' => $date_from,
                'to' => $date_to,
            ],
        ];
    }

    /**
     * Get product analytics
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_product_analytics( $context ) {
        $args = $this->validate_analytics_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        $date_from = $args['date_from'] ?? date( 'Y-m-d', strtotime( '-30 days' ) );
        $date_to = $args['date_to'] ?? date( 'Y-m-d' );

        // Get product data
        $total_products = $this->get_total_products();
        $active_products = $this->get_active_products();
        $featured_products = $this->get_featured_products();

        return [
            'total_products' => $total_products,
            'active_products' => $active_products,
            'featured_products' => $featured_products,
            'period' => [
                'from' => $date_from,
                'to' => $date_to,
            ],
        ];
    }

    /**
     * Validate analytics parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    private function validate_analytics_params( $context ) {
        $args = [];

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
     * Get total sales
     *
     * @param string $date_from
     * @param string $date_to
     * @return float
     */
    private function get_total_sales( $date_from, $date_to ) {
        global $wpdb;

        $query = $wpdb->prepare(
            "
            SELECT SUM(meta_value) as total
            FROM {$wpdb->postmeta} pm
            INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
            WHERE pm.meta_key = '_order_total'
            AND p.post_type = 'shop_order'
            AND p.post_status IN ('wc-completed', 'wc-processing')
            AND p.post_date >= %s
            AND p.post_date <= %s
        ", $date_from, $date_to
        );

        $result = $wpdb->get_var( $query );
        return $result ? floatval( $result ) : 0.0;
    }

    /**
     * Get total orders
     *
     * @param string $date_from
     * @param string $date_to
     * @return int
     */
    private function get_total_orders( $date_from, $date_to ) {
        global $wpdb;

        $query = $wpdb->prepare(
            "
            SELECT COUNT(*) as total
            FROM {$wpdb->posts}
            WHERE post_type = 'shop_order'
            AND post_status IN ('wc-completed', 'wc-processing')
            AND post_date >= %s
            AND post_date <= %s
        ", $date_from, $date_to
        );

        return (int) $wpdb->get_var( $query );
    }

    /**
     * Get vendor sales
     *
     * @param int $vendor_id
     * @param string $date_from
     * @param string $date_to
     * @return float
     */
    private function get_vendor_sales( $vendor_id, $date_from, $date_to ) {
        global $wpdb;

        $query = $wpdb->prepare(
            "
            SELECT SUM(pm.meta_value) as total
            FROM {$wpdb->postmeta} pm
            INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
            INNER JOIN {$wpdb->postmeta} vendor_meta ON p.ID = vendor_meta.post_id
            WHERE pm.meta_key = '_order_total'
            AND vendor_meta.meta_key = '_dokan_vendor_id'
            AND vendor_meta.meta_value = %d
            AND p.post_type = 'shop_order'
            AND p.post_status IN ('wc-completed', 'wc-processing')
            AND p.post_date >= %s
            AND p.post_date <= %s
        ", $vendor_id, $date_from, $date_to
        );

        $result = $wpdb->get_var( $query );
        return $result ? floatval( $result ) : 0.0;
    }

    /**
     * Get vendor orders
     *
     * @param int $vendor_id
     * @param string $date_from
     * @param string $date_to
     * @return int
     */
    private function get_vendor_orders( $vendor_id, $date_from, $date_to ) {
        global $wpdb;

        $query = $wpdb->prepare(
            "
            SELECT COUNT(*) as total
            FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->postmeta} vendor_meta ON p.ID = vendor_meta.post_id
            WHERE vendor_meta.meta_key = '_dokan_vendor_id'
            AND vendor_meta.meta_value = %d
            AND p.post_type = 'shop_order'
            AND p.post_status IN ('wc-completed', 'wc-processing')
            AND p.post_date >= %s
            AND p.post_date <= %s
        ", $vendor_id, $date_from, $date_to
        );

        return (int) $wpdb->get_var( $query );
    }

    /**
     * Get vendor products count
     *
     * @param int $vendor_id
     * @return int
     */
    private function get_vendor_products_count( $vendor_id ) {
        global $wpdb;

        $query = $wpdb->prepare(
            "
            SELECT COUNT(*) as total
            FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->postmeta} vendor_meta ON p.ID = vendor_meta.post_id
            WHERE vendor_meta.meta_key = '_dokan_vendor_id'
            AND vendor_meta.meta_value = %d
            AND p.post_type = 'product'
            AND p.post_status = 'publish'
        ", $vendor_id
        );

        return (int) $wpdb->get_var( $query );
    }

    /**
     * Get total products
     *
     * @return int
     */
    private function get_total_products() {
        global $wpdb;

        $query = "
            SELECT COUNT(*) as total
            FROM {$wpdb->posts}
            WHERE post_type = 'product'
            AND post_status = 'publish'
        ";

        return (int) $wpdb->get_var( $query );
    }

    /**
     * Get active products
     *
     * @return int
     */
    private function get_active_products() {
        global $wpdb;

        $query = "
            SELECT COUNT(*) as total
            FROM {$wpdb->posts}
            WHERE post_type = 'product'
            AND post_status = 'publish'
        ";

        return (int) $wpdb->get_var( $query );
    }

    /**
     * Get featured products
     *
     * @return int
     */
    private function get_featured_products() {
        global $wpdb;

        $query = "
            SELECT COUNT(*) as total
            FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            WHERE p.post_type = 'product'
            AND p.post_status = 'publish'
            AND pm.meta_key = '_featured'
            AND pm.meta_value = 'yes'
        ";

        return (int) $wpdb->get_var( $query );
    }

    /**
     * Get sales analytics input schema
     *
     * @return array
     */
    private function get_sales_analytics_schema() {
        return [
            'type' => 'object',
            'properties' => [
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
     * Get sales analytics output schema
     *
     * @return array
     */
    private function get_sales_analytics_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'total_sales' => [
                    'type' => 'number',
                    'description' => __( 'Total sales amount', 'dokan-lite' ),
                ],
                'total_orders' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of orders', 'dokan-lite' ),
                ],
                'average_order_value' => [
                    'type' => 'number',
                    'description' => __( 'Average order value', 'dokan-lite' ),
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
            ],
        ];
    }

    /**
     * Get vendor analytics output schema
     *
     * @return array
     */
    private function get_vendor_analytics_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'vendor_id' => [
                    'type' => 'integer',
                    'description' => __( 'Vendor ID', 'dokan-lite' ),
                ],
                'vendor_name' => [
                    'type' => 'string',
                    'description' => __( 'Vendor name', 'dokan-lite' ),
                ],
                'total_sales' => [
                    'type' => 'number',
                    'description' => __( 'Total sales amount', 'dokan-lite' ),
                ],
                'total_orders' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of orders', 'dokan-lite' ),
                ],
                'total_products' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of products', 'dokan-lite' ),
                ],
                'average_order_value' => [
                    'type' => 'number',
                    'description' => __( 'Average order value', 'dokan-lite' ),
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
            ],
        ];
    }

    /**
     * Get product analytics input schema
     *
     * @return array
     */
    private function get_product_analytics_schema() {
        return [
            'type' => 'object',
            'properties' => [
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
     * Get product analytics output schema
     *
     * @return array
     */
    private function get_product_analytics_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'total_products' => [
                    'type' => 'integer',
                    'description' => __( 'Total number of products', 'dokan-lite' ),
                ],
                'active_products' => [
                    'type' => 'integer',
                    'description' => __( 'Number of active products', 'dokan-lite' ),
                ],
                'featured_products' => [
                    'type' => 'integer',
                    'description' => __( 'Number of featured products', 'dokan-lite' ),
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
            ],
        ];
    }
}
