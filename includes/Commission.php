<?php

namespace WeDevs\Dokan;

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
     * Order subtotal holder
     *
     * @since 3.3.6
     *
     * @var integer|float
     */
    public $subtotal = 0;

    /**
     * Order item id to save applied commission type in order meta.
     *
     * @since 3.3.6
     *
     * @var integer
     */
    public $order_item_id_for_meta = 0;

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
    }

    /**
     * Calculate gateway fee
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param $order_id
     *
     * @return void
     */
    public function calculate_gateway_fee( $order_id ) {
        global $wpdb;
        $order           = wc_get_order( $order_id );
        $processing_fee  = $this->get_processing_fee( $order );

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
                    'trn_id' => $tmp_order->get_id(),
                    'trn_type' => 'dokan_orders',
                ],
                [ '%f' ],
                [ '%d', '%s' ]
            );

            $tmp_order->update_meta_data( 'dokan_gateway_fee', $gateway_fee );
            // translators: %s: Geteway fee
            $tmp_order->add_order_note( sprintf( __( 'Payment gateway processing fee %s', 'dokan-lite' ), wc_format_decimal( $gateway_fee, 2 ) ) );
            $tmp_order->save_meta_data();

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
     * @param  array
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
     * @param  int $id
     *
     * @return void
     */
    public function set_order_id( $id ) {
        $this->order_id = $id;
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
     * Set order subtotal amount
     *
     * @since  3.3.6
     *
     * @param  int|float $subtotal
     *
     * @return int|float $subtotal
     */
    public function set_order_subtotal( $subtotal ) {
        $this->subtotal = $subtotal;
    }

    /**
     * Get order subtotal amount
     *
     * @since  3.3.6
     *
     * @return int|float $subtotal
     */
    public function get_order_subtotal() {
        return $this->subtotal;
    }

    /**
     * Set order item id to save applied commission type in order meta.
     *
     * @since  3.3.6
     *
     * @param  int|float $order_id
     *
     * @return int|float $order_id
     */
    public function set_order_item_id_for_meta( $order_id ) {
        $this->order_item_id_for_meta = $order_id;
    }

    /**
     * Get order item id to save applied commission type in order meta.
     *
     * @since  3.3.6
     *
     * @return int|float $order_id
     */
    public function get_order_item_id_for_meta() {
        return $this->order_item_id_for_meta;
    }

    /**
     * Set order quantity
     *
     * @since  2.9.21
     *
     * @param  int $number
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
     * @param  int|WC_Product $product
     * @param  string $context[admin|seller]
     * @param  float $price
     *
     * @return float
     */
    public function get_earning_by_product( $product, $context = 'seller', $price = null ) {
        if ( ! $product instanceof \WC_Product ) {
            $product = wc_get_product( $product );
        }

        $product_price = is_null( $price ) && ! empty( $product ) ? (float) $product->get_price() : (float) $price;
        $vendor        = dokan_get_vendor_by_product( $product );

        $vendor_id = ! empty( $vendor ) ? $vendor->get_id() : 0;
        $product_id = ! empty( $product ) ? $product->get_id() : 0;

        $earning = $this->calculate_commission( $product_id, $product_price, $vendor_id );
        $earning = 'admin' === $context ? $product_price - $earning : $earning;

        return apply_filters( 'dokan_get_earning_by_product', $earning, $product, $context );
    }

    /**
     * Get earning by order
     *
     * @since  2.9.21
     *
     * @param  int|WC_Order $order
     * @param  string $context
     *
     * @return float|null on failure
     */
    public function get_earning_by_order( $order, $context = 'seller' ) {
        if ( ! $order instanceof \WC_Order ) {
            $order = wc_get_order( $order );
        }

        if ( ! $order ) {
            return new \WP_Error( __( 'Order not found', 'dokan-lite' ), 404 );
        }

        if ( $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        // Setting current order subtotal so that we calcalculate in the vendor sale commission type.
        $this->set_order_subtotal( $order->get_subtotal() );

        // If `_dokan_admin_fee` is found means, the commission has been calculated for this order without the `WeDevs\Dokan\Commission` class.
        // So we'll return the previously earned commission to keep backward compatability.
        $saved_admin_fee = get_post_meta( $order->get_id(), '_dokan_admin_fee', true );

        if ( $saved_admin_fee !== '' ) {
            $saved_fee = ( 'seller' === $context ) ? $order->get_total() - $saved_admin_fee : $saved_admin_fee;
            return apply_filters( 'dokan_order_admin_commission', $saved_fee, $order );
        }

        // Set user passed `order_id` so that we can track if any commission_rate has been saved previously.
        // Specially on order table `re-generation`.
        $this->set_order_id( $order->get_id() );
        $earning = $this->get_earning_from_order_table( $order->get_id(), $context );

        if ( ! is_null( $earning ) ) {
            return $earning;
        }

        $earning = 0;

        // Looping through all line item of orders to get and calculate each products earning.
        foreach ( $order->get_items() as $item_id => $item ) {
            if ( ! $item->get_product() ) {
                continue;
            }

            // Saving order id to save applied commission for this item.
            $this->set_order_item_id_for_meta( $item_id );

            // Set line item quantity so that we can use it later in the `\WeDevs\Dokan\Commission::prepare_for_calculation()` method
            $this->set_order_qunatity( $item->get_quantity() );

            $product_id = $item->get_product()->get_id();
            $refund     = $order->get_total_refunded_for_item( $item_id );
            $vendor_id  = (int) get_post_field( 'post_author', $product_id );

            if ( dokan_is_admin_coupon_applied( $order, $vendor_id, $product_id ) ) {
                $earning += dokan_pro()->coupon->get_earning_by_admin_coupon( $order, $item, $context, $item->get_product(), $vendor_id, $refund );
            } else {
                $item_price = apply_filters( 'dokan_earning_by_order_item_price', $item->get_total(), $item, $order );
                $item_price = $refund ? $item_price - $refund : $item_price;
                $earning   += $this->get_earning_by_product( $product_id, $context, $item_price );
            }
        }

        if ( $context === $this->get_shipping_fee_recipient( $order->get_id() ) ) {
            $earning += $order->get_total_shipping() - $order->get_total_shipping_refunded();
        }

        if ( $context === $this->get_tax_fee_recipient( $order->get_id() ) ) {
            $earning += $order->get_total_tax() - $order->get_total_tax_refunded();
        }

        $earning = apply_filters_deprecated( 'dokan_order_admin_commission', [ $earning, $order, $context ], '2.9.21', 'dokan_get_earning_by_order' );

        return apply_filters( 'dokan_get_earning_by_order', $earning );
    }

    /**
     * Get global rate
     *
     * @since  2.9.21
     *
     * @param  int $product_id
     * @param  int|float $product_price
     * @param  int $vendor_id
     * @param  string $commission_type
     * @param  string $func_fee
     *
     * @return float
     */
    public function get_global_rate( $product_id, $product_price = null, $vendor_id = null, $commission_type = null, $func_fee = null ) {
        // If new commissions is satisfied and found then return it.
        if ( dokan_is_new_commission_type( $commission_type ) ) {
            $all_commissions = dokan_get_option( $commission_type, 'dokan_selling', 0 );
            return $this->get_satisfied_commission_from_new_commission_set( $product_id, $commission_type, $product_price, $all_commissions );
        }

        $additional_fee = null;
        $falt_fee       = null;

        // get[product,category,vendor,global]_wise_additional_fee
        if ( is_callable( [ $this, $func_fee ] ) ) {
            $additional_fee = $this->$func_fee( $product_id );
        }

        $falt_fee = $this->validate_rate( dokan_get_option( 'admin_percentage', 'dokan_selling', 0 ) );

        return [
            'type'       => $commission_type,
            'flat'       => 'combine' === $commission_type ? $additional_fee : $falt_fee,
            'percentage' => 'flat' !== $commission_type ? $falt_fee : $additional_fee,
        ];
    }

    /**
     * Get vendor wise commission rate
     *
     * @since  2.9.21
     *
     * @param  int $product_id
     * @param  int|float $product_price
     * @param  int $vendor_id
     * @param  string $commission_type
     * @param  string $func_fee
     *
     * @return float
     */
    public function get_vendor_wise_rate( $product_id, $product_price = null, $vendor_id = null, $commission_type = null, $func_fee = null ) {
        $commissions = get_user_meta( $vendor_id, 'dokan_admin_percentage', true );

        // If new commissions is satisfied and found then return it.
        if ( dokan_is_new_commission_type( $commission_type ) ) {
            return $this->get_satisfied_commission_from_new_commission_set( $product_id, $commission_type, $product_price, $commissions );
        }

        $additional_fee = null;

        // get[product,category,vendor,global]_wise_additional_fee
        if ( is_callable( [ $this, $func_fee ] ) ) {
            $additional_fee = $this->$func_fee( $product_id );
        }

        return [
            'type'       => $commission_type,
            'flat'       => $commissions,
            'percentage' => ( 'percentage' === $commission_type ) ? $commissions : $additional_fee,
        ];
    }

    /**
     * Get product wise commission rate
     *
     * @since  2.9.21
     *
     * @param  int $product_id
     * @param  int|float $product_price
     * @param  int $vendor_id
     * @param  string $commission_type
     * @param  string $func_fee
     *
     * @return float
     */
    public function get_product_wise_rate( $product_id, $product_price = null, $vendor_id = null, $commission_type = null, $func_fee = null ) {
        $additional_fee = null;
        $falt_fee       = null;

        // calling, get_product_wise_additional_fee
        if ( is_callable( [ $this, $func_fee ] ) ) {
            $additional_fee = $this->$func_fee( $product_id );
        }

        // getting saved commission value for specific product.
        $falt_fee = $this->validate_rate( get_post_meta( $this->validate_product_id( $product_id ), '_per_product_admin_commission', true ) );

        return [
            'type'       => $commission_type,
            'flat'       => $falt_fee,
            'percentage' => ( 'percentage' === $commission_type ) ? $falt_fee : $additional_fee,
        ];
    }

    /**
     * Validate product id (if it's a variable product, return it's parent id)
     *
     * @since  2.9.21
     *
     * @param  int $product_id
     *
     * @return int
     */
    public function validate_product_id( $product_id ) {
        $product   = wc_get_product( $product_id );
        $parent_id = $product->get_parent_id();

        return $parent_id ? $parent_id : $product_id;
    }

    /**
     * Get category wise commission rate
     *
     * @since  2.9.21
     *
     * @param  int $product_id
     * @param  int|float $product_price
     * @param  int $vendor_id
     * @param  string $commission_type
     * @param  string $func_fee
     *
     * @return float
     */
    public function get_category_wise_rate( $product_id, $product_price = null, $vendor_id = null, $commission_type = null, $func_fee = null ) {
        $additional_fee = null;
        $falt_fee       = null;

        $terms = get_the_terms( $this->validate_product_id( $product_id ), 'product_cat' );

        if ( empty( $terms ) || count( $terms ) > 1 ) {
            return null;
        }

        $term_id = $terms[0]->term_id;
        $rate    = ! $terms ? null : get_term_meta( $term_id, 'per_category_admin_commission', true );

        $falt_fee = $this->validate_rate( $rate );

        // calling, get_category_wise_additional_fee
        if ( is_callable( [ $this, $func_fee ] ) ) {
            $additional_fee = $this->$func_fee( $product_id );
        }

        return [
            'type'       => $commission_type,
            'flat'       => $falt_fee,
            'percentage' => ( 'percentage' === $commission_type ) ? $falt_fee : $additional_fee,
        ];
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
     * @param  int $vendor_id
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
     * @param  int $product_id
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
     * @param  int $product_id
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
     * @param  float $rate
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
     * @param  float $product_price
     *
     * @return float|null on failure
     */
    public function get_global_earning( $product_id, $product_price, $vendor_id ) {
        return $this->prepare_for_calculation( __FUNCTION__, $product_id, $product_price, $vendor_id );
    }

    /**
     * Get vendor wise earning
     *
     * @since  2.9.21
     *
     * @param  int $vendor_id
     * @param  float $product_price
     * @param  float $vendor_id
     *
     * @return float|null on failure
     */
    public function get_vendor_wise_earning( $product_id, $product_price, $vendor_id ) {
        return $this->prepare_for_calculation( __FUNCTION__, $product_id, $product_price, $vendor_id );
    }

    /**
     * Get category wise earning
     *
     * @since  2.9.21
     *
     * @param  int $product_id
     * @param  float $product_price
     * @param  float $vendor_id
     *
     * @return float|null on failure
     */
    public function get_category_wise_earning( $product_id, $product_price, $vendor_id ) {
        if ( ! dokan()->is_pro_exists() ) {
            return null;
        }

        return $this->prepare_for_calculation( __FUNCTION__, $product_id, $product_price, $vendor_id );
    }

    /**
     * Get product wise earning
     *
     * @since  2.9.21
     *
     * @param  int $product_id
     * @param  int $product_price
     * @param  int $vendor_id
     *
     * @return float|null on failure
     */
    public function get_product_wise_earning( $product_id, $product_price, $vendor_id ) {
        if ( ! dokan()->is_pro_exists() ) {
            return null;
        }

        return $this->prepare_for_calculation( __FUNCTION__, $product_id, $product_price, $vendor_id );
    }

    /**
     * Prepare for calculation
     *
     * @since  2.9.21
     *
     * @param  function $callable
     * @param  int $product_id
     * @param  float $product_price
     * @param  float $vendor_id
     *
     * @return float | null on failure
     */
    public function prepare_for_calculation( $callable, $product_id, $product_price, $vendor_id ) {
        do_action( 'dokan_before_prepare_for_calculation', $callable, $product_id, $product_price, $this );

        // If an order has been purchased previously, calculate the earning with the previously stated commission rate.
        // It's important cause commission rate may get changed by admin during the order table `re-generation`.
        $flat_rate       = $this->get_order_id() ? wc_get_order_item_meta( $this->get_order_item_id_for_meta(), '_dokan_commission_rate', true ): '';
        $commission_type = $this->get_order_id() ? wc_get_order_item_meta( $this->get_order_item_id_for_meta(), '_dokan_commission_type', true ): '';
        $percentage_fee  = $this->get_order_id() ? wc_get_order_item_meta( $this->get_order_item_id_for_meta(), '_dokan_additional_fee', true ) : '';

        // If the commission is not saved in the order item meta means this is a new order and we have to
        // find the commission from the setting of dokan. ( product / category / vendor / global )
        if ( empty( $flat_rate ) || empty( $commission_type ) || empty( $percentage_fee ) ) {

            if ( empty( $product_id ) ) {
                return null;
            }

            $func_rate = str_replace( 'earning', 'rate', $callable );
            $func_type = str_replace( 'earning', 'type', $callable );
            $func_fee  = str_replace( 'earning', 'additional_fee', $callable );

            $commission_rate = null;

            /**
             * We have to pass vendor id when we will have to get vendor specific set commission,
             * otherwise we will send product id for product/category/global commission.
             */
            $get_type_by = 'get_vendor_wise_type' === $func_type ? $vendor_id : $product_id;

            // get[product,category,vendor,global]_wise_type
            if ( is_callable( [ $this, $func_type ] ) ) {
                $commission_type = $this->$func_type( $get_type_by );
            }

            // If commission is not set return null early.
            if ( empty( $commission_type ) ) {
                return null;
            }

            /**
             * If dokan pro doesn't exists but combine commission is found in database due to it was active before
             * Then make the commission type 'flat'. We are making it flat cause when commission type is there in database
             * But in option field, looks like flat commission is selected.
             *
             * @since 3.0.0
             */
            if ( ! dokan()->is_pro_exists() && ! in_array( $commission_type, [ 'percentage', 'flat' ], true ) ) {
                $commission_type = 'flat';
            }

            // get[product,category,vendor,global]_wise_rate
            if ( is_callable( [ $this, $func_rate ] ) ) {
                $commission_rate = $this->$func_rate( $product_id, $product_price, $vendor_id, $commission_type, $func_fee );
            }

            if (
                is_null( $commission_rate )
                || empty( $commission_rate['type'] )
                || ( 'combine' !== $commission_rate['type'] && empty( $commission_rate[ $commission_rate['type'] ] ) )
                || ( 'combine' === $commission_rate['type'] && empty( $commission_rate['flat'] ) && empty( $commission_rate['percentage'] ) )
            ) {
                return null;
            }

            $commission_type = $commission_rate['type'];
            $flat_rate       = $commission_rate['flat'];
            $percentage_fee  = $commission_rate['percentage'];

            // Saving applied commission rates and types for current order item in order item meta.
            wc_add_order_item_meta( $this->get_order_item_id_for_meta(), '_dokan_commission_rate', $flat_rate );
            wc_add_order_item_meta( $this->get_order_item_id_for_meta(), '_dokan_commission_type', $commission_type );
            wc_add_order_item_meta( $this->get_order_item_id_for_meta(), '_dokan_additional_fee', $percentage_fee );

        }

        $earning = null;

        if ( 'flat' === $commission_type ) {
            if ( $this->get_order_qunatity() ) {
                $flat_rate *= apply_filters( 'dokan_commission_multiply_by_order_quantity', $this->get_order_qunatity() );
            }

            // If `_dokan_item_total` returns value non-falsy value, it means the request is comming from the `order refund requst`.
            // As it's `flat` fee, So modify `commission rate` to the correct amount to get refunded. (commission_rate/item_total)*product_price.
            $item_total = get_post_meta( $this->get_order_id(), '_dokan_item_total', true );
            if ( $item_total ) {
                $flat_rate = ( $flat_rate / $item_total ) * $product_price;
            }

            $earning = $product_price - $flat_rate;
        }

        if ( 'percentage' === $commission_type ) {
            $earning = ( $product_price * $percentage_fee ) / 100;
            $earning = $product_price - $earning;

            // vendor will get 100 percent if commission rate > 100
            if ( $percentage_fee > 100 ) {
                $earning = $product_price;
            }
        }

        return apply_filters( 'dokan_prepare_for_calculation', $earning, $flat_rate, $commission_type, $percentage_fee, $product_price, $this->order_id );
    }

    /**
     * Get product wise additional fee
     *
     * @since  2.9.21
     *
     * @param  int $product_id
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
     * @param  int $product_id
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
     * @param  int $vendor_id
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
     * @param  int $product_id
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
     * @param  int $order_id
     * @param  string $context
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
     * @since 3.4.1 introduced the shipping fee recipient hook
     *
     * @param  int $order_id
     *
     * @return string
     */
    public function get_shipping_fee_recipient( $order_id ) {
        $saved_shipping_recipient = get_post_meta( $order_id, 'shipping_fee_recipient', true );

        if ( $saved_shipping_recipient ) {
            $shipping_recipient = $saved_shipping_recipient;
        } else {
            $shipping_recipient = apply_filters( 'dokan_shipping_fee_recipient', dokan_get_option( 'shipping_fee_recipient', 'dokan_general', 'seller' ), $order_id );
            update_post_meta( $order_id, 'shipping_fee_recipient', $shipping_recipient );
        }

        return $shipping_recipient;
    }

    /**
     * Get tax fee recipient
     *
     * @since  2.9.21
     * @since 3.4.1 introduced the tax fee recipient hook
     *
     * @param  int $order_id
     *
     * @return string
     */
    public function get_tax_fee_recipient( $order_id ) {
        $saved_tax_recipient = get_post_meta( $order_id, 'tax_fee_recipient', true );

        if ( $saved_tax_recipient ) {
            $tax_recipient = $saved_tax_recipient;
        } else {
            $tax_recipient = apply_filters( 'dokan_tax_fee_recipient', dokan_get_option( 'tax_fee_recipient', 'dokan_general', 'seller' ), $order_id );
            update_post_meta( $order_id, 'tax_fee_recipient', $tax_recipient );
        }

        return $tax_recipient;
    }

    /**
     * Get processing fee
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param \WC_Order $order
     *
     * @return float
     */
    public function get_processing_fee( $order ) {
        $processing_fee = 0;
        $payment_mthod  = $order->get_payment_method();

        if ( 'paypal' === $payment_mthod ) {
            $processing_fee = $order->get_meta( 'PayPal Transaction Fee' );
        }

        if ( 'ppec_paypal' === $payment_mthod && defined( 'PPEC_FEE_META_NAME_NEW' ) ) {
            $processing_fee = $order->get_meta( PPEC_FEE_META_NAME_NEW );
        }

        return apply_filters( 'dokan_get_processing_fee', $processing_fee, $order );
    }

    /**
     * Get all the orders to be processed
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param \WC_Order $order
     *
     * @return array
     */
    public function get_all_order_to_be_processed( $order ) {
        $has_suborder = $order->get_meta( 'has_sub_order' );
        $all_orders   = [];

        if ( $has_suborder ) {
            $sub_order_ids = get_children(
                [
                    'post_parent' => $order->get_id(),
                    'post_type' => 'shop_order',
                    'fields' => 'ids',
                ]
            );

            foreach ( $sub_order_ids as $sub_order_id ) {
                $sub_order    = wc_get_order( $sub_order_id );
                $all_orders[] = $sub_order;
            }
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
     * @param  int $product_id
     * @param  float $product_price
     * @param  int $vendor_id
     *
     * @return float
     */
    public function calculate_commission( $product_id, $product_price, $vendor_id = null ) {
        $product_wise_earning = $this->get_product_wise_earning( $product_id, $product_price, $vendor_id );

        if ( ! is_null( $product_wise_earning ) ) {
            return $product_wise_earning;
        }

        $category_wise_earning = $this->get_category_wise_earning( $product_id, $product_price, $vendor_id );

        if ( ! is_null( $category_wise_earning ) ) {
            return $category_wise_earning;
        }

        $vendor_wise_earning = $this->get_vendor_wise_earning( $product_id, $product_price, $vendor_id );

        if ( ! is_null( $vendor_wise_earning ) ) {
            return $vendor_wise_earning;
        }

        $global_earning = $this->get_global_earning( $product_id, $product_price, $vendor_id );

        if ( ! is_null( $global_earning ) ) {
            return $global_earning;
        }

        return $product_price;
    }

    /**
     * Returns satisfied commission [flat/percentage/combine] from different commission array set.
     *
     * @since 3.3.6
     *
     * @param string $product_id
     * @param string $commission_type
     * @param int|float $product_price
     * @param string $key
     *
     * @return void
     */
    public function get_satisfied_commission_from_new_commission_set( $product_id, $commission_type, $product_price, $all_commissions ) {
        if ( ! is_array( $all_commissions ) ) {
            return null;
        }

        switch ( $commission_type ) {
            case 'vendor_sale':
                if ( empty( $this->get_order_id() ) || empty( $this->get_order_subtotal() ) ) {
                    return null;
                }
                $total_sale = $this->get_order_subtotal();
                return $this->get_satisfied_commission( $total_sale, 'vendor_sale', $all_commissions );

            case 'product_price':
                return $this->get_satisfied_commission( $product_price, 'product_price', $all_commissions );

            case 'product_quantity':
                $product_quantity = $this->get_order_qunatity();
                return $this->get_satisfied_commission( $product_quantity, 'product_quantity', $all_commissions );

            default:
                return null;
        }
    }

    /**
     * Returns an array of satisfied [flat/percentage/combine] commission, for vendor_sale,
     * product_price, product_quantity commission type.
     *
     * @since  3.3.6
     *
     * @param  int $compare Vendor sale amount or product total quantity or product price.
     * @param  string $commission_type vendor_sale / product_price / product_quantity.
     * @param  array $all_commissions commission set array.
     *
     * @return array|null
     */
    private function get_satisfied_commission( $compare, $commission_type, $all_commissions ) {
        $type       = null;
        $flat       = null;
        $percentage = null;

        foreach ( $all_commissions as $key => $value ) {
            if (
                ( isset( $value[ $commission_type ] )
                && $value['rule'] === 'upto'
                && $compare <= $value[ $commission_type ] )
                ||
                ( isset( $value[ $commission_type ] )
                && $value['rule'] === 'more_than'
                && $compare > $value[ $commission_type ] )

            ) {
                $type       = $value['commission_type'];
                $flat       = $value['flat'];
                $percentage = $value['percentage'];

                break;
            }
        }

        return [
            'type'       => $type,
            'flat'       => $flat,
            'percentage' => $percentage,
        ];
    }
}
