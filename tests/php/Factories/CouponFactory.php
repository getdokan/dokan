<?php
namespace WeDevs\Dokan\Test\Factories;

use WC_Coupon;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Coupon;
use WP_UnitTest_Factory_For_Thing;
use WP_UnitTest_Generator_Sequence;

class CouponFactory extends WP_UnitTest_Factory_For_Thing {
    public function __construct( $factory = null ) {
        parent::__construct( $factory );
        $this->default_generation_definitions = array(
            'code' => new WP_UnitTest_Generator_Sequence( 'coupon_code_%s' ),
            'status' => 'publish',
        );
    }

    public function create_object( $args ) {
        $meta = wp_parse_args( $args[ 'meta' ] ?? [], [
            'discount_type'              => 'fixed_cart',
            'coupon_amount'              => '10',
        ] );

        $coupon = $this->create_coupon( $args['code'], $args['status'], $meta );

        return $coupon->get_id();
    }

    public function update_object( $coupon_id, $fields ) {
        $coupon = new WC_Coupon( $coupon_id );

        if ( isset( $fields['code'] ) ) {
            $coupon->set_code( $fields['code'] );
        }
        if ( isset( $fields['discount_type'] ) ) {
            $coupon->set_discount_type( $fields['discount_type'] );
        }
        if ( isset( $fields['amount'] ) ) {
            $coupon->set_amount( $fields['amount'] );
        }
        $coupon->save();

        return $coupon_id;
    }

     /**
     * Get the coupon by ID.
     *
     * @param string $coupon_code
     * @param array  $meta
     *
     * @return WC_Coupon
     */
    public function get_object_by_id( $coupon_id ) {
        return new WC_Coupon( $coupon_id );
    }

    /******** Start of WC Helper Wrapper  ***********/
    /**
     * Create a dummy coupon.
     *
     * @param string $coupon_code
     * @param array  $meta
     *
     * @return WC_Coupon
     */
    public function create_coupon( string $coupon_code = 'dummycoupon', string $status = 'publish', array $meta = array() ) {
        return WC_Helper_Coupon::create_coupon( $coupon_code, $status, $meta );
    }
    /**
     * Delete a coupon.
     *
     * @param $coupon_id
     *
     * @return bool
     */
    public function delete_coupon( $coupon_id ) {
        return WC_Helper_Coupon::delete_coupon( $coupon_id );
    }

    /**
     * Register a custom coupon type.
     *
     * @param string $coupon_type
     */
    public function register_custom_type( $coupon_type ) {
        return WC_Helper_Coupon::register_custom_type( $coupon_type );
    }

    /**
     * Unregister custom coupon type.
     *
     * @param $coupon_type
     */
    public function unregister_custom_type( $coupon_type ) {
        return WC_Helper_Coupon::unregister_custom_type( $coupon_type );
    }

    /**
     * Register custom discount types.
     *
     * @param array $discount_types
     * @return array
     */
    public function filter_discount_types( array $discount_types ) {
        return WC_Helper_Coupon::filter_discount_types( $discount_types );
    }

    /**
     * Get custom discount type amount. Works like 'percent' type.
     *
     * @param float      $discount
     * @param float      $discounting_amount
     * @param array|null $item
     * @param bool       $single
     * @param WC_Coupon  $coupon
     *
     * @return float
     */
    public function filter_get_discount_amount( $discount, $discounting_amount, $item, $single, $coupon ) {
        return WC_Helper_Coupon::filter_get_discount_amount( $discount, $discounting_amount, $item, $single, $coupon );
    }
    /******** End of WC Helper Wrapper  ***********/
}
