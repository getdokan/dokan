<?php

namespace WeDevs\Dokan\Abilities\Definitions;

defined( 'ABSPATH' ) || exit;

/**
 * Ability: list / search vendors.
 *
 * Lets an admin or shop manager discover the vendor to assign a product to (the `vendor_id`
 * consumed by the product-create abilities). Restricted to store managers.
 *
 * @since DOKAN_SINCE
 */
class VendorsQuery extends AbstractVendorAbility {

    /**
     * Ability name.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_name(): string {
        return 'dokan/vendors-query';
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
            'label'               => __( 'List vendors', 'dokan-lite' ),
            'description'         => __( 'Search the marketplace vendors to find the vendor a product should be assigned to.', 'dokan-lite' ),
            'category'            => 'dokan',
            'input_schema'        => [
                'type'                 => 'object',
                'properties'           => [
                    'search'   => [
                        'type'        => 'string',
                        'description' => __( 'Filter vendors by name, email, or login.', 'dokan-lite' ),
                    ],
                    'status'   => [
                        'type'    => 'string',
                        'enum'    => [ 'approved', 'pending', 'all' ],
                        'default' => 'approved',
                    ],
                    'page'     => [
                        'type'    => 'integer',
                        'minimum' => 1,
                        'default' => 1,
                    ],
                    'per_page' => [
                        'type'    => 'integer',
                        'minimum' => 1,
                        'maximum' => 100,
                        'default' => 10,
                    ],
                ],
                'additionalProperties' => false,
                'default'              => [],
            ],
            'output_schema'       => [
                'type'                 => 'object',
                'properties'           => [
                    'vendors'  => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'id'         => [ 'type' => 'integer' ],
                                'store_name' => [ 'type' => 'string' ],
                                'shop_url'   => [ 'type' => 'string' ],
                                'enabled'    => [ 'type' => 'boolean' ],
                            ],
                        ],
                    ],
                    'page'     => [ 'type' => 'integer' ],
                    'per_page' => [ 'type' => 'integer' ],
                ],
                'additionalProperties' => false,
            ],
            'execute_callback'    => [ __CLASS__, 'execute' ],
            // The store directory is public marketplace data (mirrors the public
            // `dokan/v1/stores` REST endpoint), so vendor listing is available to everyone.
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
     * @return array|\WP_Error
     */
    public static function execute( array $input ) {
        $status   = isset( $input['status'] ) ? sanitize_key( (string) $input['status'] ) : 'approved';
        $page     = max( 1, (int) ( $input['page'] ?? 1 ) );
        $per_page = min( 100, max( 1, (int) ( $input['per_page'] ?? 10 ) ) );

        $args = [
            'role__in' => [ 'seller' ],
            'number'   => $per_page,
            'offset'   => ( $page - 1 ) * $per_page,
            'status'   => [ $status ],
        ];

        if ( ! empty( $input['search'] ) ) {
            $args['search'] = '*' . wc_clean( (string) $input['search'] ) . '*';
        }

        $vendors = dokan()->vendor->get_vendors( $args );

        $items = array_map(
            static function ( $vendor ) {
                return [
                    'id'         => (int) $vendor->get_id(),
                    'store_name' => (string) $vendor->get_shop_name(),
                    'shop_url'   => (string) $vendor->get_shop_url(),
                    'enabled'    => (bool) $vendor->is_enabled(),
                ];
            },
            $vendors
        );

        return [
            'vendors'  => $items,
            'page'     => $page,
            'per_page' => $per_page,
        ];
    }
}
