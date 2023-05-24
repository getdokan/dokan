<?php

namespace WeDevs\Dokan\Shipping;

use WC_Order;
use WC_Order_Item_Shipping;

/**
 * Shipping hooks class
 *
 * @since   3.7.19
 *
 * @package WeDevs\Dokan\Shipping
 */
class Hooks {

    /**
     * Hooks constructor.
     *
     * @since 3.7.19
     */
    public function __construct() {
        if ( ! dokan()->is_pro_exists() ) {
            // todo: permanently move below hooks from dokan pro after a couple of release, we are moving shipping split feature to free version.
            add_filter( 'woocommerce_cart_shipping_packages', [ $this, 'split_shipping_packages' ] );
            add_action( 'woocommerce_checkout_create_order_shipping_item', [ $this, 'add_shipping_pack_meta' ], 10, 4 );
            add_filter( 'woocommerce_shipping_package_name', [ $this, 'change_shipping_pack_name' ], 10, 3 );
        }
    }

    /**
     * Split shipping seller wise
     *
     * @since 3.7.19 Moved from pro.
     *
     * @param array $packages
     *
     * @return array
     */
    public function split_shipping_packages( $packages ) {
        $cart_content = WC()->cart->get_cart();
        $seller_pack  = [];
        $packages     = [];

        foreach ( $cart_content as $key => $item ) {
            $post_author = get_post_field( 'post_author', $item['data']->get_id() );

            $seller_pack[ $post_author ][ $key ] = $item;
        }

        foreach ( $seller_pack as $seller_id => $pack ) {
            $packages[] = [
                'contents'        => $pack,
                'contents_cost'   => array_sum( wp_list_pluck( $pack, 'line_total' ) ),
                'applied_coupons' => WC()->cart->get_applied_coupons(),
                'user'            => [
                    'ID' => get_current_user_id(),
                ],
                'seller_id'       => $seller_id,
                'destination'     => [
                    'country'   => WC()->customer->get_shipping_country(),
                    'state'     => WC()->customer->get_shipping_state(),
                    'postcode'  => WC()->customer->get_shipping_postcode(),
                    'city'      => WC()->customer->get_shipping_city(),
                    'address'   => WC()->customer->get_shipping_address(),
                    'address_2' => WC()->customer->get_shipping_address_2(),
                ],
            ];
        }

        return apply_filters( 'dokan_cart_shipping_packages', $packages );
    }

    /**
     * Added shipping meta after order
     *
     * @since 3.7.19 Moved from pro.
     *
     * @param WC_Order_Item_Shipping $item        Shipping Line Item.
     * @param string                 $package_key Package key.
     * @param array                  $package     Package.
     * @param WC_Order               $order       Order.
     *
     * @return void
     */
    public function add_shipping_pack_meta( $item, $package_key, $package, $order ) {
        $item->add_meta_data( 'seller_id', $package['seller_id'], true );
    }

    /**
     * Set package wise seller name
     *
     * @since 3.7.19 Moved from pro.
     *
     * @param string  $title   Existing shipping pack name.
     * @param integer $i       Pack ID.
     * @param array   $package Shipping Package.
     *
     * @return string
     */
    public function change_shipping_pack_name( $title, $i, $package ) {
        $user_id = $package['seller_id'];

        if ( empty( $user_id ) ) {
            return $title;
        }

        if ( is_array( $user_id ) ) {
            $user_id = reset( $user_id );
        }

        $vendor         = dokan()->vendor->get( $user_id );
        $shipping_label = sprintf( '%s %s', __( 'Shipping: ', 'dokan-lite' ), $vendor->get_shop_name() );

        return apply_filters( 'dokan_shipping_package_name', $shipping_label, $i, $package, $vendor );
    }
}
