<?php

namespace WeDevs\Dokan\Commission;

use Automattic\WooCommerce\Internal\Orders\CouponsController;
use Automattic\WooCommerce\Utilities\ArrayUtil;
use Automattic\WooCommerce\Utilities\StringUtil;
use Exception;
use WC_Order;
use WC_Order_Refund;

class RecalculateCommissions {

    const RECALCULATE_ORDER_ID_OPTION_PREFIX = 'dokan_commission_recalculate_order_id:';

    public function __construct() {
        // Currently we will skip this.
        return;
//        add_action( 'wp_ajax_woocommerce_remove_order_coupon', [ $this, 'overwrite_woocommerce_remove_order_coupon_method' ], 9 );
//        add_action( 'wp_ajax_woocommerce_add_coupon_discount', [ $this, 'overwrite_woocommerce_add_coupon_discount_method' ], 9 );
//        add_action( 'wp_ajax_woocommerce_remove_order_tax', [ $this, 'overwrite_woocommerce_remove_order_tax_method' ], 9 );
//
//        add_action( 'woocommerce_new_order_item', [ $this, 'recalculate_commission_when_any_new_line_item_added' ], 10, 3 );
//        add_action( 'woocommerce_saved_order_items', [ $this, 'recalculate_commission_when_any_line_item_edited' ], 10, 2 );
//        add_action( 'woocommerce_ajax_order_items_removed', [ $this, 'recalculate_commission_when_any_line_item_removed' ], 10, 4 );
//
        add_action( 'dokan_recalculate_order_commission_and_adjust_vendor_balance', [ $this, 'adjust_admin_commission_and_vendor_earning_after_coupon_removed' ] );

        add_action( 'woocommerce_new_order_item', function ( $item_id, $item, $order_id ) {
            update_option( self::RECALCULATE_ORDER_ID_OPTION_PREFIX . $order_id, $order_id );
        }, 10, 3 );

        add_action( 'woocommerce_before_delete_order_item', function ( $item_id ) {
            $item = \WC_Order_Factory::get_order_item( $item_id );
            $order = $item->get_order();

            // TODO: Make sure to ignore if the irem is a couopn.

            update_option( self::RECALCULATE_ORDER_ID_OPTION_PREFIX . $order->get_id(), $order->get_id() );
        } );

        add_action( 'woocommerce_after_order_object_save', function ( $order, $obj ) {
            $recalclate_option = get_option( self::RECALCULATE_ORDER_ID_OPTION_PREFIX . $order->get_id(), false );

            if ( $recalclate_option && ! empty( absint( $recalclate_option ) ) ) {
                delete_option( self::RECALCULATE_ORDER_ID_OPTION_PREFIX . $order->get_id() );
                do_action( 'dokan_recalculate_order_commission_and_adjust_vendor_balance', $order->get_id() );
            }
        }, 10, 2 );

        add_action( 'wp_ajax_woocommerce_calc_line_taxes', function () {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotValidated
            $order_id = absint( sanitize_text_field( wp_unslash( $_POST['order_id'] ) ) );

            if ( ! empty( $order_id ) ) {
                update_option( self::RECALCULATE_ORDER_ID_OPTION_PREFIX . $order_id, $order_id );
            }
        }, 9 );
    }

    public function recalculate_commission_when_any_new_line_item_added( $item_id, $item, $order_id ) {
        // Ignore if item is WC_Order_Item_Coupon because we will handle coupon commission differently.
        if ( $item instanceof \WC_Order_Item_Coupon ) {
            return;
        }

        do_action( 'dokan_recalculate_order_commission_and_adjust_vendor_balance', $order_id );
    }

    public function recalculate_commission_when_any_line_item_edited( $order_id, $items ) {
        if ( ! $order_id ) {
            return;
        }

        do_action( 'dokan_recalculate_order_commission_and_adjust_vendor_balance', $order_id );
    }

    /**
     * @param                               $item_id
     * @param                               $item
     * @param                               $changed_stock
     * @param bool|WC_Order|WC_Order_Refund $order
     *
     * @return void
     */
    public function recalculate_commission_when_any_line_item_removed( $item_id, $item, $changed_stock, $order ) {
        if ( ! $order ) {
            return;
        }

        do_action( 'dokan_recalculate_order_commission_and_adjust_vendor_balance', $order->get_id() );
    }

    public function overwrite_woocommerce_remove_order_tax_method() {
        remove_action( 'wp_ajax_woocommerce_remove_order_tax', [ \WC_AJAX::class, 'remove_order_tax' ] );
        $this->remove_order_tax();
    }

    public function remove_order_tax() {
        check_ajax_referer( 'order-item', 'security' );

        if ( ! current_user_can( 'edit_shop_orders' ) || ! isset( $_POST['order_id'], $_POST['rate_id'] ) ) {
            wp_die( - 1 );
        }

        $response = [];

        try {
            $order_id = absint( $_POST['order_id'] );
            $rate_id  = absint( $_POST['rate_id'] );

            $order = wc_get_order( $order_id );
            if ( ! $order->is_editable() ) {
                throw new Exception( __( 'Order not editable', 'dokan-lite' ) );
            }

            wc_delete_order_item( $rate_id );

            // Need to load order again after deleting to have latest items before calculating.
            $order = wc_get_order( $order_id );
            $order->calculate_totals( false );

            ob_start();
            include __DIR__ . '/admin/meta-boxes/views/html-order-items.php';
            $response['html'] = ob_get_clean();

            do_action( 'dokan_recalculate_order_commission_and_adjust_vendor_balance', $order->get_id() );
        } catch ( Exception $e ) {
            wp_send_json_error( [ 'error' => $e->getMessage() ] );
        }

        // wp_send_json_success must be outside the try block not to break phpunit tests.
        wp_send_json_success( $response );
    }

    /**
     * Overwrite WooCommerce's remove_order_coupon method.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function overwrite_woocommerce_remove_order_coupon_method() {
        remove_action( 'wp_ajax_woocommerce_remove_order_coupon', [ \WC_AJAX::class, 'remove_order_coupon' ] );
        $this->remove_order_coupon();
    }

    /**
     * Overwrite WooCommerce's add_coupon_discount_method method.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function overwrite_woocommerce_add_coupon_discount_method() {
        remove_action( 'wp_ajax_woocommerce_add_coupon_discount', [ \WC_AJAX::class, 'add_coupon_discount' ] );
        $this->add_coupon_discount();
    }

    /**
     * Remove a coupon from an order on ajax request.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function remove_order_coupon() {
        check_ajax_referer( 'order-item', 'security' );

        if ( ! current_user_can( 'edit_shop_orders' ) ) {
            wp_die( - 1 );
        }

        $response = [];

        try {
            $order_id           = isset( $_POST['order_id'] ) ? absint( $_POST['order_id'] ) : 0;
            $order              = wc_get_order( $order_id );
            $calculate_tax_args = [
                'country'  => isset( $_POST['country'] ) ? wc_strtoupper( wc_clean( wp_unslash( $_POST['country'] ) ) ) : '',
                'state'    => isset( $_POST['state'] ) ? wc_strtoupper( wc_clean( wp_unslash( $_POST['state'] ) ) ) : '',
                'postcode' => isset( $_POST['postcode'] ) ? wc_strtoupper( wc_clean( wp_unslash( $_POST['postcode'] ) ) ) : '',
                'city'     => isset( $_POST['city'] ) ? wc_strtoupper( wc_clean( wp_unslash( $_POST['city'] ) ) ) : '',
            ];

            if ( ! $order ) {
                throw new \Exception( __( 'Invalid order', 'dokan-lite' ) );
            }

            $coupon = ArrayUtil::get_value_or_default( $_POST, 'coupon' );
            if ( StringUtil::is_null_or_whitespace( $coupon ) ) {
                throw new Exception( __( 'Invalid coupon', 'dokan-lite' ) );
            }

            $code = wc_format_coupon_code( wp_unslash( $coupon ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
            if ( $order->remove_coupon( $code ) ) {
                // translators: %s coupon code.
                $order->add_order_note( esc_html( sprintf( __( 'Coupon removed: "%s".', 'dokan-lite' ), $code ) ), 0, true );
            }
            $order->calculate_taxes( $calculate_tax_args );
            $order->calculate_totals( false );

            ob_start();
            include dirname( WC_PLUGIN_FILE ) . '/includes/admin/meta-boxes/views/html-order-items.php';
            $response['html'] = ob_get_clean();

            ob_start();
            $notes = wc_get_order_notes( [ 'order_id' => $order_id ] );
            include dirname( WC_PLUGIN_FILE ) . '/includes/admin/meta-boxes/views/html-order-notes.php';
            $response['notes_html'] = ob_get_clean();

            do_action( 'dokan_recalculate_order_commission_and_adjust_vendor_balance', $order->get_id() );
        } catch ( Exception $e ) {
            wp_send_json_error( [ 'error' => $e->getMessage() ] );
        }

        // wp_send_json_success must be outside the try block not to break phpunit tests.
        wp_send_json_success( $response );
    }

    /**
     * Adjust admin commission and vendor earning after coupon removed.
     *
     * @since 4.0.0
     *
     * @param int $order_id
     *
     * @return void
     */
    public function adjust_admin_commission_and_vendor_earning_after_coupon_removed( $order_id ) {
        $order = wc_get_order( $order_id );

        if ( ! $order || $order instanceof WC_Subscription ) {
            return;
        }

        $targeted_order = dokan()->order->get_child_orders( $order_id );

        if ( empty( $targeted_order ) ) {
            $targeted_order[] = $order;
        }

        foreach ( $targeted_order as $order ) {
            $this->adjust_admin_commission_and_vendor_earning( $order );
        }
    }

    /**
     * Adjust admin commission and vendor earning.
     *
     * @param WC_Order $order
     *
     * @return void
     */
    protected function adjust_admin_commission_and_vendor_earning( $order ) {
        // TODO: if not calculated yet make sure to ignore. This method purpose is to recalculate commission only when already has data in database.
        global $wpdb;
        $order_total = $order->get_total();

        try {
            $order_commission = dokan_get_container()->get( OrderCommission::class );
            $order_commission->set_order( $order );
            $order_commission->calculate();
        } catch ( \Exception $exception ) {
            dokan_log( 'Dokan Recalculate Order commission not found: ' . $exception->getMessage() );
            return;
        }

        $context        = 'seller';
        $vendor_earning = $order_commission->get_vendor_total_earning();

        if ( $context === dokan()->fees->get_shipping_fee_recipient( $order ) ) {
            $vendor_earning += $order->get_shipping_total() - $order->get_total_shipping_refunded();
        }

        if ( $context === dokan()->fees->get_tax_fee_recipient( $order->get_id() ) ) {
            $vendor_earning += ( ( floatval( $order->get_total_tax() ) - floatval( $order->get_total_tax_refunded() ) ) - ( floatval( $order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $order ) ) ) );
        }

        if ( $context === dokan()->fees->get_shipping_tax_fee_recipient( $order ) ) {
            $vendor_earning += ( floatval( $order->get_shipping_tax() ) - floatval( dokan()->fees->get_total_shipping_tax_refunded( $order ) ) );
        }

        $wpdb->update(
            $wpdb->dokan_orders,
            [
                'order_total' => (float) $order_total,
                'net_amount'  => (float) $vendor_earning,
            ],
            [ 'order_id' => (int) $order->get_id() ],
            [ '%f', '%f' ],
            [ '%d' ]
        );

        $wpdb->update(
            $wpdb->dokan_vendor_balance,
            [ 'debit' => (float) $vendor_earning ],
            [
                'trn_id'   => (int) $order->get_id(),
                'trn_type' => 'dokan_orders',
            ],
            [ '%f' ],
            [ '%d', '%s' ]
        );
    }

    /**
     * Add order discount via Ajax.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function add_coupon_discount() {
        check_ajax_referer( 'order-item', 'security' );

        if ( ! current_user_can( 'edit_shop_orders' ) ) {
            wp_die( - 1 );
        }

        $response = [];

        try {
            $order = wc_get_container()->get( CouponsController::class )->add_coupon_discount( $_POST );

            ob_start();
            include dirname( WC_PLUGIN_FILE ) . '/includes/admin/meta-boxes/views/html-order-items.php';
            $response['html'] = ob_get_clean();

            ob_start();
            $notes = wc_get_order_notes( [ 'order_id' => $order->get_id() ] );
            include dirname( WC_PLUGIN_FILE ) . '/includes/admin/meta-boxes/views/html-order-notes.php';
            $response['notes_html'] = ob_get_clean();

            do_action( 'dokan_recalculate_order_commission_and_adjust_vendor_balance', $order->get_id() );
        } catch ( Exception $e ) {
            wp_send_json_error( [ 'error' => $e->getMessage() ] );
        }

        // wp_send_json_success must be outside the try block not to break phpunit tests.
        wp_send_json_success( $response );
    }
}
