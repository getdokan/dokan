<?php

namespace WeDevs\Dokan\Commission\Settings;

use WC_Order_Item;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Model\Setting;

class OrderItem implements InterfaceSetting {

    protected WC_Order_Item $order_item;

    protected $product_price_to_calculate_commission;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param array $data
     */
    public function __construct( WC_Order_Item $order_item ) {
        $this->order_item = $order_item;
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
        $commission_source     = '';
        $additional_flat       = '';
        $commission_meta       = [];

        if ( ! empty( $this->order_item ) ) {
            $commission_percentage = $this->order_item->get_meta( '_dokan_commission_rate', true ) ?? '';
            $commission_type       = $this->order_item->get_meta( '_dokan_commission_type', true ) ?? '';
            $commission_source     = $this->order_item->get_meta( '_dokan_commission_source', true ) ?? '';
            $additional_flat       = $this->order_item->get_meta( '_dokan_additional_fee', true ) ?? '';
            $commission_meta       = $this->order_item->get_meta( 'dokan_commission_meta', true );

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
                ->set_source( (string) $commission_source )
                ->set_meta_data( $commission_meta );

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
        $setting = apply_filters( 'dokan_order_line_item_commission_settings_before_save', $setting, $this->order_item );
        $settings = new Setting();
        $settings->set_type( $setting['type'] ?? '' )
            ->set_flat( $setting['flat'] ?? '' )
            ->set_percentage( $setting['percentage'] ?? '' )
            ->set_source( $setting['source'] ?? '' )
            ->set_meta_data( $setting['meta_data'] ?? '' );

        $this->order_item->update_meta_data( '_dokan_commission_source', $settings->get_source() );
        $this->order_item->update_meta_data( '_dokan_commission_rate', $settings->get_percentage() );
        $this->order_item->update_meta_data( '_dokan_commission_type', $settings->get_type() );
        $this->order_item->update_meta_data( '_dokan_additional_fee', $settings->get_flat() );
        $this->order_item->update_meta_data( 'dokan_commission_meta', $settings->get_meta_data() );

        $this->order_item->save_meta_data();
        $this->order_item->save();

        do_action( 'dokan_order_line_item_commission_settings_after_save', $settings, $this->order_item );

		return $settings;
    }
}
