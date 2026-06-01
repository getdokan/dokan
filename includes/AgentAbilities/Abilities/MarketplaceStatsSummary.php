<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan/marketplace-stats-summary — top-line marketplace snapshot.
 *
 * Named explicitly "summary" so future siblings can ship without breaking
 * the contract: marketplace-stats-revenue, marketplace-stats-vendors,
 * marketplace-stats-top-sellers, etc.
 */
class MarketplaceStatsSummary {

    const NAME = 'dokan/marketplace-stats-summary';

    public static function definition(): array {
        return [
            'label'               => __( 'Marketplace Statistics Summary', 'dokan-lite' ),
            'description'         => __( 'Top-line marketplace snapshot: vendor counts by status, total products, and recent order volume/revenue. Admin only.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'period_days' => [ 'type' => 'integer', 'description' => __( 'Window for the orders metric.', 'dokan-lite' ), 'minimum' => 1, 'maximum' => 365, 'default' => 7 ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'vendors'  => [
                        'type'       => 'object',
                        'properties' => [
                            'total'    => [ 'type' => 'integer' ],
                            'approved' => [ 'type' => 'integer' ],
                            'pending'  => [ 'type' => 'integer' ],
                        ],
                    ],
                    'products' => [
                        'type'       => 'object',
                        'properties' => [
                            'total'     => [ 'type' => 'integer' ],
                            'published' => [ 'type' => 'integer' ],
                        ],
                    ],
                    'orders' => [
                        'type'       => 'object',
                        'properties' => [
                            'period_days' => [ 'type' => 'integer' ],
                            'count'       => [ 'type' => 'integer' ],
                            'revenue'     => [ 'type' => 'number' ],
                            'currency'    => [ 'type' => 'string' ],
                        ],
                    ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'admin' ],
            'meta'                => [
                'annotations'  => [ 'readonly' => true, 'idempotent' => true ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $period = isset( $input['period_days'] ) ? (int) $input['period_days'] : 7;

        $vendors = [
            'total'    => 0,
            'approved' => 0,
            'pending'  => 0,
        ];

        if ( function_exists( 'dokan_get_seller_count' ) ) {
            $counts              = dokan_get_seller_count();
            $vendors['approved'] = (int) ( $counts['active'] ?? 0 );
            $vendors['pending']  = (int) ( $counts['inactive'] ?? 0 );
            $vendors['total']    = $vendors['approved'] + $vendors['pending'];
        }

        $product_counts = wp_count_posts( 'product' );
        $products       = [
            'total'     => array_sum( (array) $product_counts ),
            'published' => isset( $product_counts->publish ) ? (int) $product_counts->publish : 0,
        ];

        $since = gmdate( 'Y-m-d H:i:s', strtotime( "-{$period} days" ) );
        $args  = [
            'limit'        => -1,
            'status'       => [ 'wc-processing', 'wc-completed' ],
            'date_created' => '>=' . $since,
            'return'       => 'objects',
        ];

        $order_count   = 0;
        $order_revenue = 0;
        if ( function_exists( 'wc_get_orders' ) ) {
            $orders = wc_get_orders( $args );
            foreach ( (array) $orders as $order ) {
                $order_count++;
                $order_revenue += (float) $order->get_total();
            }
        }

        return [
            'vendors'  => $vendors,
            'products' => $products,
            'orders'   => [
                'period_days' => $period,
                'count'       => $order_count,
                'revenue'     => round( $order_revenue, 2 ),
                'currency'    => get_woocommerce_currency(),
            ],
        ];
    }
}
