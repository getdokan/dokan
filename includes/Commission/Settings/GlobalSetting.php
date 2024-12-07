<?php

namespace WeDevs\Dokan\Commission\Settings;

use WeDevs\Dokan\Commission\Model\Setting;

class GlobalSetting implements InterfaceSetting {

    /**
     * Product id to get a commission.
     *
     * @since 3.14.0
     *
     * @var int
     */
    protected int $category_id;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param int $category_id
     */
    public function __construct( int $category_id ) {
        $this->category_id = $category_id;
    }

    /**
     * Returns product commission settings data.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get(): Setting {
        $percentage           = dokan_get_option( 'admin_percentage', 'dokan_selling', '' );
        $type                 = dokan_get_option( 'commission_type', 'dokan_selling', '' );
        $flat                 = dokan_get_option( 'additional_fee', 'dokan_selling', '' );
        $category_commissions = dokan_get_option( 'commission_category_based_values', 'dokan_selling', [] );

        $settings = new Setting();
        $settings->set_type( $type )
                ->set_flat( $flat )
                ->set_percentage( $percentage )
                ->set_category_commissions( $category_commissions )
                ->set_category_id( $this->category_id );

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
        $options                                     = get_option( 'dokan_selling', [] );
        $options['commission_type']                  = isset( $setting['type'] ) ? $setting['type'] : '';
        $options['admin_percentage']                 = isset( $setting['percentage'] ) ? $setting['percentage'] : '';
        $options['additional_fee']                   = isset( $setting['flat'] ) ? $setting['flat'] : '';
        $options['commission_category_based_values'] = isset( $setting['category_commissions'] ) ? $setting['category_commissions'] : [];

        update_option( 'dokan_selling', $options );

        return $this->get();
    }
}
