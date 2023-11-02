<?php
namespace WeDevs\Dokan\Utilities;

use Automattic\WooCommerce\Utilities\OrderUtil as WCOrderUtil;
use WC_Order;
use WC_Order_Refund;
use WP_Post;

class OrderUtil {
    /**
     * Helper function to get whether custom order tables are enabled or not.
     *
     * This method can be removed, and we can directly use WC OrderUtil::custom_orders_table_usage_is_enabled method in future
     * if we set the minimum wc version requirements to 8.0
     *
     * @since 3.8.0
     *
     * @return bool
     */
    public static function is_hpos_enabled(): bool {
        if ( false === version_compare( WC_VERSION, '7.1', '>=' ) ) {
            return false;
        }

        return WCOrderUtil::custom_orders_table_usage_is_enabled();
    }

    /**
     * Checks if posts and order custom table sync are enabled, and there are no pending orders.
     *
     * @since 3.8.0
     *
     * @return bool
     */
    public static function is_custom_order_tables_in_sync(): bool {
        return self::is_hpos_enabled() && WCOrderUtil::is_custom_order_tables_in_sync();
    }

    /**
     * Helper function to get whether the order cache should be used or not.
     *
     * @since 3.8.0
     *
     * @return bool True if the order cache should be used, false otherwise.
     */
    public static function is_order_cache_usages_enabled(): bool {
        return self::is_hpos_enabled() && WCOrderUtil::orders_cache_usage_is_enabled();
    }

    /**
     * Helper function to initialize the global $theorder object, mostly used during order meta boxes rendering.
     *
     * @since 3.8.0
     *
     * @param WC_Order|WP_Post $post_or_order_object Post or order object.
     *
     * @return WC_Order_Refund|bool|WC_Order WC_Order object.
     */
    public static function init_theorder_object( $post_or_order_object ) {
        if ( self::is_hpos_enabled() ) {
            return WCOrderUtil::init_theorder_object( $post_or_order_object );
        }

        global $theorder;
        if ( $theorder instanceof WC_Order ) {
            return $theorder;
        }

        if ( $post_or_order_object instanceof WC_Order ) {
            $theorder = $post_or_order_object;
        } else {
            $theorder = wc_get_order( $post_or_order_object->ID );
        }
        return $theorder;
    }

    /**
     * Helper function to id from a post or order object.
     *
     * @since 3.8.0
     *
     * @param WP_Post|WC_Order $post_or_order_object WP_Post/WC_Order object to get ID for.
     *
     * @return int Order or post ID.
     */
    public static function get_post_or_order_id( $post_or_order_object ): int {
        if ( self::is_hpos_enabled() ) {
            return WCOrderUtil::get_post_or_order_id( $post_or_order_object );
        } elseif ( is_numeric( $post_or_order_object ) ) {
            return (int) $post_or_order_object;
        } elseif ( $post_or_order_object instanceof WC_Order ) {
            return $post_or_order_object->get_id();
        } elseif ( $post_or_order_object instanceof WP_Post ) {
            return $post_or_order_object->ID;
        }
        return 0;
    }

    /**
     * Checks if passed id, post or order object is a WC_Order object.
     *
     * This method can be removed, and we can directly use WC OrderUtil::is_order method in future
     * if we set the minimum wc version requirements to 8.0
     *
     * @since 3.8.0
     *
     * @param int|WP_Post|WC_Order $order_id Order ID, post object or order object.
     * @param string[]             $types    Types to match against.
     *
     * @return bool Whether the passed param is an order.
     */
    public static function is_order( $order_id, $types = [] ): bool {
        $types = empty( $types ) ? wc_get_order_types() : $types;
        if ( self::is_hpos_enabled() ) {
            return WCOrderUtil::is_order( $order_id, $types );
        }

        return in_array( get_post_type( $order_id ), $types, true );
    }

    /**
     * Helper function to get the screen name of order page in wp-admin.
     *
     * This method can be removed, and we can directly use WC OrderUtil::get_order_admin_screen method in future
     * if we set minimum wc version requirements to 8.0
     *
     * @since 3.8.0
     *
     * @return string
     */
    public static function get_order_admin_screen(): string {
        return self::is_hpos_enabled() && function_exists( 'wc_get_page_screen_id' )
            ? wc_get_page_screen_id( 'shop-order' )
            : 'shop_order';
    }

    /**
     * Get admin order list page url
     *
     * @since 3.8.0
     *
     * @return string
     */
    public static function get_admin_order_list_url(): string {
        return self::is_hpos_enabled()
            ? esc_url_raw( admin_url( 'admin.php?page=wc-orders' ) )
            : esc_url_raw( admin_url( 'edit.php?post_type=shop_order' ) );
    }

    /**
     * Helper method to generate admin URL for new order.
     *
     * @since 3.8.0
     *
     * @return string Link for new order.
     */
    public static function get_order_admin_new_url(): string {
        if ( ! self::is_hpos_enabled() ) {
            return admin_url( 'post-new.php?post_type=shop_order' );
        }
        return WCOrderUtil::get_order_admin_new_url();
    }

    /**
     * Get admin order edit page url
     *
     * @since 3.8.0
     *
     * @param int $order_id
     *
     * @return string
     */
    public static function get_admin_order_edit_url( $order_id = 0 ): string {
        if ( ! self::is_hpos_enabled() ) {
            return admin_url( 'post.php?post=' . absint( $order_id ) ) . '&action=edit';
        }

        return WCOrderUtil::get_order_admin_edit_url( $order_id );
    }

    /**
     * Get the custom orders table name for wc.
     *
     * @since 3.8.0
     *
     * @return string
     */
    public static function get_order_table_name() {
        if ( ! self::is_hpos_enabled() ) {
            global $wpdb;
            return $wpdb->posts;
        }

        return WCOrderUtil::get_table_for_orders();
    }

    /**
     * Get the name of the database table that's currently in use for orders.
     *
     * @since 3.8.0
     *
     * @return string
     */
    public static function get_table_for_order_meta() {
        if ( ! self::is_hpos_enabled() ) {
            global $wpdb;
            return $wpdb->postmeta;
        }

        return WCOrderUtil::get_table_for_order_meta();
    }
}
