<?php

namespace WeDevs\Dokan\Commission\Formula;

use WeDevs\Dokan\Commission\Model\Setting;

/**
 * Category based commission calculator class.
 *
 * @since 3.14.0
 */
class CategoryBased extends AbstractFormula {

    /**
     * Commission type source.
     *
     * @since 3.14.0
     */
    const SOURCE = 'category_based';

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
     * Commission meta data.
     *
     * @since 3.14.0
     *
     * @var array $meta_data
     */
    protected $meta_data = [];

    /**
     * Fixed commission calculator classs instance.
     *
     * @since 3.14.0
     *
     * @var \WeDevs\Dokan\Commission\Formula\Fixed $fixed_formula
     */
    protected Fixed $fixed_formula;

    /**
     * @since 3.14.0
     *
     * @var \WeDevs\Dokan\Commission\Model\Setting
     */
    protected Setting $fixed_commission_setting;

    /**
     * Commission type.
     *
     * @since 3.14.0
     *
     * @var mixed
     */
    protected $type;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param \WeDevs\Dokan\Commission\Model\Setting $settings
     */
    public function __construct( Setting $settings ) {
        $this->set_settings( $this->get_valid_commission_settings( $settings ) );
        $this->fixed_formula = new Fixed( $this->fixed_commission_setting );
    }

    /**
     * Calculating the category commission.
     *
     * @since 3.14.0
     *
     * @return void
     */
    public function calculate() {
        $this->set_quantity( max( $this->get_quantity(), 1 ) );

        if ( $this->is_applicable() && $this->fixed_formula->is_applicable() ) {
            $this->fixed_formula->set_amount( $this->get_amount() );
            $this->fixed_formula->set_quantity( $this->get_quantity() );
            $this->fixed_formula->calculate();

            $this->per_item_admin_commission = $this->fixed_formula->get_per_item_admin_commission();
            $this->admin_commission          = $this->fixed_formula->get_admin_commission();
            $this->vendor_earning            = $this->fixed_formula->get_vendor_earning();
        } else {
            $this->per_item_admin_commission = 0;
            $this->admin_commission          = 0;
            $this->vendor_earning            = $this->get_amount();
        }

        $this->items_total_quantity = $this->get_quantity();
    }

    /**
     * Returns calculated commissions meta data.
     *
     * @since 3.14.0
     *
     * @return array
     */
    public function get_meta_data(): array {
        return $this->meta_data;
    }

    /**
     * Sets category commission meta data.
     *
     * @since 3.14.0
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
     * @since 3.14.0
     *
     * @return mixed
     */
    public function get_type() {
        return $this->type;
    }

    /**
     * Get commission date parameters.
     *
     * @since 3.14.0
     *
     * @return array
     */
    public function get_parameters(): array {
        $parameters = $this->fixed_formula->get_parameters();

        $parameters['category_id'] = $this->get_settings()->get_category_id();
        $parameters['meta_data'] = $this->get_settings()->get_meta_data();

        return $parameters;
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
     * Returns if a category commission is applicable or not.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    public function is_applicable(): bool {
        if ( $this->is_valid_commission_type() && $this->is_valid_commission_data() ) {
            // Changing the type here another wise fixed commission is applicable will always be false, we will set back the type to category later.
            $this->set_settings( $this->get_settings()->set_type( Fixed::SOURCE ) );
            $applicable = $this->fixed_formula->is_applicable();

            // Setting the commission type back to category based.
            $this->set_settings( $this->get_settings()->set_type( self::SOURCE ) );
            return $applicable;
        }

        return false;
    }

    /**
     * Returns true if commission type is valid.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    protected function is_valid_commission_type(): bool {
        return $this->get_settings()->get_type() === $this->get_source();
    }

    /**
     * Returns if saved commission data is valid to be applied.
     *
     * @since 3.14.0
     *
     * @return bool
     */
    protected function is_valid_commission_data(): bool {
        $valid_category_id = is_numeric( $this->get_settings()->get_category_id() );
        $has_category_setting = isset( $this->get_settings()->get_category_commissions()['items'][ $this->get_settings()->get_category_id() ] );
        $category_flat_value = $has_category_setting && isset( $this->get_settings()->get_category_commissions()['items'][ $this->get_settings()->get_category_id() ]['flat'] )
            ? $this->get_settings()->get_category_commissions()['items'][ $this->get_settings()->get_category_id() ]['flat']
            : '';
        $category_percentage_value = $has_category_setting && isset( $this->get_settings()->get_category_commissions()['items'][ $this->get_settings()->get_category_id() ]['percentage'] )
            ? $this->get_settings()->get_category_commissions()['items'][ $this->get_settings()->get_category_id() ]['percentage']
            : '';

        $has_all_setting = isset( $this->get_settings()->get_category_commissions()['all'] );
        $has_all_flat_setting = $has_all_setting && isset( $this->get_settings()->get_category_commissions()['all']['flat'] ) ? $this->get_settings()->get_category_commissions()['all']['flat'] : '';
        $has_all_percentage_setting = $has_all_setting && isset( $this->get_settings()->get_category_commissions()['all']['percentage'] ) ? $this->get_settings()->get_category_commissions()['all']['percentage'] : '';

        if (
            $valid_category_id &&
            $has_category_setting &&
            ( is_numeric( $category_flat_value ) || is_numeric( $category_percentage_value ) )
        ) {
            return true;
        } elseif (
            $valid_category_id &&
            $has_category_setting &&
            ( ! is_numeric( $category_flat_value ) && ! is_numeric( $category_percentage_value ) )
        ) {
            return false;
        } elseif ( $has_all_setting && ( is_numeric( $has_all_flat_setting ) || is_numeric( $has_all_percentage_setting ) ) ) {
            return true;
        }

        return false;
    }

    /**
     * Validates and returns commission.
     *
     * @since 3.14.0
     *
     * @param Setting $setting
     *
     * @return Setting
     */
    protected function get_valid_commission_settings( Setting $setting ): Setting {
        $this->set_settings( $setting );

        $this->fixed_commission_setting = new Setting();
        $this->fixed_commission_setting->set_type( Fixed::SOURCE )
            ->set_flat( $this->get_settings()->get_flat() )
            ->set_percentage( $this->get_settings()->get_percentage() )
            ->set_category_id( $this->get_settings()->get_category_id() )
            ->set_category_commissions( $this->get_settings()->get_category_commissions() )
            ->set_meta_data( $this->get_settings()->get_meta_data() );

        if ( ! $this->is_valid_commission_data() ) {
            return $setting;
        }

		//        $validated_setting = new Setting();
        $commissions = $setting->get_category_commissions();
        if ( is_numeric( $setting->get_category_id() ) && isset( $setting->get_category_commissions()['items'][ $setting->get_category_id() ] ) ) {
            $items = $commissions['items'];
            $item = $items[ $setting->get_category_id() ];

            $this->fixed_commission_setting->set_flat( isset( $item['flat'] ) ? $item['flat'] : '' );
            $this->fixed_commission_setting->set_percentage( isset( $item['percentage'] ) ? $item['percentage'] : '' );
            $this->fixed_commission_setting->set_category_commissions( $commissions );
        } elseif ( isset( $setting->get_category_commissions()['all'] ) && ( is_numeric( $setting->get_category_commissions()['all']['flat'] ) || is_numeric( $setting->get_category_commissions()['all']['percentage'] ) ) ) {
            $all = $commissions['all'];

            $this->fixed_commission_setting->set_flat( isset( $all['flat'] ) ? $all['flat'] : '' );
            $this->fixed_commission_setting->set_percentage( isset( $all['percentage'] ) ? $all['percentage'] : '' );
            $this->fixed_commission_setting->set_category_commissions( $commissions );
        }

        return $setting;
    }

    /**
     * Returns admin commission amount.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_admin_commission(): float {
        return $this->admin_commission;
    }

    /**
     * Returns vendor earning amount.
     *
     * @since 3.14.0
     *
     * @return float
     */
    public function get_vendor_earning(): float {
        return $this->vendor_earning;
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
