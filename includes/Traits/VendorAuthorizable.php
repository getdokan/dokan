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
    public function check_vendor_authorizable_permission( $vendor_id ) {
        if( ! $vendor_id ) {
            return false;
        }

        $vendor = dokan()->vendor->get( $vendor_id );

        if ( ! $vendor || ! $vendor->get_id() ) {
            return false;
        }

        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        $current_user_id = get_current_user_id();

        if ( dokan_is_user_seller( $current_user_id, true ) ) {
            return (int) $current_user_id === (int) $vendor_id;
        }

        if ( user_can( $current_user_id, 'vendor_staff' ) ) {
            $staff_vendor_id = (int) get_user_meta( $current_user_id, '_vendor_id', true );
            return $staff_vendor_id === (int) $vendor_id;
        }

        return false;
    }

    /**
     * Get vendor ID for a user.
     *
     * Returns the vendor ID for a vendor or the parent vendor ID for vendor staff.
     *
     * @param int|null $user_id Optional. User ID to check. Defaults to current user.
     *
     * @return int|false|null Vendor ID on success, false if staff has no vendor, null if not vendor or staff.
     */
    public function get_user_vendor_id( $user_id = null ) {
        if ( empty( $user_id ) ) {
            $user_id = get_current_user_id();
        }

        if ( dokan_is_user_seller( $user_id, true ) ) {
            return (int) $user_id;
        }

        if ( user_can( $user_id, 'vendor_staff' ) ) {
            $vendor_id = (int) get_user_meta( $user_id, '_vendor_id', true );

            if ( empty( $vendor_id ) ) {
                return false;
            }

            return $vendor_id;
        }

        return null;
    }
}
