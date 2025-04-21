<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Formula\CategoryBased;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Model\Setting;

class OrderItem implements AbstractSettings {
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

            // if dokan_commission_meta is exists the we don't need to map the flat amount because after 3.14.0 this maping is not needed.
            if ( $commission_type === Flat::SOURCE && ! is_array( $commission_meta ) ) {
                $additional_flat = $commission_percentage;
            }

            $commission_meta = empty( $commission_meta ) ? [] : $commission_meta;
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
        if ( ! isset( $setting['percentage'] ) ) {
            $setting['percentage'] = '';
        }

        if ( ! isset( $setting['type'] ) ) {
            $setting['type'] = '';
        }

        if ( ! isset( $setting['flat'] ) ) {
            $setting['flat'] = '';
        }

        if ( ! isset( $setting['meta_data'] ) ) {
            $setting['meta_data'] = [];
        }

        $setting = apply_filters( 'dokan_order_line_item_commission_save_before', $setting, $this->order_item_id );

        wc_update_order_item_meta( $this->order_item_id, '_dokan_commission_type', $setting['type'] );
        wc_update_order_item_meta( $this->order_item_id, '_dokan_commission_rate', $setting['percentage'] );
        wc_update_order_item_meta( $this->order_item_id, '_dokan_additional_fee', $setting['flat'] );
        wc_update_order_item_meta( $this->order_item_id, 'dokan_commission_meta', $setting['meta_data'] );

        return apply_filters( 'dokan_order_line_item_commission_save_after', $this->get(), $this->order_item_id );
    }
}
