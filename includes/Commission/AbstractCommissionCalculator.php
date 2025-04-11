<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Strategies\AbstractStrategy;
use WeDevs\Dokan\Vendor\DokanOrderLineItemCouponInfo;

abstract class AbstractCommissionCalculator {

    /**
     * @since 3.14.0
     *
     * @var AbstractStrategy[]
     */
    protected array $strategies;

    /**
     * @since DOKAN_SINCE
     *
     * @var \WeDevs\Dokan\Commission\Strategies\AbstractStrategy|null
     */
    protected $strategy = null;

    /**
     * @since DOKAN_SINCE
     *
     * @var \WeDevs\Dokan\Commission\Formula\AbstractFormula|null
     */
    protected $formula = null;

    /**
     * @var float $price
     */
    protected float $price;

    /**
     * @var int $quantity
     */
    protected int $quantity = 1;

    /**
     * Returns the applied strategy.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    abstract public function calculate(): Commission;

    /**
     * Retrieve commission data from order item meta.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    abstract public function get(): Commission;

    /**
     * Additional adjustments to the commission data.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Commission $commission_data
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    abstract public function additional_adjustments( Commission $commission_data ): Commission;

    /**
     * Returns the applied strategy.
     *
     * @since DOKAN_SINCE
     *
     * @param array $strategies
     *
     * @return void
     */
    public function determine_strategy_to_apply( array $strategies ) {
        $this->strategies = $strategies;

        foreach ( $this->strategies as $strategy ) {
            $formula = $strategy->create_formula();

            if ( ! $formula->is_applicable() ) {
                continue;
            }

            $this->strategy = $strategy;
            $this->formula  = $formula;

            break;
        }
    }

    /**
     * Returns applied commission data
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function calculate_commission(): Commission {
        $commission_data = new Commission();
        $commission_data->set_vendor_earning( $this->price )
            ->set_total_quantity( $this->quantity )
            ->set_total_amount( $this->price );

        $this->formula->set_amount( $this->price )
            ->set_quantity( $this->quantity )
            ->calculate();

        $commission_data->set_source( $this->strategy->get_source() )
            ->set_per_item_admin_commission( $this->formula->get_per_item_admin_commission() )
            ->set_admin_commission( $this->formula->get_admin_commission() )
            ->set_net_admin_commission( $this->formula->get_admin_commission() )
            ->set_vendor_earning( $this->formula->get_vendor_earning() )
            ->set_net_vendor_earning( $this->formula->get_vendor_earning() )
            ->set_total_quantity( $this->formula->get_items_total_quantity() )
            ->set_total_amount( $this->price )
            ->set_type( $this->formula->get_source() )
            ->set_parameters( $this->formula->get_parameters() );

        return $this->additional_adjustments( $commission_data );
    }

    /**
     * Set price.
     *
     * @since DOKAN_SINCE
     *
     * @param float $price
     *
     * @return void
     */
    public function set_price( float $price ) {
        $this->price = $price;
    }

    /**
     * Set quantity.
     *
     * @since DOKAN_SINCE
     *
     * @param int $quantity
     *
     * @return void
     */
    public function set_quantity( int $quantity ) {
        $this->quantity = $quantity;
    }
}
