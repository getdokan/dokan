<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class FixedCommissionCalculator implements CommissionCalculatorInterface {

    /**
     * Commission type source.
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'fixed';

    /**
     * Admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $admin_commission
     */
    private $admin_commission = 0;

    /**
     * Per item admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $per_item_admin_commission
     */
    private $per_item_admin_commission = 0;

    /**
     * Total vendor earning amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $vendor_earning
     */
    private $vendor_earning = 0;

    /**
     * Total items quantity, on it the commission will be calculated.
     *
     * @since DOKAN_SINCE
     *
     * @var int $items_total_quantity
     */
    private $items_total_quantity = 1;

    /**
     * Commission setting.
     *
     * @since DOKAN_SINCE
     *
     * @var \WeDevs\Dokan\Commission\Utils\CommissionSettings $settings
     */
    private CommissionSettings $settings;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Utils\CommissionSettings $settings
     */
    public function __construct( CommissionSettings $settings ) {
        $this->settings = $settings;
    }

    /**
     * Calculating the fixed commission.
     *
     * @since DOKAN_SINCE
     *
     * @param int|float $total_amount
     * @param int       $total_quantity
     *
     * @return void
     */
    public function calculate( $total_amount, $total_quantity = 1 ) {
        $total_quantity = max( $total_quantity, 1 );

        $flat_calculator = new FlatCommissionCalculator( $this->settings );
        $percentage_calculator = new PercentageCommissionCalculator( $this->settings );

        if ( $flat_calculator->is_applicable() ) {
            $flat_calculator->calculate( $total_amount, $total_quantity );
            $this->per_item_admin_commission += $flat_calculator->get_per_item_admin_commission();
            $this->admin_commission          += $flat_calculator->get_admin_commission();
        }

        if ( $percentage_calculator->is_applicable() ) {
            $percentage_calculator->calculate( $total_amount, $total_quantity );
            $this->per_item_admin_commission += $percentage_calculator->get_per_item_admin_commission();
            $this->admin_commission          += $percentage_calculator->get_admin_commission();
        }

        if ( $this->get_per_item_admin_commission() > $total_amount ) {
            $this->per_item_admin_commission = $total_amount;
        }

        if ( $this->get_admin_commission() > $total_amount ) {
            $this->admin_commission = $total_amount;
        }

        $this->vendor_earning            = $total_amount - $this->get_admin_commission();
        $this->items_total_quantity      = $total_quantity;
    }

    /**
     * Get commission date parameters.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_parameters(): array {
        return [
            'flat'       => $this->settings->get_flat(),
            'percentage' => $this->settings->get_percentage(),
            'meta_data'  => $this->settings->get_meta_data(),
        ];
    }

    /**
     * Returns commission source.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns if a fixed commission is applicable or not.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_applicable(): bool {
        return $this->valid_commission_type() && $this->valid_commission();
    }

    /**
     * Returns true if commission type is valid.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    private function valid_commission_type(): bool {
        $legacy_types = dokan()->commission->get_legacy_commission_types();

        $all_types = array_keys( $legacy_types );

        return in_array( $this->settings->get_type(), $all_types, true ) || $this->settings->get_type() === self::SOURCE;
    }

    /**
     * Returns if saved commission data is valid to be applied.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    private function valid_commission(): bool {
        return is_numeric( $this->settings->get_flat() ) || is_numeric( $this->settings->get_percentage() );
    }

    /**
     * Returns admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->admin_commission );
    }

    /**
     * Returns vendor earning amount.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_vendor_earning(): float {
        return dokan()->commission->validate_rate( $this->vendor_earning );
    }

    /**
     * Returns per item admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_per_item_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->per_item_admin_commission );
    }

    /**
     * Returns the quantity on which the commission has been calculated.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_items_total_quantity(): int {
        return $this->items_total_quantity;
    }
}
