<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;
use WeDevs\Dokan\AgentAbilities\Schemas;

/**
 * dokan/vendor-get — single vendor detail.
 */
class VendorGet {

    const NAME = 'dokan/vendor-get';

    public static function definition(): array {
        return [
            'label'               => __( 'Get Vendor', 'dokan-lite' ),
            'description'         => __( 'Retrieve full information about a single vendor including storefront, address, social links, and policies.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'vendor_id' => [ 'type' => 'integer', 'description' => __( 'The vendor (user) ID.', 'dokan-lite' ), 'required' => true ],
                ],
                'required'   => [ 'vendor_id' ],
            ],
            'output_schema'       => Schemas::vendor_summary(),
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'public_read' ],
            'meta'                => [
                'annotations'  => [ 'readonly' => true, 'idempotent' => true ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $vendor_id = isset( $input['vendor_id'] ) ? (int) $input['vendor_id'] : 0;
        if ( $vendor_id <= 0 ) {
            return new \WP_Error( 'invalid_vendor', __( 'A valid vendor_id is required.', 'dokan-lite' ) );
        }

        if ( ! function_exists( 'dokan_get_vendor' ) ) {
            return new \WP_Error( 'dokan_unavailable', __( 'Dokan is not active.', 'dokan-lite' ) );
        }

        $vendor = dokan_get_vendor( $vendor_id );
        if ( ! $vendor || ! $vendor->get_id() ) {
            return new \WP_Error( 'vendor_not_found', __( 'Vendor not found.', 'dokan-lite' ) );
        }

        return VendorsQuery::shape( $vendor );
    }
}
