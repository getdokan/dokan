<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Formula\CategoryBased;
use WeDevs\Dokan\Commission\Formula\Combine;
use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\AbstractFormula;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Commission\Settings\DefaultSetting;

/**
 * This is the factory class that determines the commission formula.
 *
 * @since 3.14.0
 */
class FormulaFactory {

    /**
     * Returns the applicable formula class or null.
     *
     * @since 3.14.0
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $settings
     *
     * @return \WeDevs\Dokan\Commission\Formula\AbstractFormula
     */
    public static function get_formula( Setting $settings ): AbstractFormula {
        switch ( $settings->get_type() ) {
            case Flat::SOURCE:
                // In Dokan before 3.14.0 version if the commission type was flat the flat value used to be saved in the percentage key, that is why we are passing the percentage value.
                return new Flat( $settings );
            case Percentage::SOURCE:
                return new Percentage( $settings );
            case Combine::SOURCE: // Assuming 'combine' implies a combination of flat + percentage
                return new Combine( $settings );
            case Fixed::SOURCE:
                return new Fixed( $settings );
            case CategoryBased::SOURCE:
                return new CategoryBased( $settings );
            default:
                $default_setting = new DefaultSetting();
                return new Percentage( $default_setting->get() );
        }
    }
}
