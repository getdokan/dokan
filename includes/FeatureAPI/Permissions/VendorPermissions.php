<?php
/**
 * Vendor Permissions for Feature API
 *
 * @package WeDevs\Dokan\FeatureAPI\Permissions
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Permissions;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Vendor Permissions
 *
 * @since 4.0.0
 */
class VendorPermissions {

    /**
     * Check if user can list vendors
     *
     * @return bool
     */
    public static function can_list_vendors() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_view_vendor_list' );
    }

    /**
     * Check if user can create vendors
     *
     * @return bool
     */
    public static function can_create_vendor() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_create_vendor' );
    }

    /**
     * Check if user can view vendor details
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_view_vendor( $vendor_id = 0 ) {
        // Admin can view any vendor
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own details
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor' );
    }

    /**
     * Check if user can update vendor
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_update_vendor( $vendor_id = 0 ) {
        // Admin can update any vendor
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can update their own details
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_update_vendor' );
    }

    /**
     * Check if user can delete vendor
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_delete_vendor( $vendor_id = 0 ) {
        // Only admin can delete vendors
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return false;
        }

        // Prevent admin from deleting themselves
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can approve vendor
     *
     * @return bool
     */
    public static function can_approve_vendor() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_approve_vendor' );
    }

    /**
     * Check if user can disable vendor
     *
     * @return bool
     */
    public static function can_disable_vendor() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_disable_vendor' );
    }

    /**
     * Check if user can feature vendor
     *
     * @return bool
     */
    public static function can_feature_vendor() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_feature_vendor' );
    }

    /**
     * Check if user can search vendors
     *
     * @return bool
     */
    public static function can_search_vendors() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_search_vendors' );
    }

    /**
     * Check if user can view vendor products
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_view_vendor_products( $vendor_id = 0 ) {
        // Admin can view any vendor's products
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own products
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor_products' );
    }

    /**
     * Check if user can view vendor orders
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_view_vendor_orders( $vendor_id = 0 ) {
        // Admin can view any vendor's orders
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own orders
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor_orders' );
    }

    /**
     * Check if user can view vendor earnings
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_view_vendor_earnings( $vendor_id = 0 ) {
        // Admin can view any vendor's earnings
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own earnings
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor_earnings' );
    }

    /**
     * Check if user can manage vendor commission
     *
     * @return bool
     */
    public static function can_manage_vendor_commission() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_vendor_commission' );
    }

    /**
     * Check if user can view vendor balance
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_view_vendor_balance( $vendor_id = 0 ) {
        // Admin can view any vendor's balance
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own balance
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor_balance' );
    }

    /**
     * Check if user can view vendor withdrawals
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_view_vendor_withdrawals( $vendor_id = 0 ) {
        // Admin can view any vendor's withdrawals
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own withdrawals
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor_withdrawals' );
    }

    /**
     * Check if user can manage vendor withdrawals
     *
     * @return bool
     */
    public static function can_manage_vendor_withdrawals() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_vendor_withdrawals' );
    }

    /**
     * Check if user can view vendor store settings
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_view_vendor_store_settings( $vendor_id = 0 ) {
        // Admin can view any vendor's store settings
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own store settings
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor_store_settings' );
    }

    /**
     * Check if user can update vendor store settings
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_update_vendor_store_settings( $vendor_id = 0 ) {
        // Admin can update any vendor's store settings
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can update their own store settings
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_update_vendor_store_settings' );
    }

    /**
     * Check if user can view vendor analytics
     *
     * @param int $vendor_id
     * @return bool
     */
    public static function can_view_vendor_analytics( $vendor_id = 0 ) {
        // Admin can view any vendor's analytics
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own analytics
        if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor_analytics' );
    }

    /**
     * Check if user can view global analytics
     *
     * @return bool
     */
    public static function can_view_global_analytics() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_view_global_analytics' );
    }

    /**
     * Check if user can manage vendor requests
     *
     * @return bool
     */
    public static function can_manage_vendor_requests() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_vendor_requests' );
    }

    /**
     * Check if user can convert customer to vendor
     *
     * @return bool
     */
    public static function can_convert_customer_to_vendor() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_convert_customer_to_vendor' );
    }
} 