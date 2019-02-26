<?php

defined( 'ABSPATH' ) || exit;

class Dokan_Commission {

    public static $default_rate = 100;

    /**
     * Get earning by product id
     *
     * @param  int $id
     * @param  string $context
     *
     * @return float
     */
    public static function get_earning_by_product( $product_id, $context = 'vendor' ) {
        if ( $product_id instanceof WC_Product ) {
            $product_id = $product_id->get_id();
        }

        $product = wc_get_product( $product_id );

        if ( ! $product || ! $product instanceof WC_Product ) {
            return new WP_Error( __( 'Product not found', 'dokan-lite' ), 404 );
        }

        $product_price = $product->get_price();
        $vendor        = dokan_get_vendor_by_product( $product_id );

        $earning = self::calculate_commission( $product_id, $product_price, $vendor->get_id() );

        return 'admin' === $context ? $product_price - $earning : $earning;
    }

    public static function get_earning_by_order( $id, $context = 'vendor' ) {
        $order = wc_get_order( $id );
        //
    }

    /**
     * Get global rate
     *
     * @return float
     */
    public static function get_global_rate() {
        $rate = dokan_get_option( 'admin_percentage', 'dokan_selling', 0 );

        return self::validate_rate( $rate );
    }

    /**
     * Get vendor wise commission rate
     *
     * @param  int $vendor_id
     *
     * @return float
     */
    public static function get_vendor_wise_rate( $vendor_id ) {
        $rate = get_user_meta( $vendor_id, 'dokan_admin_percentage', true );

        return self::validate_rate( $rate );
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
     * @param int $category_id
     *
     * @return float
     */
    public static function get_category_wise_rate( $product_id, $category_id = 0 ) {
        $terms = get_the_terms( $product_id, 'product_cat' );

        if ( empty( $terms ) ) {
            return null;
        }

        $term_id = $terms[0]->term_id;

        if ( $category_id ) {
            $terms = get_term( $category_id );
            $term_id = $terms->term_id;
        }

        $rate = ! $terms ? null: get_woocommerce_term_meta( $term_id, 'per_category_admin_commission', true );

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
     * @param int $category_id
     *
     * @return string
     */
    public static function get_category_wise_type( $product_id, $category_id = 0 ) {
        $terms   = get_the_terms( $product_id, 'product_cat' );
        $term_id = $terms[0]->term_id;

        if ( $category_id ) {
            $terms   = get_term( $category_id );
            $term_id = $terms->term_id;
        }

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
        return self::prepare_for_calculation( __FUNCTION__, __FUNCTION__, __FUNCTION__ );
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
     * @param  int $category_id
     * @param  float $product_price
     *
     * @return float|null on failure
     */
    public static function get_category_wise_earning( $product_id, $category_id, $product_price ) {
        return self::prepare_for_calculation( __FUNCTION__, __FUNCTION__, __FUNCTION__, $product_id, $category_id, $product_price );
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
    public static function prepare_for_calculation( $func_rate = '', $func_type = '', $func_fee = '', $product_id = '', $cat_id = 0, $product_price = 0 ) {
        $func_rate = str_replace( 'earning', 'rate', $func_rate );
        $func_type = str_replace( 'earning', 'type', $func_type );
        $func_fee  = str_replace( 'earning', 'additional_fee', $func_fee );
        $rate      = self::$func_rate( $product_id );

        if ( is_null( $rate ) ) {
            return null;
        }

        if ( 'flat' === self::$func_type( $product_id, $cat_id ) ) {
            $earning = $product_price - $rate;
        }

        if ( 'percentage' === self::$func_type( $product_id, $cat_id ) ) {
            $earning = ( $product_price * $rate ) / 100;
            $earning = $product_price - $earning;
        }

        if ( 'combine' === self::$func_type( $product_id, $cat_id ) ) {
            $earning        = ( $product_price * $rate ) / 100;
            $earning        = $product_price - $earning;
            $additional_fee = self::$func_fee( $product_id, $cat_id );

            if ( ! self::validate_rate( $additional_fee ) ) {
                return $earning;
            }

            $earning = $earning - $additional_fee;
        }

        return $earning;
    }

    /**
     * Get product wise additional fee
     *
     * @param  int $product_id
     *
     * @return float|null on failure
     */
    public static function get_product_wise_additional_fee( $product_id ) {
        $rate = get_post_meta( $product_id, '_per_product_admin_additional_fee', true );

        return self::validate_rate( $rate );
    }

    /**
     * Get product wise additional fee
     *
     * @param  int $product_id
     *
     * @return float|null on failure
     */
    public static function get_global_additional_fee() {
        $rate = dokan_get_option( 'admin_fee', 'dokan_selling', 0 );

        return self::validate_rate( $rate );
    }

    /**
     * Get vendor wise additional fee
     *
     * @param  int $vendor_id
     *
     * @return float|null on failure
     */
    public static function get_vendor_wise_additional_fee( $vendor_id ) {
        $rate = get_user_meta( $vendor_id, 'dokan_admin_additional_fee', true );

        return self::validate_rate( $rate );
    }

    /**
     * Get product wise additional fee
     *
     * @param  int $product_id
     *
     * @return float|null on failure
     */
    public static function get_category_wise_additional_fee( $product_id, $category_id = 0 ) {
        $terms = get_the_terms( $product_id, 'product_cat' );

        if ( empty( $terms ) ) {
            return null;
        }

        $term_id = $terms[0]->term_id;

        if ( $category_id ) {
            $terms = get_term( $category_id );
            $term_id = $terms->term_id;
        }

        $rate = ! $terms ? null: get_woocommerce_term_meta( $term_id, 'per_category_admin_additional_fee', true );

        return self::validate_rate( $rate );
    }

    /**
     * Calculate commission
     *
     * @param  int $product_id
     * @param  float $product_price
     * @param  int $vendor_id
     * @param  int $category_id
     *
     * @return float
     */
    public static function calculate_commission( $product_id, $product_price, $vendor_id = null, $category_id = null ) {
        $earning               = 0;
        $global_earning        = self::get_global_earning( $product_price );
        $vendor_wise_earning   = self::get_vendor_wise_earning( $vendor_id, $product_price );
        $category_wise_earning = self::get_category_wise_earning( $product_id, $category_id, $product_price );
        $product_wise_earning  = self::get_product_wise_earning( $product_id, $product_price );

        // commission priority [1.product wise, 2. category wise, 3.vendor wise, 4.global]
        $earning = is_null( $global_earning ) ? $earning : $global_earning;
        $earning = is_null( $vendor_wise_earning ) ? $earning : $vendor_wise_earning;
        $earning = is_null( $category_wise_earning ) ? $earning : $category_wise_earning;
        $earning = is_null( $product_wise_earning ) ? $earning : $product_wise_earning;

        return $earning;
    }
}