<?php

namespace WeDevs\Dokan\Abilities\Definitions;

defined( 'ABSPATH' ) || exit;

/**
 * Ability: list the current vendor's withdrawal requests.
 *
 * @since DOKAN_SINCE
 */
class WithdrawsQuery extends AbstractVendorAbility {

    /**
     * Ability name.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_name(): string {
        return 'dokan/withdraws-query';
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
            'label'               => __( 'List vendor withdrawals', 'dokan-lite' ),
            'description'         => __( 'List the current vendor\'s withdrawal requests, optionally filtered by status.', 'dokan-lite' ),
            'category'            => 'dokan',
            'input_schema'        => [
                'type'                 => 'object',
                'properties'           => [
                    'status'   => [
                        'type'        => 'string',
                        'description' => __( 'Filter by withdrawal status.', 'dokan-lite' ),
                        'enum'        => [ 'pending', 'approved', 'cancelled' ],
                        'default'     => 'pending',
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
                    'withdraws' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'id'                => [ 'type' => 'integer' ],
                                'amount'            => [ 'type' => 'number' ],
                                'status'            => [ 'type' => 'string' ],
                                'method'            => [ 'type' => 'string' ],
                                'charge'            => [ 'type' => 'number' ],
                                'receivable_amount' => [ 'type' => 'number' ],
                                'note'              => [ 'type' => 'string' ],
                                'date'              => [ 'type' => 'string' ],
                            ],
                        ],
                    ],
                    'page'      => [ 'type' => 'integer' ],
                    'per_page'  => [ 'type' => 'integer' ],
                ],
                'additionalProperties' => false,
            ],
            'execute_callback'    => [ __CLASS__, 'execute' ],
            'permission_callback' => [ __CLASS__, 'is_current_user_vendor' ],
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
        $vendor_id = self::current_vendor_id();

        if ( ! dokan_is_user_seller( $vendor_id ) ) {
            return self::forbidden();
        }

        $withdraw = dokan()->withdraw;

        $status   = isset( $input['status'] ) ? (string) $input['status'] : 'pending';
        $page     = max( 1, (int) ( $input['page'] ?? 1 ) );
        $per_page = min( 100, max( 1, (int) ( $input['per_page'] ?? 10 ) ) );
        $offset   = ( $page - 1 ) * $per_page;

        $status_code = (int) $withdraw->get_status_code( $status );

        $requests = $withdraw->get_withdraw_requests( $vendor_id, $status_code, $per_page, $offset );

        $items = array_map(
            static function ( $request ) use ( $withdraw ) {
                return [
                    'id'                => (int) $request->get_id(),
                    'amount'            => (float) $request->get_amount(),
                    'status'            => (string) $withdraw->get_status_name( $request->get_status() ),
                    'method'            => (string) $request->get_method(),
                    'charge'            => (float) $request->get_charge(),
                    'receivable_amount' => (float) $request->get_receivable_amount(),
                    'note'              => (string) $request->get_note(),
                    'date'              => (string) $request->get_date(),
                ];
            },
            $requests
        );

        return [
            'withdraws' => $items,
            'page'      => $page,
            'per_page'  => $per_page,
        ];
    }
}
