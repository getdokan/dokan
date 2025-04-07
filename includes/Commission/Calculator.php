<?php

namespace WeDevs\Dokan\Commission;

use WC_Order_Factory;
use WeDevs\Dokan\Commission\Strategies\AbstractStrategy;
use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Strategies\OrderItem;
use WeDevs\Dokan\Vendor\DokanOrderLineItemCouponInfo;

/**
 * Calculates and returns commission
 *
 * @since 3.14.0
 */
class Calculator {

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
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param AbstractStrategy[] $strategies
     */
    public function __construct( array $strategies ) {
        $this->strategies = $strategies;

        foreach ( $this->strategies as $strategy ) {
            $formula = $strategy->create_formula();
            if ( $formula->is_applicable() ) {
                $this->strategy = $strategy;
                $this->formula  = $formula;

                break;
            }
        }
    }

    /**
     * Returns applied commission data
     *
     * @since 3.14.0
     *
     * @param int|float $total_amount
     * @param int       $total_quantity
     * @param DokanOrderLineItemCouponInfo[] $dokan_coupon_infos
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function calculate_commission( $total_amount, $total_quantity = 1, $dokan_coupon_infos = [] ): Commission {
        if ( ! is_numeric( $total_quantity ) || $total_quantity < 1 ) {
            $total_quantity = 1;
        }

        if ( ! is_numeric( $total_amount ) ) {
            $total_quantity = 0;
        }

        $commission_data = new Commission();
        $commission_data->set_vendor_earning( $total_amount )
            ->set_total_quantity( $total_quantity )
            ->set_total_amount( $total_amount );

        if ( ! is_null( $this->strategy ) ) {
            $this->formula->set_amount( $total_amount )
                ->set_quantity( $total_quantity )
                ->calculate();

            $commission_data->set_source( $this->strategy->get_source() )
                ->set_per_item_admin_commission( $this->formula->get_per_item_admin_commission() )
                ->set_admin_commission( $this->formula->get_admin_commission() )
                ->set_net_admin_commission( $this->formula->get_admin_commission() )
                ->set_vendor_earning( $this->formula->get_vendor_earning() )
                ->set_net_vendor_earning( $this->formula->get_vendor_earning() )
                ->set_total_quantity( $this->formula->get_items_total_quantity() )
                ->set_total_amount( $total_amount )
                ->set_type( $this->formula->get_source() )
                ->set_parameters( $this->formula->get_parameters() );

            if ( $this->strategy->get_source() === OrderItem::SOURCE && ! empty( $dokan_coupon_infos ) ) {
                $order_item_id = $this->strategy->get_order_item_id();

                /**
                 * @var \WC_Order_Item_Product $item
                 */
                $item = WC_Order_Factory::get_order_item( $order_item_id );

                return $this->adjust_commission_with_coupon_discounts( $dokan_coupon_infos, $item->get_total(), $commission_data );
            }

            return $commission_data;
        }

        // If no commission is defined at any level.
        return $commission_data;
    }

    /**
     * Calculate commission with coupon discounts.
     *
     * @since DOKAN_SINCE
     *
     * @param DokanOrderLineItemCouponInfo[] $dokan_coupon_infos
     * @param float|int $item_price_after_discount
     * @param Commission $commission_data
     *
     * @return void
     */
    protected function adjust_commission_with_coupon_discounts( $dokan_coupon_infos, $item_price_after_discount, $commission_data ): Commission {
        $admin_net_commission = 0;
        $vendor_net_earning = 0;

        foreach ( $dokan_coupon_infos as $dokan_coupon_info ) {
            $commission_params     = $commission_data->get_parameters();
            $flat                  = $commission_params['flat'] ?? 0;
            $percent               = $commission_params['percentage'] ?? 0;
            $admin_commission_rate = $flat + ( $percent / 100 );

            $admin_net_commission += ( ( $commission_data->get_total_amount() - $dokan_coupon_info->get_vendor_discount() ) * $admin_commission_rate ) - $dokan_coupon_info->get_admin_discount();
            $vendor_net_earning += floatval( $item_price_after_discount ) - $admin_net_commission;

            $commission_data->set_vendor_discount( $commission_data->get_vendor_discount() + $dokan_coupon_info->get_vendor_discount() );
            $commission_data->set_admin_discount( $commission_data->get_admin_discount() + $dokan_coupon_info->get_admin_discount() );
        }

        $commission_data->set_net_admin_commission( $admin_net_commission );
        $commission_data->set_admin_commission( $admin_net_commission );
        $commission_data->set_net_vendor_earning( $vendor_net_earning );
        $commission_data->set_per_item_admin_commission( $admin_net_commission / $commission_data->get_total_quantity() );

        if ( $commission_data->get_net_admin_commission() < 0 ) {
            $commission_data->set_admin_subsidy( abs( $commission_data->get_net_admin_commission() ) );
            $commission_data->set_admin_commission( 0 );
            $commission_data->set_per_item_admin_commission( 0 );
        }

        return $commission_data;
    }
}
