<?php

defined( 'ABSPATH' ) || exit;

/**
 * Dokan Commission Class
 */
class Dokan_Commission {

    /**
     * Get earning by product
     *
     * @param  int|WC_Product $product
     * @param  string $context[admin|seller]
     *
     * @return float
     */
    public static function get_earning_by_product( $product, $context = 'seller' ) {
        if ( ! $product instanceof WC_Product ) {
            $product = wc_get_product( $product );
        }

        if ( ! $product ) {
            return new WP_Error( __( 'Product not found', 'dokan-lite' ), 404 );
        }

        $product_price = $product->get_price();
        $vendor        = dokan_get_vendor_by_product( $product );

        $earning = self::calculate_commission( $product->get_id(), $product_price, $vendor->get_id() );
        $earning = 'admin' === $context ? $product_price - $earning : $earning;

        return apply_filters( 'dokan_get_earning_by_product', $earning, $product, $context );
    }

    /**
     * Get earning by order
     *
     * @param  int|WC_Order $order
     * @param  string $context
     *
     * @return float|null on failure
     */
    public static function get_earning_by_order( $order, $context = 'seller' ) {
        if ( ! $order instanceof WC_Order ) {
            $order = wc_get_order( $order );
        }

        if ( ! $order ) {
           return new WP_Error( __( 'Order not found', 'dokan-lite' ), 404 );
        }

        if ( $order->get_meta( 'has_sub_order' ) ) {
            return;
        }

        if ( 'seller' === $context ) {
            $saved_vendor_earning = $order->get_meta( '_dokan_vendor_earning', true );
        }

        // if saved vendor_earning is found, return it
        if ( isset( $saved_vendor_earning ) && '' !== $saved_vendor_earning ) {
            return apply_filters_deprecated( 'dokan_order_admin_commission', array( (float) $saved_vendor_earning, $order, $context ), '2.9.10', 'dokan_get_earning_by_order' );
        }

        $saved_admin_earning = $order->get_meta( '_dokan_admin_fee', true );

        // if saved admin earning is found, retrun it
        if ( '' !== $saved_admin_earning ) {
            return apply_filters_deprecated( 'dokan_order_admin_commission', array( (float) $saved_admin_earning, $order, $context ), '2.9.10', 'dokan_get_earning_by_order' );
        }

        $line_items = $order->get_items( 'line_item' );

        $earning            = 0;
        $shipping_recipient = dokan_get_option( 'shipping_fee_recipient', 'dokan_general', 'seller' );
        $tax_recipient      = dokan_get_option( 'tax_fee_recipient', 'dokan_general', 'seller' );

        foreach ( $line_items as $item ) {
            $product_id = $item->get_product_id();
            $earning    += self::get_earning_by_product( $product_id, $context );
        }

        if ( $context === $shipping_recipient ) {
            $earning += $order->get_total_shipping();
        }

        if ( $context === $tax_recipient ) {
            $earning += $order->get_total_tax();
        }

        return apply_filters_deprecated( 'dokan_order_admin_commission', array( $earning, $order, $context ), '2.9.10', 'dokan_get_earning_by_order' );
    }

    /**
     * Get global rate
     *
     * @return float
     */
    public static function get_global_rate() {
        return self::validate_rate( dokan_get_option( 'admin_percentage', 'dokan_selling', 0 ) );
    }

    /**
     * Get vendor wise commission rate
     *
     * @param  int $vendor_id
     *
     * @return float
     */
    public static function get_vendor_wise_rate( $vendor_id ) {
        return self::validate_rate( get_user_meta( $vendor_id, 'dokan_admin_percentage', true ) );
    }

    /**
     * Get product wise commission rate
     *
     * @param int $product_id
     *
     * @return float
     */
    public static function get_product_wise_rate( $product_id ) {
        $rate = get_post_meta( $product_id, '_per_product_admin_commission', true );

        return self::validate_rate( $rate );
    }

    /**
     * Get category wise commission rate
     *
     * @param int $product_id
     *
     * @return float
     */
    public static function get_category_wise_rate( $product_id ) {
        $terms = get_the_terms( $product_id, 'product_cat' );

        if ( empty( $terms ) ) {
            return null;
        }

        $term_id = $terms[0]->term_id;
        $rate    = ! $terms ? null: get_woocommerce_term_meta( $term_id, 'per_category_admin_commission', true );

        return self::validate_rate( $rate );
    }

    /**
     * Get global commission type
     *
     * @return string
     */
    public static function get_global_type() {
        return dokan_get_option( 'commission_type', 'dokan_selling', 'percentage' );
    }

    /**
     * Get vendor wise commission type
     *
     * @param int $vendor_id
     *
     * @return string
     */
    public static function get_vendor_wise_type( $vendor_id ) {
        return get_user_meta( $vendor_id, 'dokan_admin_percentage_type', true );
    }

    /**
     * Get category wise commission type
     *
     * @param int $product_id
     *
     * @return string
     */
    public static function get_category_wise_type( $product_id ) {
        $terms   = get_the_terms( $product_id, 'product_cat' );
        $term_id = $terms[0]->term_id;

        return ! $terms ? null : get_woocommerce_term_meta( $term_id, 'per_category_admin_commission_type', true );
    }

    /**
     * Get product wise commission type
     *
     * @param int $product_id
     *
     * @return string
     */
    public static function get_product_wise_type( $product_id ) {
        return get_post_meta( $product_id, '_per_product_admin_commission_type', true );
    }

    /**
     * Validate commission rate
     *
     * @param  float $rate
     *
     * @return float
     */
    public static function validate_rate( $rate ) {
        if ( '' === $rate || ! is_numeric( $rate ) || $rate < 0 ) {
            return null;
        }

        return (float) $rate;
    }

    /**
     * Get global earning
     *
     * @param  float $product_price
     *
     * @return float|null on failure
     */
    public static function get_global_earning( $product_price ) {
        return self::prepare_for_calculation( __FUNCTION__, __FUNCTION__, __FUNCTION__, null, null, $product_price );
    }

    /**
     * Get vendor wise earning
     *
     * @param  int $vendor_id
     * @param  float $product_price
     *
     * @return float|null on failure
     */
    public static function get_vendor_wise_earning( $vendor_id, $product_price ) {
        return self::prepare_for_calculation( __FUNCTION__, __FUNCTION__, __FUNCTION__, $vendor_id, null, $product_price );
    }

    /**
     * Get category wise earning
     *
     * @param  int $product_id
     * @param  float $product_price
     *
     * @return float|null on failure
     */
    public static function get_category_wise_earning( $product_id, $product_price ) {
        return self::prepare_for_calculation( __FUNCTION__, __FUNCTION__, __FUNCTION__, $product_id, $product_price );
    }

    /**
     * Get product wise earning
     *
     * @param  int $product_id
     * @param  int $product_price
     *
     * @return float
     */
    public static function get_product_wise_earning( $product_id, $product_price ) {
        return self::prepare_for_calculation( __FUNCTION__, __FUNCTION__, __FUNCTION__, $product_id, null, $product_price );
    }

    /**
     * Prepare for calculation
     *
     * @param  string $func_rate
     * @param  string $func_type
     * @param  string $func_fee
     * @param  int $product_id
     * @param  float Product_price
     *
     * @return float
     */
    public static function prepare_for_calculation( $func_rate = '', $func_type = '', $func_fee = '', $product_id = 0, $product_price = 0 ) {
        $func_rate = str_replace( 'earning', 'rate', $func_rate );
        $func_type = str_replace( 'earning', 'type', $func_type );
        $func_fee  = str_replace( 'earning', 'additional_fee', $func_fee );

        // get[product,category,vendor,global]_wise_rate
        $commission_rate = self::$func_rate( $product_id );

        if ( is_null( $commission_rate ) ) {
            return null;
        }

        $earning = null;

        // get[product,category,vendor,global]_wise_type
        if ( 'flat' === self::$func_type( $product_id ) ) {
            $earning = $product_price - $commission_rate;
        }

        // get[product,category,vendor,global]_wise_type
        if ( 'percentage' === self::$func_type( $product_id ) ) {
            $earning = ( $product_price * $commission_rate ) / 100;
            $earning = $product_price - $earning;

            // vendor will get 100 percent if commission rate > 100
            if ( $commission_rate > 100 ) {
                $earning = (float) $product_price;
            }
        }

        return apply_filters( 'dokan_prepare_for_calculation', $earning, __CLASS__, $func_rate, $func_type, $func_fee, $commission_rate, $product_id, $product_price );
    }

    /**
     * Get product wise additional fee
     *
     * @param  int $product_id
     *
     * @return float|null on failure
     */
    public static function get_product_wise_additional_fee( $product_id ) {
        return self::validate_rate( get_post_meta( $product_id, '_per_product_admin_additional_fee', true ) );
    }

    /**
     * Get global wise additional fee
     *
     * @param  int $product_id
     *
     * @return float|null on failure
     */
    public static function get_global_additional_fee() {
        return self::validate_rate( dokan_get_option( 'additional_fee', 'dokan_selling', 0 ) );
    }

    /**
     * Get vendor wise additional fee
     *
     * @param  int $vendor_id
     *
     * @return float|null on failure
     */
    public static function get_vendor_wise_additional_fee( $vendor_id ) {
        return self::validate_rate( get_user_meta( $vendor_id, 'dokan_admin_additional_fee', true ) );
    }

    /**
     * Get category wise additional fee
     *
     * @param  int $product_id
     *
     * @return float|null on failure
     */
    public static function get_category_wise_additional_fee( $product_id ) {
        $terms = get_the_terms( $product_id, 'product_cat' );

        if ( empty( $terms ) ) {
            return null;
        }

        $term_id = $terms[0]->term_id;
        $rate    = ! $terms ? null: get_woocommerce_term_meta( $term_id, 'per_category_admin_additional_fee', true );

        return self::validate_rate( $rate );
    }

    /**
     * Calculate commission (commission priority [1.product, 2.category, 3.vendor, 4.global] wise)
     *
     * @param  int $product_id
     * @param  float $product_price
     * @param  int $vendor_id
     *
     * @return float
     */
    public static function calculate_commission( $product_id, $product_price, $vendor_id = null ) {
        $product_wise_earning = self::get_product_wise_earning( $product_id, $product_price );

        if ( ! is_null( $product_wise_earning ) ) {
            return $product_wise_earning;
        }

        $category_wise_earning = self::get_category_wise_earning( $product_id, $product_price );

        if ( ! is_null( $category_wise_earning ) ) {
            return $category_wise_earning;
        }

        $vendor_wise_earning = self::get_vendor_wise_earning( $vendor_id, $product_price );

        if ( ! is_null( $vendor_wise_earning ) ) {
            return $vendor_wise_earning;
        }

        $global_earning = self::get_global_earning( $product_price );

        if ( ! is_null( $global_earning ) ) {
            return $global_earning;
        }

        return 0;
    }
}