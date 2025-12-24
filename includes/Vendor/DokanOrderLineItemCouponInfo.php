<?php

namespace WeDevs\Dokan\Vendor;

class DokanOrderLineItemCouponInfo {

    private $discount                         = 0;
    private $coupon_code                      = '';
    private $per_qty_amount                   = 0;
    private $quantity                         = 0;
    private $admin_coupons_enabled_for_vendor = '';

    /**
     * Expected types are 'from_vendor' or 'from_admin' or 'shared' or ''
     * @var string Coupon commission type
     */
    private $coupon_commissions_type          = '';
    private $admin_shared_coupon_type         = '';
    private $admin_shared_coupon_amount       = '';
    private bool $subsidy_supported           = true;

    /**
     * Check if subsidy is supported
     *
     * @since 4.0.0
     *
     * @return bool
     */
    public function is_subsidy_supported(): bool {
        return $this->subsidy_supported;
    }

    /**
     * Set subsidy supported
     *
     * @since 4.0.0
     *
     * @param bool $subsidy_supported
     *
     * @return void
     */
    public function set_subsidy_supported( bool $subsidy_supported ): void {
        $this->subsidy_supported = $subsidy_supported;
    }

    /**
     * Get coupon info
     *
     * @since 4.0.0
     *
     * @return array
     */
    public function get_coupon_info(): array {
        return [
            'discount'                         => $this->get_discount(),
            'coupon_code'                      => $this->get_coupon_code(),
            'per_qty_amount'                   => $this->get_per_qty_amount(),
            'quantity'                         => $this->get_quantity(),
            'admin_coupons_enabled_for_vendor' => $this->get_admin_coupons_enabled_for_vendor(),
            'coupon_commissions_type'          => $this->get_coupon_commissions_type(),
            'admin_shared_coupon_type'         => $this->get_admin_shared_coupon_type(),
            'admin_shared_coupon_amount'       => $this->get_admin_shared_coupon_amount(),
            'subsidy_supported'                => $this->is_subsidy_supported(),
        ];
    }

    /**
     * Set coupon info
     *
     * @since 4.0.0
     *
     * @param $coupon_info
     *
     * @return $this
     */
    public function set_coupon_info( $coupon_info ): self {
        $this->set_discount( $coupon_info['discount'] ?? 0 );
        $this->set_coupon_code( $coupon_info['coupon_code'] ?? '' );
        $this->set_per_qty_amount( $coupon_info['per_qty_amount'] ?? 0 );
        $this->set_quantity( $coupon_info['quantity'] ?? 0 );
        $this->set_admin_coupons_enabled_for_vendor( $coupon_info['admin_coupons_enabled_for_vendor'] ?? '' );
        $this->set_coupon_commissions_type( $coupon_info['coupon_commissions_type'] ?? '' );
        $this->set_admin_shared_coupon_type( $coupon_info['admin_shared_coupon_type'] ?? '' );
        $this->set_admin_shared_coupon_amount( $coupon_info['admin_shared_coupon_amount'] ?? '' );

        return $this;
    }

    /**
     * Get discount amount
     *
     * @since 4.0.0
     *
     * @return float
     */
    public function get_discount(): float {
        return $this->discount;
    }

    /**
     * Set discount amount
     *
     * @since 4.0.0
     *
     * @param float $discount
     *
     * @return $this
     */
    public function set_discount( float $discount ): self {
        $this->discount = $discount;

        return $this;
    }

    /**
     * Get coupon code
     *
     * @since 4.0.0
     *
     * @return string
     */
    public function get_coupon_code(): string {
        return $this->coupon_code;
    }

    /**
     * Set coupon code
     *
     * @since 4.0.0
     *
     * @param string $coupon_code
     *
     * @return $this
     */
    public function set_coupon_code( string $coupon_code ): self {
        $this->coupon_code = $coupon_code;

        return $this;
    }

    /**
     * Get per qty amount
     *
     * @since 4.0.0
     *
     * @return float
     */
    public function get_per_qty_amount(): float {
        return floatval( $this->per_qty_amount );
    }

    /**
     * Set per qty amount
     *
     * @since 4.0.0
     *
     * @param float $per_qty_amount
     *
     * @return $this
     */
    public function set_per_qty_amount( int $per_qty_amount ): self {
        $this->per_qty_amount = $per_qty_amount;

        return $this;
    }

    /**
     * Get quantity
     *
     * @since 4.0.0
     *
     * @return int
     */
    public function get_quantity(): int {
        return $this->quantity;
    }

    /**
     * Set quantity
     *
     * @since 4.0.0
     *
     * @param int $quantity
     *
     * @return $this
     */
    public function set_quantity( int $quantity ): self {
        $this->quantity = $quantity;

        return $this;
    }

    /**
     * Get admin coupons enabled for vendor
     *
     * @since 4.0.0
     *
     * @return string
     */
    public function get_admin_coupons_enabled_for_vendor(): string {
        return $this->admin_coupons_enabled_for_vendor;
    }

    /**
     * Set admin coupons enabled for vendor
     *
     * @since 4.0.0
     *
     * @param string $admin_coupons_enabled_for_vendor
     *
     * @return $this
     */
    public function set_admin_coupons_enabled_for_vendor( string $admin_coupons_enabled_for_vendor ): self {
        $this->admin_coupons_enabled_for_vendor = $admin_coupons_enabled_for_vendor;

        return $this;
    }

    /**
     * Get coupon commissions type
     *
     * @since 4.0.0
     *
     * @return string
     */
    public function get_coupon_commissions_type(): string {
        return $this->coupon_commissions_type;
    }

    /**
     * Set coupon commissions type
     *
     * @since 4.0.0
     *
     * @param string $coupon_commissions_type
     *
     * @return $this
     */
    public function set_coupon_commissions_type( string $coupon_commissions_type ): self {
        $this->coupon_commissions_type = $coupon_commissions_type;

        return $this;
    }

    /**
     * Get admin shared coupon type
     *
     * @since 4.0.0
     *
     * @return string
     */
    public function get_admin_shared_coupon_type(): string {
        if ( ! $this->is_subsidy_supported() && $this->admin_shared_coupon_type === 'default') {
            $this->admin_shared_coupon_type = 'vendor';
        }

        return $this->admin_shared_coupon_type;
    }

    /**
     * Set admin shared coupon type
     *
     * @since 4.0.0
     *
     * @param string $admin_shared_coupon_type
     *
     * @return $this
     */
    public function set_admin_shared_coupon_type( string $admin_shared_coupon_type ): self {
        $this->admin_shared_coupon_type = $admin_shared_coupon_type;

        return $this;
    }

    /**
     * Get admin shared coupon amount
     *
     * @since 4.0.0
     *
     * @return string
     */
    public function get_admin_shared_coupon_amount(): string {
        return $this->admin_shared_coupon_amount;
    }

    public function set_admin_shared_coupon_amount( string $admin_shared_coupon_amount ): self {
        $this->admin_shared_coupon_amount = $admin_shared_coupon_amount;

        return $this;
    }

    /**
     * Get vendor discount
     *
     * @since 4.0.0
     *
     * @return float
     */
    public function get_vendor_discount() {
        /**
         * if $this->coupon_commissions_type is `from_vendor` or `default` or empty, then vendor will get the full discount
         */
        $discount = $this->get_discount();

        return apply_filters( 'dokan_get_vendor_portion_amount_of_coupon_discount', $discount, $this );
    }

    /**
     * Get admin discount
     *
     * @since 4.0.0
     *
     * @return float
     */
    public function get_admin_discount() {
        $vendor_portion = $this->get_vendor_discount();

        return apply_filters( 'dokan_get_admin_portion_amount_of_coupon_discount', $this->get_discount() - $vendor_portion, $this );
    }
}
