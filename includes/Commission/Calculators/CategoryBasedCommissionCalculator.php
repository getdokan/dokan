<?php

namespace WeDevs\Dokan\Commission\Calculators;

use WeDevs\Dokan\Commission\Utils\CommissionSettings;

class CategoryBasedCommissionCalculator implements CommissionCalculatorInterface {
    private $admin_commission = 0;
    private $per_item_admin_commission = 0;
    private $vendor_earning = 0;
    private $items_total_quantity = 1;
    private $meta_data = [];
    private CommissionSettings $settings;

    public function get_meta_data(): array {
        return $this->meta_data;
    }

    public function set_meta_data( array $meta_data ): void {
        $this->meta_data = $meta_data;
    }
    const SOURCE = 'category_based';
    private FixedCommissionCalculator $fixed_commission_calculator;
    /**
     * @var mixed
     */
    private $type;
    /**
     * @var mixed
     */
    private $category_id = '';

    /**
     * @return mixed
     */
    public function get_type() {
        return $this->type;
    }

    public function __construct( CommissionSettings $settings ) {
		//        $this->category_commissions = $settings->get_category_commissions();
		//        $this->type = $settings->get_type();
		//        $this->category_id = $settings->get_category_id();

        $this->settings = $settings;
    }

    public function calculate( $total_amount, $total_quantity = 1 ) {
        $total_quantity            = max( $total_quantity, 1 );
        $valid_commission_settings = $this->get_valid_commission_settings();
        $valid_commission_settings->set_type( FixedCommissionCalculator::SOURCE );

        // Use FixedCommissionCalculator for the calculation
        $this->fixed_commission_calculator = new FixedCommissionCalculator( $valid_commission_settings );
        $this->fixed_commission_calculator->calculate( $total_amount, $total_quantity );

        $this->per_item_admin_commission = $this->fixed_commission_calculator->get_per_item_admin_commission();
        $this->admin_commission          = $this->fixed_commission_calculator->get_admin_commission();
        $this->vendor_earning            = $this->fixed_commission_calculator->get_vendor_earning();
        $this->items_total_quantity      = $total_quantity;
    }

    public function get_parameters(): array {
        $parameters = $this->fixed_commission_calculator->get_parameters();

        $parameters['category_id'] = $this->settings->get_category_id();
        $parameters['meta_data'] = $this->settings->get_meta_data();

        return $parameters;
    }

    public function get_source(): string {
        return self::SOURCE;
    }


    public function is_applicable(): bool {
        return $this->valid_commission_type() && $this->is_valid_commission();
    }

    private function valid_commission_type(): bool {
        return $this->settings->get_type() === $this->get_source();
    }

    private function is_valid_commission(): bool {
        if ( is_numeric( $this->settings->get_category_id() ) && isset( $this->settings->get_category_commissions()['items'][ $this->settings->get_category_id() ] ) ) {
            return true;
        } elseif ( is_numeric( $this->settings->get_category_commissions()['all']['flat'] ) || is_numeric( $this->settings->get_category_commissions()['all']['percentage'] ) ) {
            return true;
        }

        return false;
    }

    private function get_valid_commission_settings(): CommissionSettings {
        if ( is_numeric( $this->settings->get_category_id() ) && isset( $this->settings->get_category_commissions()['items'][ $this->settings->get_category_id() ] ) ) {
            $commissions = $this->settings->get_category_commissions();

            $items = $commissions['items'];
            $item = $items[ $this->settings->get_category_id() ];
            $item = [
                'flat'       => $item['flat'] ?? 0,
                'percentage' => $item['percentage'] ?? 0,
            ];

            $items[ $this->settings->get_category_id() ] = $item;
            $commissions['items'] = $items;
            $this->settings->set_category_commissions( $commissions );
        } elseif ( is_numeric( $this->settings->get_category_commissions()['all']['flat'] ) || is_numeric( $this->settings->get_category_commissions()['all']['percentage'] ) ) {
            $commissions = $this->settings->get_category_commissions();
            $all = $commissions['all'];
            $commissions['all'] = [
                'flat' => $all['flat'] ?? 0,
                'percentage' => $all['percentage'] ?? 0,
            ];

            $this->settings->set_category_commissions( $commissions );
        }

        return $this->settings;
    }

    public function get_admin_commission(): float {
        return $this->admin_commission;
    }

    public function get_vendor_earning(): float {
        return $this->vendor_earning;
    }

    public function get_per_item_admin_commission(): float {
        return dokan()->commission->validate_rate( $this->per_item_admin_commission );
    }

    public function get_items_total_quantity(): int {
        return $this->items_total_quantity;
    }
}
