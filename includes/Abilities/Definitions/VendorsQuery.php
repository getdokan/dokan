<?php

namespace WeDevs\Dokan\Abilities\Definitions;

defined( 'ABSPATH' ) || exit;

/**
 * Ability: list / search vendors.
 *
 * Lets an admin or shop manager discover the vendor to assign a product to (the `vendor_id`
 * consumed by the product-create abilities), and backs the public store directory.
 *
 * Listing approved vendors is public; listing pending ones is restricted to store managers.
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
                        'type'        => 'string',
                        'enum'        => [ 'approved', 'pending', 'all' ],
                        'default'     => 'approved',
                        'description' => __( 'Which vendors to list. Only store admins may list pending vendors; other callers always receive approved vendors.', 'dokan-lite' ),
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
                                'id'                => [ 'type' => 'integer' ],
                                'store_name'        => [ 'type' => 'string' ],
                                'shop_url'          => [ 'type' => 'string' ],
                                'selling_activated' => [
                                    'type'        => 'boolean',
                                    'description' => __( 'Whether the store is live and may transact (Selling Activation).', 'dokan-lite' ),
                                ],
                            ],
                        ],
                    ],
                    'page'     => [ 'type' => 'integer' ],
                    'per_page' => [ 'type' => 'integer' ],
                ],
                'additionalProperties' => false,
            ],
            'execute_callback'    => [ __CLASS__, 'execute' ],
            // The approved store directory is public marketplace data (mirrors the public
            // `dokan/v1/stores` REST endpoint), so vendor listing is available to everyone.
            // Pending vendors are not public — see resolve_status().
            'permission_callback' => '__return_true',
            'meta'                => self::base_meta( true ),
        ];
    }

    /**
     * Resolve the vendor status a caller is allowed to list.
     *
     * A vendor awaiting approval has not been accepted into the marketplace and is not public
     * information, so `pending` and `all` are restricted to Store Admins. Other callers are
     * coerced to `approved` rather than rejected, keeping the public directory usable.
     *
     * @since DOKAN_SINCE
     *
     * @param array $input Ability input.
     *
     * @return string One of `approved`, `pending`, `all`.
     */
    protected static function resolve_status( array $input ): string {
        $status = isset( $input['status'] ) ? sanitize_key( (string) $input['status'] ) : 'approved';

        if ( ! in_array( $status, [ 'approved', 'pending', 'all' ], true ) ) {
            return 'approved';
        }

        if ( 'approved' !== $status && ! self::is_store_admin() ) {
            return 'approved';
        }

        return $status;
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
        $status = self::resolve_status( $input );

        list( $page, $per_page ) = self::pagination( $input );

        // No role__in override: the Vendor Manager's default (seller + administrator) is what the
        // public `dokan/v1/stores` endpoint uses, so admin-owned stores appear here too.
        $args = [
            'number' => $per_page,
            'offset' => ( $page - 1 ) * $per_page,
            'status' => [ $status ],
        ];

        if ( ! empty( $input['search'] ) ) {
            $args['search'] = '*' . wc_clean( (string) $input['search'] ) . '*';
        }

        $vendors = dokan()->vendor->get_vendors( $args );

        $items = array_map(
            static function ( $vendor ) {
                return [
                    'id'                => (int) $vendor->get_id(),
                    'store_name'        => (string) $vendor->get_shop_name(),
                    'shop_url'          => (string) $vendor->get_shop_url(),
                    'selling_activated' => (bool) $vendor->is_enabled(),
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
