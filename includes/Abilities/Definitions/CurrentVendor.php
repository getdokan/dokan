<?php

namespace WeDevs\Dokan\Abilities\Definitions;

use WeDevs\Dokan\Abilities\Support\VendorPayload;

defined( 'ABSPATH' ) || exit;

/**
 * Ability: resolve the current Dokan identity ("who am I").
 *
 * Lets an MCP orchestrator answer questions like "my products" by first discovering whether the
 * authenticated user is a vendor, vendor staff, or a store admin, and which store they act for.
 * When the caller is a vendor or staff, the catalog/order abilities are already scoped to that
 * store automatically.
 *
 * @since DOKAN_SINCE
 */
class CurrentVendor extends AbstractVendorAbility {

    /**
     * Ability name.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_name(): string {
        return 'dokan/current-vendor';
    }

    /**
     * Ability registration arguments.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public static function get_registration_args(): array {
        return [
            'label'               => __( 'Get current vendor', 'dokan-lite' ),
            'description'         => __( 'Resolve the authenticated user\'s Dokan identity: whether they are a vendor, vendor staff, or store admin, and which store they act for. Use this to interpret "my" requests such as "my products".', 'dokan-lite' ),
            'category'            => 'dokan',
            'input_schema'        => [
                'type'                 => 'object',
                'properties'           => [],
                'additionalProperties' => false,
                // Allows the ability to be invoked with no arguments: the Abilities API normalizes a
                // null input to this default before schema validation (see WP_Ability::normalize_input()).
                'default'              => [],
            ],
            'output_schema'       => [
                'type'                 => 'object',
                'properties'           => [
                    'user_id'    => [ 'type' => 'integer' ],
                    'vendor_id'  => [
                        'type'        => 'integer',
                        'description' => __( 'The store the user acts for (their own, or their parent vendor for staff). 0 when the user is not a vendor.', 'dokan-lite' ),
                    ],
                    'store_name' => [ 'type' => 'string' ],
                    'is_vendor'  => [ 'type' => 'boolean' ],
                    'is_staff'   => [ 'type' => 'boolean' ],
                    'is_admin'   => [ 'type' => 'boolean' ],
                ],
                'additionalProperties' => false,
            ],
            'execute_callback'    => [ __CLASS__, 'execute' ],
            // Always answers "who am I" (returns an empty/anonymous identity when not logged in)
            // so an orchestrator can reason about it instead of hitting a permission error.
            'permission_callback' => '__return_true',
            'meta'                => self::base_meta( true ),
        ];
    }

    /**
     * Execute the ability.
     *
     * @since DOKAN_SINCE
     *
     * @param array $input Ability input.
     *
     * @return array
     */
    public static function execute( array $input ) {
        $user_id   = get_current_user_id();
        $vendor_id = self::current_vendor_id();
        $is_admin  = current_user_can( 'manage_woocommerce' );
        $is_staff  = user_can( $user_id, 'vendor_staff' );

        // Store admins/shop managers hold the `dokandar` cap by default, so the cap alone cannot
        // tell an admin apart from a real seller. A non-admin with the seller cap is a vendor; an
        // admin counts as a vendor only when selling is actually enabled for their account (so an
        // admin who is also a vendor is recognized, but a plain admin is not).
        $is_vendor = dokan_is_user_seller( $vendor_id )
            && ( ! $is_admin || dokan_is_seller_enabled( $vendor_id ) );

        // Via VendorPayload so a vendor with no shop name falls back to their display name,
        // matching the `vendor` block on product and order output.
        $store_name = $is_vendor ? (string) VendorPayload::for_user( $vendor_id )['store_name'] : '';

        return [
            'user_id'    => $user_id,
            'vendor_id'  => $is_vendor ? $vendor_id : 0,
            'store_name' => $store_name,
            'is_vendor'  => $is_vendor,
            'is_staff'   => $is_staff,
            'is_admin'   => $is_admin,
        ];
    }
}
