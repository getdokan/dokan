<?php
/**
 * Withdraw Permissions for Feature API
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
 * Withdraw Permissions
 *
 * @since 4.0.0
 */
class WithdrawPermissions {

    /**
     * Check if user can list withdrawals
     *
     * @param array $context
     * @return bool
     */
    public static function can_list_withdrawals( $context ) {
        return current_user_can( 'manage_woocommerce' ) || 
               ( dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_view_withdraw' ) );
    }

    /**
     * Check if user can view withdrawal
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_withdrawal( $context ) {
        $withdraw_id = isset( $context['id'] ) ? absint( $context['id'] ) : 0;
        
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return false;
        }

        // Check if withdrawal belongs to current vendor
        // For now, we'll use a simpler check - in a real implementation, you'd get the withdrawal object
        $withdraw_user_id = get_post_meta( $withdraw_id, '_dokan_withdraw_user_id', true );
        if ( ! $withdraw_user_id ) {
            return false;
        }

        return absint( $withdraw_user_id ) === get_current_user_id();
    }

    /**
     * Check if user can view vendor withdrawals
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_vendor_withdrawals( $context ) {
        $vendor_id = isset( $context['vendor_id'] ) ? absint( $context['vendor_id'] ) : 0;
        
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can only view their own withdrawals
        return dokan_is_user_seller( get_current_user_id() ) && 
               $vendor_id === get_current_user_id() && 
               current_user_can( 'dokan_view_withdraw' );
    }

    /**
     * Check if user can create withdrawal
     *
     * @param array $context
     * @return bool
     */
    public static function can_create_withdrawal( $context ) {
        return dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_create_withdraw' );
    }

    /**
     * Check if user can update withdrawal
     *
     * @param array $context
     * @return bool
     */
    public static function can_update_withdrawal( $context ) {
        $withdraw_id = isset( $context['id'] ) ? absint( $context['id'] ) : 0;
        
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return false;
        }

        // Check if withdrawal belongs to current vendor
        // For now, we'll use a simpler check - in a real implementation, you'd get the withdrawal object
        $withdraw_user_id = get_post_meta( $withdraw_id, '_dokan_withdraw_user_id', true );
        if ( ! $withdraw_user_id ) {
            return false;
        }

        return absint( $withdraw_user_id ) === get_current_user_id() && 
               current_user_can( 'dokan_update_withdraw' );
    }

    /**
     * Check if user can delete withdrawal
     *
     * @param array $context
     * @return bool
     */
    public static function can_delete_withdrawal( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_delete_withdraw' );
    }

    /**
     * Check if user can approve withdrawal
     *
     * @param array $context
     * @return bool
     */
    public static function can_approve_withdrawal( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_approve_withdraw' );
    }

    /**
     * Check if user can reject withdrawal
     *
     * @param array $context
     * @return bool
     */
    public static function can_reject_withdrawal( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_reject_withdraw' );
    }

    /**
     * Check if user can cancel withdrawal
     *
     * @param array $context
     * @return bool
     */
    public static function can_cancel_withdrawal( $context ) {
        $withdraw_id = isset( $context['id'] ) ? absint( $context['id'] ) : 0;
        
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        if ( ! dokan_is_user_seller( get_current_user_id() ) ) {
            return false;
        }

        // Check if withdrawal belongs to current vendor
        // For now, we'll use a simpler check - in a real implementation, you'd get the withdrawal object
        $withdraw_user_id = get_post_meta( $withdraw_id, '_dokan_withdraw_user_id', true );
        if ( ! $withdraw_user_id ) {
            return false;
        }

        return absint( $withdraw_user_id ) === get_current_user_id() && 
               current_user_can( 'dokan_cancel_withdraw' );
    }

    /**
     * Check if user can view withdrawal reports
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_withdrawal_reports( $context ) {
        return current_user_can( 'manage_woocommerce' ) || 
               ( dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_view_withdraw_reports' ) );
    }

    /**
     * Check if user can manage withdrawal settings
     *
     * @param array $context
     * @return bool
     */
    public static function can_manage_withdrawal_settings( $context ) {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_manage_withdraw_settings' );
    }

    /**
     * Check if user can export withdrawals
     *
     * @param array $context
     * @return bool
     */
    public static function can_export_withdrawals( $context ) {
        return current_user_can( 'manage_woocommerce' ) || 
               ( dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_export_withdrawals' ) );
    }

    /**
     * Check if user can view withdrawal statistics
     *
     * @param array $context
     * @return bool
     */
    public static function can_view_withdrawal_statistics( $context ) {
        return current_user_can( 'manage_woocommerce' ) || 
               ( dokan_is_user_seller( get_current_user_id() ) && current_user_can( 'dokan_view_withdraw_statistics' ) );
    }
} 