<?php

namespace WeDevs\Dokan\Commission;

use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Model\Setting;

abstract class AbstractCommissionCalculator extends Commission {

    protected Setting $settings;

    /**
     * @var bool $should_adjust_refund
     */
    protected bool $should_adjust_refund = true;

    /**
     * Returns the applied strategy.
     *
     * @since 4.0.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    abstract public function calculate(): Commission;

    /**
     * Retrieve commission data from order item meta.
     *
     * @since 4.0.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    abstract public function get(): Commission;

    public function set_should_adjust_refund( bool $should_adjust_refund ): self {
        $this->should_adjust_refund = $should_adjust_refund;

        return $this;
    }

    public function get_should_adjust_refund(): bool {
        return $this->should_adjust_refund;
    }
}
