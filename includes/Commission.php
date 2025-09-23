<?php

namespace WeDevs\Dokan;

use WC_Order;
use WC_Order_Factory;
use WC_Product;
use WeDevs\Dokan\Commission\OrderCommission;
use WeDevs\Dokan\Commission\OrderLineItemCommission;
use WeDevs\Dokan\Commission\ProductCommission;
use WP_Error;

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
     * Calculate gateway fee
     *
     * @deprecated 3.14.0 Use dokan()->fees->calculate_gateway_fee insted.
     *
     * @since 2.9.21
     *
     * @param int $order_id
     *
     * @return void
     */
    public function calculate_gateway_fee( $order_id ) {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->fees->calculate_gateway_fee()' );
        dokan()->fees->calculate_gateway_fee( $order_id );
    }

    /**
     * Set order id
     *
     * @deprecated 3.14.0
     *
     * @since  2.9.21
     *
     * @param int $id
     *
     * @return void
     */
    public function set_order_id( $id ) {
        _deprecated_function( __METHOD__, '3.14.0' );
        $this->order_id = $id;
    }

    /**
     * Set order line item id
     *
     * @deprecated 3.14.0
     *
     * @since 3.8.0
     *
     * @param int $item_id
     *
     * @return void
     */
    public function set_order_item_id( $item_id ) {
        _deprecated_function( __METHOD__, '3.14.0' );
        $this->order_item_id = absint( $item_id );
    }

    /**
     * Get order id
     *
     * @deprecated 3.14.0
     *
     * @since  2.9.21
     *
     * @return int
     */
    public function get_order_id() {
        _deprecated_function( __METHOD__, '3.14.0' );
        return $this->order_id;
    }

    /**
     * Get order line item id
     *
     * @deprecated 3.14.0
     *
     * @since 3.8.0
     *
     * @return int
     */
    public function get_order_item_id() {
        _deprecated_function( __METHOD__, '3.14.0' );
        return $this->order_item_id;
    }

    /**
     * Set order quantity
     *
     * @deprecated 3.14.0
     *
     * @since  2.9.21
     *
     * @param int $number
     *
     * @return void
     */
    public function set_order_qunatity( $number ) {
        _deprecated_function( __METHOD__, '3.14.0' );
        $this->quantity = $number;
    }

    /**
     * Get order quantity
     *
     * @deprecated 3.14.0
     *
     * @since  2.9.21
     *
     * @return int
     */
    public function get_order_qunatity() {
        _deprecated_function( __METHOD__, '3.14.0' );
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

        $product_price = is_null( $price ) ? floatval( $product->get_price() ) : floatval( $price );
        $vendor_id     = (int) dokan_get_vendor_by_product( $product, true );
        $product_id    = $product->get_id();

        try {
            $product_commission = dokan_get_container()->get( ProductCommission::class );
            $product_commission->set_product_id( $product_id );
            $product_commission->set_total_amount( $product_price );
            $product_commission->set_vendor_id( $vendor_id );
            $product_commission->set_category_id( 0 );
            $commission = $product_commission->calculate();

            $commission_or_earning = 'admin' === $context ? $commission->get_admin_commission() : $commission->get_vendor_earning();
        } catch ( \Exception $exception ) {
            $commission_or_earning = 0;
        }

        return apply_filters( 'dokan_get_earning_by_product', $commission_or_earning, $product, $context );
    }

    /**
     * Get earning by order
     *
     * @since  2.9.21
     * @since  3.7.19 Shipping tax recipient support added.
     *
     * @param int|WC_Order $order Order.
     * @param string       $context Accepted values are `admin`, `seller`
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
            $saved_fee = ( 'seller' === $context ) ? floatval( $order->get_total() ) - floatval( $saved_admin_fee ) : $saved_admin_fee;

            return apply_filters( 'dokan_order_admin_commission', $saved_fee, $order );
        }

        // get earning from order table
        $earning_or_commission = $this->get_earning_from_order_table( $order->get_id(), $context );
        if ( ! is_null( $earning_or_commission ) ) {
            return $earning_or_commission;
        }

        try {
            $order_commission = dokan_get_container()->get( OrderCommission::class );
            $order_commission->set_order( $order );
            $order_commission->calculate();
        } catch ( \Exception $exception ) {
            return new WP_Error( 'commission_calculation_failed', __( 'Commission calculation failed', 'dokan-lite' ), [ 'status' => 500 ] );
        }

        $earning_or_commission = 'admin' === $context ? $order_commission->get_admin_total_earning() : $order_commission->get_vendor_total_earning();

        $earning_or_commission = apply_filters_deprecated( 'dokan_order_admin_commission', [ $earning_or_commission, $order, $context ], '2.9.21', 'dokan_get_earning_by_order' );

        return apply_filters( 'dokan_get_earning_by_order', $earning_or_commission, $order, $context );
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
            $rate = 0.0;
        }

        return (float) $rate;
    }

    /**
     * Get vendor wise additional rate
     *
     * @deprecated 3.14.0 Use dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_percentage() insted
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_rate( $vendor_id ) {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_percentage()' );
        return dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_percentage();
    }

    /**
     * Get vendor wise additional fee
     *
     * @deprecated 3.14.0 Use dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_flat() instead
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_additional_fee( $vendor_id ) {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_flat()' );
        return dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_flat();
    }

    /**
     * Get vendor wise additional type
     *
     * @deprecated 3.14.0 Use dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_type() instead
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_type( $vendor_id ) {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_type()' );
        return dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_type();
    }

    /**
     * Get earning from order table
     *
     * @since  2.9.21
     *
     * @param int    $order_id
     * @param string $context
     * @param bool   $raw
     *
     * @return float|array|null on failure
     */
    public function get_earning_from_order_table( $order_id, $context = 'seller', $raw = false ) {
        global $wpdb;

        $cache_key     = "get_earning_from_order_table_{$order_id}_{$context}";
        $cache_key_raw = $cache_key . '_raw';

        $earning = Cache::get( $raw ? $cache_key_raw : $cache_key );
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

        $raw_earning = [
            'net_amount'  => (float) $result->net_amount,
            'order_total' => (float) $result->order_total,
        ];

        $earning = ( 'seller' === $context )
            ? $raw_earning['net_amount']
            : $raw_earning['order_total'] - $raw_earning['net_amount'];

        Cache::set( $cache_key, $earning );
        Cache::set( $cache_key_raw, $raw_earning );

        /**
         * Hooks to modify the earning from order table.
         *
         * @since 4.0.2
         *
         * @param float|array $earning  The earning amount or raw data.
         * @param int         $order_id The order ID.
         * @param string      $context  The context (admin or seller).
         * @param bool        $raw      Whether to return raw data or not.
         */
        return apply_filters(
            'dokan_get_earning_from_order_table',
            $raw ? $raw_earning : $earning,
            $order_id,
            $context,
            $raw
        );
    }

    /**
     * Get shipping fee recipient
     *
     * @deprecated 3.14.0 Use dokan()->fees->get_shipping_fee_recipient() instead
     *
     * @since  2.9.21
     * @since  3.4.1 introduced the shipping fee recipient hook
     *
     * @param WC_Order|int $order
     *
     * @return string
     */
    public function get_shipping_fee_recipient( $order ) {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->fees->get_shipping_fee_recipient()' );

        return dokan()->fees->get_shipping_fee_recipient( $order );
    }

    /**
     * Get tax fee recipient
     *
     * @deprecated 3.14.0 Use dokan()->fees->get_tax_fee_recipient() instead
     *
     * @since  2.9.21
     * @since  3.4.1 introduced the tax fee recipient hook
     *
     * @param WC_Order|int $order
     *
     * @return string|WP_Error
     */
    public function get_tax_fee_recipient( $order ) {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->fees->get_tax_fee_recipient()' );

        return dokan()->fees->get_tax_fee_recipient( $order );
    }

    /**
     * Get shipping tax fee recipient.
     *
     * @deprecated 3.14.0 Use dokan()->fees->get_shipping_tax_fee_recipient() instead
     *
     * @since 3.7.19
     *
     * @param WC_Order $order Order.
     *
     * @return string
     */
    public function get_shipping_tax_fee_recipient( $order ): string {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->fees->get_shipping_tax_fee_recipient()' );
        return dokan()->fees->get_shipping_tax_fee_recipient( $order );
    }

    /**
     * Get total shipping tax refunded for the order.
     *
     * @deprecated 3.14.0 Use dokan()->fees->get_total_shipping_tax_refunded() instead
     *
     * @since 3.7.19
     *
     * @param WC_Order $order Order.
     *
     * @return float
     */
    public function get_total_shipping_tax_refunded( WC_Order $order ): float {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->fees->get_total_shipping_tax_refunded()' );

        return dokan()->fees->get_total_shipping_tax_refunded( $order );
    }

    /**
     * Get processing fee
     *
     * @deprecated 3.14.0 Use dokan()->fees->get_processing_fee instead.
     *
     * @since 3.0.4
     *
     * @param WC_Order $order
     *
     * @return float
     */
    public function get_processing_fee( $order ) {
        _deprecated_function( __METHOD__, '3.14.0', 'dokan()->fees->get_processing_fee' );

        return dokan()->fees->get_processing_fee( $order );
    }

    /**
     * Get all the orders to be processed
     *
     * @since 3.0.4
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
     * I this function the calculation was written for vendor perspective it is deprecated now it is recomanded to use `get_commission` method it works fo admin perspective.
     *
     * @deprecated 3.14.0 Use get_commission() instead.
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
        _deprecated_function( __METHOD__, '3.14.0', 'get_commission' );

        $commission_data = $this->get_commission(
            [
                'order_item_id'  => $this->get_order_item_id(),
                'total_amount'   => $product_price,
                'total_quantity' => $this->get_order_qunatity(),
                'product_id'     => $product_id,
                'vendor_id'      => $vendor_id,
            ],
            true
        );

        $settings       = $commission_data->get_settings();
        $percentage       = $settings->get_percentage();
        $flat             = $settings->get_flat();
        $commission_type = $settings->get_type();

        return apply_filters(
            'dokan_after_commission_calculation',
            $commission_data->get_vendor_earning() ?? 0,
            $percentage,
            $commission_type,
            $flat,
            $product_price,
            $this->get_order_id()
        );
    }

    /**
     * Returns all the commission types that ware in dokan. These types were existed before dokan lite version 3.14.0
     *
     * @since 3.14.0
     *
     * @return array
     */
    public function get_legacy_commission_types() {
        return [
            'combine'    => __( 'Combine', 'dokan-lite' ),
            'percentage' => __( 'Percentage', 'dokan-lite' ),
            'flat'       => __( 'Flat', 'dokan-lite' ),
        ];
    }

    /**
     * Returns commission (commission priority [1.Order item if exists. 2.product, 3.vendor, 4.global] wise)
     *
     * @since 3.14.0
     *
     * @param array $args {
     *     Accepted arguments are below.
     *
     *     @type int       $order_item_id  Order item id. Default ''. Accepted values numbers.
     *     @type float|int $total_amount   The amount on which the commission will be calculated. Default 0. Accepted values numbers.
     *                                     Ff you want to calculate for order line item the $total_amount should be total line item amount and
     *                                     $total_quantity should be total line item quantity. EX: for product item apple with cost $100 then $total_amount = 500, $total_quantity = 5
     *                                     or if you want to calculate for product price the $total_amount should be the product price and $total_quantity should be 1
     *                                     EX: for product apple with cost $100 then $total_amount = 100, $total_quantity = 1
     *     @type int       $total_quantity This is the total quantity that represents the $total_amounts item units. Default 1. Accepted values numbers.
     *                                     Please read $total_amount doc above to understand clearly.
     *     @type int       $product_id     Product id. Default 0. Accepted values numbers.
     *     @type int       $vendor_id      Vendor id. Default ''. Accepted values numbers.
     *     @type int       $category_id    Product category id. Default 0'. Accepted values numbers.
     * }
     * @param boolean $auto_save                              If true, it will save the calculated commission automatically to the given `$order_item_id`. Default 'false`. Accepted values boolean.
     * @param boolean $override_total_amount_by_product_price If true, it will override the `$total_amount` by the product price if the `$total_amount` is empty and `$order_item_id` is empty. Default 'true`. Accepted values boolean.
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function get_commission( $args = [], $auto_save = false, $override_total_amount_by_product_price = true ) {
        $order_item_id    = ! empty( $args['order_item_id'] ) ? $args['order_item_id'] : '';
        $total_amount     = ! empty( $args['total_amount'] ) ? $args['total_amount'] : 0;
        $product_id       = ! empty( $args['product_id'] ) ? $args['product_id'] : 0;
        $vendor_id        = ! empty( $args['vendor_id'] ) ? $args['vendor_id'] : '';
        $category_id      = ! empty( $args['category_id'] ) ? $args['category_id'] : 0;

        if ( $order_item_id ) {
            $order_item = WC_Order_Factory::get_order_item( $order_item_id );

            try {
                $line_item_commission = dokan_get_container()->get( OrderLineItemCommission::class );
                $line_item_commission->set_order( $order_item->get_order() );
                $line_item_commission->set_item( $order_item );

                return $line_item_commission->calculate();
            } catch ( \Exception $e ) {
                dokan_log( $e->getMessage() );
            }
        } else {
            try {
                $product_commission = dokan_get_container()->get( ProductCommission::class );
                $product_commission->set_product_id( $product_id );
                $product_commission->set_category_id( $category_id );
                $product_commission->set_total_amount( $total_amount );
                $product_commission->set_vendor_id( $vendor_id );
                return $product_commission->calculate();
            } catch ( \Exception $e ) {
                dokan_log( $e->getMessage() );
            }
        }
    }
}
