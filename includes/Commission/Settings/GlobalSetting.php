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

        // @todo Need to check if the commission rate 
        if ( $type === 'category_based' ) {
            $all_category_commissions = $category_commissions['all'] ?? [];
            $category_commissions     = $category_commissions['items'][ $this->category_id] ?? [];

            if ( ! empty( $category_commissions ) ) {
                $percentage = $category_commissions['percentage'] ?? '';
                $flat       = $category_commissions['flat'] ?? '';
            } else {
                $percentage = $all_category_commissions['percentage'] ?? '';
                $flat       = $all_category_commissions['flat'] ?? '';
            }
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
     *     @type array  $category_commissions
     * }
     *
     * @return void
     */
    public function save( array $setting ): void {
        $setting = apply_filters( 'dokan_global_commission_settings_before_save', $setting );

        $options                                     = get_option( 'dokan_selling', [] );
        $options['commission_type']                  = isset( $setting['type'] ) ? $setting['type'] : '';
        $options['admin_percentage']                 = isset( $setting['percentage'] ) ? $setting['percentage'] : '';
        $options['additional_fee']                   = isset( $setting['flat'] ) ? $setting['flat'] : '';
        $options['commission_category_based_values'] = isset( $setting['category_commissions'] ) ? $setting['category_commissions'] : [];

        update_option( 'dokan_selling', $options );

        do_action( 'dokan_global_commission_settings_after_save', $setting );
    }
}
