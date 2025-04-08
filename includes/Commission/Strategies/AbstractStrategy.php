<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Formula\CategoryBased;
use WeDevs\Dokan\Commission\Formula\Combine;
use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Formula\AbstractFormula;
use WeDevs\Dokan\Commission\Model\Setting;

abstract class AbstractStrategy {

    /**
     * Returns commission strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    abstract public function get_source(): string;

    /**
     * Returns commission settings.
     *
     * @since 3.14.0
     *
     * @return Setting
     */
    abstract public function get_settings(): Setting;

    /**
     * Returns commission calculator or null.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Formula\AbstractFormula
     */
    public function create_formula(): AbstractFormula {
        $settings = $this->get_settings();

        switch ( $settings->get_type() ) {
            case Flat::SOURCE:
                // In Dokan before 3.14.0 version if the commission type was flat the flat value used to be saved in the percentage key, that is why we are passing the percentage value.
                $formula = new Flat( $settings );
                break;
            case Combine::SOURCE: // Assuming 'combine' implies a combination of flat + percentage
                $formula = new Combine( $settings );
                break;
            case Fixed::SOURCE:
                $formula = new Fixed( $settings );
                break;
            case CategoryBased::SOURCE:
                $formula = new CategoryBased( $settings );
                break;
            case Percentage::SOURCE:
            default:
                $formula = new Percentage( $settings );
        }

        return apply_filters( 'dokan_commission_calculation_strategy_formula', $formula, $settings, $this->get_source() );
    }
}
