<?php

namespace WeDevs\Dokan;

use WC_Order;
use WC_Product;
use WeDevs\Dokan\ProductCategory\Helper;
use WP_Error;
use WooCommerce\PayPalCommerce\WcGateway\Gateway\PayPalGateway;

/**
 * Dokan Commission Class
 *
 * @since 2.9.21
 */
class Commission {

    /**
     * Order id holder
     *
     * @since 2.9.21
     *
     * @var integer
     */
    public $order_id = 0;

    /**
     * Order Line Item Id For Product
     *
     * @since 3.8.0
     *
     * @var int $order_item_id
     */
    protected $order_item_id = 0;

    /**
     * Order quantity holder
     *
     * @since 2.9.21
     *
     * @var integer
     */
    public $quantity = 0;

    /**
     * Class constructor
     *
     * @since  2.9.21
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
     * Calculate gateway fee
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

        foreach ( $this->get_all_order_to_be_processed( $order ) as $tmp_order ) {
            $gateway_fee_added = $tmp_order->get_meta( 'dokan_gateway_fee' );
            $vendor_earning    = $this->get_earning_from_order_table( $tmp_order->get_id() );

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
            // translators: %s: Geteway fee
            $tmp_order->add_order_note( sprintf( __( 'Payment gateway processing fee %s', 'dokan-lite' ), wc_format_decimal( $gateway_fee, 2 ) ) );

            //remove cache for seller earning
            $cache_key = "get_earning_from_order_table_{$tmp_order->get_id()}_seller";
            Cache::delete( $cache_key );

            // remove cache for seller earning
            $cache_key = "get_earning_from_order_table_{$tmp_order->get_id()}_admin";
            Cache::delete( $cache_key );
        }
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
     * Set order id
     *
     * @since  2.9.21
     *
     * @param int $id
     *
     * @return void
     */
    public function set_order_id( $id ) {
        $this->order_id = $id;
    }

    /**
     * Set order line item id
     *
     * @since 3.8.0
     *
     * @param int $item_id
     *
     * @return void
     */
    public function set_order_item_id( $item_id ) {
        $this->order_item_id = absint( $item_id );
    }

    /**
     * Get order id
     *
     * @since  2.9.21
     *
     * @return int
     */
    public function get_order_id() {
        return $this->order_id;
    }

    /**
     * Get order line item id
     *
     * @since 3.8.0
     *
     * @return int
     */
    public function get_order_item_id() {
        return $this->order_item_id;
    }

    /**
     * Set order quantity
     *
     * @since  2.9.21
     *
     * @param int $number
     *
     * @return void
     */
    public function set_order_qunatity( $number ) {
        $this->quantity = $number;
    }

    /**
     * Get order quantity
     *
     * @since  2.9.21
     *
     * @return int
     */
    public function get_order_qunatity() {
        return $this->quantity;
    }

    /**
     * Get earning by product
     *
     * @since  2.9.21
     *
     * @param int|WC_Product $product
     * @param string         $context [admin|seller]
     * @param float|null     $price
     *
     * @return float|WP_Error
     */
    public function get_earning_by_product( $product, $context = 'seller', $price = null ) {
        if ( ! $product instanceof WC_Product ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product ) {
            return new WP_Error( 'invalid_product', __( 'Product not found', 'dokan-lite' ), [ 'status' => 400 ] );
        }

        $product_price = is_null( $price ) ? (float) $product->get_price() : (float) $price;
        $vendor_id     = (int) dokan_get_vendor_by_product( $product, true );
        $product_id    = $product->get_id();

        $earning = $this->calculate_commission( $product_id, $product_price, $vendor_id );
        $earning = 'admin' === $context ? $product_price - $earning : $earning;

        return apply_filters( 'dokan_get_earning_by_product', $earning, $product, $context );
    }

    /**
     * Get earning by order
     *
     * @since  2.9.21
     * @since  3.7.19 Shipping tax recipient support added.
     *
     * @param int|WC_Order $order Order.
     * @param string       $context
     *
     * @return float|void|WP_Error|null on failure
     */
    public function get_earning_by_order( $order, $context = 'seller' ) {
        if ( is_numeric( $order ) ) {
            $order = wc_get_order( $order );
        }

        if ( ! $order ) {
            return new WP_Error( __( 'Order not found', 'dokan-lite' ), 404 );
        }

        if ( $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        // If `_dokan_admin_fee` is found means, the commission has been calculated for this order without the `WeDevs\Dokan\Commission` class.
        // So we'll return the previously earned commission to keep backward compatability.
        $saved_admin_fee = $order->get_meta( '_dokan_admin_fee', true );

        if ( $saved_admin_fee !== '' ) {
            $saved_fee = ( 'seller' === $context ) ? $order->get_total() - $saved_admin_fee : $saved_admin_fee;

            return apply_filters( 'dokan_order_admin_commission', $saved_fee, $order );
        }

        // Set user passed `order_id`
        $this->set_order_id( $order->get_id() );

        // get earning from order table
        $earning = $this->get_earning_from_order_table( $order->get_id(), $context );
        if ( ! is_null( $earning ) ) {
            return $earning;
        }

        $earning   = 0;
        $vendor_id = (int) $order->get_meta( '_dokan_vendor_id' );

        foreach ( $order->get_items() as $item_id => $item ) {
            // Set user passed `order_id` so that we can track if any commission_rate has been saved previously.
            // Specially on order table `re-generation`.
            $this->set_order_item_id( $item->get_id() );

            // Set line item quantity so that we can use it later in the `\WeDevs\Dokan\Commission::prepare_for_calculation()` method
            $this->set_order_qunatity( $item->get_quantity() );

            $product_id = $item->get_variation_id() ? $item->get_variation_id() : $item->get_product_id();
            $refund     = $order->get_total_refunded_for_item( $item_id );

            if ( dokan_is_admin_coupon_applied( $order, $vendor_id, $product_id ) ) {
                $earning += dokan_pro()->coupon->get_earning_by_admin_coupon( $order, $item, $context, $item->get_product(), $vendor_id, $refund );
            } else {
                $item_price = apply_filters( 'dokan_earning_by_order_item_price', $item->get_total(), $item, $order );
                $item_price = $refund ? $item_price - $refund : $item_price;

                $item_earning = $this->calculate_commission( $product_id, $item_price, $vendor_id );
                $item_earning = 'admin' === $context ? $item_price - $item_earning : $item_earning;
                $earning      += $item_earning;
            }

            // reset order item id to zero
            $this->set_order_item_id( 0 );
            // set order quantity to zero
            $this->set_order_qunatity( 0 );
        }

        // reset order id to zero, we don't need this value anymore
        $this->set_order_id( 0 );

        if ( $context === $this->get_shipping_fee_recipient( $order ) ) {
            $earning += wc_format_decimal( floatval( $order->get_shipping_total() ) ) - $order->get_total_shipping_refunded();
        }

        if ( $context === $this->get_tax_fee_recipient( $order->get_id() ) ) {
            $earning += ( ( $order->get_total_tax() - $order->get_total_tax_refunded() ) - ( $order->get_shipping_tax() - $this->get_total_shipping_tax_refunded( $order ) ) );
        }

        if ( $context === $this->get_shipping_tax_fee_recipient( $order ) ) {
            $earning += ( $order->get_shipping_tax() - $this->get_total_shipping_tax_refunded( $order ) );
        }

        $earning = apply_filters_deprecated( 'dokan_order_admin_commission', [ $earning, $order, $context ], '2.9.21', 'dokan_get_earning_by_order' );

        return apply_filters( 'dokan_get_earning_by_order', $earning, $order, $context );
    }

    /**
     * Get global rate
     *
     * @since  2.9.21
     *
     * @return float
     */
    public function get_global_rate() {
        return $this->validate_rate( dokan_get_option( 'admin_percentage', 'dokan_selling', 0 ) );
    }

    /**
     * Get vendor wise commission rate
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return float
     */
    public function get_vendor_wise_rate( $vendor_id ) {
        return $this->validate_rate( get_user_meta( $vendor_id, 'dokan_admin_percentage', true ) );
    }

    /**
     * Get product wise commission rate
     *
     * @since  2.9.21
     *
     * @param int $product_id
     *
     * @return float
     */
    public function get_product_wise_rate( $product_id ) {
        return $this->validate_rate( get_post_meta( $this->validate_product_id( $product_id ), '_per_product_admin_commission', true ) );
    }

    /**
     * Validate product id (if it's a variable product, return it's parent id)
     *
     * @since  2.9.21
     *
     * @param int $product_id
     *
     * @return int
     */
    public function validate_product_id( $product_id ) {
        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return 0;
        }

        $parent_id = $product->get_parent_id();

        return $parent_id ? $parent_id : $product_id;
    }

    /**
     * Get category wise commission rate
     *
     * @since  2.9.21
     *
     * @param int $product_id
     *
     * @return float
     */
    public function get_category_wise_rate( $product_id ) {
        $terms = Helper::get_product_chosen_category( $this->validate_product_id( $product_id ) );

        // Category commission will not applicable if 'Product Category Selection' is set as 'Multiple' in Dokan settings.
        if ( ! is_array( $terms ) || empty( $terms ) || count( $terms ) > 1 || ! Helper::product_category_selection_is_single() ) {
            return null;
        }

        $term_id = $terms[0];
        $rate    = ! $terms ? null : get_term_meta( $term_id, 'per_category_admin_commission', true );

        return $this->validate_rate( $rate );
    }

    /**
     * Get global commission type
     *
     * @since  2.9.21
     *
     * @return string
     */
    public function get_global_type() {
        return dokan_get_option( 'commission_type', 'dokan_selling', 'percentage' );
    }

    /**
     * Get vendor wise commission type
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return string
     */
    public function get_vendor_wise_type( $vendor_id ) {
        return get_user_meta( $vendor_id, 'dokan_admin_percentage_type', true );
    }

    /**
     * Get category wise commission type
     *
     * @since  2.9.21
     *
     * @param int $product_id
     *
     * @return string
     */
    public function get_category_wise_type( $product_id ) {
        $terms   = get_the_terms( $this->validate_product_id( $product_id ), 'product_cat' );
        $term_id = $terms[0]->term_id;

        return ! $terms ? null : get_term_meta( $term_id, 'per_category_admin_commission_type', true );
    }

    /**
     * Get product wise commission type
     *
     * @since  2.9.21
     *
     * @param int $product_id
     *
     * @return string
     */
    public function get_product_wise_type( $product_id ) {
        return get_post_meta( $this->validate_product_id( $product_id ), '_per_product_admin_commission_type', true );
    }

    /**
     * Validate commission rate
     *
     * @since  2.9.21
     *
     * @param float $rate
     *
     * @return float
     */
    public function validate_rate( $rate ) {
        if ( '' === $rate || ! is_numeric( $rate ) || $rate < 0 ) {
            return null;
        }

        return (float) $rate;
    }

    /**
     * Get global earning
     *
     * @since  2.9.21
     *
     * @param float $product_price
     *
     * @return float|null on failure
     */
    public function get_global_earning( $product_price ) {
        return $this->prepare_for_calculation( __FUNCTION__, null, $product_price );
    }

    /**
     * Get vendor wise earning
     *
     * @since  2.9.21
     *
     * @param int   $vendor_id
     * @param float $product_price
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_earning( $vendor_id, $product_price ) {
        return $this->prepare_for_calculation( __FUNCTION__, $vendor_id, $product_price );
    }

    /**
     * Get category wise earning
     *
     * @since  2.9.21
     *
     * @param int   $product_id
     * @param float $product_price
     *
     * @return float|null on failure
     */
    public function get_category_wise_earning( $product_id, $product_price ) {
        if ( ! dokan()->is_pro_exists() ) {
            return null;
        }

        return $this->prepare_for_calculation( __FUNCTION__, $product_id, $product_price );
    }

    /**
     * Get product wise earning
     *
     * @since  2.9.21
     *
     * @param int $product_id
     * @param int $product_price
     *
     * @return float|null on failure
     */
    public function get_product_wise_earning( $product_id, $product_price ) {
        if ( ! dokan()->is_pro_exists() ) {
            return null;
        }

        return $this->prepare_for_calculation( __FUNCTION__, $product_id, $product_price );
    }

    /**
     * Prepare for calculation
     *
     * @since  2.9.21
     *
     * @param callable $callable
     * @param int      $product_id
     * @param float    $product_price
     *
     * @return float | null on failure
     */
    public function prepare_for_calculation( $callable, $product_id = 0, $product_price = 0 ) {
        do_action( 'dokan_before_prepare_for_calculation', $callable, $product_id, $product_price, $this );

        // If an order has been purchased previously, calculate the earning with the previously stated commission rate.
        // It's important cause commission rate may get changed by admin during the order table `re-generation`.
        $commission_rate = $this->get_order_item_id() ? wc_get_order_item_meta( $this->get_order_item_id(), '_dokan_commission_rate', true ) : null;
        $commission_type = $this->get_order_item_id() ? wc_get_order_item_meta( $this->get_order_item_id(), '_dokan_commission_type', true ) : null;
        $additional_fee  = $this->get_order_item_id() ? wc_get_order_item_meta( $this->get_order_item_id(), '_dokan_additional_fee', true ) : null;

        if ( empty( $commission_rate ) ) { // this is the first time we are calculating commission for this order
            // Set default value as null
            $commission_rate = null;
            $commission_type = null;
            $additional_fee  = null;

            $func_rate = str_replace( 'earning', 'rate', $callable );
            $func_type = str_replace( 'earning', 'type', $callable );
            $func_fee  = str_replace( 'earning', 'additional_fee', $callable );

            // get[product,category,vendor,global]_wise_rate
            if ( is_callable( [ $this, $func_rate ] ) ) {
                $commission_rate = $this->$func_rate( $product_id );
            }

            if ( is_null( $commission_rate ) ) {
                return $commission_rate;
            }

            // get[product,category,vendor,global]_wise_type
            if ( is_callable( [ $this, $func_type ] ) ) {
                $commission_type = $this->$func_type( $product_id );
            }

            // get[product,category,vendor,global]_wise_additional_fee
            if ( is_callable( [ $this, $func_fee ] ) ) {
                $additional_fee = $this->$func_fee( $product_id );
            }

            // Saving applied commission rates and types for current order item in order item meta.
            wc_add_order_item_meta( $this->get_order_item_id(), '_dokan_commission_rate', $commission_rate );
            wc_add_order_item_meta( $this->get_order_item_id(), '_dokan_commission_type', $commission_type );
            wc_add_order_item_meta( $this->get_order_item_id(), '_dokan_additional_fee', $additional_fee );
        }

        /**
         * If dokan pro doesn't exist but combine commission is found in database due to it was active before
         * Then make the commission type 'flat'. We are making it flat cause when commission type is there in database
         * But in option field, looks like flat commission is selected.
         *
         * @since 3.0.0
         */
        if ( ! dokan()->is_pro_exists() && 'combine' === $commission_type ) {
            $commission_type = 'flat';
        }

        $earning = null;

        if ( 'flat' === $commission_type ) {
            if ( (int) $this->get_order_qunatity() > 1 ) {
                $commission_rate *= apply_filters( 'dokan_commission_multiply_by_order_quantity', $this->get_order_qunatity() );
            }

            // If `_dokan_item_total` returns value non-falsy value, it means the request is comming from the `order refund requst`.
            // As it's `flat` fee, So modify `commission rate` to the correct amount to get refunded. (commission_rate/item_total)*product_price.
            $item_total = 0;
            if ( $this->get_order_id() ) {
                $order      = wc_get_order( $this->get_order_id() );
                $item_total = $order->get_meta( '_dokan_item_total', true );
            }

            if ( $item_total ) {
                $commission_rate = ( $commission_rate / $item_total ) * $product_price;
            }

            $earning = $product_price - $commission_rate;
        } elseif ( 'percentage' === $commission_type ) {
            $earning = ( $product_price * $commission_rate ) / 100;
            $earning = $product_price - $earning;

            // vendor will get 100 percent if commission rate > 100
            if ( $commission_rate > 100 ) {
                $earning = $product_price;
            }
        }

        return apply_filters( 'dokan_prepare_for_calculation', $earning, $commission_rate, $commission_type, $additional_fee, $product_price, $this->get_order_id() );
    }

    /**
     * Get product wise additional fee
     *
     * @since  2.9.21
     *
     * @param int $product_id
     *
     * @return float|null on failure
     */
    public function get_product_wise_additional_fee( $product_id ) {
        return $this->validate_rate( get_post_meta( $this->validate_product_id( $product_id ), '_per_product_admin_additional_fee', true ) );
    }

    /**
     * Get global wise additional fee
     *
     * @since  2.9.21
     *
     * @param int $product_id
     *
     * @return float|null on failure
     */
    public function get_global_additional_fee() {
        return $this->validate_rate( dokan_get_option( 'additional_fee', 'dokan_selling', 0 ) );
    }

    /**
     * Get vendor wise additional fee
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_additional_fee( $vendor_id ) {
        return $this->validate_rate( get_user_meta( $vendor_id, 'dokan_admin_additional_fee', true ) );
    }

    /**
     * Get category wise additional fee
     *
     * @since  2.9.21
     *
     * @param int $product_id
     *
     * @return float|null on failure
     */
    public function get_category_wise_additional_fee( $product_id ) {
        $terms = get_the_terms( $this->validate_product_id( $product_id ), 'product_cat' );

        if ( empty( $terms ) ) {
            return null;
        }

        $term_id = $terms[0]->term_id;
        $rate    = ! $terms ? null : get_term_meta( $term_id, 'per_category_admin_additional_fee', true );

        return $this->validate_rate( $rate );
    }

    /**
     * Get earning from order table
     *
     * @since  2.9.21
     *
     * @param int    $order_id
     * @param string $context
     *
     * @return float|null on failure
     */
    public function get_earning_from_order_table( $order_id, $context = 'seller' ) {
        global $wpdb;

        $cache_key = "get_earning_from_order_table_{$order_id}_{$context}";
        $earning   = Cache::get( $cache_key );

        if ( false !== $earning ) {
            return $earning;
        }

        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT `net_amount`, `order_total` FROM {$wpdb->dokan_orders} WHERE `order_id` = %d",
                $order_id
            )
        );

        if ( ! $result ) {
            return null;
        }

        $earning = 'seller' === $context ? (float) $result->net_amount : (float) $result->order_total - (float) $result->net_amount;
        Cache::set( $cache_key, $earning );

        return $earning;
    }

    /**
     * Get shipping fee recipient
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

    /**
     * Get processing fee
     *
     * @since DOKAN_LITE_SINCE
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
     * Get all the orders to be processed
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param WC_Order $order
     *
     * @return WC_Order[]
     */
    public function get_all_order_to_be_processed( $order ) {
        $all_orders = [];

        if ( $order->get_meta( 'has_sub_order' ) ) {
            $all_orders = dokan()->order->get_child_orders( $order->get_id() );
        } else {
            $all_orders[] = $order;
        }

        return $all_orders;
    }

    /**
     * Calculate commission (commission priority [1.product, 2.category, 3.vendor, 4.global] wise)
     *
     * @since  2.9.21
     *
     * @param int   $product_id
     * @param float $product_price
     * @param int   $vendor_id
     *
     * @return float
     */
    public function calculate_commission( $product_id, $product_price, $vendor_id = null ) {
        $product_wise_earning = $this->get_product_wise_earning( $product_id, $product_price );

        if ( ! is_null( $product_wise_earning ) ) {
            return $product_wise_earning;
        }

        $category_wise_earning = $this->get_category_wise_earning( $product_id, $product_price );

        if ( ! is_null( $category_wise_earning ) ) {
            return $category_wise_earning;
        }

        $vendor_wise_earning = $this->get_vendor_wise_earning( $vendor_id, $product_price );

        if ( ! is_null( $vendor_wise_earning ) ) {
            return $vendor_wise_earning;
        }

        $global_earning = $this->get_global_earning( $product_price );

        if ( ! is_null( $global_earning ) ) {
            return $global_earning;
        }

        return $product_price;
    }
}
