<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Strategies\AbstractStrategy;
use WeDevs\Dokan\Commission\Model\Commission;

/**
 * Calculates and returns commission
 *
 * @since 3.14.0
 */
class Calculator {

    /**
     * @since 3.14.0
     *
     * @var AbstractStrategy[]
     */
    protected array $strategies;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param AbstractStrategy[] $strategies
     */
    public function __construct( array $strategies ) {
        $this->strategies = $strategies;
    }

    /**
     * Returns applied commission data
     *
     * @since 3.14.0
     *
     * @param int|float $total_amount
     * @param int       $total_quantity
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function calculate_commission( $total_amount, $total_quantity = 1 ): Commission {
        if ( ! is_numeric( $total_quantity ) || $total_quantity < 1 ) {
            $total_quantity = 1;
        }

        if ( ! is_numeric( $total_amount ) ) {
            $total_quantity = 0;
        }

        $commission_data = new Commission();
        $commission_data->set_vendor_earning( $total_amount )
            ->set_total_quantity( $total_quantity )
            ->set_total_amount( $total_amount );

        foreach ( $this->strategies as $strategy ) {
            $formula = $strategy->create_formula();
            if ( $formula->is_applicable() ) {
                $formula->set_amount( $total_amount )
                    ->set_quantity( $total_quantity )
                    ->calculate();

                $commission_data->set_source( $strategy->get_source() )
                    ->set_per_item_admin_commission( $formula->get_per_item_admin_commission() )
                    ->set_admin_commission( $formula->get_admin_commission() )
                    ->set_vendor_earning( $formula->get_vendor_earning() )
                    ->set_total_quantity( $formula->get_items_total_quantity() )
                    ->set_total_amount( $total_amount )
                    ->set_type( $formula->get_source() )
                    ->set_parameters( $formula->get_parameters() );

                return $commission_data;
            }
        }

        // If no commission is defined at any level.
        return $commission_data;
    }
}
