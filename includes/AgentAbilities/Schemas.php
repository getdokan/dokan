<?php

namespace WeDevs\Dokan\AgentAbilities;

/**
 * Reusable JSON Schema fragments for Dokan ability inputs and outputs.
 *
 * Schemas are part of the public contract — additions are safe, removals
 * and renames are breaking changes that need at least 2 minor Dokan
 * releases of deprecation warning before removal.
 */
class Schemas {

    public static function vendor_summary(): array {
        return [
            'type'        => 'object',
            'description' => __( 'Vendor identity and storefront summary.', 'dokan-lite' ),
            'properties'  => [
                'id'            => [ 'type' => 'integer' ],
                'name'          => [ 'type' => 'string' ],
                'shop_name'     => [ 'type' => 'string' ],
                'shop_url'      => [ 'type' => 'string' ],
                'email'         => [ 'type' => 'string' ],
                'rating'        => [ 'type' => 'number' ],
                'rating_count'  => [ 'type' => 'integer' ],
                'product_count' => [ 'type' => 'integer' ],
                'enabled'       => [ 'type' => 'boolean' ],
            ],
        ];
    }

    public static function product_summary(): array {
        return [
            'type'        => 'object',
            'description' => __( 'Product summary including vendor attribution.', 'dokan-lite' ),
            'properties'  => [
                'id'           => [ 'type' => 'integer' ],
                'title'        => [ 'type' => 'string' ],
                'url'          => [ 'type' => 'string' ],
                'price'        => [ 'type' => 'string' ],
                'currency'     => [ 'type' => 'string' ],
                'sku'          => [ 'type' => 'string' ],
                'stock_status' => [ 'type' => 'string', 'enum' => [ 'instock', 'outofstock', 'onbackorder' ] ],
                'vendor_id'    => [ 'type' => 'integer' ],
                'vendor_name'  => [ 'type' => 'string' ],
                'vendor_url'   => [ 'type' => 'string' ],
            ],
        ];
    }

    public static function order_summary(): array {
        return [
            'type'        => 'object',
            'description' => __( 'Order summary scoped to a vendor.', 'dokan-lite' ),
            'properties'  => [
                'id'          => [ 'type' => 'integer' ],
                'status'      => [ 'type' => 'string' ],
                'total'       => [ 'type' => 'string' ],
                'currency'    => [ 'type' => 'string' ],
                'date'        => [ 'type' => 'string' ],
                'customer_id' => [ 'type' => 'integer' ],
                'vendor_id'   => [ 'type' => 'integer' ],
                'item_count'  => [ 'type' => 'integer' ],
            ],
        ];
    }

    public static function pagination(): array {
        return [
            'per_page' => [
                'type'        => 'integer',
                'description' => __( 'Results per page. Max 100.', 'dokan-lite' ),
                'minimum'     => 1,
                'maximum'     => 100,
                'default'     => 20,
            ],
            'page'     => [
                'type'        => 'integer',
                'description' => __( 'Page number, 1-indexed.', 'dokan-lite' ),
                'minimum'     => 1,
                'default'     => 1,
            ],
        ];
    }
}
