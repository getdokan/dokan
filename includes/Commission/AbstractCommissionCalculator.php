<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Model\Setting;

abstract class AbstractCommissionCalculator {

    protected Setting $settings;


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
