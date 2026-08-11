<?php

namespace WeDevs\Dokan\AgentAbilities\Abilities;

use WeDevs\Dokan\AgentAbilities\Permissions;

/**
 * dokan-vendor/withdrawal-request — vendor requests a payout.
 *
 * Sensitive financial action. Restricted to parent vendor only — staff
 * cannot request withdrawals even if they're logged in (financial
 * decisions stay with the account owner).
 *
 * Validates amount against vendor's available balance and minimum-withdraw
 * threshold before creating the request.
 */
class VendorWithdrawalRequest {

    const NAME = 'dokan-vendor/withdrawal-request';

    public static function definition(): array {
        return [
            'label'               => __( 'Request Withdrawal (Vendor)', 'dokan-lite' ),
            'description'         => __( 'Request a payout of your available marketplace balance. The request is queued for marketplace approval. Only parent vendors can request — staff accounts are blocked from financial actions by design.', 'dokan-lite' ),
            'category'            => 'dokan-marketplace',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'amount' => [ 'type' => 'number', 'minimum' => 0.01, 'required' => true ],
                    'method' => [ 'type' => 'string', 'description' => __( 'Payout method slug (e.g. paypal, bank, skrill).', 'dokan-lite' ), 'required' => true ],
                    'note'   => [ 'type' => 'string' ],
                ],
                'required'   => [ 'amount', 'method' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'request_id' => [ 'type' => 'integer' ],
                    'amount'     => [ 'type' => 'number' ],
                    'method'     => [ 'type' => 'string' ],
                    'status'     => [ 'type' => 'string' ],
                    'message'    => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [ self::class, 'execute' ],
            'permission_callback' => [ Permissions::class, 'vendor_only_no_staff' ],
            'meta'                => [
                'annotations'  => [ 'destructive' => false ],
                'show_in_rest' => true,
            ],
        ];
    }

    public static function execute( $input ) {
        $current = (int) get_current_user_id();

        // Explicitly forbid vendor staff from initiating a payout. Use the
        // raw get_current_user_id() here so the comparison is on the actual
        // logged-in account, not the parent vendor that dokan_get_current_user_id() returns.
        if ( function_exists( 'dokan_is_user_seller' ) && ! dokan_is_user_seller( $current, true ) ) {
            return new \WP_Error( 'rest_forbidden', __( 'Only parent vendors can request withdrawals. Staff cannot perform financial actions.', 'dokan-lite' ), [ 'status' => 403 ] );
        }

        $vendor_id = $current;
        $amount    = isset( $input['amount'] ) ? (float) $input['amount'] : 0;
        $method    = isset( $input['method'] ) ? sanitize_key( $input['method'] ) : '';
        $note      = isset( $input['note'] ) ? sanitize_textarea_field( $input['note'] ) : '';

        if ( $amount <= 0 ) {
            return new \WP_Error( 'invalid_amount', __( 'Withdrawal amount must be greater than zero.', 'dokan-lite' ) );
        }
        if ( '' === $method ) {
            return new \WP_Error( 'invalid_method', __( 'A payout method is required.', 'dokan-lite' ) );
        }

        if ( ! function_exists( 'dokan_get_seller_balance' ) ) {
            return new \WP_Error( 'dokan_unavailable', __( 'Dokan is not active.', 'dokan-lite' ) );
        }

        $balance = (float) dokan_get_seller_balance( $vendor_id, false );
        if ( $amount > $balance ) {
            return new \WP_Error(
                'insufficient_balance',
                sprintf(
                    __( 'Requested %1$s exceeds your available balance of %2$s.', 'dokan-lite' ),
                    wc_price( $amount ),
                    wc_price( $balance )
                )
            );
        }

        $minimum = (float) dokan_get_option( 'withdraw_limit', 'dokan_withdraw', 0 );
        if ( $minimum > 0 && $amount < $minimum ) {
            return new \WP_Error(
                'below_minimum',
                sprintf(
                    __( 'Minimum withdrawal amount on this marketplace is %s.', 'dokan-lite' ),
                    wc_price( $minimum )
                )
            );
        }

        // Build the request row Dokan's withdrawal controller writes to wp_dokan_withdraw.
        global $wpdb;
        $table  = $wpdb->prefix . 'dokan_withdraw';
        $result = $wpdb->insert(
            $table,
            [
                'user_id' => $vendor_id,
                'amount'  => $amount,
                'date'    => current_time( 'mysql' ),
                'status'  => 0, // 0 = pending in Dokan's withdrawal lifecycle.
                'method'  => $method,
                'note'    => $note,
                'ip'      => '',
            ],
            [ '%d', '%f', '%s', '%d', '%s', '%s', '%s' ]
        );

        if ( ! $result ) {
            return new \WP_Error( 'create_failed', __( 'Could not create withdrawal request.', 'dokan-lite' ) );
        }

        $request_id = (int) $wpdb->insert_id;

        do_action( 'dokan_after_withdraw_request', $vendor_id, $amount, $method );

        return [
            'request_id' => $request_id,
            'amount'     => $amount,
            'method'     => $method,
            'status'     => 'pending',
            'message'    => __( 'Withdrawal request submitted. The marketplace operator will review and process it.', 'dokan-lite' ),
        ];
    }
}
