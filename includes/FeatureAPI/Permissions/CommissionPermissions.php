<?php
/**
 * Commission Permissions for Feature API
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
 * Commission Permissions
 *
 * @since 4.0.0
 */
class CommissionPermissions {

    /**
     * Check if user can list commissions
     *
     * @param array $context
     * @return bool
     */
    public static function can_list_commissions( $context ) {
        return current_user_can( 'manage_woocommerce' ) || 
               ( dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_view_commission' ) );
    }

    /**
     * Check if user can view commission
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_commission( $context ) {
        $commission_id = isset( $context['id'] ) ? absint( $context['id'] ) : 0;
        
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return false;
        }

        // Check if commission belongs to current vendor
        // For now, we'll use a simpler check - in a real implementation, you'd get the commission object
        $commission_vendor_id = get_post_meta( $commission_id, '_dokan_commission_vendor_id', true );
        if ( ! $commission_vendor_id ) {
            return false;
        }

        return absint( $commission_vendor_id ) === get_current_user_id();
    }

    /**
     * Check if user can view vendor commissions
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_vendor_commissions( $context ) {
        $vendor_id = isset( $context['vendor_id'] ) ? absint( $context['vendor_id'] ) : 0;
        
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can only view their own commissions
        return dokan_is_user_seller( get_current_user_id() ) && 
               $vendor_id === get_current_user_id() && 
               current_user_can( 'dokan_view_commission' );
    }

    /**
     * Check if user can create commission
     *
     * @param array $context
     * @return bool
     */
    public static function can_create_commission( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_create_commission' );
    }

    /**
     * Check if user can update commission
     *
     * @param array $context
     * @return bool
     */
    public static function can_update_commission( $context ) {
        $commission_id = isset( $context['id'] ) ? absint( $context['id'] ) : 0;
        
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return false;
        }

        // Check if commission belongs to current vendor
        // For now, we'll use a simpler check - in a real implementation, you'd get the commission object
        $commission_vendor_id = get_post_meta( $commission_id, '_dokan_commission_vendor_id', true );
        if ( ! $commission_vendor_id ) {
            return false;
        }

        return absint( $commission_vendor_id ) === get_current_user_id() && 
               current_user_can( 'dokan_update_commission' );
    }

    /**
     * Check if user can delete commission
     *
     * @param array $context
     * @return bool
     */
    public static function can_delete_commission( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_delete_commission' );
    }

    /**
     * Check if user can view commission reports
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_commission_reports( $context ) {
        return current_user_can( 'manage_woocommerce' ) || 
               ( dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_view_commission_reports' ) );
    }

    /**
     * Check if user can manage commission settings
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_commission_settings( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_commission_settings' );
    }

    /**
     * Check if user can export commissions
     *
     * @param array $context
     * @return bool
     */
    public static function can_export_commissions( $context ) {
        return current_user_can( 'manage_woocommerce' ) || 
               ( dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_export_commissions' ) );
    }

    /**
     * Check if user can view commission statistics
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_commission_statistics( $context ) {
        return current_user_can( 'manage_woocommerce' ) || 
               ( dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_view_commission_statistics' ) );
    }
} 