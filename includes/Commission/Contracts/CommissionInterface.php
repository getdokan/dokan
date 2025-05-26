<?php

namespace WeDevs\Dokan\Commission\Contracts;

/**
 * Interface CommissionInterface
 *
 * Handles the calculation of commissions, earnings, discounts, shipping, and gateway fees
 * for both admin and vendor in a marketplace environment.
 */
interface CommissionInterface
{
    /**
     * Get the discount amount provided by the admin.
     *
     * @return float
     */
    public function get_admin_discount(): float;

    /**
     * Get the discount amount provided by the vendor.
     *
     * @return float
     */
    public function get_vendor_discount(): float;

    /**
     * Calculate the admin's net commission.
     * Formula: (product price - vendor discount %) * admin commission % - admin discount
     *
     * @return float
     */
    public function get_admin_net_commission(): float;

    /**
     * Calculate the vendor's net earning.
     * Formula: order_item_total - admin_net_commission
     *
     * @return float
     */
    public function get_vendor_net_earning(): float;

    /**
     * Get the admin commission.
     * Returns the admin net commission when positive, otherwise zero.
     *
     * @return float
     */
    public function get_admin_commission(): float;

    /**
     * Calculate the vendor's total earning.
     * Formula: vendor_net_earning + vendor_shipping_fee - vendor_gateway_fee
     *
     * @return float
     */
    public function get_vendor_earning(): float;


    /**
     * Calculate the admin subsidy.
     * Returns the absolute value of admin net commission when negative, otherwise zero.
     *
     * @return float
     */
    public function get_admin_subsidy(): float;

}