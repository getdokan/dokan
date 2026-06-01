<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan/vendor-approve — approve a pending vendor.
 * Admin-only, write action.
 */
class VendorApprove {

    const NAME = 'dokan/vendor-approve';

    public static function definition(): array {
        return [
            'label'               => __( 'Approve Vendor', 'dokan-lite' ),
            'description'         => __( 'Approve a pending vendor so they can start selling. Admin only.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'vendor_id' => [ 'type' => 'integer', 'required' => true ],
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
                'annotations'  => [ 'destructive' => false ],
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

        if ( method_exists( $vendor, 'make_active' ) ) {
            $vendor->make_active();
        } else {
            update_user_meta( $vendor_id, 'dokan_enable_selling', 'yes' );
        }

        do_action( 'dokan_new_seller_created', $vendor_id );

        return [
            'vendor_id' => $vendor_id,
            'enabled'   => true,
            'message'   => __( 'Vendor approved and is now active.', 'dokan-lite' ),
        ];
    }
}
