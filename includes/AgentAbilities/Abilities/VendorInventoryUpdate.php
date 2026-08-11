<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan-vendor/inventory-update — bulk stock updates on own products.
 *
 * Accepts an array of { product_id, stock_quantity, stock_status }. Each
 * row is verified against vendor ownership before applying. Failures on
 * one row don't abort the batch — the response reports per-row success.
 */
class VendorInventoryUpdate {

    const NAME = 'dokan-vendor/inventory-update';

    public static function definition(): array {
        return [
            'label'               => __( 'Update Inventory (Vendor)', 'dokan-lite' ),
            'description'         => __( 'Bulk update stock quantities and stock status on multiple of your own products in one call. Each row is checked for ownership; rows for products you do not own are skipped.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'updates' => [
                        'type'        => 'array',
                        'description' => __( 'List of inventory updates.', 'dokan-lite' ),
                        'items'       => [
                            'type'       => 'object',
                            'properties' => [
                                'product_id'     => [ 'type' => 'integer' ],
                                'stock_quantity' => [ 'type' => 'integer', 'minimum' => 0 ],
                                'stock_status'   => [ 'type' => 'string', 'enum' => [ 'instock', 'outofstock', 'onbackorder' ] ],
                            ],
                            'required'   => [ 'product_id' ],
                        ],
                        'required'    => true,
                    ],
                ],
                'required'   => [ 'updates' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'updated' => [ 'type' => 'integer' ],
                    'skipped' => [ 'type' => 'integer' ],
                    'rows'    => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'product_id' => [ 'type' => 'integer' ],
                                'status'     => [ 'type' => 'string', 'enum' => [ 'updated', 'skipped' ] ],
                                'reason'     => [ 'type' => 'string' ],
                            ],
                        ],
                    ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'vendor_only' ],
            'meta'                => [
                'annotations'  => [ 'destructive' => false ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $vendor_id = function_exists( 'dokan_get_current_user_id' )
            ? (int) dokan_get_current_user_id()
            : (int) get_current_user_id();

        if ( empty( $input['updates'] ) || ! is_array( $input['updates'] ) ) {
            return new \WP_Error( 'invalid_input', __( 'updates must be an array of inventory rows.', 'dokan-lite' ) );
        }

        $updated = 0;
        $skipped = 0;
        $rows    = [];

        foreach ( $input['updates'] as $row ) {
            $pid = isset( $row['product_id'] ) ? (int) $row['product_id'] : 0;
            if ( $pid <= 0 ) {
                $rows[]    = [ 'product_id' => $pid, 'status' => 'skipped', 'reason' => 'invalid_id' ];
                $skipped++;
                continue;
            }

            $product = wc_get_product( $pid );
            if ( ! $product ) {
                $rows[]    = [ 'product_id' => $pid, 'status' => 'skipped', 'reason' => 'not_found' ];
                $skipped++;
                continue;
            }

            $owner = (int) get_post_field( 'post_author', $pid );
            if ( $owner !== $vendor_id && ! current_user_can( 'manage_woocommerce' ) ) {
                $rows[]    = [ 'product_id' => $pid, 'status' => 'skipped', 'reason' => 'not_owner' ];
                $skipped++;
                continue;
            }

            if ( isset( $row['stock_quantity'] ) ) {
                $product->set_manage_stock( true );
                $product->set_stock_quantity( (int) $row['stock_quantity'] );
            }
            if ( isset( $row['stock_status'] ) ) {
                $product->set_stock_status( sanitize_key( $row['stock_status'] ) );
            }
            $product->save();

            $rows[]   = [ 'product_id' => $pid, 'status' => 'updated', 'reason' => '' ];
            $updated++;
        }

        do_action( 'dokan_vendor_inventory_updated', $vendor_id, $rows );

        return [
            'updated' => $updated,
            'skipped' => $skipped,
            'rows'    => $rows,
        ];
    }
}
