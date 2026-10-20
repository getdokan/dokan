<?php

namespace WeDevs\Dokan\Abilities\Mcp;

use WeDevs\Dokan\Contracts\Hookable;

defined( 'ABSPATH' ) || exit;

/**
 * Keeps live credentials in step with the accounts behind them.
 *
 * A connection acts as the person who granted it, so when that person is deleted, loses the
 * role the connection depends on, or has their store's selling disabled, every credential they
 * hold has to stop working.
 *
 * @since DOKAN_SINCE
 */
class Grants implements Hookable {

    /**
     * Register hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'deleted_user', [ $this, 'revoke_user' ] );
        add_action( 'set_user_role', [ $this, 'revoke_when_no_longer_allowed' ] );
        add_action( 'remove_user_role', [ $this, 'revoke_when_no_longer_allowed' ] );
        add_action( 'dokan_vendor_disabled', [ $this, 'revoke_user' ] );
    }

    /**
     * Revoke everything a user holds.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id The user.
     *
     * @return void
     */
    public function revoke_user( $user_id ): void {
        $user_id = (int) $user_id;

        OAuth::revoke_user( $user_id );
        Tokens::revoke( $user_id );
    }

    /**
     * Revoke a user's credentials when a role change costs them the right to connect.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id The user whose roles changed.
     *
     * @return void
     */
    public function revoke_when_no_longer_allowed( $user_id ): void {
        $user_id = (int) $user_id;

        if ( Access::user_can_connect( $user_id ) ) {
            return;
        }

        $this->revoke_user( $user_id );
    }
}
