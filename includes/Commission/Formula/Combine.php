<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

class Combine extends AbstractFormula {

    /**
     * Per item admin commission value.
     *
     * @since 3.14.0
     *
     * @var int|float
     */
    protected $per_item_admin_commission = 0;

    /**
     * Admin commission value.
     *
     * @since 3.14.0
     *
     * @var int|float
     */
    protected $admin_commission = 0;

    /**
     * Vendor earning amount.
     *
     * @since 3.14.0
     *
     * @var int|float
     */
    protected $vendor_earning = 0;

    /**
     * The quantity on which the commission will be calculated.
     *
     * @since 3.14.0
     *
     * @var int
     */
    protected $items_total_quantity = 1;

    /**
     * Combine commission source text.
     *
     * @since 3.14.0
     */
    const SOURCE = 'combine';

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $settings
     */
    public function __construct( Setting $settings ) {
        $this->set_settings( $settings );
    }

    /**
     * Calculation is doing here.
     *
     * @since 3.14.0
     *
     * @return void
     */
    public function calculate() {
        $percent_commission = $this->get_amount() * ( $this->validate_rate( $this->get_settings()->get_percentage() ) / 100 );
        $commission         = (float) $this->validate_rate( $this->get_settings()->get_flat() ) + $percent_commission;

        $per_item_flat       = $this->validate_rate( $this->get_settings()->get_flat() ) / $this->get_quantity();
        $per_item_percentage = $percent_commission / $this->get_quantity();

        $this->admin_commission          = $commission;
        $this->per_item_admin_commission = $per_item_flat + $per_item_percentage;

        if ( $this->get_per_item_admin_commission() > $this->get_amount() ) {
            $this->per_item_admin_commission = $this->get_amount();
        }

        if ( $this->get_admin_commission() > $this->get_amount() ) {
            $this->admin_commission = $this->get_amount();
        }

        $this->vendor_earning            = $this->get_amount() - $this->admin_commission;
        $this->items_total_quantity      = $this->get_quantity();
    }

    /**
     * Commission calculation parameters.
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
     * Returns the combine commission surce text.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns if the combine commission is applicable or not based on data.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    public function is_applicable(): bool {
        return $this->is_valid_commission_type() && $this->is_valid_commission_data();
    }

    /**
     * Returns if the commission type data is valid.
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
     * Returns if commission is valid.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    protected function is_valid_commission_data(): bool {
        return is_numeric( $this->get_settings()->get_flat() ) || is_numeric( $this->get_settings()->get_percentage() );
    }

    /**
     * Returns the admin commission
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_admin_commission(): float {
        return $this->validate_rate( $this->admin_commission );
    }

    /**
     * Returns the vendors earning.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_vendor_earning(): float {
        return $this->validate_rate( $this->vendor_earning );
    }

    /**
     * Returns per item admin commission.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_per_item_admin_commission(): float {
        return $this->validate_rate( $this->per_item_admin_commission );
    }

    /**
     * Returns the quantity on which the commission is calculated.
     *
     * @since 3.14.0
     *
     * @return int
     */
    public function get_items_total_quantity(): int {
        return $this->items_total_quantity;
    }
}
