<?php

namespace WeDevs\Dokan\Commission\Model;

use WeDevs\Dokan\Commission\Contracts\CommissionInterface;

class Commission implements CommissionInterface {
    protected float $admin_net_commission;
    /**
     * Vendor Earning without subsidy.
     *
     * @var float
     */
    protected float $vendor_net_earning;

    protected float $admin_discount;
    protected float $vendor_discount;

    protected Setting $settings;

    /**
     * Constructor to initialize the Commission object.
     *
     * @param Setting $settings The commission settings.
     */
    public function set_settings( Setting $settings ): self {
        $this->settings = $settings;

        return $this;
    }

    public function get_settings(): Setting {
        return $this->settings;
    }

    /**
     * Set the admin's net commission.
     *
     * @param float $admin_net_commission The net commission amount for the admin.
     * @return self
     */
    public function set_admin_net_commission( float $admin_net_commission ): self {
        $this->admin_net_commission = $admin_net_commission;

        return $this;
    }

    /**
     * Get the admin's net commission.
     *
     * @return float The net commission amount for the admin.
     */
    public function get_admin_net_commission(): float {
        return $this->admin_net_commission ?? 0;
    }

    /**
     * Set the vendor's net earning.
     *
     * @param float $vendor_earning The earning amount for the vendor.
     * @return self
     */
    public function set_vendor_net_earning( float $vendor_earning ): self {
        $this->vendor_net_earning = $vendor_earning;

        return $this;
    }

    /**
     * Get the vendor's net earning.
     *
     * @return float The net earning amount for the vendor.
     */
    public function get_vendor_net_earning(): float {
        return $this->vendor_net_earning ?? 0;
    }

    /**
     * Set the admin's discount.
     *
     * @param float $admin_discount The discount amount for the admin.
     * @return self
     */
    public function set_admin_discount( float $admin_discount ): self {
        $this->admin_discount = $admin_discount;

        return $this;
    }

    /**
     * Get the admin's discount.
     *
     * @return float The discount amount for the admin.
     */
    public function get_admin_discount(): float {
        return $this->admin_discount ?? 0;
    }

    /**
     * Set the vendor's discount.
     *
     * @param float $vendor_discount The discount amount for the vendor.
     * @return self
     */
    public function set_vendor_discount( float $vendor_discount ): self {
        $this->vendor_discount = $vendor_discount;

        return $this;
    }

    /**
     * Get the vendor's discount.
     *
     * @return float The discount amount for the vendor.
     */
    public function get_vendor_discount(): float {
        return $this->vendor_discount ?? 0;
    }

    public function get_vendor_earning(): float {
        return $this->get_vendor_net_earning();
    }

    public function get_admin_commission(): float {
        return max( $this->get_admin_net_commission(), 0 );
    }

    public function get_admin_subsidy(): float {
        return abs( min( $this->get_admin_net_commission(), 0 ) );
    }

    /**
     * Get the commission type.
     *
     * @since 4.0.2
     *
     * @return string The commission type.
     */

    public function get_type(): string {
        return $this->get_settings()->get_type();
    }
}
