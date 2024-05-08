<?php

namespace WeDevs\Dokan;

use WC_Order;
use WC_Product;
use WeDevs\Dokan\Commission\Context;
use WeDevs\Dokan\Commission\Strategies\GlobalStrategy;
use WeDevs\Dokan\Commission\Strategies\OrderItem;
use WeDevs\Dokan\Commission\Strategies\Product;
use WeDevs\Dokan\Commission\Strategies\Vendor;
use WeDevs\Dokan\ProductCategory\Helper;
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
     * @deprecated DOKAN_SINCE Use dokan()->fees->calculate_gateway_fee insted.
     *
     * @since 2.9.21
     *
     * @param int $order_id
     *
     * @return void
     */
    public function calculate_gateway_fee( $order_id ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->fees->calculate_gateway_fee()' );
        dokan()->fees->calculate_gateway_fee( $order_id );
    }

    /**
     * Set order id
     *
     * @deprecated DOKAN_SINCE
     *
     * @since  2.9.21
     *
     * @param int $id
     *
     * @return void
     */
    public function set_order_id( $id ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE' );
        $this->order_id = $id;
    }

    /**
     * Set order line item id
     *
     * @deprecated DOKAN_SINCE
     *
     * @since 3.8.0
     *
     * @param int $item_id
     *
     * @return void
     */
    public function set_order_item_id( $item_id ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE' );
        $this->order_item_id = absint( $item_id );
    }

    /**
     * Get order id
     *
     * @deprecated DOKAN_SINCE
     *
     * @since  2.9.21
     *
     * @return int
     */
    public function get_order_id() {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE' );
        return $this->order_id;
    }

    /**
     * Get order line item id
     *
     * @deprecated DOKAN_SINCE
     *
     * @since 3.8.0
     *
     * @return int
     */
    public function get_order_item_id() {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE' );
        return $this->order_item_id;
    }

    /**
     * Set order quantity
     *
     * @deprecated DOKAN_SINCE
     *
     * @since  2.9.21
     *
     * @param int $number
     *
     * @return void
     */
    public function set_order_qunatity( $number ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE' );
        $this->quantity = $number;
    }

    /**
     * Get order quantity
     *
     * @deprecated DOKAN_SINCE
     *
     * @since  2.9.21
     *
     * @return int
     */
    public function get_order_qunatity() {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE' );
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

        $commission = $this->get_commission(
            [
                'product_id'     => $product_id,
                'total_amount'   => $product_price,
                'total_quantity' => 1,
                'vendor_id'      => $vendor_id,
            ]
        );

        $commission_or_earning = 'admin' === $context ? $commission->get_admin_commission() : $commission->get_vendor_earning();
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
            $saved_fee = ( 'seller' === $context ) ? $order->get_total() - $saved_admin_fee : $saved_admin_fee;

            return apply_filters( 'dokan_order_admin_commission', $saved_fee, $order );
        }

        // get earning from order table
        $earning_or_commission = $this->get_earning_from_order_table( $order->get_id(), $context );
        if ( ! is_null( $earning_or_commission ) ) {
            return $earning_or_commission;
        }

        $earning_or_commission   = 0;
        $vendor_id = (int) $order->get_meta( '_dokan_vendor_id' );

        foreach ( $order->get_items() as $item_id => $item ) {
            $product_id = $item->get_variation_id() ? $item->get_variation_id() : $item->get_product_id();
            $refund     = $order->get_total_refunded_for_item( $item_id );

            if ( dokan_is_admin_coupon_applied( $order, $vendor_id, $product_id ) ) {
                $earning_or_commission += dokan_pro()->coupon->get_earning_by_admin_coupon( $order, $item, $context, $item->get_product(), $vendor_id, $refund );
            } else {
                $item_price = apply_filters( 'dokan_earning_by_order_item_price', $item->get_total(), $item, $order );
                $item_price = $refund ? $item_price - $refund : $item_price;

                $item_earning_or_commission = $this->get_commission(
                    [
                        'order_item_id' => $item->get_id(),
                        'product_id' => $product_id,
                        'total_amount' => $item_price,
                        'total_quantity' => $item->get_quantity(),
                        'vendor_id' => $vendor_id,
                    ],
                    true
                );
                $item_earning_or_commission = 'admin' === $context ? $item_earning_or_commission->get_admin_commission() : $item_earning_or_commission->get_vendor_earning();
                $earning_or_commission      += $item_earning_or_commission;
            }
        }

        if ( $context === dokan()->fees->get_shipping_fee_recipient( $order ) ) {
            $earning_or_commission += $order->get_shipping_total() - $order->get_total_shipping_refunded();
        }

        if ( $context === dokan()->fees->get_tax_fee_recipient( $order->get_id() ) ) {
            $earning_or_commission += ( ( $order->get_total_tax() - $order->get_total_tax_refunded() ) - ( $order->get_shipping_tax() - dokan()->fees->get_total_shipping_tax_refunded( $order ) ) );
        }

        if ( $context === dokan()->fees->get_shipping_tax_fee_recipient( $order ) ) {
            $earning_or_commission += ( $order->get_shipping_tax() - dokan()->fees->get_total_shipping_tax_refunded( $order ) );
        }

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
            return null;
        }

        return (float) $rate;
    }

    /**
     * Get vendor wise additional rate
     *
     * @deprecated DOKAN_SINCE Use dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_percentage() insted
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_rate( $vendor_id ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_percentage()' );
        return dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_percentage();
    }

    /**
     * Get vendor wise additional fee
     *
     * @deprecated DOKAN_SINCE Use dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_flat() instead
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_additional_fee( $vendor_id ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_flat()' );
        return dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_flat();
    }

    /**
     * Get vendor wise additional type
     *
     * @deprecated DOKAN_SINCE Use dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_type() instead
     *
     * @since  2.9.21
     *
     * @param int $vendor_id
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_type( $vendor_id ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_type()' );
        return dokan()->vendor->get( $vendor_id )->get_commission_settings()->get_type();
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
     * @deprecated DOKAN_SINCE Use dokan()->fees->get_shipping_fee_recipient() instead
     *
     * @since  2.9.21
     * @since  3.4.1 introduced the shipping fee recipient hook
     *
     * @param WC_Order|int $order
     *
     * @return string
     */
    public function get_shipping_fee_recipient( $order ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->fees->get_shipping_fee_recipient()' );

        return dokan()->fees->get_shipping_fee_recipient( $order );
    }

    /**
     * Get tax fee recipient
     *
     * @deprecated DOKAN_SINCE Use dokan()->fees->get_tax_fee_recipient() instead
     *
     * @since  2.9.21
     * @since  3.4.1 introduced the tax fee recipient hook
     *
     * @param WC_Order|int $order
     *
     * @return string|WP_Error
     */
    public function get_tax_fee_recipient( $order ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->fees->get_tax_fee_recipient()' );

        return dokan()->fees->get_tax_fee_recipient( $order );
    }

    /**
     * Get shipping tax fee recipient.
     *
     * @deprecated DOKAN_SINCE Use dokan()->fees->get_shipping_tax_fee_recipient() instead
     *
     * @since 3.7.19
     *
     * @param WC_Order $order Order.
     *
     * @return string
     */
    public function get_shipping_tax_fee_recipient( $order ): string {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->fees->get_shipping_tax_fee_recipient()' );
        return dokan()->fees->get_shipping_tax_fee_recipient( $order );
    }

    /**
     * Get total shipping tax refunded for the order.
     *
     * @deprecated DOKAN_SINCE Use dokan()->fees->get_total_shipping_tax_refunded() instead
     *
     * @since 3.7.19
     *
     * @param WC_Order $order Order.
     *
     * @return float
     */
    public function get_total_shipping_tax_refunded( WC_Order $order ): float {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->fees->get_total_shipping_tax_refunded()' );

        return dokan()->fees->get_total_shipping_tax_refunded( $order );
    }

    /**
     * Get processing fee
     *
     * @deprecated DOKAN_SINCE Use dokan()->fees->get_processing_fee instead.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param WC_Order $order
     *
     * @return float
     */
    public function get_processing_fee( $order ) {
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'dokan()->fees->get_processing_fee' );

        return dokan()->fees->get_processing_fee( $order );
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
     * I this function the calculation was written for vendor perspective it is deprecated now it is recomanded to use `get_commission` method it works fo admin perspective.
     *
     * @deprecated DOKAN_SINCE Use get_commission() instead.
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
        _deprecated_function( __METHOD__, 'DOKAN_SINCE', 'get_commission' );

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

        $parameters       = $commission_data->get_parameters() ?? [];
        $percentage       = $parameters['percentage'] ?? 0;
        $flat             = $parameters['flat'] ?? 0;

        return apply_filters(
            'dokan_after_commission_calculation',
            $commission_data->get_vendor_earning() ?? 0,
            $percentage, $commission_data->get_type() ?? 'none',
            $flat,
            $product_price,
            $this->get_order_id()
        );
    }

    /**
     * Returns all the commission types that ware in dokan. These types were existed before dokan lite version DOKAN_SINCE
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
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
     * @param boolean $auto_save If true, it will save the calculated commission automatically to the given `$order_item_id`. Default 'false`. Accepted values boolean.
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function get_commission( $args = [], $auto_save = false ) {
        $order_item_id  = ! empty( $args['order_item_id'] ) ? $args['order_item_id'] : '';
        $total_amount   = ! empty( $args['total_amount'] ) ? $args['total_amount'] : 0;
        $total_quantity = ! empty( $args['total_quantity'] ) ? $args['total_quantity'] : 1;
        $product_id     = ! empty( $args['product_id'] ) ? $args['product_id'] : 0;
        $vendor_id      = ! empty( $args['vendor_id'] ) ? $args['vendor_id'] : '';
        $category_id    = ! empty( $args['category_id'] ) ? $args['category_id'] : 0;

        // Category commission will not applicable if 'Product Category Selection' is set as 'Multiple' in Dokan settings.
		if ( ! empty( $product_id ) && empty( $category_id ) ) {
            $product_categories = Helper::get_saved_products_category( $product_id );
            $chosen_categories  = $product_categories['chosen_cat'];
            $category_id        = reset( $chosen_categories );
            $category_id        = $category_id ? $category_id : 0;
        }

        if ( ! empty( $product_id ) && empty( $total_amount ) ) {
            $total_amount = dokan()->product->get( $product_id )->get_price();

            // If product price is empty the setting the price as 0
            $total_amount = empty( $total_amount ) ? 0 : $total_amount;
        }

        $order_item_strategy = new OrderItem( $order_item_id, $total_amount, $total_quantity );

        $strategies = [
            $order_item_strategy,
            new Product( $product_id ),
            new Vendor( $vendor_id, $category_id ),
            new GlobalStrategy( $category_id ),
        ];

        $context = new Context( $strategies );
        $commission_data = $context->calculate_commission( $total_amount, $total_quantity );

        if ( ! empty( $order_item_id ) && $auto_save && $commission_data->get_source() !== $order_item_strategy::SOURCE ) {
            $parameters       = $commission_data->get_parameters() ?? [];
            $percentage       = $parameters['percentage'] ?? 0;
            $flat             = $parameters['flat'] ?? 0;

            $order_item_strategy->save_line_item_commission_to_meta( $commission_data->get_type() ?? 'none', $percentage, $flat, $commission_data->get_data() );
        }

        return $commission_data;
    }
}
