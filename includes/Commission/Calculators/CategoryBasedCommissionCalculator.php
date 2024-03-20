<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

/**
 * Category based commission calculator class.
 *
 * @since DOKAN_SINCE
 */
class CategoryBasedCommissionCalculator implements CommissionCalculatorInterface {

    /**
     * Commission type source.
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'category_based';

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
     * Commission meta data.
     *
     * @since DOKAN_SINCE
     *
     * @var array $meta_data
     */
    private $meta_data = [];

    /**
     * Commission setting.
     *
     * @since DOKAN_SINCE
     *
     * @var \WeDevs\Dokan\Commission\Utils\CommissionSettings $settings
     */
    private CommissionSettings $settings;

    /**
     * Fixed commission calculator classs instance.
     *
     * @since DOKAN_SINCE
     *
     * @var \WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator $fixed_commission_calculator
     */
    private FixedCommissionCalculator $fixed_commission_calculator;

    /**
     * Commission type.
     *
     * @since DOKAN_SINCE
     *
     * @var mixed
     */
    private $type;

    /**
     * Category id by which the commission will be calculated.
     *
     * @since DOKAN_SINCE
     *
     * @var mixed
     */
    private $category_id = '';

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
     * Calculating the category commission.
     *
     * @since DOKAN_SINCE
     *
     * @param int|float $total_amount
     * @param int       $total_quantity
     *
     * @return void
     */
    public function calculate( $total_amount, $total_quantity = 1 ) {
        $total_quantity            = max( $total_quantity, 1 );
        $valid_commission_settings = $this->get_valid_commission_settings();

        // Use FixedCommissionCalculator for the calculation
        $this->fixed_commission_calculator = new FixedCommissionCalculator( $valid_commission_settings );

        if ( $this->fixed_commission_calculator->is_applicable() ) {
            $this->fixed_commission_calculator->calculate( $total_amount, $total_quantity );
            $this->per_item_admin_commission = $this->fixed_commission_calculator->get_per_item_admin_commission();
            $this->admin_commission          = $this->fixed_commission_calculator->get_admin_commission();
            $this->vendor_earning            = $this->fixed_commission_calculator->get_vendor_earning();
        }

        $this->items_total_quantity = $total_quantity;
    }

    /**
     * Returns calculated commissions meta data.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_meta_data(): array {
        return $this->meta_data;
    }

    /**
     * Sets category commission meta data.
     *
     * @since DOKAN_SINCE
     *
     * @param array $meta_data
     *
     * @return void
     */
    public function set_meta_data( array $meta_data ): void {
        $this->meta_data = $meta_data;
    }

    /**
     * Returns type.
     *
     * @since DOKAN_SINCE
     *
     * @return mixed
     */
    public function get_type() {
        return $this->type;
    }

    /**
     * Get commission date parameters.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_parameters(): array {
        $parameters = $this->fixed_commission_calculator->get_parameters();

        $parameters['category_id'] = $this->settings->get_category_id();
        $parameters['meta_data'] = $this->settings->get_meta_data();

        return $parameters;
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
     * Returns if a category commission is applicable or not.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_applicable(): bool {
        if ( $this->valid_commission_type() && $this->is_valid_commission() ) {
            $fixed_settings = $this->get_valid_commission_settings();
            $fixed_commission = new FixedCommissionCalculator( $fixed_settings );

            return $fixed_commission->is_applicable();
        } else {
            return false;
        }
    }

    /**
     * Returns true if commission type is valid.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    private function valid_commission_type(): bool {
        return $this->settings->get_type() === $this->get_source();
    }

    /**
     * Returns if saved commission data is valid to be applied.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    private function is_valid_commission(): bool {
        if ( is_numeric( $this->settings->get_category_id() ) && isset( $this->settings->get_category_commissions()['items'][ $this->settings->get_category_id() ] ) ) {
            return true;
        } elseif ( isset( $this->settings->get_category_commissions()['all'] ) && ( is_numeric( $this->settings->get_category_commissions()['all']['flat'] ) || is_numeric( $this->settings->get_category_commissions()['all']['percentage'] ) ) ) {
            return true;
        }

        return false;
    }

    /**
     * Validates and returns commission.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Utils\CommissionSettings
     */
    private function get_valid_commission_settings(): CommissionSettings {
        $fixed_cat_settings = new CommissionSettings();
        if ( is_numeric( $this->settings->get_category_id() ) && isset( $this->settings->get_category_commissions()['items'][ $this->settings->get_category_id() ] ) ) {
            $commissions = $this->settings->get_category_commissions();

            $items = $commissions['items'];
            $item = $items[ $this->settings->get_category_id() ];

            $fixed_cat_settings->set_flat( $item['flat'] ?? '' );
            $fixed_cat_settings->set_percentage( $item['percentage'] ?? '' );
            $fixed_cat_settings->set_category_commissions( $commissions );
        } elseif ( isset( $this->settings->get_category_commissions()['all'] ) && ( is_numeric( $this->settings->get_category_commissions()['all']['flat'] ) || is_numeric( $this->settings->get_category_commissions()['all']['percentage'] ) ) ) {
            $commissions = $this->settings->get_category_commissions();
            $all = $commissions['all'];

            $fixed_cat_settings->set_flat( $all['flat'] ?? '' );
            $fixed_cat_settings->set_percentage( $all['percentage'] ?? '' );
            $fixed_cat_settings->set_category_commissions( $commissions );
        }

        $fixed_cat_settings->set_type( FixedCommissionCalculator::SOURCE );

        return $fixed_cat_settings;
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
