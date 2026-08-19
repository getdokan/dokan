<?php

namespace WeDevs\Dokan\Abilities\Definitions;

defined( 'ABSPATH' ) || exit;

/**
 * Ability: get the current vendor's high-level stats (balance + withdraw summary).
 *
 * @since DOKAN_SINCE
 */
class VendorStatsGet extends AbstractVendorAbility {

    /**
     * Ability name.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_name(): string {
        return 'dokan/vendor-stats-get';
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
            'label'               => __( 'Get vendor stats', 'dokan-lite' ),
            'description'         => __( 'Get the current vendor\'s available balance and withdrawal summary.', 'dokan-lite' ),
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
                    'vendor_id'        => [ 'type' => 'integer' ],
                    'balance'          => [
                        'type'        => 'number',
                        'description' => __( 'Current available balance for withdrawal.', 'dokan-lite' ),
                    ],
                    'withdraw_summary' => [
                        'type'       => 'object',
                        'properties' => [
                            'total'     => [ 'type' => 'integer' ],
                            'pending'   => [ 'type' => 'integer' ],
                            'approved'  => [ 'type' => 'integer' ],
                            'cancelled' => [ 'type' => 'integer' ],
                        ],
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
     * Balance and earnings are gated on the sales-overview capability.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected static function required_capability(): string {
        return 'dokan_view_sales_overview';
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
        $denied = self::guard();

        if ( $denied ) {
            return $denied;
        }

        $vendor_id = self::current_vendor_id();
        $withdraw  = dokan()->withdraw;

        return [
            'vendor_id'        => $vendor_id,
            'balance'          => (float) $withdraw->get_user_balance( $vendor_id ),
            'withdraw_summary' => $withdraw->get_user_withdraw_summary( $vendor_id ),
        ];
    }
}
