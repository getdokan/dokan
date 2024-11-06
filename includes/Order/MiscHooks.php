<?php

namespace WeDevs\Dokan\Order;

use WC_Order;
use WP_REST_Response;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Order admin related hooks
 *
 * @since 3.8.0 moved functionality from includes/Admin/Hooks.php file
 */
class MiscHooks {
    /**
     * Class constructor
     *
     * @since 3.8.0
     */
    public function __construct() {
        // remove customer info from order export based on setting
        add_filter( 'dokan_csv_export_headers', [ $this, 'hide_customer_info_from_vendor_order_export' ], 20, 1 );

        add_filter( 'woocommerce_rest_prepare_shop_order_object', [ $this, 'add_vendor_info_in_rest_order' ], 10, 1 );
        add_filter( 'wp_count_posts', [ $this, 'modify_vendor_order_counts' ], 10, 1 ); // no need to add hpos support for this filter
    }

    /**
     * Remove customer sensitive information while exporting order
     *
     * @since 3.8.0 Moved this method from Order/Hooks.php file
     *
     * @param array $headers
     *
     * @return mixed
     */
    public function hide_customer_info_from_vendor_order_export( $headers ) {
        $hide_customer_info = dokan_get_option( 'hide_customer_info', 'dokan_selling', 'off' );
        if ( 'off' !== $hide_customer_info ) {
            unset( $headers['billing_email'] );
            unset( $headers['customer_ip'] );
        }

        return $headers;
    }

    /**
     * Add vendor info in restful wc_order
     *
     * @since 3.8.0 Moved this method from includes/functions.php file
     *
     * @param WP_REST_Response $response
     *
     * @return WP_REST_Response
     */
    public function add_vendor_info_in_rest_order( $response ) {
        $vendor_ids = [];

        foreach ( $response as $data ) {
            if ( empty( $data['line_items'] ) ) {
                continue;
            }

            foreach ( $data['line_items'] as $item ) {
                $product_id = ! empty( $item['product_id'] ) ? $item['product_id'] : 0;
                $vendor_id  = (int) get_post_field( 'post_author', $product_id );

                if ( $vendor_id && ! in_array( $vendor_id, $vendor_ids, true ) ) {
                    array_push( $vendor_ids, $vendor_id );
                }
            }
        }

        if ( ! $vendor_ids ) {
            return $response;
        }

        $data = $response->get_data();

        foreach ( $vendor_ids as $store_id ) {
            $store            = dokan()->vendor->get( $store_id );
            $data['stores'][] = [
                'id'        => $store->get_id(),
                'name'      => $store->get_name(),
                'shop_name' => $store->get_shop_name(),
                'url'       => $store->get_shop_url(),
                'address'   => $store->get_address(),
            ];
        }

        // for backward compatibility, if there are multiple vendors, pass empty array.
        if ( count( $vendor_ids ) > 1 ) {
            $data['store'] = [];
        } else {
            $store         = dokan()->vendor->get( $vendor_ids[0] );
            $data['store'] = [
                'id'        => $store->get_id(),
                'name'      => $store->get_name(),
                'shop_name' => $store->get_shop_name(),
                'url'       => $store->get_shop_url(),
                'address'   => $store->get_address(),
            ];
        }

        $response->set_data( $data );

        return $response;
    }

    /**
     * Modify order counts for vendor.
     *
     * @since 3.8.0 Moved this method from includes/wc-functions.php file
     *
     * @param object $counts
     *
     * @return object $counts
     */
    public function modify_vendor_order_counts( $counts ) {
        global $pagenow;

        if ( current_user_can( 'manage_woocommerce' ) ) {
            return $counts;
        }

        if ( 'edit.php' !== $pagenow || 'shop_order' !== get_query_var( 'post_type' ) ) {
            return $counts;
        }

        $vendor_id = dokan_get_current_user_id();
        if ( empty( $vendor_id ) ) {
            return $counts;
        }

        // Current order counts for the vendor.
        $vendor_order_counts = dokan_count_orders( $vendor_id );

        // Modify WP dashboard order counts as per vendor's order counts.
        foreach ( $vendor_order_counts as $count_key => $count_value ) {
            if ( 'total' !== $count_key ) {
                $counts->{$count_key} = $count_value;
            }
        }

        return $counts;
    }
}
