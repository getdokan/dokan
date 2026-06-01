<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;
use WeDevs\Dokan\AgentAbilities\Schemas;

/**
 * dokan/vendor-orders-query — orders scoped to a vendor.
 *
 * Admins can query any vendor's orders. Vendors can only query their own.
 * Permission callback enforces vendor_id matches dokan_get_current_user_id()
 * so vendor staff resolve to the parent vendor.
 */
class VendorOrdersQuery {

    const NAME = 'dokan/vendor-orders-query';

    public static function definition(): array {
        return [
            'label'               => __( 'List Vendor Orders', 'dokan-lite' ),
            'description'         => __( 'List orders containing products from a specific vendor. Optional status filter. Returns order totals, status, customer ID, and item count.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => array_merge(
                    [
                        'vendor_id' => [ 'type' => 'integer', 'required' => true ],
                        'status'    => [
                            'type'        => 'string',
                            'description' => __( 'WooCommerce order status slug (e.g. processing, completed). Omit for all.', 'dokan-lite' ),
                        ],
                    ],
                    Schemas::pagination()
                ),
                'required'   => [ 'vendor_id' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'orders' => [ 'type' => 'array', 'items' => Schemas::order_summary() ],
                    'total'  => [ 'type' => 'integer' ],
                    'page'   => [ 'type' => 'integer' ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => Permissions::vendor_self_for( 'vendor_id' ),
            'meta'                => [
                'annotations'  => [ 'readonly' => true ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $vendor_id = isset( $input['vendor_id'] ) ? (int) $input['vendor_id'] : 0;
        if ( $vendor_id <= 0 ) {
            return new \WP_Error( 'invalid_vendor', __( 'A valid vendor_id is required.', 'dokan-lite' ) );
        }

        if ( ! function_exists( 'dokan_get_seller_orders' ) ) {
            return new \WP_Error( 'dokan_unavailable', __( 'Dokan is not active.', 'dokan-lite' ) );
        }

        $per_page = isset( $input['per_page'] ) ? (int) $input['per_page'] : 20;
        $page     = isset( $input['page'] ) ? (int) $input['page'] : 1;
        $status   = ! empty( $input['status'] ) ? sanitize_key( $input['status'] ) : 'any';
        $offset   = ( $page - 1 ) * $per_page;

        $orders_raw = dokan_get_seller_orders( $vendor_id, $status, null, $per_page, $offset );
        $orders     = [];

        foreach ( (array) $orders_raw as $row ) {
            $order_id = isset( $row->order_id ) ? (int) $row->order_id : (int) $row->ID;
            $order    = wc_get_order( $order_id );
            if ( ! $order ) {
                continue;
            }
            $orders[] = [
                'id'          => (int) $order->get_id(),
                'status'      => (string) $order->get_status(),
                'total'       => (string) $order->get_total(),
                'currency'    => (string) $order->get_currency(),
                'date'        => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : '',
                'customer_id' => (int) $order->get_customer_id(),
                'vendor_id'   => $vendor_id,
                'item_count'  => (int) $order->get_item_count(),
            ];
        }

        return [
            'orders' => $orders,
            'total'  => count( $orders ),
            'page'   => $page,
        ];
    }
}
