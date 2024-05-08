<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

/**
 * Category based commission calculator class.
 *
 * @since DOKAN_SINCE
 */
class CategoryBased extends AbstractFormula {

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

    /**
     * Commission meta data.
     *
     * @since DOKAN_SINCE
     *
     * @var array $meta_data
     */
    protected $meta_data = [];

    /**
     * Fixed commission calculator classs instance.
     *
     * @since DOKAN_SINCE
     *
     * @var \WeDevs\Dokan\Commission\Formula\Fixed $fixed_commission_calculator
     */
    protected Fixed $fixed_commission_calculator;

    /**
     * Commission type.
     *
     * @since DOKAN_SINCE
     *
     * @var mixed
     */
    protected $type;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $settings
     */
    public function __construct( Setting $settings ) {
        $this->set_settings( $settings );
        $this->set_settings( $this->get_valid_commission_settings() );
        $this->fixed_commission_calculator = new Fixed( $this->get_settings() );
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
        $total_quantity = max( $total_quantity, 1 );

        // Changing the type here another wise fixed commission is applicable will always be false, we will set back the type to category later.
        $this->set_settings( $this->get_settings()->set_type( Fixed::SOURCE ) );
        $applicable = $this->fixed_commission_calculator->is_applicable();

        // Setting the commission type back to category based.
        $this->set_settings( $this->get_settings()->set_type( self::SOURCE ) );

        if ( $applicable ) {
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
     * @return \WeDevs\Dokan\Commission\Formula\CategoryBased
     */
    public function set_meta_data( array $meta_data ): CategoryBased {
        $this->meta_data = $meta_data;

        return $this;
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

        $parameters['category_id'] = $this->get_settings()->get_category_id();
        $parameters['meta_data'] = $this->get_settings()->get_meta_data();

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
            // Changing the type here another wise fixed commission is applicable will always be false, we will set back the type to category later.
            $this->set_settings( $this->get_settings()->set_type( Fixed::SOURCE ) );
            $applicable = $this->fixed_commission_calculator->is_applicable();

            // Setting the commission type back to category based.
            $this->set_settings( $this->get_settings()->set_type( self::SOURCE ) );
            return $applicable;
        }

        return false;
    }

    /**
     * Returns true if commission type is valid.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    protected function valid_commission_type(): bool {
        return $this->get_settings()->get_type() === $this->get_source();
    }

    /**
     * Returns if saved commission data is valid to be applied.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    protected function is_valid_commission(): bool {
        if ( is_numeric( $this->get_settings()->get_category_id() ) && isset( $this->get_settings()->get_category_commissions()['items'][ $this->get_settings()->get_category_id() ] ) ) {
            return true;
        } elseif ( isset( $this->get_settings()->get_category_commissions()['all'] ) && ( is_numeric( $this->get_settings()->get_category_commissions()['all']['flat'] ) || is_numeric( $this->get_settings()->get_category_commissions()['all']['percentage'] ) ) ) {
            return true;
        }

        return false;
    }

    /**
     * Validates and returns commission.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    protected function get_valid_commission_settings(): Setting {
        $fixed_cat_settings = new Setting();
        if ( is_numeric( $this->get_settings()->get_category_id() ) && isset( $this->get_settings()->get_category_commissions()['items'][ $this->get_settings()->get_category_id() ] ) ) {
            $commissions = $this->get_settings()->get_category_commissions();

            $items = $commissions['items'];
            $item = $items[ $this->get_settings()->get_category_id() ];

            $fixed_cat_settings->set_flat( $item['flat'] ?? '' );
            $fixed_cat_settings->set_percentage( $item['percentage'] ?? '' );
            $fixed_cat_settings->set_category_commissions( $commissions );
        } elseif ( isset( $this->get_settings()->get_category_commissions()['all'] ) && ( is_numeric( $this->get_settings()->get_category_commissions()['all']['flat'] ) || is_numeric( $this->get_settings()->get_category_commissions()['all']['percentage'] ) ) ) {
            $commissions = $this->get_settings()->get_category_commissions();
            $all = $commissions['all'];

            $fixed_cat_settings->set_flat( $all['flat'] ?? '' );
            $fixed_cat_settings->set_percentage( $all['percentage'] ?? '' );
            $fixed_cat_settings->set_category_commissions( $commissions );
        }

        $fixed_cat_settings->set_category_id( $this->get_settings()->get_category_id() );
        $fixed_cat_settings->set_type( $this->get_settings()->get_type() );

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
