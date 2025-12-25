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
     * Check if user has vendor permission.
     *
     * @since 3.14.11
     *
     * @return bool
     */
    public function check_vendor_authorizable_permission( $vendor_id ) {
        $vendor = dokan()->vendor->get( $vendor_id );

        if ( ! $vendor || ! $vendor->get_id() ) {
            return false;
        }

        // Admin can access any vendor
        if ( current_user_can( 'manage_options' ) ) {
            return true;
        }

        $current_user_id = get_current_user_id();

        // Vendor accessing own store
        if ( dokan_is_user_seller( $current_user_id, true ) ) {
            return (int) $current_user_id === (int) $vendor_id;
        }

        // Vendor staff
        if ( user_can( $current_user_id, 'vendor_staff' ) ) {
            $staff_vendor_id = (int) get_user_meta( $current_user_id, '_vendor_id', true );
            return $staff_vendor_id === (int) $vendor_id;
        }

        return false;
    }

}
