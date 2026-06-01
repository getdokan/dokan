<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan/vendor-commission-set — set per-vendor commission.
 * Admin-only.
 */
class VendorCommissionSet {

    const NAME = 'dokan/vendor-commission-set';

    public static function definition(): array {
        return [
            'label'               => __( 'Set Vendor Commission', 'dokan-lite' ),
            'description'         => __( 'Set commission rate for a specific vendor. Supports percentage or flat fee. Overrides the global marketplace default for this vendor.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'vendor_id'       => [ 'type' => 'integer', 'required' => true ],
                    'commission_type' => [ 'type' => 'string', 'enum' => [ 'percentage', 'flat', 'combine' ], 'default' => 'percentage' ],
                    'commission_rate' => [ 'type' => 'number', 'description' => __( 'Percentage 0-100 or flat amount in store currency.', 'dokan-lite' ), 'required' => true ],
                    'additional_fee'  => [ 'type' => 'number', 'description' => __( 'Used when commission_type = combine.', 'dokan-lite' ) ],
                ],
                'required'   => [ 'vendor_id', 'commission_rate' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'vendor_id'       => [ 'type' => 'integer' ],
                    'commission_type' => [ 'type' => 'string' ],
                    'commission_rate' => [ 'type' => 'number' ],
                    'message'         => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'admin' ],
            'meta'                => [
                'annotations'  => [ 'destructive' => false ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $vendor_id = isset( $input['vendor_id'] ) ? (int) $input['vendor_id'] : 0;
        $rate      = isset( $input['commission_rate'] ) ? (float) $input['commission_rate'] : -1;
        $type      = isset( $input['commission_type'] ) ? sanitize_key( $input['commission_type'] ) : 'percentage';

        if ( $vendor_id <= 0 ) {
            return new \WP_Error( 'invalid_vendor', __( 'A valid vendor_id is required.', 'dokan-lite' ) );
        }
        if ( $rate < 0 ) {
            return new \WP_Error( 'invalid_rate', __( 'commission_rate must be zero or positive.', 'dokan-lite' ) );
        }

        update_user_meta( $vendor_id, 'dokan_admin_percentage_type', $type );
        update_user_meta( $vendor_id, 'dokan_admin_percentage', $rate );

        if ( 'combine' === $type && isset( $input['additional_fee'] ) ) {
            update_user_meta( $vendor_id, 'dokan_admin_additional_fee', (float) $input['additional_fee'] );
        }

        do_action( 'dokan_vendor_commission_updated', $vendor_id, $type, $rate );

        return [
            'vendor_id'       => $vendor_id,
            'commission_type' => $type,
            'commission_rate' => $rate,
            'message'         => __( 'Vendor commission updated.', 'dokan-lite' ),
        ];
    }
}
