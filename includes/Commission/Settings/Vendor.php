<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Model\Setting;

class Vendor implements InterfaceSetting {

    /**
     * Product id to get a commission.
     *
     * @since 3.14.0
     *
     * @var \WeDevs\Dokan\Vendor\Vendor
     */
    protected $vendor;

    public function __construct( $vendor_id ) {
        $this->vendor = dokan()->vendor->get( $vendor_id );
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
        $category_commissions  = [];

        if ( 0 !== $this->vendor->get_id() ) {
            $percentage = $this->vendor->get_meta( 'dokan_admin_percentage', true );
            $type       = $this->vendor->get_meta( 'dokan_admin_percentage_type', true );
            $flat       = $this->vendor->get_meta( 'dokan_admin_additional_fee', true );
            $category_commissions  = $this->vendor->get_meta( 'admin_category_commission', true );

            $category_commissions = ! is_array( $category_commissions ) ? [] : $category_commissions;
        }

        $settings = new Setting();
        $settings->set_type( $type )
                ->set_flat( $flat )
                ->set_percentage( $percentage )
                ->set_category_commissions( $category_commissions );

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
     *     @type array  $category_commissions
     * }
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function save( array $setting ): Setting {
        if ( ! $this->vendor->get_id() ) {
            return $this->get();
        }

        $percentage           = isset( $setting['percentage'] ) ? $setting['percentage'] : '';
        $type                 = isset( $setting['type'] ) ? $setting['type'] : '';
        $flat                 = isset( $setting['flat'] ) ? $setting['flat'] : '';
        $category_commissions = isset( $setting['category_commissions'] ) ? $setting['category_commissions'] : [];

        $this->vendor->update_meta( 'dokan_admin_percentage', $percentage );
        $this->vendor->update_meta( 'dokan_admin_percentage_type', $type );
        $this->vendor->update_meta( 'dokan_admin_additional_fee', $flat );
        $this->vendor->update_meta( 'admin_category_commission', $category_commissions );

        return $this->get();
    }

    public function delete() {
        if ( ! $this->vendor->get_id() ) {
            return $this->get();
        }

        delete_user_meta( $this->vendor->get_id(), 'dokan_admin_percentage' );
        delete_user_meta( $this->vendor->get_id(), 'dokan_admin_percentage_type' );
        delete_user_meta( $this->vendor->get_id(), 'dokan_admin_additional_fee' );
        delete_user_meta( $this->vendor->get_id(), 'admin_category_commission' );
    }
}
