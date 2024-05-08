<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

/**
 * Interface class for commission calculator.
 * Extend this class to make a commission calculator.
 *
 * @since DOKAN_SINCE
 */
abstract class AbstractFormula {

    /**
     * Commission setting.
     *
     * @since DOKAN_SINCE
     *
     * @var \WeDevs\Dokan\Commission\Model\Setting $settings
     */
    protected Setting $settings;

    abstract public function __construct( Setting $settings );

    /**
     * Sets the setting.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $setting
     *
     * @return
     */
    public function set_settings( Setting $setting ): AbstractFormula {
        $this->settings = $setting;

        return $this;
    }

    /**
     * Returns the commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get_settings(): Setting {
        return $this->settings;
    }

    /**
     * Calculate the commission here and set the commission values.
     *
     * @since DOKAN_SINCE
     *
     * @param $total_amount
     *
     * @param $total_quantity
     *
     * @return void
     */
    abstract public function calculate( $total_amount, $total_quantity = 1 );

    /**
     * Returns admin commission.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    abstract public function get_admin_commission(): float;

    /**
     * Returns vendor earning.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    abstract public function get_vendor_earning(): float;

    /**
     * Returns applied commission parameters.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    abstract public function get_parameters(): array;

    /**
     * Returns applied commission source.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    abstract public function get_source(): string;

    /**
     * Returns per item admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    abstract public function get_per_item_admin_commission(): float;

    /**
     * Returns the quantity for which the commission will be calculated.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    abstract public function get_items_total_quantity(): int;

    /**
     * Returns if the commission is applicable or not.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    abstract public function is_applicable(): bool;
}
