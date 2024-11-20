<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

class Flat extends AbstractFormula {

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
    protected $flat_commission = 0;

    /**
     * Per item admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $per_item_admin_commission
     */
    protected $per_item_admin_commission = 0;

    /**
     * Admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $admin_commission
     */
    protected $admin_commission = 0;

    /**
     * Total vendor earning amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $vendor_earning
     */
    protected $vendor_earning = 0;

    /**
     * Total items quantity, on it the commission will be calculated.
     *
     * @since DOKAN_SINCE
     *
     * @var int $items_total_quantity
     */
    protected $items_total_quantity = 1;

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
     * Calculating the flat commission.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function calculate() {
        $this->set_quantity( max( $this->get_quantity(), 1 ) );

        if ( $this->is_applicable() ) {
            $this->per_item_admin_commission = dokan()->commission->validate_rate( $this->get_settings()->get_flat() );
        }

        if ( $this->per_item_admin_commission > $this->get_amount() ) {
            $this->per_item_admin_commission = $this->get_amount();
        }

        $this->flat_commission = $this->per_item_admin_commission;
        if ( (int) $this->get_quantity() > 1 ) {
            $this->flat_commission = $this->per_item_admin_commission * apply_filters( 'dokan_commission_multiply_by_order_quantity', $this->get_quantity() );
        }

        $this->admin_commission = $this->flat_commission;

        if ( $this->admin_commission > $this->get_amount() ) {
            $this->admin_commission = $this->get_amount();
        }

        $this->vendor_earning = $this->get_amount() - $this->admin_commission;
        $this->items_total_quantity = $this->get_quantity();
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
            'flat'      => $this->get_settings()->get_flat(),
            'meta_data' => $this->get_settings()->get_meta_data(),
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
        return is_numeric( $this->get_settings()->get_flat() );
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
