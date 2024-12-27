<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Formula\CategoryBased;
use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Utilities\OrderUtil;

class OrderItem implements InterfaceSetting {


    protected $order_item_id;

    protected $product_price_to_calculate_commission;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param array $data
     */
    public function __construct( array $data ) {
        $this->order_item_id = $data['id'];
        $this->product_price_to_calculate_commission = $data['price'];
    }

    /**
     * Rrturns order item commission settings.
     *
     * @since 3.14.0
     *
     * @throws \Exception
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get(): Setting {
        $commission_percentage = '';
        $commission_type       = '';
        $additional_flat       = '';
        $commission_meta       = [];

        if ( ! empty( $this->order_item_id ) ) {
            $commission_percentage = wc_get_order_item_meta( $this->order_item_id, '_dokan_commission_rate', true ) ?? '';
            $commission_type       = wc_get_order_item_meta( $this->order_item_id, '_dokan_commission_type', true ) ?? '';
            $additional_flat       = wc_get_order_item_meta( $this->order_item_id, '_dokan_additional_fee', true ) ?? '';
            $commission_meta       = wc_get_order_item_meta( $this->order_item_id, 'dokan_commission_meta', true );

            $commission_meta = empty( $commission_meta ) ? [] : $commission_meta;
        }

        /**
         * If `_dokan_item_total` returns `non-falsy` value that means, the request comes from the `order refund request`.
         * So modify `additional_fee` to the correct amount to get refunded. (additional_fee/item_total)*product_price.
         * Where `product_price` means item_total - refunded_total_for_item.
         *
         * To understand clearly, how and when these codes work and how dokan commission works, you can also go through dokan-lite previous codes as provided below.
         *
         * @see https://github.com/getdokan/dokan/blob/28888e6824d96747ed65004fbd6de80d0eee5161/includes/Commission.php#L629
         * @see https://github.com/getdokan/dokan/blob/28888e6824d96747ed65004fbd6de80d0eee5161/includes/Commission.php#L567-L653
         * @see https://github.com/getdokan/dokan/blob/28888e6824d96747ed65004fbd6de80d0eee5161/includes/Commission.php
         */
        $order_id = wc_get_order_id_by_order_item_id( $this->order_item_id );

        if ( $order_id ) {
            $order = dokan()->order->get( $order_id );
            $item_total = floatval( $order->get_meta( '_dokan_item_total' ) );
        }

        $product_price = (float) wc_format_decimal( $this->product_price_to_calculate_commission );
        if ( $order_id && $item_total ) {
            $additional_flat = ( floatval( $additional_flat ) / $item_total ) * $product_price;
        }

        $settings = new Setting();
        $settings->set_type( $commission_type )
                ->set_flat( $additional_flat )
                ->set_percentage( $commission_percentage )
                ->set_meta_data( $commission_meta );

        if ( $commission_type === CategoryBased::SOURCE && isset( $commission_meta['parameters']['category_id'] ) ) {
            $settings->set_category_id( $commission_meta['parameters']['category_id'] );
            $settings->set_category_commissions(
                [
                    'all'   => [],
                    'items' => [
                        $settings->get_category_id() => [
                            'flat'       => $settings->get_flat(),
                            'percentage' => $settings->get_percentage(),
                        ],
                    ],
                ]
            );
        } else {
            $settings->set_category_commissions(
                [
                    'all'   => [
                        'flat'       => $settings->get_flat(),
                        'percentage' => $settings->get_percentage(),
                    ],
                    'items' => [],
                ]
            );
        }

        return $settings;
    }

    /**
     * Saves order item commission settings.
     *
     * @since 3.14.0
     *
     * @param array $setting
     *
     * @throws \Exception
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function save( array $setting ): Setting {
        $percentage           = isset( $setting['percentage'] ) ? $setting['percentage'] : '';
        $type                 = isset( $setting['type'] ) ? $setting['type'] : '';
        $flat                 = isset( $setting['flat'] ) ? $setting['flat'] : '';
        $meta_data            = isset( $setting['meta_data'] ) ? $setting['meta_data'] : [];

        wc_add_order_item_meta( $this->order_item_id, '_dokan_commission_type', $type );
        wc_add_order_item_meta( $this->order_item_id, '_dokan_commission_rate', $percentage );
        wc_add_order_item_meta( $this->order_item_id, '_dokan_additional_fee', $flat );
        wc_add_order_item_meta( $this->order_item_id, 'dokan_commission_meta', $meta_data );

        return $this->get();
    }
}
