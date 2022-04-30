<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Cart
 *
 * @since DOKAN_SINCE
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class Cart {
    /**
     * Cart constructor.
     *
     * @since DOKAN_SINCE
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

        // remove delivery time module section from checkout page
        add_action( 'woocommerce_review_order_before_payment', [ $this, 'remove_delivery_time_section_from_checkout' ], 9 );

        // remove paypal marketplace checkout validations
        add_filter( 'dokan_paypal_marketplace_escape_after_checkout_validation', [ $this, 'paypal_remove_gateway_validations' ], 10, 2 );
        add_filter( 'dokan_paypal_marketplace_merchant_id', [ $this, 'paypal_get_merchant_id' ], 10, 2 );
        add_filter( 'dokan_paypal_marketplace_purchase_unit_merchant_id', [ $this, 'paypal_purchase_unit_merchant_id' ], 10, 2 );
    }

    /**
     * Remove PayPal Marketplace Checkout Validations
     *
     * @since DOKAN_SINCE
     *
     * @param bool $escape
     * @param array $cart_item
     *
     * @return bool
     */
    public function paypal_remove_gateway_validations( $escape, $cart_item ) {
        if ( true === wc_string_to_bool( $escape ) ) {
            return $escape;
        } elseif ( Helper::has_reverse_withdrawal_payment_in_cart() ) {
            return true;
        }
        return $escape;
    }

    /**
     * Get admin partner id
     *
     * @since DOKAN_SINCE
     *
     * @param string $merchant_id
     * @param int $product_id
     *
     * @return string
     */
    public function paypal_get_merchant_id( $merchant_id, $product_id ) {
        // check if this is a recurring subscription product
        if ( (int) $product_id === Helper::has_reverse_withdrawal_payment_in_cart() ) {
            return \WeDevs\DokanPro\Modules\PayPalMarketplace\Helper::get_partner_id();
        }

        return $merchant_id;
    }

    /**
     * Get admin partner id
     *
     * @since DOKAN_SINCE
     *
     * @param string $merchant_id
     * @param \WC_Abstract_Order $order
     *
     * @return string
     */
    public function paypal_purchase_unit_merchant_id( $merchant_id, $order ) {
        // check if this is a recurring subscription product
        if ( Helper::has_reverse_withdrawal_payment_in_cart( $order ) ) {
            return \WeDevs\DokanPro\Modules\PayPalMarketplace\Helper::get_partner_id();
        }

        return $merchant_id;
    }

    /**
     * This method will remove delivery time module section from checkout page
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function remove_delivery_time_section_from_checkout() {
        if ( dokan_pro()->module->is_active( 'delivery_time' ) && Helper::has_reverse_withdrawal_payment_in_cart() ) {
            remove_action( 'woocommerce_review_order_before_payment', [ dokan_pro()->module->delivery_time->dt_frontend, 'render_delivery_time_template' ], 10 );
        }
    }

    /**
     * Remove seller name on cart and other areas
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
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
