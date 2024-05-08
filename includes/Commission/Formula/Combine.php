<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

class Combine extends AbstractFormula {

    /**
     * Per item admin commission value.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float
     */
    protected $per_item_admin_commission = 0;

    /**
     * Admin commission value.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float
     */
    protected $admin_commission = 0;

    /**
     * Vendor earning amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float
     */
    protected $vendor_earning = 0;

    /**
     * The quantity on which the commission will be calculated.
     *
     * @since DOKAN_SINCE
     *
     * @var int
     */
    protected $items_total_quantity = 1;

    /**
     * Combine commission source text.
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'combine';

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $settings
     */
    public function __construct( Setting $settings ) {
        $this->set_settings( $settings );
    }

    /**
     * Calculation is doing here.
     *
     * @since DOKAN_SINCE
     *
     * @param int|float $total_amount
     * @param int       $total_quantity
     *
     * @return void
     */
    public function calculate( $total_amount, $total_quantity = 1 ) {
        $percent_commission = $total_amount * ( dokan()->commission->validate_rate( $this->get_settings()->get_percentage() ) / 100 );
        $commission         = (float) dokan()->commission->validate_rate( $this->get_settings()->get_flat() ) + $percent_commission;

        $per_item_flat       = dokan()->commission->validate_rate( $this->get_settings()->get_flat() ) / $total_quantity;
        $per_item_percentage = $percent_commission / $total_quantity;

        $this->admin_commission          = $commission;
        $this->per_item_admin_commission = $per_item_flat + $per_item_percentage;

        if ( $this->get_per_item_admin_commission() > $total_amount ) {
            $this->per_item_admin_commission = $total_amount;
        }

        if ( $this->get_admin_commission() > $total_amount ) {
            $this->admin_commission = $total_amount;
        }

        $this->vendor_earning            = $total_amount - $this->admin_commission;
        $this->items_total_quantity      = $total_quantity;
    }

    /**
     * Commission calculation parameters.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns if the combine commission is applicable or not based on data.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_applicable(): bool {
        return $this->valid_commission_type() && $this->valid_commission();
    }

    /**
     * Returns if the commission type data is valid.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    protected function valid_commission_type(): bool {
        $legacy_types = dokan()->commission->get_legacy_commission_types();

        $all_types = array_keys( $legacy_types );

        return in_array( $this->get_settings()->get_type(), $all_types, true ) || $this->get_settings()->get_type() === self::SOURCE;
    }

    /**
     * Returns if commission is valid.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    protected function valid_commission(): bool {
        return is_numeric( $this->get_settings()->get_flat() ) || is_numeric( $this->get_settings()->get_percentage() );
    }

    /**
     * Returns the admin commission
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->admin_commission );
    }

    /**
     * Returns the vendors earning.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_vendor_earning(): float {
        return dokan()->commission->validate_rate( $this->vendor_earning );
    }

    /**
     * Returns per item admin commission.
     *
     * @since DOKAN_SINCE
     *
     * @return float
     */
    public function get_per_item_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->per_item_admin_commission );
    }

    /**
     * Returns the quantity on which the commission is calculated.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_items_total_quantity(): int {
        return $this->items_total_quantity;
    }
}
