<?php

namespace WeDevs\Dokan\Commission\Calculators;

/**
 * Interface class for commission calculator.
 * Extend this class to make a commission calculator.
 *
 * @since DOKAN_SINCE
 */
interface CommissionCalculatorInterface {

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
    public function calculate( $total_amount, $total_quantity = 1 );

    /**
     * Returns admin commission.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_admin_commission(): float;

    /**
     * Returns vendor earning.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_vendor_earning(): float;

    /**
     * Returns applied commission parameters.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_parameters(): array;

    /**
     * Returns applied commission source.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_source(): string;

    /**
     * Returns per item admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_per_item_admin_commission(): float;

    /**
     * Returns the quantity for which the commission will be calculated.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_items_total_quantity(): int;

    /**
     * Returns if the commission is applicable or not.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_applicable(): bool;
}
