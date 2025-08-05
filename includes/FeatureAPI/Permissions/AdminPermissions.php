<?php
/**
 * Admin Permissions for Feature API
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
 * Admin Permissions
 *
 * @since 4.0.0
 */
class AdminPermissions {

    /**
     * Check if user can manage vendors
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_vendors( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_vendors' );
    }

    /**
     * Check if user can manage products
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_products( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_products' );
    }

    /**
     * Check if user can manage orders
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_orders( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_orders' );
    }

    /**
     * Check if user can manage commissions
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_commissions( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_commissions' );
    }

    /**
     * Check if user can manage withdrawals
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_withdrawals( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_withdrawals' );
    }

    /**
     * Check if user can view analytics
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_analytics( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_view_analytics' );
    }

    /**
     * Check if user can manage settings
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_settings( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_settings' );
    }

    /**
     * Check if user can approve vendors
     *
     * @param array $context
     * @return bool
     */
    public static function can_approve_vendors( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_approve_vendors' );
    }

    /**
     * Check if user can approve products
     *
     * @param array $context
     * @return bool
     */
    public static function can_approve_products( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_approve_products' );
    }

    /**
     * Check if user can manage store settings
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_store_settings( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_store_settings' );
    }

    /**
     * Check if user can view all vendor data
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_all_vendor_data( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_view_all_vendor_data' );
    }

    /**
     * Check if user can manage vendor requests
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_vendor_requests( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_vendor_requests' );
    }

    /**
     * Check if user can manage notifications
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_notifications( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_notifications' );
    }

    /**
     * Check if user can manage store reviews
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_store_reviews( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_store_reviews' );
    }

    /**
     * Check if user can manage store listings
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_store_listings( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_store_listings' );
    }

    /**
     * Check if user can list stores
     *
     * @param array $context
     * @return bool
     */
    public static function can_list_stores( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_list_stores' );
    }

    /**
     * Check if user can view store
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_store( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_view_store' );
    }

    /**
     * Check if user can update store
     *
     * @param array $context
     * @return bool
     */
    public static function can_update_store( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_update_store' );
    }

    /**
     * Check if user can feature store
     *
     * @param array $context
     * @return bool
     */
    public static function can_feature_store( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_feature_store' );
    }

    /**
     * Check if user can manage analytics
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_analytics( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_analytics' );
    }

    /**
     * Check if user can view settings
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_settings( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_view_settings' );
    }
} 