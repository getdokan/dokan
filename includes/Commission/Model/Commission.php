<?php

namespace WeDevs\Dokan\Commission\Model;

class Commission {

    /**
     * Applied commission source or scope.
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    protected $source = 'none';

    /**
     * Per item admin commission.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $per_item_admin_commission
     */
    protected $per_item_admin_commission = 0;

    /**
     * Admin commission aount
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $admin_commission
     */
    protected $admin_commission = 0;

    /**
     * Vendor earning amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $vendor_earning
     */
    protected $vendor_earning = 0;

    /**
     * Total quantity on which the commission will be calculated.
     *
     * @since DOKAN_SINCE
     *
     * @var int $total_quantity
     */
    protected $total_quantity = 1;

    /**
     * Total commission amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|float $total_amount
     */
    protected $total_amount = 0;

    /**
     * Applied commission type.
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    protected $type = 'none';

    /**
     * Applied commission data parameters.
     *
     * @since DOKAN_SINCE
     *
     * @var array
     */
    protected $parameters = [];

    /**
     * Returns applied commission source. example order_item/product/vendor/global.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_source(): string {
        return $this->source;
    }

    /**
     * Sets commission source.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return int|float
     */
    public function get_per_item_admin_commission() {
        return $this->per_item_admin_commission;
    }

    /**
     * Sets per item admin commission.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return int|float
     */
    public function get_admin_commission() {
        return $this->admin_commission;
    }

    /**
     * Sets admin commission amount.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return int|float
     */
    public function get_vendor_earning() {
        return $this->vendor_earning;
    }

    /**
     * Sets vendor earning..
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_total_quantity(): int {
        return $this->total_quantity;
    }

    /**
     * Sets the total quantity on which the commission will be calculated.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_total_amount(): int {
        return $this->total_amount;
    }

    /**
     * Sets the total amount on which the commission will be calculated.
     *
     * @since DOKAN_SINCE
     *
     * @param int $total_amount
     *
     * @return Commission
     */
    public function set_total_amount( int $total_amount ): Commission {
        $this->total_amount = $total_amount;

        return $this;
    }

    /**
     * Returns the commission type.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_parameters(): array {
        return $this->parameters;
    }

    /**
     * Sets commission parameters.
     *
     * @since DOKAN_SINCE
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
     * @since DOKAN_SINCE
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
