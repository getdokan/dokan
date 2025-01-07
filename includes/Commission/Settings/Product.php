<?php

namespace WeDevs\Dokan\Commission\Settings;

use WC_Product;
use WeDevs\Dokan\Commission\Model\Setting;

class Product implements InterfaceSetting {

    /**
     * Product id to get a commission.
     *
     * @since 3.14.0
     *
     * @var WC_Product
     */
    protected $product;

    public function __construct( $product_id ) {
        $this->product = dokan()->product->get( $product_id );

        if ( $this->product && $this->product->is_type( 'variation' ) ) {
            $this->product = dokan()->product->get( $this->product->get_parent_id() );
        }
    }


    /**
     * Returns product commission settings data.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get(): Setting {
        $percentage = '';
        $type       = '';
        $flat       = '';

        if ( is_a( $this->product, WC_Product::class ) && $this->product->get_id() ) {
            $percentage = $this->product->get_meta( '_per_product_admin_commission', true );
            $type       = $this->product->get_meta( '_per_product_admin_commission_type', true );
            $flat       = $this->product->get_meta( '_per_product_admin_additional_fee', true );
        }

        $settings = new Setting();
        $settings->set_type( $type )
                ->set_flat( $flat )
                ->set_percentage( $percentage );

        return $settings;
    }

    /**
     * Saves and returns product commission settings data.
     *
     * @since 3.14.0
     *
     * @param array $setting {
     *
     *     @type string $percentage
     *     @type string $type
     *     @type string $flat
     * }
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function save( array $setting ): Setting {
        $commission_percentage = isset( $setting['percentage'] ) ? $setting['percentage'] : '';
        $commission_type       = isset( $setting['type'] ) ? $setting['type'] : '';
        $additional_flat       = isset( $setting['flat'] ) ? $setting['flat'] : '';

        if ( is_a( $this->product, WC_Product::class ) && $this->product->get_id() ) {
            $this->product->update_meta_data( '_per_product_admin_commission', $commission_percentage );
            $this->product->update_meta_data( '_per_product_admin_commission_type', $commission_type );
            $this->product->update_meta_data( '_per_product_admin_additional_fee', $additional_flat );

            $this->product->save_meta_data();
            $this->product->save();
        }

        $commission = new Setting();
        $commission->set_type( $commission_type )
                ->set_flat( $additional_flat )
                ->set_percentage( $commission_percentage );

        return $commission;
    }
}
