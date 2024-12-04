<?php

namespace WeDevs\Dokan\Commission\Model;

use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Settings\DefaultSetting;
use WeDevs\Dokan\Commission\Strategies\DefaultStrategy;

class Commission {

    /**
     * Applied commission source or scope.
     *
     * @since 3.14.0
     *
     * @var string
     */
    protected $source = DefaultStrategy::SOURCE;

    /**
     * Per item admin commission.
     *
     * @since 3.14.0
     *
     * @var int|float $per_item_admin_commission
     */
    protected $per_item_admin_commission = 0;

    /**
     * Admin commission aount
     *
     * @since 3.14.0
     *
     * @var int|float $admin_commission
     */
    protected $admin_commission = 0;

    /**
     * Vendor earning amount.
     *
     * @since 3.14.0
     *
     * @var int|float $vendor_earning
     */
    protected $vendor_earning = 0;

    /**
     * Total quantity on which the commission will be calculated.
     *
     * @since 3.14.0
     *
     * @var int $total_quantity
     */
    protected $total_quantity = 1;

    /**
     * Total commission amount.
     *
     * @since 3.14.0
     *
     * @var int|float $total_amount
     */
    protected $total_amount = 0;

    /**
     * Applied commission type.
     *
     * @since 3.14.0
     *
     * @var string
     */
    protected $type = DefaultSetting::TYPE;

    /**
     * Applied commission data parameters.
     *
     * @since 3.14.0
     *
     * @var array
     */
    protected $parameters = [];

    /**
     * Returns applied commission source. example order_item/product/vendor/global.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return $this->source;
    }

    /**
     * Sets commission source.
     *
     * @since 3.14.0
     *
     * @param string $source
     *
     * @return Commission
     */
    public function set_source( string $source ): Commission {
        $this->source = $source;

        return $this;
    }

    /**
     * Returns per item admin commission.
     *
     * @since 3.14.0
     *
     * @return int|float
     */
    public function get_per_item_admin_commission() {
        return $this->per_item_admin_commission;
    }

    /**
     * Sets per item admin commission.
     *
     * @since 3.14.0
     *
     * @param int|float $per_item_admin_commission
     *
     * @return Commission
     */
    public function set_per_item_admin_commission( $per_item_admin_commission ): Commission {
        $this->per_item_admin_commission = $per_item_admin_commission;

        return $this;
    }

    /**
     * Returns the admin commission amount.
     *
     * @since 3.14.0
     *
     * @return int|float
     */
    public function get_admin_commission() {
        return $this->admin_commission;
    }

    /**
     * Sets admin commission amount.
     *
     * @since 3.14.0
     *
     * @param $admin_commission
     *
     * @return Commission
     */
    public function set_admin_commission( $admin_commission ): Commission {
        $this->admin_commission = $admin_commission;

        return $this;
    }

    /**
     * Returns vendor earning.
     *
     * @since 3.14.0
     *
     * @return int|float
     */
    public function get_vendor_earning() {
        return $this->vendor_earning;
    }

    /**
     * Sets vendor earning..
     *
     * @since 3.14.0
     *
     * @param int|float $vendor_earning
     *
     * @return Commission
     */
    public function set_vendor_earning( $vendor_earning ): Commission {
        $this->vendor_earning = $vendor_earning;

        return $this;
    }

    /**
     * Returns the quantity on which the commission will be calculated.
     *
     * @since 3.14.0
     *
     * @return int
     */
    public function get_total_quantity(): int {
        return $this->total_quantity;
    }

    /**
     * Sets the total quantity on which the commission will be calculated.
     *
     * @since 3.14.0
     *
     * @param int $total_quantity
     *
     * @return Commission
     */
    public function set_total_quantity( int $total_quantity ): Commission {
        $this->total_quantity = $total_quantity;

        return $this;
    }

    /**
     * Returns the total amount on which the commission will be calculated.
     *
     * @since 3.14.0
     *
     * @return int
     */
    public function get_total_amount() {
        return $this->total_amount;
    }

    /**
     * Sets the total amount on which the commission will be calculated.
     *
     * @since 3.14.0
     *
     * @param int|float $total_amount
     *
     * @return Commission
     */
    public function set_total_amount( $total_amount ): Commission {
        $this->total_amount = $total_amount;

        return $this;
    }

    /**
     * Returns the commission type.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_type(): string {
        return $this->type;
    }

    /**
     * Sets the commission type
     *
     * @param string $type
     *
     * @return Commission
     */
    public function set_type( string $type ): Commission {
        $this->type = $type;

        return $this;
    }

    /**
     * Returns applied commission parameters.
     *
     * @since 3.14.0
     *
     * @return array
     */
    public function get_parameters(): array {
        return $this->parameters;
    }

    /**
     * Sets commission parameters.
     *
     * @since 3.14.0
     *
     * @param array $parameters
     *
     * @return Commission
     */
    public function set_parameters( array $parameters ): Commission {
        $this->parameters = $parameters;

        return $this;
    }

    /**
     * Returns commission data as array.
     *
     * @since 3.14.0
     *
     * @return array
     */
    public function get_data(): array {
        return [
            'source'                    => $this->get_source(),
            'per_item_admin_commission' => $this->get_per_item_admin_commission(),
            'admin_commission'          => $this->get_admin_commission(),
            'vendor_earning'            => $this->get_vendor_earning(),
            'total_quantity'            => $this->get_total_quantity(),
            'total_amount'              => $this->get_total_amount(),
            'type'                      => $this->get_type(),
            'parameters'                => $this->get_parameters(),
        ];
    }
}
