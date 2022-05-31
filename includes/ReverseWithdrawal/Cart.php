<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Cart
 *
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class Cart {
    /**
     * Cart constructor.
     *
     * @since 3.5.1
     */
    public function __construct() {
        // return if reverse withdrawal feature is disabled
        if ( ! SettingsHelper::is_enabled() ) {
            return;
        }

        // prevent other products to add cart while reverse withdrawal payment exists in cart
        add_filter( 'woocommerce_add_to_cart_validation', [ $this, 'prevent_purchasing_multiple_products' ], 10, 2 );

        // remove vendor name from cart item
        add_filter( 'woocommerce_get_item_data', [ $this, 'remove_seller_name_from_cart_item' ], 9, 2 );

        add_action( 'woocommerce_before_calculate_totals', [ $this, 'woocommerce_custom_price_to_cart_item' ], 99, 1 );
    }

    /**
     * Remove seller name on cart and other areas
     *
     * @since 3.5.1
     *
     * @param array $item_data
     * @param array $cart_item
     *
     * @return array
     */
    public function remove_seller_name_from_cart_item( $item_data, $cart_item ) {
        if ( ! isset( $cart_item['dokan_reverse_withdrawal_balance'] ) ) {
            return $item_data;
        }

        // remove seller data for advertisement product
        remove_filter( 'woocommerce_get_item_data', 'dokan_product_seller_info', 10 );

        return $item_data;
    }

    /**
     * Add custom price into cart meta item.
     *
     * @since 3.5.1
     *
     * @param \WC_Cart $cart for whole cart.
     */
    public function woocommerce_custom_price_to_cart_item( $cart ) {
        if ( ! empty( $cart->cart_contents ) ) {
            foreach ( $cart->cart_contents as $key => $value ) {
                if ( isset( $value['dokan_reverse_withdrawal_balance'] ) && $value['data']->get_id() === Helper::get_reverse_withdrawal_base_product() ) {
                    $value['data']->set_price( $value['dokan_reverse_withdrawal_balance'] );
                }
            }
        }
    }

    /**
     * This method will remove other products from cart if reverse withdrawal payment exists in cart.
     *
     * @since 3.5.1
     *
     * @param bool $passed
     * @param int $product_id
     *
     * @return bool
     */
    public static function prevent_purchasing_multiple_products( $passed, $product_id ) {
        if ( ! Helper::has_reverse_withdrawal_payment_in_cart() ) {
            return $passed;
        }

        $message = wp_kses(
            sprintf(
            // translators: 1) Product title
                __( '<strong>Error!</strong> Could not add product <strong>%1$s</strong> to cart. You can not purchase other products along with reverse withdrawal payment.', 'dokan-lite' ),
                get_the_title( $product_id )
            ),
            [
                'strong' => [],
            ]
        );
        wc_add_notice( $message, 'error' );
        return false;
    }
}
