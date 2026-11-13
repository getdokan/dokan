<?php

namespace WeDevs\Dokan\CJDropshipping\Vendor;

use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\CJDropshipping\Status;

/**
 * Who may use CJ Dropshipping in the vendor dashboard.
 *
 * @since DOKAN_SINCE
 */
class Access {

    public const TERMS_META = 'dokan_cj_terms_accepted_at';

    /**
     * Why a user can't use CJ, or an empty string when they can.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User id.
     *
     * @return string One of: disabled, not_vendor, staff, inactive, not_allowed, or ''.
     */
    public static function blocked_reason( int $user_id ): string {
        if ( ! Settings::is_enabled() ) {
            return 'disabled';
        }

        if ( ! dokan_is_user_seller( $user_id ) ) {
            return 'not_vendor';
        }

        // Only the store owner works with CJ (E1).
        if ( ! dokan_is_user_seller( $user_id, true ) ) {
            return 'staff';
        }

        if ( ! dokan_is_seller_enabled( $user_id ) ) {
            return 'inactive';
        }

        // Pro limits CJ to chosen subscription packs (E3).
        if ( ! apply_filters( 'dokan_cj_vendor_can_use', true, $user_id ) ) {
            return 'not_allowed';
        }

        return '';
    }

    /**
     * Whether a user can use CJ.
     *
     * @since DOKAN_SINCE
     *
     * @param int $user_id User id.
     *
     * @return bool
     */
    public static function can_use( int $user_id ): bool {
        return '' === self::blocked_reason( $user_id );
    }

    /**
     * Whether the vendor ticked "I understand" in the start step (E8).
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id.
     *
     * @return bool
     */
    public static function has_accepted_terms( int $vendor_id ): bool {
        return (bool) get_user_meta( $vendor_id, self::TERMS_META, true );
    }

    /**
     * Record that the vendor accepted the CJ terms.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id.
     *
     * @return void
     */
    public static function accept_terms( int $vendor_id ): void {
        update_user_meta( $vendor_id, self::TERMS_META, time() );
    }

    /**
     * Whether a vendor can import and sell CJ products right now.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id.
     *
     * @return bool
     */
    public static function can_import( int $vendor_id ): bool {
        return self::can_use( $vendor_id ) && self::has_accepted_terms( $vendor_id ) && Status::is_connected();
    }
}
