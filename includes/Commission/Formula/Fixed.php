<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

class Fixed extends AbstractFormula {

    /**
     * Commission type source.
     *
     * @since 3.14.0
     */
    const SOURCE = 'fixed';

    /**
     * Admin commission amount.
     *
     * @since 3.14.0
     *
     * @var int|float $admin_commission
     */
    protected $admin_commission = 0;

    /**
     * Per item admin commission amount.
     *
     * @since 3.14.0
     *
     * @var int|float $per_item_admin_commission
     */
    protected $per_item_admin_commission = 0;

    /**
     * Total vendor earning amount.
     *
     * @since 3.14.0
     *
     * @var int|float $vendor_earning
     */
    protected $vendor_earning = 0;

    /**
     * Total items quantity, on it the commission will be calculated.
     *
     * @since 3.14.0
     *
     * @var int $items_total_quantity
     */
    protected $items_total_quantity = 1;

    /**
     * @since 3.14.0
     *
     * @var \WeDevs\Dokan\Commission\Formula\Flat
     */
    protected Flat $flat_calculator;

    /**
     * @since 3.14.0
     *
     * @var \WeDevs\Dokan\Commission\Formula\Percentage
     */
    protected Percentage $percentage_calculator;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $settings
     */
    public function __construct( Setting $settings ) {
        $this->set_settings( $settings );

        $this->flat_calculator       = new Flat( $this->get_settings() );
        $this->percentage_calculator = new Percentage( $this->get_settings() );
    }

    /**
     * Calculating the fixed commission.
     *
     * @since 3.14.0
     *
     * @return void
     */
    public function calculate() {
        $this->set_quantity( max( $this->get_quantity(), 1 ) );

        if ( $this->flat_calculator->is_applicable() ) {
            $this->flat_calculator->set_amount( $this->get_amount() );
            $this->flat_calculator->set_quantity( $this->get_quantity() );
            $this->flat_calculator->calculate();

            $this->per_item_admin_commission += $this->flat_calculator->get_per_item_admin_commission();
            $this->admin_commission          += $this->flat_calculator->get_admin_commission();
        }

        if ( $this->percentage_calculator->is_applicable() ) {
            $this->percentage_calculator->set_amount( $this->get_amount() );
            $this->percentage_calculator->set_quantity( $this->get_quantity() );
            $this->percentage_calculator->calculate();

            $this->per_item_admin_commission += $this->percentage_calculator->get_per_item_admin_commission();
            $this->admin_commission          += $this->percentage_calculator->get_admin_commission();
        }

        if ( $this->get_per_item_admin_commission() > $this->get_amount() ) {
            $this->per_item_admin_commission = $this->get_amount();
        }

        if ( $this->get_admin_commission() > $this->get_amount() ) {
            $this->admin_commission = $this->get_amount();
        }

        $this->vendor_earning            = $this->get_amount() - $this->get_admin_commission();
        $this->items_total_quantity      = $this->get_quantity();
    }

    /**
     * Get commission date parameters.
     *
     * @since 3.14.0
     *
     * @return array
     */
    public function get_parameters(): array {
        return [
            'flat'       => $this->get_settings()->get_flat(),
            'percentage' => $this->get_settings()->get_percentage(),
            'meta_data'  => $this->get_settings()->get_meta_data(),
        ];
    }

    /**
     * Returns commission source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns if a fixed commission is applicable or not.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    public function is_applicable(): bool {
        return $this->is_valid_commission_type() && $this->is_valid_commission_data();
    }

    /**
     * Returns true if commission type is valid.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    protected function is_valid_commission_type(): bool {
        $legacy_types = dokan()->commission->get_legacy_commission_types();

        $all_types = array_keys( $legacy_types );

        return in_array( $this->get_settings()->get_type(), $all_types, true ) || $this->get_settings()->get_type() === self::SOURCE;
    }

    /**
     * Returns if saved commission data is valid to be applied.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    protected function is_valid_commission_data(): bool {
        return is_numeric( $this->get_settings()->get_flat() ) || is_numeric( $this->get_settings()->get_percentage() );
    }

    /**
     * Returns admin commission amount.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_admin_commission(): float {
        return $this->validate_rate( $this->admin_commission );
    }

    /**
     * Returns vendor earning amount.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_vendor_earning(): float {
        return $this->validate_rate( $this->vendor_earning );
    }

    /**
     * Returns per item admin commission amount.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_per_item_admin_commission(): float {
        return $this->validate_rate( $this->per_item_admin_commission );
    }

    /**
     * Returns the quantity on which the commission has been calculated.
     *
     * @since 3.14.0
     *
     * @return int
     */
    public function get_items_total_quantity(): int {
        return $this->items_total_quantity;
    }
}
