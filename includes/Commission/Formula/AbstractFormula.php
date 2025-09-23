<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

/**
 * Interface class for commission calculator.
 * Extend this class to make a commission calculator.
 *
 * @since 3.14.0
 */
abstract class AbstractFormula {

    /**
     * Commission setting.
     *
     * @since 3.14.0
     *
     * @var \WeDevs\Dokan\Commission\Model\Setting $settings
     */
    protected Setting $settings;

    protected float $percent;

    protected float $fixed = 0;

    protected float $combinedFixed = 0;


    abstract public function __construct( Setting $settings );

    
}
