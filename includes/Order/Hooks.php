<?php

namespace WeDevs\Dokan\Order;

use Exception;
use WC_Coupon;
use WC_Discounts;
use WC_Order;
use WC_Product;

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
        add_filter( 'woocommerce_coupon_is_valid', [ $this, 'ensure_coupon_is_valid' ], 10, 3 );

        if ( is_admin() ) {
            add_action( 'woocommerce_process_shop_order_meta', 'dokan_sync_insert_order', 60 );
        }

        // restore order stock if it's been reduced by twice
        add_action( 'woocommerce_reduce_order_stock', [ $this, 'restore_reduced_order_stock' ] );

        add_action( 'woocommerce_reduce_order_stock', [ $this, 'handle_order_notes_for_suborder' ], 99 );
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
        $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->dokan_orders,
            [ 'order_status' => $new_status ],
            [ 'order_id' => $order_id ],
            [ '%s' ],
            [ '%d' ]
        );

        // Update sub-order statuses
        $sub_orders = dokan()->order->get_child_orders( $order_id );
        if ( $sub_orders ) {
            foreach ( $sub_orders as $sub_order ) {
                if ( is_callable( [ $sub_order, 'update_status' ] ) ) {
                    $current_status = $sub_order->get_status();
                    if ( $this->is_status_change_allowed( $current_status, $new_status ) ) {
                        $sub_order->update_status( $new_status );
                    } else {
                        $this->log_skipped_status_update( $sub_order->get_id(), $current_status, $new_status );
                    }
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
        $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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
     * Check if a status change is allowed for a sub-order.
     *
     * This method determines whether a sub-order can transition from its current status
     * to a new status, based on a configurable whitelist of allowed transitions.
     *
     * @since 3.12.2
     *
     * @param string $current_status The current status of the sub-order (should include 'wc-' prefix).
     * @param string $new_status     The new status to check (should include 'wc-' prefix).
     *
     * @return bool True if the status change is allowed, false otherwise.
     */
    private function is_status_change_allowed( string $current_status, string $new_status ): bool {
        // Ensure both statuses have 'wc-' prefix
        $current_status = $this->maybe_add_wc_prefix( $current_status );
        $new_status     = $this->maybe_add_wc_prefix( $new_status );

        // Define the default whitelist of allowed status transitions
        $default_whitelist = [
            'wc-pending'    => [ 'any' ],
            'wc-on-hold'    => [ 'wc-pending', 'wc-on-hold', 'wc-processing', 'wc-completed', 'wc-failed' ],
            'wc-processing' => [ 'wc-completed', 'wc-failed', 'wc-cancelled', 'wc-refunded' ],
            'wc-completed'  => [ 'wc-refunded' ],
            'wc-failed'     => [ 'wc-pending', 'wc-on-hold', 'wc-processing', 'wc-failed', 'wc-cancelled' ],
            'wc-cancelled'  => [],
            'wc-refunded'   => [],
        ];

        /**
         * Filter the whitelist of allowed status transitions for sub-orders.
         *
         * This filter allows developers to customize the whitelist that determines
         * which status transitions are allowed for sub-orders when the main order
         * status is updated. By modifying this whitelist, you can control how
         * sub-order statuses are updated in relation to the main order.
         *
         * @since 3.12.2
         *
         * @param array $whitelist An associative array where keys are current statuses
         *                         and values are arrays of allowed new statuses.
         *                         The special value 'any' allows transition to any status.
         *
         * @return array Modified whitelist of allowed status transitions.
         */
        $whitelist = apply_filters( 'dokan_sub_order_status_update_whitelist', $default_whitelist );

        // Allow any status change if the current status is not in the whitelist or the new status is not allowed
        if ( ! array_key_exists( $current_status, $whitelist ) || ! array_key_exists( $new_status, $whitelist ) ) {
            return true;
        }

        // If 'any' is allowed for the current status, all transitions are allowed
        if ( in_array( 'any', $whitelist[ $current_status ], true ) ) {
            return true;
        }

        // Check if the new status is in the list of allowed transitions
        return in_array( $new_status, $whitelist[ $current_status ], true );
    }

    /**
     * Ensure a status string has the 'wc-' prefix.
     *
     * @since 3.12.2
     *
     * @param string $status The status string to check.
     *
     * @return string The status string with 'wc-' prefix added if it was missing.
     */
    private function maybe_add_wc_prefix( string $status ): string {
        return strpos( $status, 'wc-' ) === 0 ? $status : 'wc-' . $status;
    }

    /**
     * Log a skipped status update for a sub-order.
     *
     * This method logs a message to the error log when a status update for a sub-order
     * is skipped because the status change is not allowed.
     *
     * @since 3.12.2
     *
     * @param int    $order_id      The ID of the sub-order.
     * @param string $current_status The current status of the sub-order.
     * @param string $new_status     The new status that was not allowed.
     *
     * @return void
     */
    private function log_skipped_status_update( int $order_id, string $current_status, string $new_status ) {
        dokan_log( sprintf( 'Dokan: Skipped status update for sub-order %d from %s to %s', $order_id, $current_status, $new_status ) );
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

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
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
        $order_data = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "select * from $wpdb->dokan_orders where order_id = %d",
                $order_id
            )
        );

        if ( isset( $order_data->order_total, $order_data->net_amount ) ) {
            // insert on dokan sync table
            $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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

        // Exclude manual gateways from auto complete order status update for digital products.
        $excluded_gateways = apply_filters( 'dokan_excluded_payment_gateways_on_order_status_update', array( 'bacs', 'cheque', 'cod' ) );

        foreach ( $sub_orders as $sub_order ) {
            // if the order is a downloadable and virtual product, then we need to set the status to complete
            if ( 'processing' === $sub_order->get_status() && $order->is_paid() && ! in_array( $order->get_payment_method(), $excluded_gateways, true ) && ! $sub_order->needs_processing() ) {
                $sub_order->set_status( 'completed', __( 'Marked as completed because it contains digital products only.', 'dokan-lite' ) );
                $sub_order->save();
            }

            // if any child order is not completed, break the loop
            if ( $sub_order->get_status() !== 'completed' ) {
                $all_complete = false;
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
     * @since 4.0.0 Refactored to make it more flexible, and added filter
     *
     * @param boolean      $valid      Whether the coupon is currently considered valid.
     * @param WC_Coupon    $coupon     The coupon object being validated.
     * @param WC_Discounts $discounts  The discount object containing cart/order items being validated.
     *
     * @return boolean True if the coupon is valid, false otherwise
     * @throws Exception When the coupon is invalid for multiple vendors
     */
    public function ensure_coupon_is_valid( bool $valid, WC_Coupon $coupon, WC_Discounts $discounts ): bool {
        $available_vendors  = [];

	    foreach ( $discounts->get_items() as $item ) {
		    if ( ! isset( $item->product ) || ! $item->product instanceof WC_Product ) {
			    continue;
		    }

		    $available_vendors[]  = (int) dokan_get_vendor_by_product( $item->product->get_id(), true );
	    }

        $available_vendors = array_unique( $available_vendors );

        if ( $coupon->is_type( 'fixed_cart' ) && count( $available_vendors ) > 1 ) {
            throw new Exception( esc_html__( 'This coupon is invalid for multiple vendors.', 'dokan-lite' ) );
        }

        /**
         * Filter the validity of a coupon.
         *
         * @since 4.0.0
         *
         * @param boolean      $valid     The validity of the coupon.
         * @param WC_Coupon    $coupon    The coupon object.
         * @param WC_Discounts $discounts The discount object, which contains the order details.
         */
        return apply_filters( 'dokan_coupon_is_valid', $valid, $coupon, $discounts );
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
}
