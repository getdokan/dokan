<?php

namespace WeDevs\Dokan\Order;

use Exception;

/**
* Admin Hooks
*
* @package dokan
*
* @since 3.0.0
*/
class Hooks {

    /**
     * Load autometically when class initiate
     *
     * @since 3.0.0
     */
    public function __construct() {
        // on order status change
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_change' ), 10, 4 );
        add_action( 'woocommerce_order_status_changed', array( $this, 'on_sub_order_change' ), 99, 3 );

        // create sub-orders
        add_action( 'woocommerce_checkout_update_order_meta', array( $this, 'split_vendor_orders' ) );

        // order table synced for WooCommerce update order meta
        add_action( 'woocommerce_checkout_update_order_meta', 'dokan_sync_insert_order', 20 );

        // order table synced for dokan update order meta
        add_action( 'dokan_checkout_update_order_meta', 'dokan_sync_insert_order' );

        // prevent non-vendor coupons from being added
        add_filter( 'woocommerce_coupon_is_valid', array( $this, 'ensure_vendor_coupon' ), 10, 2 );

        if ( is_admin() ) {
            add_action( 'woocommerce_process_shop_order_meta', 'dokan_sync_insert_order' );
        }

        // restore order stock if it's been reduced by twice
        add_action( 'woocommerce_reduce_order_stock', array( $this, 'restore_reduced_order_stock' ) );

        //Wc remove child order from wc_order_product_lookup & trim child order from posts for analytics
        add_action( 'wc-admin_import_orders', [ $this, 'delete_child_order_from_wc_order_product' ] );
        add_filter( 'woocommerce_analytics_orders_select_query', [ $this, 'trim_child_order_for_analytics_order' ] );
    }

    /**
     * Update the child order status when a parent order status is changed
     *
     * @global object $wpdb
     *
     * @param integer $order_id
     * @param string $old_status
     * @param string $new_status
     *
     * @return void
     */
    public function on_order_status_change( $order_id, $old_status, $new_status, $order ) {
        global $wpdb;

        // Split order if the order doesn't have parent and sub orders,
        // and the order is created from dashboard.
        if ( empty( $order->post_parent ) && empty( $order->get_meta( 'has_sub_order' ) ) && is_admin() ) {
            // Remove the hook to prevent recursive callas.
            remove_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_change' ), 10 );

            // Split the order.
            dokan()->order->maybe_split_orders( $order_id );

            // Add the hook back.
            add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_change' ), 10, 4 );
        }

        // make sure order status contains "wc-" prefix
        if ( stripos( $new_status, 'wc-' ) === false ) {
            $new_status = 'wc-' . $new_status;
        }

        // insert on dokan sync table
        $wpdb->update(
            $wpdb->dokan_orders,
            array( 'order_status' => $new_status ),
            array( 'order_id' => $order_id ),
            array( '%s' ),
            array( '%d' )
        );

        // if any child orders found, change the orders as well
        $sub_orders = get_children(
            [
                'post_parent' => $order_id,
                'post_type' => 'shop_order',
            ]
        );

        if ( $sub_orders ) {
            foreach ( $sub_orders as $order_post ) {
                $order = dokan()->order->get( $order_post->ID );
                $order->update_status( $new_status );
            }
        }

        /**
         * If `exclude_cod_payment` is enabled, don't include the fund in vendor's withdrawal balance.
         *
         * @since DOKAN_LITE_SINCE
         */
        $exclude_cod_payment = 'on' === dokan_get_option( 'exclude_cod_payment', 'dokan_withdraw', 'off' );

        if ( $exclude_cod_payment && 'cod' === $order->get_payment_method() ) {
            return;
        }

        // update on vendor-balance table
        $wpdb->update(
            $wpdb->dokan_vendor_balance,
            array( 'status' => $new_status ),
            array(
                'trn_id' => $order_id,
                'trn_type' => 'dokan_orders',
            ),
            array( '%s' ),
            array( '%d', '%s' )
        );

        if ( $new_status === 'wc-refunded' ) {
            $postdata = wp_unslash( $_POST );

            if ( ! empty( $postdata['_wpnonce'] ) && ( wp_verify_nonce( $postdata['_wpnonce'], 'dokan_change_status' ) || $postdata['post_type'] === 'shop_order' ) ) {
                $balance_data = $wpdb->get_row(
                    $wpdb->prepare(
                        "select * from $wpdb->dokan_vendor_balance where trn_id = %d AND status = 'approved'",
                        $order_id
                    )
                );

                if ( $balance_data ) {
                    return;
                }

                $seller_id  = dokan_get_seller_id_by_order( $order_id );
                $net_amount = dokan()->commission->get_earning_by_order( $order );

                $wpdb->insert(
                    $wpdb->dokan_vendor_balance,
                    [
                        'vendor_id'     => $seller_id,
                        'trn_id'        => $order_id,
                        'trn_type'      => 'dokan_refund',
                        'debit'         => 0,
                        'credit'        => $net_amount,
                        'status'        => 'approved',
                        'trn_date'      => current_time( 'mysql' ),
                        'balance_date'  => current_time( 'mysql' ),
                    ],
                    [
                        '%d',
                        '%d',
                        '%s',
                        '%f',
                        '%f',
                        '%s',
                        '%s',
                        '%s',
                    ]
                );

                // update the order table with new refund amount
                $order_data = $wpdb->get_row(
                    $wpdb->prepare(
                        "select * from $wpdb->dokan_orders where order_id = %d",
                        $order_id
                    )
                );

                if ( isset( $order_data->order_total, $order_data->net_amount ) ) {
                    // insert on dokan sync table
                    $wpdb->update(
                        $wpdb->dokan_orders,
                        [
                            'order_total' => 0,
                            'net_amount'  => 0,
                        ],
                        [
                            'order_id' => $order_id,
                        ],
                        [
                            '%f',
                            '%f',
                        ],
                        [
                            '%d',
                        ]
                    );
                }
            }
        }
    }

    /**
     * Mark the parent order as complete when all the child order are completed
     *
     * @param integer $order_id
     * @param string $old_status
     * @param string $new_status
     *
     * @return void
     */
    public function on_sub_order_change( $order_id, $old_status, $new_status ) {
        $order_post = get_post( $order_id );

        // we are monitoring only child orders
        if ( $order_post->post_parent === 0 ) {
            return;
        }

        // get all the child orders and monitor the status
        $parent_order_id = $order_post->post_parent;
        $sub_orders      = get_children(
            [
                'post_parent' => $parent_order_id,
                'post_type' => 'shop_order',
            ]
        );

        // return if any child order is not completed
        $all_complete = true;

        if ( $sub_orders ) {
            foreach ( $sub_orders as $sub ) {
                $order = dokan()->order->get( $sub->ID );

                if ( $order->get_status() !== 'completed' ) {
                    $all_complete = false;
                }
            }
        }

        // seems like all the child orders are completed
        // mark the parent order as complete
        if ( $all_complete ) {
            $parent_order = dokan()->order->get( $parent_order_id );
            $parent_order->update_status( 'wc-completed', __( 'Mark parent order completed when all child orders are completed.', 'dokan-lite' ) );
        }
    }

    /**
     * Split order for vendor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function split_vendor_orders( $parent_order_id ) {
        dokan()->order->maybe_split_orders( $parent_order_id );
    }

    /**
     * Ensure vendor coupon
     *
     * For consistancy, restrict coupons in cart if only
     * products from that vendor exists in the cart. Also, a coupon
     * should be restricted with a product.
     *
     * For example: When entering a coupon created by admin is applied, make
     * sure a product of the admin is in the cart. Otherwise it wouldn't be
     * possible to distribute the coupon in sub orders.
     *
     * @param  boolean $valid
     * @param  \WC_Coupon $coupon
     *
     * @return boolean|Execption
     */
    public function ensure_vendor_coupon( $valid, $coupon ) {
        $coupon_id         = $coupon->get_id();
        $vendor_id         = get_post_field( 'post_author', $coupon_id );
        $available_vendors = array();

        if ( ! apply_filters( 'dokan_ensure_vendor_coupon', true ) ) {
            return $valid;
        }

        // a coupon must be bound with a product
        if ( count( $coupon->get_product_ids() ) === 0 ) {
            throw new Exception( __( 'A coupon must be restricted with a vendor product.', 'dokan-lite' ) );
        }

        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id = $item['data']->get_id();

            $available_vendors[] = get_post_field( 'post_author', $product_id );
        }

        if ( ! in_array( $vendor_id, $available_vendors, true ) ) {
            return false;
        }

        return $valid;
    }

    /**
     * Restore order stock if it's been reduced by twice
     *
     * @param  object $order
     *
     * @return void
     */
    public function restore_reduced_order_stock( $order ) {
        // seems in rest request, there is no such issue like (stock reduced by twice), so return early
        if ( defined( 'REST_REQUEST' ) ) {
            return;
        }

        $has_sub_order = wp_get_post_parent_id( $order->get_id() );

        // seems it's not a parent order so return early
        if ( ! $has_sub_order ) {
            return;
        }

        // Loop over all items.
        foreach ( $order->get_items() as $item ) {
            if ( ! $item->is_type( 'line_item' ) ) {
                continue;
            }

            // Only reduce stock once for each item.
            $product            = $item->get_product();
            $item_stock_reduced = $item->get_meta( '_reduced_stock', true );

            if ( ! $item_stock_reduced || ! $product || ! $product->managing_stock() ) {
                continue;
            }

            $item_name = $product->get_formatted_name();
            $new_stock = wc_update_product_stock( $product, $item_stock_reduced, 'increase' );

            if ( is_wp_error( $new_stock ) ) {
                /* translators: %s item name. */
                $order->add_order_note( sprintf( __( 'Unable to restore stock for item %s.', 'dokan-lite' ), $item_name ) );
                continue;
            }

            $item->delete_meta_data( '_reduced_stock' );
            $item->save();
        }
    }

    /**
     * @param \ActionScheduler_Action $args
     *
     * @return void
     */
    public function delete_child_order_from_wc_order_product( $args ) {
        $order = get_post( $args );

        if ( $order->post_parent ) {
            global $wpdb;
            $wpdb->delete( $wpdb->prefix . 'wc_order_product_lookup', [ 'order_id' => $order->ID ] );
            $wpdb->delete( $wpdb->prefix . 'wc_order_stats', [ 'order_id' => $order->ID ] );
        }
    }

    /**
     * Trim child order if parent exist from wc_order_product_lookup for analytics order
     *
     * @param \WC_Order $orders
     *
     * @return \WC_Order
     */
    public function trim_child_order_for_analytics_order( $orders ) {
        foreach ( $orders->data as $key => $order ) {
            if ( $order['parent_id'] ) {
                unset( $orders->data[ $key ] );
            }
        }

        return $orders;
    }
}
