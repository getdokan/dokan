<?php

namespace WeDevs\Dokan\Abilities\Definitions;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Ability: order counts per status for one store.
 *
 * The cheapest high-value order read: "how many orders are pending or processing" without
 * pulling a single customer row. Vendors and their staff get their own store; a Store Admin may
 * name any store with `vendor_id`.
 *
 * @since DOKAN_SINCE
 */
class OrdersSummaryGet extends AbstractVendorAbility {

    /**
     * Ability name.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_name(): string {
        return 'dokan/orders-summary-get';
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
            'label'               => __( 'Get order summary', 'dokan-lite' ),
            'description'         => __( 'Order counts per status for a store, without any customer data. Vendors and vendor staff get their own store; a store admin may pass vendor_id to pick a store.', 'dokan-lite' ),
            'category'            => 'dokan',
            'input_schema'        => [
                'type'                 => 'object',
                'properties'           => [
                    'vendor_id' => [
                        'type'        => 'integer',
                        'minimum'     => 1,
                        'description' => __( 'Store to count orders for. Store admins only; vendors always get their own store.', 'dokan-lite' ),
                    ],
                ],
                'additionalProperties' => false,
                'default'              => [],
            ],
            'output_schema'       => [
                'type'                 => 'object',
                'properties'           => [
                    'vendor_id' => [ 'type' => 'integer' ],
                    'total'     => [
                        'type'        => 'integer',
                        'description' => __( 'All orders of the store, every status.', 'dokan-lite' ),
                    ],
                    'counts'    => [
                        'type'                 => 'object',
                        'description'          => __( 'Order count per status slug, e.g. processing, on-hold, completed.', 'dokan-lite' ),
                        'additionalProperties' => [ 'type' => 'integer' ],
                    ],
                ],
                'additionalProperties' => false,
            ],
            'execute_callback'    => [ __CLASS__, 'execute' ],
            'permission_callback' => [ __CLASS__, 'check_permission' ],
            'meta'                => self::base_meta( true ),
        ];
    }

    /**
     * Gated like the dashboard's order report.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected static function required_capability(): string {
        return 'dokan_view_order_report';
    }

    /**
     * Execute the ability.
     *
     * @since DOKAN_SINCE
     *
     * @param array $input Ability input.
     *
     * @return array|WP_Error
     */
    public static function execute( array $input ) {
        $denied = self::guard();

        if ( $denied ) {
            return $denied;
        }

        $vendor_id = self::resolve_vendor_id( $input );

        if ( is_wp_error( $vendor_id ) ) {
            return $vendor_id;
        }

        $raw = (array) dokan()->order->count_orders( $vendor_id );

        return [
            'vendor_id' => $vendor_id,
            'total'     => (int) ( $raw['total'] ?? 0 ),
            'counts'    => self::counts_by_status( $raw ),
        ];
    }

    /**
     * The store to count for: a vendor or staff member's own, or the one a Store Admin named.
     *
     * @since DOKAN_SINCE
     *
     * @param array $input Ability input.
     *
     * @return int|WP_Error
     */
    protected static function resolve_vendor_id( array $input ) {
        // Everyone below Store Admin is pinned to their own store, whatever they pass.
        if ( ! self::is_store_admin() ) {
            return self::current_vendor_id();
        }

        if ( ! empty( $input['vendor_id'] ) ) {
            $vendor_id = absint( $input['vendor_id'] );

            if ( ! dokan_is_user_seller( $vendor_id ) ) {
                return new WP_Error( 'dokan_ability_invalid_vendor', __( 'The selected vendor_id is not a valid vendor.', 'dokan-lite' ), [ 'status' => 400 ] );
            }

            return $vendor_id;
        }

        $own = self::current_vendor_id();

        // A Store Admin without a store of their own has to say which store they mean.
        if ( $own <= 0 || ! dokan_is_user_seller( $own ) ) {
            return new WP_Error( 'dokan_ability_invalid_vendor', __( 'Pass vendor_id: a store admin has to name the store to count orders for.', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        return $own;
    }

    /**
     * Counts keyed by status slug, as agents and the REST API speak it.
     *
     * @since DOKAN_SINCE
     *
     * @param array $raw Output of `dokan()->order->count_orders()`: keyed `wc-<status>`, plus `total`.
     *
     * @return array<string, int>
     */
    protected static function counts_by_status( array $raw ): array {
        $counts = [];

        foreach ( $raw as $status => $count ) {
            if ( 'total' === $status ) {
                continue;
            }

            // Stored as `wc-processing`; agents and the REST API speak `processing`.
            $counts[ preg_replace( '/^wc-/', '', (string) $status ) ] = (int) $count;
        }

        return $counts;
    }
}
