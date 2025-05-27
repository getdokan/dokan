<?php

namespace WeDevs\Dokan;

use WC_Order;
use WP_Error;
use WooCommerce\PayPalCommerce\WcGateway\Gateway\PayPalGateway;

class Fees {

    /**
     * Class constructor
     * Moved from dokan()->commission in version in 3.14.0
     *
     * @since 3.14.0
     *
     * @return void
     */
    public function __construct() {
        add_filter( 'woocommerce_order_item_get_formatted_meta_data', [ $this, 'hide_extra_data' ] );
        add_action( 'woocommerce_order_status_changed', [ $this, 'calculate_gateway_fee' ], 100 );
        add_action( 'woocommerce_thankyou_ppec_paypal', [ $this, 'calculate_gateway_fee' ] );
        add_action( 'woocommerce_paypal_payments_order_captured', [ $this, 'calculate_gateway_fee' ], 99 );
    }

    /**
     * Hide extra meta data
     *
     * @since  2.9.21
     *
     * @param array
     *
     * @return array
     */
    public function hide_extra_data( $formatted_meta ) {
        $meta_to_hide = [ '_dokan_commission_rate', '_dokan_commission_type', '_dokan_additional_fee' ];

        foreach ( $formatted_meta as $key => $meta ) {
            if ( in_array( $meta->key, $meta_to_hide, true ) ) {
                unset( $formatted_meta[ $key ] );
            }
        }

        return $formatted_meta;
    }

    /**
     * Calculate gateway fee
     * Moved from dokan()->commission in version in 3.14.0
     *
     * @since 2.9.21
     *
     * @param int $order_id
     *
     * @return void
     */
    public function calculate_gateway_fee( $order_id ) {
        global $wpdb;
        $order          = wc_get_order( $order_id );
        $processing_fee = $this->get_processing_fee( $order );

        if ( ! $processing_fee ) {
            return;
        }

        foreach ( dokan()->commission->get_all_order_to_be_processed( $order ) as $tmp_order ) {
            $gateway_fee_added = $tmp_order->get_meta( 'dokan_gateway_fee' );
            $vendor_earning    = dokan()->commission->get_earning_from_order_table( $tmp_order->get_id() );

            if ( is_null( $vendor_earning ) || $gateway_fee_added ) {
                continue;
            }

            $gateway_fee = wc_format_decimal( ( $processing_fee / $order->get_total() ) * $tmp_order->get_total() );

            // Ensure sub-orders also get the correct payment gateway fee (if any)
            $gateway_fee = apply_filters( 'dokan_get_processing_gateway_fee', $gateway_fee, $tmp_order, $order );
            $net_amount = $vendor_earning - $gateway_fee;
            $net_amount = apply_filters( 'dokan_orders_vendor_net_amount', $net_amount, $vendor_earning, $gateway_fee, $tmp_order, $order );

            $wpdb->update(
                $wpdb->dokan_orders,
                [ 'net_amount' => (float) $net_amount ],
                [ 'order_id' => $tmp_order->get_id() ],
                [ '%f' ],
                [ '%d' ]
            );

            $wpdb->update(
                $wpdb->dokan_vendor_balance,
                [ 'debit' => (float) $net_amount ],
                [
                    'trn_id'   => $tmp_order->get_id(),
                    'trn_type' => 'dokan_orders',
                ],
                [ '%f' ],
                [ '%d', '%s' ]
            );

            $tmp_order->update_meta_data( 'dokan_gateway_fee', $gateway_fee );
            $tmp_order->save();

            if ( apply_filters( 'dokan_commission_log_gateway_fee_to_order_note', true, $tmp_order ) ) {
                // translators: %s: Geteway fee
                $tmp_order->add_order_note( sprintf( __( 'Payment gateway processing fee %s', 'dokan-lite' ), wc_format_decimal( $gateway_fee, 2 ) ) );
            }
            //remove cache for seller earning
            $cache_key = "get_earning_from_order_table_{$tmp_order->get_id()}_seller";
            Cache::delete( $cache_key );

            // remove cache for seller earning
            $cache_key = "get_earning_from_order_table_{$tmp_order->get_id()}_admin";
            Cache::delete( $cache_key );
        }
    }

    /**
     * Get processing fee
     *
     * @since 3.0.4
     *
     * @param WC_Order $order
     *
     * @return float
     */
    public function get_processing_fee( $order ) {
        $processing_fee = 0;
        $payment_method  = $order->get_payment_method();

        if ( 'paypal' === $payment_method ) {
            $processing_fee = $order->get_meta( 'PayPal Transaction Fee' );
        } elseif ( 'ppec_paypal' === $payment_method && defined( 'PPEC_FEE_META_NAME_NEW' ) ) {
            $processing_fee = $order->get_meta( PPEC_FEE_META_NAME_NEW );
        } elseif ( 'ppcp-gateway' === $payment_method && class_exists( PayPalGateway::class ) ) {
            $breakdown = $order->get_meta( PayPalGateway::FEES_META_KEY );
            if ( is_array( $breakdown ) && isset( $breakdown['paypal_fee'] ) && is_array( $breakdown['paypal_fee'] ) ) {
                $processing_fee = $breakdown['paypal_fee']['value'];
            }
        }

        return apply_filters( 'dokan_get_processing_fee', $processing_fee, $order );
    }

    /**
     * Get shipping fee recipient
     * Move from commission.php in version 3.14.0
     *
     * @since  2.9.21
     * @since  3.4.1 introduced the shipping fee recipient hook
     *
     * @param WC_Order|int $order
     *
     * @return string
     */
    public function get_shipping_fee_recipient( $order ) {
        if ( is_numeric( $order ) ) {
            $order = wc_get_order( $order );
        }

        if ( ! $order ) {
            return new WP_Error( 'invalid-order-object', __( 'Please provide a valid order object.', 'dokan-lite' ) );
        }

        $saved_shipping_recipient = $order->get_meta( 'shipping_fee_recipient', true );

        if ( $saved_shipping_recipient ) {
            $shipping_recipient = $saved_shipping_recipient;
        } else {
            $shipping_recipient = apply_filters( 'dokan_shipping_fee_recipient', dokan_get_option( 'shipping_fee_recipient', 'dokan_selling', 'seller' ), $order->get_id() );
            $order->update_meta_data( 'shipping_fee_recipient', $shipping_recipient );
            $order->save();
        }

        return $shipping_recipient;
    }

    /**
     * Get tax fee recipient
     *  Move from commission.php in version 3.14.0
     *
     * @since  2.9.21
     * @since  3.4.1 introduced the tax fee recipient hook
     *
     * @param WC_Order|int $order
     *
     * @return string|WP_Error
     */
    public function get_tax_fee_recipient( $order ) {
        if ( is_numeric( $order ) ) {
            $order = wc_get_order( $order );
        }

        if ( ! $order ) {
            return new WP_Error( 'invalid-order-object', __( 'Please provide a valid order object.', 'dokan-lite' ) );
        }

        $saved_tax_recipient = $order->get_meta( 'tax_fee_recipient', true );

        if ( $saved_tax_recipient ) {
            $tax_recipient = $saved_tax_recipient;
        } else {
            $tax_recipient = apply_filters( 'dokan_tax_fee_recipient', dokan_get_option( 'tax_fee_recipient', 'dokan_selling', 'seller' ), $order->get_id() );
            $order->update_meta_data( 'tax_fee_recipient', $tax_recipient );
            $order->save();
        }

        return $tax_recipient;
    }

    /**
     * Get shipping tax fee recipient.
     * Move from commission.php in version 3.14.0
     *
     * @since 3.7.19
     *
     * @param WC_Order $order Order.
     *
     * @return string
     */
    public function get_shipping_tax_fee_recipient( $order ): string {
        // get saved tax recipient
        $saved_shipping_tax_recipient = $order->get_meta( 'shipping_tax_fee_recipient', true );
        if ( ! empty( $saved_shipping_tax_recipient ) ) {
            return $saved_shipping_tax_recipient;
        }

        $default_tax_fee_recipient = $this->get_tax_fee_recipient( $order->get_id() ); // this is needed for backward compatibility
        $shipping_tax_recipient    = dokan_get_option( 'shipping_tax_fee_recipient', 'dokan_selling', $default_tax_fee_recipient );
        $shipping_tax_recipient    = apply_filters( 'dokan_shipping_tax_fee_recipient', $shipping_tax_recipient, $order->get_id() );

        $order->update_meta_data( 'shipping_tax_fee_recipient', $shipping_tax_recipient, true );
        $order->save();

        return $shipping_tax_recipient;
    }

    /**
     * Get total shipping tax refunded for the order.
     * Move from commission.php in version 3.14.0
     *
     * @since 3.7.19
     *
     * @param WC_Order $order Order.
     *
     * @return float
     */
    public function get_total_shipping_tax_refunded( WC_Order $order ): float {
        $tax_refunded = 0.0;

        foreach ( $order->get_items( 'shipping' ) as $item_id => $item ) {
            /**
             * @var \WC_Order_Item_Shipping $item Shipping item.
             */
            foreach ( $item->get_taxes()['total'] as $tax_id => $tax_amount ) {
                $tax_refunded += $order->get_tax_refunded_for_item( $item->get_id(), $tax_id, 'shipping' );
            }
        }

        return $tax_refunded;
    }
}
