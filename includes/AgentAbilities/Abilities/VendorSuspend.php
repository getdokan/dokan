<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan/vendor-suspend — suspend a vendor.
 * Admin-only, destructive (vendor can no longer sell).
 */
class VendorSuspend {

    const NAME = 'dokan/vendor-suspend';

    public static function definition(): array {
        return [
            'label'               => __( 'Suspend Vendor', 'dokan-lite' ),
            'description'         => __( 'Suspend a vendor so they cannot sell. Their existing products remain visible but new orders are blocked. Reversible by approving again.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'vendor_id' => [ 'type' => 'integer', 'required' => true ],
                    'reason'    => [ 'type' => 'string' ],
                ],
                'required'   => [ 'vendor_id' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'vendor_id' => [ 'type' => 'integer' ],
                    'enabled'   => [ 'type' => 'boolean' ],
                    'message'   => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'admin' ],
            'meta'                => [
                'annotations'  => [ 'destructive' => true ],
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

        if ( method_exists( $vendor, 'make_inactive' ) ) {
            $vendor->make_inactive();
        } else {
            update_user_meta( $vendor_id, 'dokan_enable_selling', 'no' );
        }

        if ( ! empty( $input['reason'] ) ) {
            update_user_meta( $vendor_id, 'dokan_suspend_reason', sanitize_text_field( $input['reason'] ) );
        }

        do_action( 'dokan_vendor_suspended', $vendor_id );

        return [
            'vendor_id' => $vendor_id,
            'enabled'   => false,
            'message'   => __( 'Vendor suspended.', 'dokan-lite' ),
        ];
    }
}
