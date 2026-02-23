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
     * This method determines authorization based on user role:
     * - Admins: Can access any vendor (including invalid vendor IDs for proper error handling)
     * - Vendors: Can access only their own store
     * - Vendor staff: Can access only their assigned vendor store
     * - Others: Cannot access any vendor store
     *
     *  @since 4.2.5
     *
     * @param int $vendor_id Vendor user ID.
     * @param int $user_id Optional. User ID. Defaults to current user.
     *
     * @return bool True if authorized, false otherwise.
     */
    public function can_access_vendor_store( int $vendor_id, int $user_id = 0 ): bool {
        if ( empty( $user_id ) ) {
            $user_id = get_current_user_id();
        }

        // Admins can access any vendor (including invalid ones for proper error handling)
        if ( user_can( $user_id, 'manage_woocommerce' ) ) {
            return true;
        }

        // Non-admin users cannot access stores with invalid vendor ID
        if ( ! $vendor_id ) {
            return false;
        }

        $current_user_id = $this->get_vendor_id_for_user( $user_id );

        if ( dokan_is_user_seller( $current_user_id ) ) {
            return (int) $current_user_id === (int) $vendor_id;
        }

        return false;
    }

    /**
     * Get the vendor/store ID associated with a user.
     *
     * This method delegates to VendorUtil::get_vendor_id_for_user().
     * It determines the vendor ID based on the user's role:
     * - Vendors: Returns their own user ID as the vendor ID
     * - Vendor staff: Returns their parent vendor's ID (stored in user meta)
     * - Other users: Returns 0 if not associated with any vendor
     *
     *  @since 4.2.5
     *
     * @param int $user_id Optional. The user ID to get the vendor ID for. Defaults to 0 (current user).
     *
     * @return int The vendor/store ID. Returns 0 if the user is not a vendor or vendor staff,
     *             or if vendor ID cannot be determined.
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
     * Used for REST API validation callbacks. The validation ensures that:
     * - The provided value is greater than 0
     * - The vendor ID resolved from the value is greater than 0
     *
     *  @since 4.2.5
     *
     * @param mixed          $value   The value to validate (typically a user ID).
     * @param \WP_REST_Request $request The REST API request object.
     * @param string         $key     The parameter key being validated.
     *
     * @return bool|\WP_Error True if valid, WP_Error with status 400 if invalid.
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

    /**
     * Check if a user is vendor staff (not a vendor owner).
     *
     * @since 4.2.5
     *
     * @param int $user_id User ID to check.
     * @return bool True if user is vendor staff but not a vendor owner.
     */
    public function is_staff_only( int $user_id ): bool {
        return ! dokan_is_user_seller( $user_id, true ) && dokan_is_user_seller( $user_id );
    }
}
