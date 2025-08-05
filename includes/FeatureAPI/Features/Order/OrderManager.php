<?php
/**
 * Order Feature Manager
 *
 * @package WeDevs\Dokan\FeatureAPI\Features\Order
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Features\Order;

use WeDevs\Dokan\FeatureAPI\Schemas\OrderSchema;
use WeDevs\Dokan\FeatureAPI\Validators\OrderValidator;
use WeDevs\Dokan\FeatureAPI\Permissions\OrderPermissions;
use WP_Feature as FeatureTypes;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Order Manager
 *
 * @since 4.0.0
 */
class OrderManager {

    /**
     * Register order features
     */
    public function register_features() {
        $this->register_order_resources();
        $this->register_order_tools();
    }

    /**
     * Register order resource features (read-only)
     */
    private function register_order_resources() {
        // List orders
        wp_register_feature(
            [
				'id' => 'dokan/orders/list',
				'name' => __( 'List Orders', 'dokan-lite' ),
				'description' => __( 'Get a list of all orders with filtering options', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_orders_list' ],
				'permission_callback' => [ OrderPermissions::class, 'can_list_orders' ],
				'input_schema' => OrderSchema::get_orders_list_schema(),
				'output_schema' => OrderSchema::get_orders_list_output_schema(),
				'categories' => [ 'dokan', 'order', 'marketplace' ],
			]
        );

        // Get single order
        wp_register_feature(
            [
				'id' => 'dokan/orders/get',
				'name' => __( 'Get Order', 'dokan-lite' ),
				'description' => __( 'Get details of a specific order', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_order' ],
				'permission_callback' => [ OrderPermissions::class, 'can_view_order' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Order ID', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => OrderSchema::get_order_output_schema(),
				'categories' => [ 'dokan', 'order', 'marketplace' ],
			]
        );

        // Get vendor orders
        wp_register_feature(
            [
				'id' => 'dokan/orders/vendor-orders',
				'name' => __( 'Get Vendor Orders', 'dokan-lite' ),
				'description' => __( 'Get orders for a specific vendor', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_vendor_orders' ],
				'permission_callback' => [ OrderPermissions::class, 'can_view_vendor_orders' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'vendor_id' ],
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
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
						'status' => [
							'type' => 'string',
							'enum' => [ 'pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed' ],
							'description' => __( 'Order status', 'dokan-lite' ),
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
				'output_schema' => OrderSchema::get_orders_list_output_schema(),
				'categories' => [ 'dokan', 'order', 'vendor', 'marketplace' ],
			]
        );

        // Get sub orders
        wp_register_feature(
            [
				'id' => 'dokan/orders/sub-orders',
				'name' => __( 'Get Sub Orders', 'dokan-lite' ),
				'description' => __( 'Get sub orders for a parent order', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_sub_orders' ],
				'permission_callback' => [ OrderPermissions::class, 'can_view_sub_orders' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'parent_id' ],
					'properties' => [
						'parent_id' => [
							'type' => 'integer',
							'description' => __( 'Parent order ID', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => OrderSchema::get_orders_list_output_schema(),
				'categories' => [ 'dokan', 'order', 'marketplace' ],
			]
        );

        // Get commission details
        wp_register_feature(
            [
				'id' => 'dokan/orders/commission-details',
				'name' => __( 'Get Order Commission', 'dokan-lite' ),
				'description' => __( 'Get commission details for an order', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_order_commission' ],
				'permission_callback' => [ OrderPermissions::class, 'can_view_order_commission' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'order_id' ],
					'properties' => [
						'order_id' => [
							'type' => 'integer',
							'description' => __( 'Order ID', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => OrderSchema::get_commission_output_schema(),
				'categories' => [ 'dokan', 'order', 'commission', 'marketplace' ],
			]
        );
    }

    /**
     * Register order tool features (update, modify)
     */
    private function register_order_tools() {
        // Update order status
        wp_register_feature(
            [
				'id' => 'dokan/orders/status-update',
				'name' => __( 'Update Order Status', 'dokan-lite' ),
				'description' => __( 'Update the status of an order', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_order_status' ],
				'permission_callback' => [ OrderPermissions::class, 'can_update_order_status' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id', 'status' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Order ID', 'dokan-lite' ),
						],
						'status' => [
							'type' => 'string',
							'enum' => [ 'pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed' ],
							'description' => __( 'New order status', 'dokan-lite' ),
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Status change note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => OrderSchema::get_order_output_schema(),
				'categories' => [ 'dokan', 'order', 'marketplace' ],
			]
        );

        // Update order commission
        wp_register_feature(
            [
				'id' => 'dokan/orders/commission-update',
				'name' => __( 'Update Order Commission', 'dokan-lite' ),
				'description' => __( 'Update the commission for an order', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_order_commission' ],
				'permission_callback' => [ OrderPermissions::class, 'can_update_order_commission' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id', 'commission' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Order ID', 'dokan-lite' ),
						],
						'commission' => [
							'type' => 'number',
							'description' => __( 'Commission amount', 'dokan-lite' ),
							'minimum' => 0,
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Commission update note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => OrderSchema::get_commission_output_schema(),
				'categories' => [ 'dokan', 'order', 'commission', 'marketplace' ],
			]
        );
    }

    /**
     * Get orders list
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_orders_list( $context ) {
        $validator = new OrderValidator();
        $args = $validator->validate_list_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        $query_args = [
            'post_type' => 'shop_order',
            'post_status' => $args['status'] ?? 'any',
            'posts_per_page' => $args['number'] ?? 10,
            'paged' => ( $args['offset'] ?? 0 ) / ( $args['number'] ?? 10 ) + 1,
            'orderby' => $args['orderby'] ?? 'date',
            'order' => $args['order'] ?? 'DESC',
        ];

        // Add vendor filter if specified
        if ( ! empty( $args['vendor_id'] ) ) {
            $query_args['meta_query'][] = [
                'key' => '_dokan_vendor_id',
                'value' => $args['vendor_id'],
                'compare' => '=',
            ];
        }

        // Add date range filter
        if ( ! empty( $args['date_from'] ) || ! empty( $args['date_to'] ) ) {
            $date_query = [];
            if ( ! empty( $args['date_from'] ) ) {
                $date_query['after'] = $args['date_from'];
            }
            if ( ! empty( $args['date_to'] ) ) {
                $date_query['before'] = $args['date_to'];
            }
            $query_args['date_query'] = $date_query;
        }

        $query = new \WP_Query( $query_args );
        $orders = [];

        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $order = wc_get_order( get_the_ID() );
                if ( $order ) {
                    $orders[] = $this->format_order_response( $order );
                }
            }
        }

        wp_reset_postdata();

        return [
            'orders' => $orders,
            'total' => $query->found_posts,
            'total_pages' => $query->max_num_pages,
            'current_page' => $query->get( 'paged' ),
        ];
    }

    /**
     * Get single order
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_order( $context ) {
        $order_id = absint( $context['id'] );
        $order = wc_get_order( $order_id );

        if ( ! $order ) {
            return new \WP_Error( 'order_not_found', __( 'Order not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $this->format_order_response( $order );
    }

    /**
     * Get vendor orders
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_vendor_orders( $context ) {
        $vendor_id = absint( $context['vendor_id'] );

        // Check if vendor exists
        if ( ! dokan_is_user_seller( $vendor_id ) ) {
            return new \WP_Error( 'vendor_not_found', __( 'Vendor not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $context['vendor_id'] = $vendor_id;
        return $this->get_orders_list( $context );
    }

    /**
     * Get sub orders
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_sub_orders( $context ) {
        $parent_id = absint( $context['parent_id'] );
        $parent_order = wc_get_order( $parent_id );

        if ( ! $parent_order ) {
            return new \WP_Error( 'parent_order_not_found', __( 'Parent order not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        // Get sub orders
        $sub_orders = dokan_get_suborder_ids_by( $parent_id );
        $orders = [];

        foreach ( $sub_orders as $sub_order_id ) {
            $order = wc_get_order( $sub_order_id );
            if ( $order ) {
                $orders[] = $this->format_order_response( $order );
            }
        }

        return [
            'orders' => $orders,
            'total' => count( $orders ),
            'parent_order_id' => $parent_id,
        ];
    }

    /**
     * Get order commission
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_order_commission( $context ) {
        $order_id = absint( $context['order_id'] );
        $order = wc_get_order( $order_id );

        if ( ! $order ) {
            return new \WP_Error( 'order_not_found', __( 'Order not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        // Get commission details
        $commission = get_post_meta( $order_id, '_dokan_order_commission', true );
        $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );

        return [
            'order_id' => $order_id,
            'vendor_id' => $vendor_id,
            'commission' => $commission,
            'order_total' => $order->get_total(),
            'commission_rate' => dokan_get_commission_rate( $vendor_id ),
            'commission_type' => dokan_get_commission_type( $vendor_id ),
        ];
    }

    /**
     * Update order status
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_order_status( $context ) {
        $order_id = absint( $context['id'] );
        $order = wc_get_order( $order_id );

        if ( ! $order ) {
            return new \WP_Error( 'order_not_found', __( 'Order not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $new_status = sanitize_text_field( $context['status'] );
        $note = isset( $context['note'] ) ? sanitize_textarea_field( $context['note'] ) : '';

        // Update order status
        $order->update_status( $new_status, $note );

        // Send notification
        do_action( 'dokan_order_status_changed', $order_id, $new_status, $note );

        return $this->format_order_response( $order );
    }

    /**
     * Update order commission
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_order_commission( $context ) {
        $order_id = absint( $context['id'] );
        $order = wc_get_order( $order_id );

        if ( ! $order ) {
            return new \WP_Error( 'order_not_found', __( 'Order not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $commission = floatval( $context['commission'] );
        $note = isset( $context['note'] ) ? sanitize_textarea_field( $context['note'] ) : '';

        // Update commission
        update_post_meta( $order_id, '_dokan_order_commission', $commission );

        // Add note
        if ( ! empty( $note ) ) {
            $order->add_order_note( $note );
        }

        // Send notification
        do_action( 'dokan_order_commission_updated', $order_id, $commission, $note );

        return $this->get_order_commission( [ 'order_id' => $order_id ] );
    }

    /**
     * Format order response
     *
     * @param \WC_Order $order
     * @return array
     */
    private function format_order_response( $order ) {
        $vendor_id = get_post_meta( $order->get_id(), '_dokan_vendor_id', true );

        return [
            'id' => $order->get_id(),
            'number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'date_created' => $order->get_date_created()->format( 'Y-m-d H:i:s' ),
            'date_modified' => $order->get_date_modified()->format( 'Y-m-d H:i:s' ),
            'total' => $order->get_total(),
            'subtotal' => $order->get_subtotal(),
            'tax_total' => $order->get_total_tax(),
            'shipping_total' => $order->get_shipping_total(),
            'discount_total' => $order->get_total_discount(),
            'currency' => $order->get_currency(),
            'payment_method' => $order->get_payment_method(),
            'payment_method_title' => $order->get_payment_method_title(),
            'billing' => [
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'company' => $order->get_billing_company(),
                'address_1' => $order->get_billing_address_1(),
                'address_2' => $order->get_billing_address_2(),
                'city' => $order->get_billing_city(),
                'state' => $order->get_billing_state(),
                'postcode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
            ],
            'shipping' => [
                'first_name' => $order->get_shipping_first_name(),
                'last_name' => $order->get_shipping_last_name(),
                'company' => $order->get_shipping_company(),
                'address_1' => $order->get_shipping_address_1(),
                'address_2' => $order->get_shipping_address_2(),
                'city' => $order->get_shipping_city(),
                'state' => $order->get_shipping_state(),
                'postcode' => $order->get_shipping_postcode(),
                'country' => $order->get_shipping_country(),
            ],
            'vendor_id' => $vendor_id,
            'vendor_name' => $vendor_id ? dokan_get_store_info( $vendor_id, 'store_name' ) : '',
            'items' => $this->format_order_items( $order ),
            'notes' => $this->format_order_notes( $order ),
        ];
    }

    /**
     * Format order items
     *
     * @param \WC_Order $order
     * @return array
     */
    private function format_order_items( $order ) {
        $items = [];
        foreach ( $order->get_items() as $item ) {
            $product = $item->get_product();
            $items[] = [
                'id' => $item->get_id(),
                'product_id' => $item->get_product_id(),
                'product_name' => $item->get_name(),
                'product_sku' => $product ? $product->get_sku() : '',
                'quantity' => $item->get_quantity(),
                'total' => $item->get_total(),
                'subtotal' => $item->get_subtotal(),
                'tax_total' => $item->get_total_tax(),
                'meta_data' => $item->get_meta_data(),
            ];
        }
        return $items;
    }

    /**
     * Format order notes
     *
     * @param \WC_Order $order
     * @return array
     */
    private function format_order_notes( $order ) {
        $notes = [];
        $order_notes = wc_get_order_notes(
            [
				'order_id' => $order->get_id(),
			]
        );

        foreach ( $order_notes as $note ) {
            $notes[] = [
                'id' => $note->id,
                'content' => $note->content,
                'date_created' => $note->date_created->format( 'Y-m-d H:i:s' ),
                'is_customer_note' => $note->is_customer_note,
            ];
        }

        return $notes;
    }
}
