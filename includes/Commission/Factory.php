<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Formula\CategoryBased;
use WeDevs\Dokan\Commission\Formula\Combine;
use WeDevs\Dokan\Commission\Formula\Fixed;
use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\AbstractFormula;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Model\Setting;

class Factory {

    /**
     * Returns the applicable formula class or null.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $settings
     *
     * @return \WeDevs\Dokan\Commission\Formula\AbstractFormula|null
     */
    public static function getFormula( Setting $settings ): ?AbstractFormula {
        switch ( $settings->get_type() ) {
            case Flat::SOURCE:
                // In Dokan before DOKAN_SINCE version if the commission type was flat the flat value used to be saved in the percentage key, that is why we are passing the percentage value.
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
                return null;
        }
    }
}
