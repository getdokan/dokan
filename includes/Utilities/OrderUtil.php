<?php
namespace WeDevs\Dokan\Utilities;

use WC_Order;
use WP_Post;

class OrderUtil {
    /**
     * Helper function to get whether custom order tables are enabled or not.
     *
     * This method can be removed, and we can directly use WC OrderUtil::custom_orders_table_usage_is_enabled method in future
     * if we set minimum wc version requirements to 8.0
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public static function is_hpos_enabled(): bool {
        if ( false === version_compare( WC_VERSION, '7.1', '>=' ) ) {
            return false;
        }

        return \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();
    }

    /**
     * Checks if passed id, post or order object is a WC_Order object.
     *
     * This method can be removed, and we can directly use WC OrderUtil::is_order method in future
     * if we set minimum wc version requirements to 8.0
     *
     * @since DOKAN_SINCE
     *
     * @param int|WP_Post|WC_Order $order_id Order ID, post object or order object.
     * @param string[]             $types    Types to match against.
     *
     * @return bool Whether the passed param is an order.
     */
    public static function is_order( $order_id, $types = [] ): bool {
        $types = empty( $types ) ? wc_get_order_types() : $types;
        if ( self::is_hpos_enabled() ) {
            return \Automattic\WooCommerce\Utilities\OrderUtil::is_order( $order_id, $types );
        }

        return in_array( get_post_type( $order_id ), $types, true );
    }

    /**
     * Helper function to get screen name of orders page in wp-admin.
     *
     * This method can be removed, and we can directly use WC OrderUtil::get_order_admin_screen method in future
     * if we set minimum wc version requirements to 8.0
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function get_order_admin_screen(): string {
        if ( self::is_hpos_enabled() ) {
            return \Automattic\WooCommerce\Utilities\OrderUtil::get_order_admin_screen();
        }
        return 'shop_order';
    }

    /**
     * Get admin order list page url
     *
     * @return string
     */
    public static function get_admin_order_list_url(): string {
        return self::is_hpos_enabled()
            ? esc_url_raw( admin_url( 'admin.php?page=wc-orders' ) )
            : esc_url_raw( admin_url( 'edit.php?post_type=shop_order' ) );
    }

    /**
     * Get admin order edit page url
     *
     * @param int $order_id
     *
     * @return string
     */
    public static function get_admin_order_edit_url( int $order_id ): string {
        return self::is_hpos_enabled()
            ? esc_url_raw( admin_url( 'admin.php?page=wc-orders&action=edit' ) ) . '&id=' . intval( $order_id )
            : esc_url_raw( admin_url( 'post.php?action=edit' ) ) . '&post=' . intval( $order_id );
    }

}
