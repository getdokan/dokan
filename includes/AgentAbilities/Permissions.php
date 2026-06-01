<?php

namespace WeDevs\Dokan\AgentAbilities;

/**
 * Shared permission callbacks for Dokan abilities.
 *
 * IMPORTANT: vendor-scoped callbacks use dokan_get_current_user_id() — not
 * get_current_user_id() — so vendor staff with delegated capabilities resolve
 * to the parent vendor's ID. Otherwise sub-vendor staff could query the
 * parent's orders after their permission was revoked.
 */
class Permissions {

    public static function public_read() {
        return true;
    }

    public static function admin() {
        return current_user_can( 'manage_woocommerce' );
    }

    /**
     * Vendor-only abilities. Parent vendor OR vendor staff (whichever
     * matches the staff capability) can call. Admins bypass.
     */
    public static function vendor_only() {
        if ( ! is_user_logged_in() ) {
            return new \WP_Error( 'rest_forbidden', __( 'Login required.', 'dokan-lite' ), [ 'status' => 401 ] );
        }
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        $current = function_exists( 'dokan_get_current_user_id' )
            ? (int) dokan_get_current_user_id()
            : (int) get_current_user_id();

        if ( ! function_exists( 'dokan_is_user_seller' ) ) {
            return false;
        }
        return (bool) dokan_is_user_seller( $current );
    }

    /**
     * Vendor-only WITHOUT staff. Parent vendor account required —
     * staff accounts cannot call. Use for financial or store-level
     * actions where staff inheritance is unsafe.
     */
    public static function vendor_only_no_staff() {
        if ( ! is_user_logged_in() ) {
            return new \WP_Error( 'rest_forbidden', __( 'Login required.', 'dokan-lite' ), [ 'status' => 401 ] );
        }
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Use raw get_current_user_id() — must be the actual parent vendor account,
        // not the resolved parent from dokan_get_current_user_id() which would let
        // staff pass through.
        $user_id = (int) get_current_user_id();

        if ( ! function_exists( 'dokan_is_user_seller' ) ) {
            return false;
        }
        return (bool) dokan_is_user_seller( $user_id, true );
    }

    /**
     * Returns a callable that enforces "the input's vendor_id matches the
     * current Dokan user". Admin users bypass the match.
     */
    public static function vendor_self_for( string $field = 'vendor_id' ): callable {
        return function ( $input ) use ( $field ) {
            if ( ! is_user_logged_in() ) {
                return new \WP_Error( 'rest_forbidden', __( 'Login required.', 'dokan-lite' ), [ 'status' => 401 ] );
            }

            if ( current_user_can( 'manage_woocommerce' ) ) {
                return true;
            }

            $current = function_exists( 'dokan_get_current_user_id' )
                ? (int) dokan_get_current_user_id()
                : (int) get_current_user_id();

            $target  = is_array( $input ) && isset( $input[ $field ] ) ? (int) $input[ $field ] : 0;

            if ( $target > 0 && $target !== $current ) {
                return new \WP_Error( 'rest_forbidden', __( 'You can only manage your own vendor data.', 'dokan-lite' ), [ 'status' => 403 ] );
            }

            if ( ! function_exists( 'dokan_is_user_seller' ) ) {
                return false;
            }
            return (bool) dokan_is_user_seller( $current );
        };
    }
}
