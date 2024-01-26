<?php

namespace WeDevs\Dokan\Order;

use Exception;
use WC_Order;

// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Admin Hooks
 *
 * @since   3.0.0
 *
 * @package dokan
 *
 * @author  weDevs
 */
class Hooks {

    /**
     * Load automatically when class initiate
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        // on order status change
        add_action( 'woocommerce_order_status_changed', [ $this, 'on_order_status_change' ], 10, 4 );
        add_action( 'woocommerce_order_status_changed', [ $this, 'manage_refunded_for_order' ], 15, 4 );
        add_action( 'woocommerce_order_status_changed', [ $this, 'on_sub_order_change' ], 99, 4 );

        // create sub-orders
        add_action( 'woocommerce_checkout_update_order_meta', [ $this, 'split_vendor_orders' ] );
        add_action( 'woocommerce_store_api_checkout_order_processed', [ $this, 'split_vendor_orders' ] );

        // order table synced for WooCommerce update order meta
        add_action( 'woocommerce_checkout_update_order_meta', 'dokan_sync_insert_order', 20 );
        add_action( 'woocommerce_store_api_checkout_order_processed', 'dokan_sync_insert_order', 20 );

        // order table synced for dokan update order meta
        add_action( 'dokan_checkout_update_order_meta', 'dokan_sync_insert_order' );

        // prevent non-vendor coupons from being added
        add_filter( 'woocommerce_coupon_is_valid', [ $this, 'ensure_vendor_coupon' ], 10, 3 );

        if ( is_admin() ) {
            add_action( 'woocommerce_process_shop_order_meta', 'dokan_sync_insert_order', 60 );
        }

        // restore order stock if it's been reduced by twice
        add_action( 'woocommerce_reduce_order_stock', [ $this, 'restore_reduced_order_stock' ] );

        add_action( 'woocommerce_reduce_order_stock', [ $this, 'handle_order_notes_for_suborder' ], 99 );

        // Suborder pdf button
        add_filter( 'dokan_my_account_my_sub_orders_actions', [ $this, 'suborder_pdf_invoice_button' ], 10, 2 );
    }

    /**
     * Update the child order status when a parent order status is changed
     *
     * @param int      $order_id
     * @param string   $old_status
     * @param string   $new_status
     * @param WC_Order $order
     *
     * @return void
     */
    public function on_order_status_change( $order_id, $old_status, $new_status, $order ) {
        global $wpdb;

        // Split order if the order doesn't have parent and sub orders,
        // and the order is created from dashboard.
        if ( empty( $order->get_parent_id() ) && empty( $order->get_meta( 'has_sub_order' ) ) && is_admin() ) {
            // Remove the hook to prevent recursive callas.
            remove_action( 'woocommerce_order_status_changed', [ $this, 'on_order_status_change' ], 10 );

            // Split the order.
            dokan()->order->maybe_split_orders( $order_id );

            // Add the hook back.
            add_action( 'woocommerce_order_status_changed', [ $this, 'on_order_status_change' ], 10, 4 );
        }

        // make sure order status contains "wc-" prefix
        if ( stripos( $new_status, 'wc-' ) === false ) {
            $new_status = 'wc-' . $new_status;
        }

        // insert on dokan sync table
        $wpdb->update(
            $wpdb->dokan_orders,
            [ 'order_status' => $new_status ],
            [ 'order_id' => $order_id ],
            [ '%s' ],
            [ '%d' ]
        );

        // if any child orders found, change the orders as well
        $sub_orders = dokan()->order->get_child_orders( $order_id );
        if ( $sub_orders ) {
            foreach ( $sub_orders as $sub_order ) {
                if ( is_callable( [ $sub_order, 'update_status' ] ) ) {
                    $sub_order->update_status( $new_status );
                }
            }
        }

        /**
         * If `exclude_cod_payment` is enabled, don't include the fund in vendor's withdrawal balance.
         *
         * @since 3.8.3
         */
        $exclude_cod_payment = 'on' === dokan_get_option( 'exclude_cod_payment', 'dokan_withdraw', 'off' );

        if ( $exclude_cod_payment && 'cod' === $order->get_payment_method() ) {
            return;
        }

        // update on vendor-balance table
        $wpdb->update(
            $wpdb->dokan_vendor_balance,
            [ 'status' => $new_status ],
            [
                'trn_id'   => $order_id,
                'trn_type' => 'dokan_orders',
            ],
            [ '%s' ],
            [ '%d', '%s' ]
        );
    }

    /**
     * If order status is set to refunded from vendor dashboard, enter remaining balance into vendor balance table.
     *
     * @since 3.8.0 Created this method from on_order_status_change()
     *
     * @param int      $order_id
     * @param string   $old_status
     * @param string   $new_status
     * @param WC_Order $order
     *
     * @return void
     */
    public function manage_refunded_for_order( $order_id, $old_status, $new_status, $order ) {
        global $wpdb;

        // verify nonce
        if ( ! isset( $_POST['_wpnonce'], $_POST['post_type'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'dokan_change_status' ) ) {
            return;
        }

        $exclude_cod_payment = 'on' === dokan_get_option( 'exclude_cod_payment', 'dokan_withdraw', 'off' );
        if ( $exclude_cod_payment && 'cod' === $order->get_payment_method() ) {
            return;
        }

        if ( $new_status !== 'wc-refunded' ) {
            return;
        }

        if ( $_POST['post_type'] !== 'shop_order' ) {
            return;
        }

        $balance_data = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT 1 FROM $wpdb->dokan_vendor_balance WHERE trn_id = %d AND trn_type = %s AND status = 'approved'",
                [ $order_id, 'dokan_refund' ]
            )
        );

        if ( ! empty( $balance_data ) ) {
            return;
        }

        $seller_id  = dokan_get_seller_id_by_order( $order_id );
        $net_amount = dokan()->commission->get_earning_by_order( $order );

        $wpdb->insert(
            $wpdb->dokan_vendor_balance,
            [
                'vendor_id'    => $seller_id,
                'trn_id'       => $order_id,
                'trn_type'     => 'dokan_refund',
                'debit'        => 0,
                'credit'       => $net_amount,
                'status'       => 'approved',
                'trn_date'     => current_time( 'mysql' ),
                'balance_date' => current_time( 'mysql' ),
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

    /**
     * Mark the parent order as complete when all the child order are completed
     *
     * @param integer  $order_id
     * @param string   $old_status
     * @param string   $new_status
     * @param WC_Order $order
     *
     * @return void
     */
    public function on_sub_order_change( $order_id, $old_status, $new_status, $order ) {
        // we are monitoring only child orders
        if ( $order->get_parent_id() === 0 ) {
            return;
        }

        // get all the child orders and monitor the status
        $parent_order_id = $order->get_parent_id();
        $sub_orders      = dokan()->order->get_child_orders( $parent_order_id );

        if ( ! $sub_orders ) {
            return;
        }

        // return if any child order is not completed
        $all_complete = true;

        foreach ( $sub_orders as $sub_order ) {
            if ( $sub_order->get_status() !== 'completed' ) {
                $all_complete = false;
                break;
            }
        }

        // seems like all the child orders are completed
        // mark the parent order as complete
        if ( $all_complete ) {
            $parent_order = wc_get_order( $parent_order_id );
            $parent_order->update_status( 'wc-completed', __( 'Mark parent order completed when all child orders are completed.', 'dokan-lite' ) );
        }
    }

    /**
     * Split order for vendor
     *
     * @since 3.0.0
     *
     * @param $parent_order_id
     *
     * @return void
     */
    public function split_vendor_orders( $parent_order_id ) {
        dokan()->order->maybe_split_orders( $parent_order_id );
    }

    /**
     * Ensure vendor coupon
     *
     * For consistency, restrict coupons in cart if only
     * products from that vendor exists in the cart. Also, a coupon
     * should be restricted with a product.
     *
     * For example: When entering a coupon created by admin is applied, make
     * sure a product of the admin is in the cart. Otherwise it wouldn't be
     * possible to distribute the coupon in sub orders.
     *
     * @param boolean       $valid
     * @param \WC_Coupon    $coupon
     * @param \WC_Discounts $discount
     *
     * @throws Exception
     * @return boolean|Exception
     */
    public function ensure_vendor_coupon( $valid, $coupon, $discount ) {
        $available_vendors  = [];
        $available_products = [];

        if ( WC()->cart ) {
            foreach ( WC()->cart->get_cart() as $item ) {
                $product_id           = $item['data']->get_id();
                $available_vendors[]  = (int) dokan_get_vendor_by_product( $product_id, true );
                $available_products[] = $product_id;
            }
        } else {
            foreach ( $discount->get_items() as $item_id => $item ) {
                $available_vendors[]  = (int) dokan_get_vendor_by_product( $item_id, true );
                $available_products[] = $item_id;
            }
        }

        $available_vendors = array_unique( $available_vendors );

        if ( $coupon->is_type( 'fixed_cart' ) && count( $available_vendors ) > 1 ) {
            throw new Exception( __( 'This coupon is invalid for multiple vendors.', 'dokan-lite' ) );
        }

        // Make sure applied coupon created by admin
        if ( apply_filters( 'dokan_ensure_admin_have_create_coupon', $valid, $coupon, $available_vendors, $available_products ) ) {
            return true;
        }

        if ( ! apply_filters( 'dokan_ensure_vendor_coupon', true ) ) {
            return $valid;
        }

        // A coupon must be bound with a product
        if ( ! dokan()->is_pro_exists() && count( $coupon->get_product_ids() ) === 0 ) {
            throw new Exception( __( 'A coupon must be restricted with a vendor product.', 'dokan-lite' ) );
        }

        $coupon_id = $coupon->get_id();
        $vendor_id = intval( get_post_field( 'post_author', $coupon_id ) );

        if ( ! in_array( $vendor_id, $available_vendors, true ) ) {
            return false;
        }

        return $valid;
    }

    /**
     * Restore order stock if it's been reduced by twice
     *
     * @param WC_Order $order
     *
     * @return void
     */
    public function restore_reduced_order_stock( $order ) {
        // seems in rest request, there is no such issue like (stock reduced by twice), so return early
        if ( defined( 'REST_REQUEST' ) ) {
            return;
        }

        // seems it's not a parent order so return early
        if ( ! $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        // Loop over all items.
        foreach ( $order->get_items( 'line_item' ) as $item ) {
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
     * Handle stock level wrong calculation in order notes for suborder
     *
     * @since 3.8.3
     *
     * @param WC_Order $order
     *
     * @return void
     */
    public function handle_order_notes_for_suborder( $order ) {
        //return if it has suborder. only continue if this is a suborder
        if ( ! $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        $notes = wc_get_order_notes( [ 'order_id' => $order->get_id() ] );

        //change stock level note status instead of deleting
        foreach ( $notes as $note ) {
            //here using the woocommerce as text domain because we are using woocommerce text for searching
            if ( false !== strpos( $note->content, __( 'Stock levels reduced:', 'woocommerce' ) ) ) { //phpcs:ignore WordPress.WP.I18n.TextDomainMismatch
                //update notes status to `hold`, so that it will not show in order details page
                wp_set_comment_status( $note->id, 'hold' );
            }
        }

        //adding stock level notes in order
        foreach ( $order->get_items( 'line_item' ) as $key => $line_item ) {
            $product = $line_item->get_product();

            if ( $product->get_manage_stock() ) {
                $stock_quantity    = $product->get_stock_quantity();
                $previous_quantity = (int) $stock_quantity + $line_item->get_quantity();

                $notes_content = $product->get_formatted_name() . ' ' . $previous_quantity . '&rarr;' . $stock_quantity;

                //here using the woocommerce as text domain because we are using woocommerce text for adding
                $order->add_order_note( __( 'Stock levels reduced:', 'woocommerce' ) . ' ' . $notes_content ); //phpcs:ignore WordPress.WP.I18n.TextDomainMismatch
            }
        }
    }

    /**
     * PDF Invoices & Packing Slips for WooCommerce plugin integration on suborder section.
     *
     * @since 3.8.3
     *
     * @param $actions
     * @param $order
     *
     * @return mixed
     */
    public function suborder_pdf_invoice_button( $actions, $order ) {
        $woocommerce_all_actions = apply_filters( 'woocommerce_my_account_my_orders_actions', $actions, $order );

        if ( isset( $woocommerce_all_actions['invoice'] ) ) {
            $actions['action'] = $woocommerce_all_actions['invoice'];
        }
        return $actions;
    }
}
