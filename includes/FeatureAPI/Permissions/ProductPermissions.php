<?php
/**
 * Product Permissions for Feature API
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
 * Product Permissions
 *
 * @since 4.0.0
 */
class ProductPermissions {

    /**
     * Check if user can list products
     *
     * @return bool
     */
    public static function can_list_products() {
        return current_user_can( 'manage_woocommerce' ) || current_user_can( 'dokan_view_product_list' );
    }

    /**
     * Check if user can view product
     *
     * @param int $product_id
     * @return bool
     */
    public static function can_view_product( $product_id = 0 ) {
        // Admin can view any product
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own products
        if ( $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product && dokan_get_current_user_id() === get_post_field( 'post_author', $product->get_id() ) ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_product' );
    }

    /**
     * Check if user can create products
     *
     * @return bool
     */
    public static function can_create_product() {
        // Admin can create products
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can create products
        if ( dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_create_product' );
    }

    /**
     * Check if user can update product
     *
     * @param int $product_id
     * @return bool
     */
    public static function can_update_product( $product_id = 0 ) {
        // Admin can update any product
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can update their own products
        if ( $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product && dokan_get_current_user_id() === get_post_field( 'post_author', $product->get_id() ) ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_update_product' );
    }

    /**
     * Check if user can delete product
     *
     * @param int $product_id
     * @return bool
     */
    public static function can_delete_product( $product_id = 0 ) {
        // Admin can delete any product
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can delete their own products
        if ( $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product && dokan_get_current_user_id() === get_post_field( 'post_author', $product->get_id() ) ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_delete_product' );
    }

    /**
     * Check if user can approve products
     *
     * @return bool
     */
    public static function can_approve_product() {
        // Only admin can approve products
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can reject products
     *
     * @return bool
     */
    public static function can_reject_product() {
        // Only admin can reject products
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can feature products
     *
     * @return bool
     */
    public static function can_feature_product() {
        // Admin can feature any product
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_feature_product' );
    }

    /**
     * Check if user can search products
     *
     * @return bool
     */
    public static function can_search_products() {
        // Anyone can search products (public feature)
        return true;
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

        // Check if vendor exists and is approved
        if ( $vendor_id && dokan_is_user_seller( $vendor_id ) ) {
            $store_info = dokan_get_store_info( $vendor_id );
            if ( $store_info && isset( $store_info['enable_tnc'] ) && $store_info['enable_tnc'] === 'on' ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_vendor_products' );
    }

    /**
     * Check if user can manage product categories
     *
     * @return bool
     */
    public static function can_manage_product_categories() {
        // Admin can manage categories
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_product_categories' );
    }

    /**
     * Check if user can manage product tags
     *
     * @return bool
     */
    public static function can_manage_product_tags() {
        // Admin can manage tags
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_product_tags' );
    }

    /**
     * Check if user can manage product inventory
     *
     * @param int $product_id
     * @return bool
     */
    public static function can_manage_product_inventory( $product_id = 0 ) {
        // Admin can manage any product's inventory
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can manage their own product's inventory
        if ( $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product && dokan_get_current_user_id() === $product->get_author() ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_product_inventory' );
    }

    /**
     * Check if user can manage product pricing
     *
     * @param int $product_id
     * @return bool
     */
    public static function can_manage_product_pricing( $product_id = 0 ) {
        // Admin can manage any product's pricing
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can manage their own product's pricing
        if ( $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product && dokan_get_current_user_id() === $product->get_author() ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_product_pricing' );
    }

    /**
     * Check if user can manage product images
     *
     * @param int $product_id
     * @return bool
     */
    public static function can_manage_product_images( $product_id = 0 ) {
        // Admin can manage any product's images
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can manage their own product's images
        if ( $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product && dokan_get_current_user_id() === $product->get_author() ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_product_images' );
    }

    /**
     * Check if user can export products
     *
     * @return bool
     */
    public static function can_export_products() {
        // Admin can export products
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can export their own products
        if ( dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_export_products' );
    }

    /**
     * Check if user can import products
     *
     * @return bool
     */
    public static function can_import_products() {
        // Admin can import products
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can import products to their store
        if ( dokan_is_user_seller( dokan_get_current_user_id() ) ) {
            return true;
        }

        // Check custom capability
        return current_user_can( 'dokan_import_products' );
    }

    /**
     * Check if user can view product analytics
     *
     * @param int $product_id
     * @return bool
     */
    public static function can_view_product_analytics( $product_id = 0 ) {
        // Admin can view any product's analytics
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can view their own product's analytics
        if ( $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product && dokan_get_current_user_id() === $product->get_author() ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_view_product_analytics' );
    }

    /**
     * Check if user can manage product reviews
     *
     * @param int $product_id
     * @return bool
     */
    public static function can_manage_product_reviews( $product_id = 0 ) {
        // Admin can manage any product's reviews
        if ( current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        // Vendor can manage their own product's reviews
        if ( $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product && dokan_get_current_user_id() === $product->get_author() ) {
                return true;
            }
        }

        // Check custom capability
        return current_user_can( 'dokan_manage_product_reviews' );
    }
} 