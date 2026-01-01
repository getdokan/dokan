<?php

namespace WeDevs\Dokan\Traits;

use WeDevs\Dokan\Utilities\VendorUtil;

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
     * @param int $user_id Optional. User ID. Defaults to current user.
     *
     * @return bool True if authorized, false otherwise.
     */
    public function can_access_vendor_store( int $vendor_id, int $user_id = 0 ): bool {
        if ( ! $vendor_id ) {
            return false;
        }

        if ( empty( $user_id ) ) {
            $user_id = get_current_user_id();
        }

        if ( user_can( $user_id, 'manage_woocommerce' ) ) {
            return true;
        }

        $current_user_id = $this->get_vendor_id_for_user( $user_id );

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
        return VendorUtil::get_vendor_id_for_user( $user_id );
    }

    /**
     * Validate if a user ID represents a valid vendor or vendor staff member.
     *
     * This method checks if the given ID belongs to:
     * - A valid vendor user, or
     * - A vendor staff member with a valid associated vendor.
     *
     * Used for REST API validation callbacks.
     *
     * @param mixed          $value   The value to validate.
     * @param \WP_REST_Request $request The REST API request object.
     * @param string         $key     The parameter key.
     *
     * @return bool|\WP_Error True if valid, WP_Error if invalid.
     */
    public function validate_store_id( $value, $request, $key ) {
        $vendor_id = $this->get_vendor_id_for_user( $value );

        // Validate that the vendor ID is a valid store/vendor.
        // $vendor_id is fetched via get_vendor_id_for_user: for vendors, it's their own ID; for vendor staff, it's their parent vendor's ID.
        // If both $value and $vendor_id are > 0, the ID is considered valid and belongs to a store/vendor.
        // Otherwise, return a WP_Error indicating the store was not found.
        if ( $value > 0 && $vendor_id > 0 ) {
            return true;
        }

        // translators: 1) rest api endpoint key name
        return new \WP_Error( 'rest_invalid_param', sprintf( esc_html__( 'No store found with given store id', 'dokan-lite' ), $key ), [ 'status' => 400 ] );
    }
}
