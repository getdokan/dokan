<?php

namespace WeDevs\Dokan\Traits;

trait VendorAuthorizable {

    /**
     * Check if user has vendor permission.
     *
     * @since 3.14.11
     *
     * @return bool
     */
    public function check_permission() {
        return current_user_can( 'dokandar' );
    }

    /**
     * Check whether the current user is authorized to access a vendor store.
     *
     * Admins can access any vendor.
     * Vendors can access only their own store.
     * Vendor staff can access only their assigned vendor store.
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return bool True if authorized, false otherwise.
     */
    public function can_access_vendor_store( int $vendor_id ): bool {
        if ( ! $vendor_id ) {
            return false;
        }

        $vendor = dokan()->vendor->get( $vendor_id );

        if ( ! $vendor || ! $vendor->get_id() ) {
            return false;
        }

        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        $current_user_id = dokan_get_current_user_id();

        if ( dokan_is_user_seller( $current_user_id ) ) {
            return (int) $current_user_id === (int) $vendor_id;
        }

        return false;
    }

    /**
     * Get vendor/store ID for a user.
     *
     * Vendors return their own ID.
     * Vendor staff return their parent vendor ID.
     * Others return 0.
     *
     * @param int $user_id Optional. User ID. Defaults to current user.
     *
     * @return int Vendor/store ID or 0 if unavailable.
     */
    public function get_vendor_id_for_user( int $user_id = 0 ): int {
        if ( empty( $user_id ) ) {
            $user_id = dokan_get_current_user_id();
        }

        if ( dokan_is_user_seller( $user_id, true ) ) {
            return (int) $user_id;
        }

        if ( user_can( $user_id, 'vendor_staff' ) ) {
            $vendor_id = (int) get_user_meta( $user_id, '_vendor_id', true );

            return $vendor_id;
        }

        return 0;
    }
}
