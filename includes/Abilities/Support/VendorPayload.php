<?php

namespace WeDevs\Dokan\Abilities\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Builds the small `{ id, store_name }` vendor payload attached to ability output.
 *
 * Shared by the product and order ability scopers so a vendor is represented identically
 * everywhere. When a seller has no shop name set — e.g. an administrator who also owns orders /
 * products but never configured a store — the WordPress display name is used so the payload is
 * never an empty label.
 *
 * @since DOKAN_SINCE
 */
class VendorPayload {

    /**
     * Build the vendor payload for a user (vendor) ID.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id Vendor / seller user ID. `0` for "no vendor" (e.g. a parent order).
     *
     * @return array{id:int, store_name:string}
     */
    public static function for_user( int $user_id ): array {
        if ( $user_id <= 0 ) {
            return [
                'id'         => 0,
                'store_name' => '',
            ];
        }

        $vendor     = dokan()->vendor->get( $user_id );
        $store_name = $vendor ? (string) $vendor->get_shop_name() : '';

        // Fall back to the user's display name when no shop name is configured.
        if ( '' === $store_name ) {
            $user       = get_userdata( $user_id );
            $store_name = $user ? (string) $user->display_name : '';
        }

        return [
            'id'         => $user_id,
            'store_name' => $store_name,
        ];
    }
}
