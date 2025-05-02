<?php

namespace WeDevs\Dokan\Commission;

class CouponInfo {
    protected array $info = [];

    protected ?float $vendor_discount;
    protected ?float $admin_discount;

    public function __construct( array $info ) {
        $this->set_info( $info );
    }


    /**
     * @param array $info
     *
     * @return CouponInfo
     */
    public function set_info( array $info ): CouponInfo {
        $this->info = $info;

        return $this;
    }

    protected function populate() {
        $this->vendor_discount = 0.0;
        $this->admin_discount = 0.0;

        foreach ( $this->info as $single_coupon ) {
            $discount = $this->get_coupon_amount( $single_coupon );

            $this->vendor_discount += $discount['vendor'];
            $this->admin_discount += $discount['admin'];
        }
    }

    /**
     * @return float|null
     */
    public function get_vendor_discount(): ?float {
        if ( ! isset( $this->vendor_discount ) ) {
            $this->populate();
        }

        return $this->vendor_discount;
    }

    /**
     * @return float|null
     */
    public function get_total_discount(): ?float {
        return $this->get_vendor_discount() + $this->get_admin_discount();
    }

    /**
     * @return float|null
     */
    public function get_admin_discount(): ?float {
        if ( ! isset( $this->admin_discount ) ) {
            $this->populate();
        }

        return $this->admin_discount;
    }

    /**
     * Get the admin and vendor discount amount from a single coupon.
     *
     * @param array $coupon_info
     * @return array
     */
    protected function get_coupon_amount( array $coupon_info ): array {
        $admin_discount = 0.0;
        $vendor_discount = 0.0;

        $default = [
            'discount'                         => 0.0,
            'coupon_commissions_type'          => 'from_vendor',
            'admin_shared_coupon_type'         => 'percent',
            'admin_shared_coupon_amount'       => 0.0,
        ];

        $coupon_info = wp_parse_args( $coupon_info, $default );

        $discount_amount = floatval( $coupon_info['discount'] );

        switch ( $coupon_info['coupon_commissions_type'] ) {
            case 'default':
            case 'from_vendor':
                $vendor_discount = $discount_amount;
                break;
            case 'from_admin':
                $admin_discount = $discount_amount;
                break;
            case 'shared_coupon':
                if ( 'percentage' === $coupon_info['admin_shared_coupon_type'] ) {
                    $admin_discount = ( $discount_amount * floatval( $coupon_info['admin_shared_coupon_amount'] ) ) / 100;
                    $vendor_discount = $discount_amount - $admin_discount;
                } else {
                    $admin_discount = min( $discount_amount, floatval( $coupon_info['admin_shared_coupon_amount'] ) );
                    $vendor_discount = $discount_amount - $admin_discount;
                }
                break;
            default:
                $vendor_discount = $discount_amount;

                break;
        }

        return [
            'admin' => $admin_discount,
            'vendor' => $vendor_discount,
        ];
    }
}
