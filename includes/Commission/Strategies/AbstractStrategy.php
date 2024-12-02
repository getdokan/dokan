<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\FormulaFactory;
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

        return FormulaFactory::get_formula( $settings );
    }
}
