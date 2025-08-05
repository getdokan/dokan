<?php
/**
 * Order Permissions for Feature API
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
 * Order Permissions
 *
 * @since 4.0.0
 */
class OrderPermissions {

    /**
     * Check if user can list orders
     *
     * @return bool
     */
    public static function can_list_orders() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_view_order_list' );
    }

    /**
     * Check if user can view order
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_view_order( $order_id = 0 ) {
        // Admin can view any order
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own orders
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_order' );
    }

    /**
     * Check if user can update order status
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_update_order_status( $order_id = 0 ) {
        // Admin can update any order status
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can update their own order status
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_update_order_status' );
    }

    /**
     * Check if user can update order commission
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_update_order_commission( $order_id = 0 ) {
        // Only admin can update order commission
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return false;
        }

        return true;
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
     * Check if user can view sub orders
     *
     * @param int $parent_order_id
     * @return bool
     */
    public static function can_view_sub_orders( $parent_order_id = 0 ) {
        // Admin can view any sub orders
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view sub orders of their orders
        if ( $parent_order_id ) {
            $parent_order = wc_get_order( $parent_order_id );
            if ( $parent_order ) {
                $vendor_id = get_post_meta( $parent_order_id, '_dokan_vendor_id', true );
                if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                    return true;
                }
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_sub_orders' );
    }

    /**
     * Check if user can view order commission
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_view_order_commission( $order_id = 0 ) {
        // Admin can view any order commission
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own order commission
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_order_commission' );
    }

    /**
     * Check if user can manage order refunds
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_manage_order_refunds( $order_id = 0 ) {
        // Admin can manage any order refunds
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can manage refunds for their own orders
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_order_refunds' );
    }

    /**
     * Check if user can export orders
     *
     * @return bool
     */
    public static function can_export_orders() {
        // Admin can export orders
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can export their own orders
        if ( dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_export_orders' );
    }

    /**
     * Check if user can view order analytics
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_view_order_analytics( $order_id = 0 ) {
        // Admin can view any order analytics
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own order analytics
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_order_analytics' );
    }

    /**
     * Check if user can manage order notes
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_manage_order_notes( $order_id = 0 ) {
        // Admin can manage any order notes
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can manage notes for their own orders
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_order_notes' );
    }

    /**
     * Check if user can view order customer details
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_view_order_customer_details( $order_id = 0 ) {
        // Admin can view any order customer details
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view customer details for their own orders
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_order_customer_details' );
    }

    /**
     * Check if user can manage order shipping
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_manage_order_shipping( $order_id = 0 ) {
        // Admin can manage any order shipping
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can manage shipping for their own orders
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_order_shipping' );
    }

    /**
     * Check if user can manage order payments
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_manage_order_payments( $order_id = 0 ) {
        // Only admin can manage order payments
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can view order history
     *
     * @param int $order_id
     * @return bool
     */
    public static function can_view_order_history( $order_id = 0 ) {
        // Admin can view any order history
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view history for their own orders
        if ( $order_id ) {
            $vendor_id = get_post_meta( $order_id, '_dokan_vendor_id', true );
            if ( $vendor_id && dokan_get_current_user_id() === $vendor_id ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_order_history' );
    }
} 