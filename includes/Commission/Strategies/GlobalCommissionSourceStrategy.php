<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;
use WeDevs\Dokan\Commission\CommissionCalculatorFactory;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class GlobalCommissionSourceStrategy extends AbstractCommissionSourceStrategy {

    /**
     * Global commission strategy source.
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'global';

    /**
     * Catgory id for category commission.
     *
     * @since DOKAN_SINCE
     *
     * @var mixed
     */
    private $category_id;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param $category_id
     */
    public function __construct( $category_id ) {
        $this->category_id = $category_id;
    }

    /**
     * Returns category id.
     *
     * @since DOKAN_SINCE
     *
     * @return mixed
     */
    public function get_category_id() {
        return $this->category_id;
    }

    /**
     * Returns global strategy source.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns global commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Utils\CommissionSettings
     */
    public function get_settings(): CommissionSettings {
        $percentage = dokan_get_option( 'admin_percentage', 'dokan_selling', '' );
        $type       = dokan_get_option( 'commission_type', 'dokan_selling', '' );
        $flat       = dokan_get_option( 'additional_fee', 'dokan_selling', '' );
        $category_commissions   = dokan_get_option( 'commission_category_based_values', 'dokan_selling', [] );

        $settings = new CommissionSettings();
        $settings->set_type( $type )
                ->set_flat( $flat )
                ->set_percentage( $percentage )
                ->set_category_commissions( $category_commissions )
                ->set_category_id( $this->get_category_id() );

        return $settings;
    }
}
