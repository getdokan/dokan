<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

class Percentage extends AbstractFormula {

    /**
     * Commission type source.
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'percentage';

    /**
     * Amount of admin commission.
     *
     * @var int|float $flat_commission
     *
     * @since DOKAN_SINCE
     */
    protected $admin_commission = 0;

    /**
     * Per item admin commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $per_item_admin_commission
     */
    protected $per_item_admin_commission = 0;

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

    public function __construct( Setting $settings ) {
        $this->set_settings( $settings );
    }

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $settings
     */
    public function calculate( $total_amount, $total_quantity = 1 ) {
        $this->admin_commission          = ( $total_amount * dokan()->commission->validate_rate( $this->get_settings()->get_percentage() ) ) / 100;
        $this->per_item_admin_commission = $this->admin_commission / $total_quantity;
        $this->vendor_earning            = $total_amount - $this->admin_commission;

        // Admin will get 100 percent if commission rate > 100
        if ( $this->get_settings()->get_percentage() > 100 ) {
            $this->admin_commission = $total_amount;
            $this->vendor_earning   = 0;
        }

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
            'percentage' => $this->get_settings()->get_percentage(),
            'meta_data'  => $this->get_settings()->get_meta_data(),
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
     * Returns if a percentage commission is applicable or not.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_applicable(): bool {
        return is_numeric( $this->get_settings()->get_percentage() );
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
        return dokan()->commission->validate_rate( $this->per_item_admin_commission ?? 0 );
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
