<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class FlatCommissionCalculator implements CommissionCalculatorInterface {

    /**
     * Commission type source.
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'flat';

    /**
     * Amount of flat commission.
     *
     * @var int|float $flat_commission
     *
     * @since DOKAN_SINCE
     */
    private $flat_commission = 0;

    /**
     * Commission setting.
     *
     * @since DOKAN_SINCE
     *
     * @var \WeDevs\Dokan\Commission\Utils\CommissionSettings $settings
     */
    private CommissionSettings $settings;

    /**
     * Per item admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $per_item_admin_commission
     */
    private $per_item_admin_commission = 0;

    /**
     * Admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $admin_commission
     */
    private $admin_commission = 0;

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
     * Calculating the flat commission.
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

        $this->per_item_admin_commission = dokan()->commission->validate_rate( $this->settings->get_flat() ) ?? 0;
        if ( $this->per_item_admin_commission > $total_amount ) {
            $this->per_item_admin_commission = $total_amount;
        }

        $this->flat_commission = $this->per_item_admin_commission;
        if ( (int) $total_quantity > 1 ) {
            $this->flat_commission = $this->per_item_admin_commission * apply_filters( 'dokan_commission_multiply_by_order_quantity', $total_quantity );
        }

        $this->admin_commission = $this->flat_commission;

        if ( $this->admin_commission > $total_amount ) {
            $this->admin_commission = $total_amount;
        }

        $this->vendor_earning = $total_amount - $this->admin_commission;
        $this->items_total_quantity = $total_quantity;
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
            'flat'      => $this->settings->get_flat(),
            'meta_data' => $this->settings->get_meta_data(),
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
     * Returns if a flat commission is applicable or not.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_applicable(): bool {
        return is_numeric( $this->settings->get_flat() );
    }

    /**
     * Returns admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_admin_commission(): float {
        return $this->admin_commission;
    }

    /**
     * Returns vendor earning amount.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_vendor_earning(): float {
        return $this->vendor_earning;
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
