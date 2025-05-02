<?php

namespace WeDevs\Dokan\Commission\Contracts;

/**
 * Interface CommissionInterface
 *
 * Handles the calculation of commissions, earnings, discounts, shipping, and gateway fees
 * for both admin and vendor in a marketplace environment.
 */
interface OrderCommissionInterface extends CommissionInterface
{
    /**
     * Get the shipping fee amount that belongs to the admin.
     *
     * @return float
     */
    public function get_admin_shipping_fee(): float;

    /**
     * Get the shipping fee amount that belongs to the vendor.
     *
     * @return float
     */
    public function get_vendor_shipping_fee(): float;

    /**
     * Get the gateway fee paid by the admin.
     *
     * @return float
     */
    public function get_admin_gateway_fee(): float;

    /**
     * Get the gateway fee paid by the vendor.
     *
     * @return float
     */
    public function get_vendor_gateway_fee(): float;

}