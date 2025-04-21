<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Item;
use WeDevs\Dokan\Commission\Model\Commission;
use WeDevs\Dokan\Commission\Settings\DefaultSetting;
use WeDevs\Dokan\Commission\Strategies\DefaultStrategy;
use WeDevs\Dokan\Commission\Strategies\GlobalStrategy;
use WeDevs\Dokan\Commission\Strategies\OrderItem;
use WeDevs\Dokan\Commission\Strategies\Product;
use WeDevs\Dokan\Commission\Strategies\Vendor;
use WeDevs\Dokan\ProductCategory\Helper;
use WeDevs\Dokan\Vendor\Coupon;
use WeDevs\Dokan\Vendor\DokanOrderLineItemCouponInfo;

/**
 * Class OrderLineItemCommission - Calculate order line item commission
 *
 * @since DOKAN_SINCE
 */
class OrderLineItemCommission extends AbstractCommissionCalculator {

    protected WC_Order_Item $item;
    const VENDOR_ID_META_KEY = '_dokan_vendor_id';
    protected WC_Order $order;
    protected int $vendor_id;
    /**
     * @var DokanOrderLineItemCouponInfo[] $dokan_coupon_infos
     */
    protected array $dokan_coupon_infos;

    public function get_item(): WC_Order_Item {
        return $this->item;
    }

    public function set_item( WC_Order_Item $item ): void {
        $this->item = $item;

        $dokan_coupon_info = $this->item->get_meta( Coupon::DOKAN_COUPON_META_KEY, true );
        /**
         * Prepare coupon info for commission calculation.
         *
         * @since DOKAN_SINCE
         *
         * @var DokanOrderLineItemCouponInfo[] $dokan_coupon_infos
         */
        $this->dokan_coupon_infos = [];
        if ( ! empty( $dokan_coupon_info ) && is_array( $dokan_coupon_info ) ) {
            foreach ( $dokan_coupon_info as $coupon_code => $coupon_meta ) {
                $coupon_line_item = new DokanOrderLineItemCouponInfo();
                $coupon_line_item->set_coupon_info( $coupon_meta );

                $this->dokan_coupon_infos[] = $coupon_line_item;
            }
        }
    }

    public function get_order(): WC_Order {
        return $this->order;
    }

    public function set_order( WC_Order $order ): void {
        $this->order = $order;
        $this->vendor_id = (int) $this->order->get_meta( self::VENDOR_ID_META_KEY );
    }

    /**
     * Calculate order line item commission.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission|null
     */
    public function calculate(): Commission {
        if ( ! $this->item ) {
            throw new \Exception( esc_html__( 'Order item is required for order item commission calculation.', 'dokan-lite' ) );
        }

        if ( ! $this->order ) {
            throw new \Exception( esc_html__( 'Order is required for order item commission calculation.', 'dokan-lite' ) );
        }

        $refund = $this->order->get_total_refunded_for_item( $this->item->get_id() );

        $item_price = apply_filters( 'dokan_earning_by_order_item_price', $this->item->get_subtotal(), $this->item, $this->order );
        $item_price = $refund ? floatval( $item_price ) - floatval( $refund ) : $item_price;

        $total_quantity   = $this->item->get_quantity();
        $product_id       = $this->item->get_variation_id() ? $this->item->get_variation_id() : $this->item->get_product_id();
        $vendor_id        = $this->vendor_id;
        $category_id      = 0;

        // Category commission will not applicable if 'Product Category Selection' is set as 'Multiple' in Dokan settings.
        $product_categories = Helper::get_saved_products_category( $product_id );
        $chosen_categories  = $product_categories['chosen_cat'];
        $category_id        = reset( $chosen_categories );
        $category_id        = $category_id ? $category_id : 0;

        $strategies = apply_filters(
            'dokan_order_line_item_commission_strategies', [
                new OrderItem( $this->item->get_id(), $item_price, $total_quantity ),
                new Product( $product_id ),
                new Vendor( $vendor_id, $category_id ),
                new GlobalStrategy( $category_id ),
                new DefaultStrategy(),
            ]
        );

        $this->determine_strategy_to_apply( $strategies );
        $this->set_price( $item_price );
        $this->set_quantity( $total_quantity );

        $commission_data = $this->calculate_commission();

        $parameters = $commission_data->get_parameters() ?? [];
        $percentage = $parameters['percentage'] ?? 0;
        $flat       = $parameters['flat'] ?? 0;

        // Saving commission data to line items for further reuse.
        ( new \WeDevs\Dokan\Commission\Settings\OrderItem(
            [
                'id'    => $this->item->get_id(),
                'price' => $item_price,
            ]
        ) )->save(
            [
                'type'       => $commission_data->get_type() ?? DefaultSetting::TYPE,
                'percentage' => $percentage,
                'flat'       => $flat,
                'meta_data'  => $commission_data->get_data()  ,
            ]
        );

        return $commission_data;
    }

    /**
     * Retrieve commission data from order item meta.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     *
     * @throw \Exception
     */
    public function get(): Commission {
        if ( ! $this->item ) {
            throw new \Exception( esc_html__( 'Order item is required to get order item commission.', 'dokan-lite' ) );
        }

        /**
         * @var \WeDevs\Dokan\Commission\Model\Commission $commission_data
         */
        $commission_meta = $this->item->get_meta( 'dokan_commission_meta', true );

        /**
         * Before dokan 3.14.0 version dokan did not save commission data in order item meta. When the commission is needed dokan use to calculate them.
         * But now dokan saves the commission data in order item meta. So we need to check if the commission data is available in order item meta or we need to calculate them for backward compatibility.
         */
        if ( empty( $commission_meta ) && ! is_array( $commission_meta ) ) {
            return $this->calculate();
        }

        $commission_data = new Commission();
        $commission_data->set_admin_commission( $commission_data->get_admin_commission() + floatval( $commission_meta['admin_commission'] ?? 0 ) );
        $commission_data->set_net_admin_commission( $commission_data->get_net_admin_commission() + floatval( $commission_meta['net_admin_commission'] ?? 0 ) );
        $commission_data->set_admin_discount( $commission_data->get_admin_discount() + floatval( $commission_meta['admin_discount'] ?? 0 ) );
        $commission_data->set_admin_subsidy( $commission_data->get_admin_subsidy() + floatval( $commission_meta['admin_subsidy'] ?? 0 ) );
        $commission_data->set_per_item_admin_commission( floatval( $commission_meta['per_item_admin_commission'] ?? 0 ) );
        $commission_data->set_vendor_discount( $commission_data->get_vendor_discount() + floatval( $commission_meta['vendor_discount'] ?? 0 ) );
        $commission_data->set_vendor_earning( $commission_data->get_vendor_earning() + floatval( $commission_meta['vendor_earning'] ?? 0 ) );
        $commission_data->set_net_vendor_earning( $commission_data->get_net_vendor_earning() + floatval( $commission_meta['net_vendor_earning'] ?? 0 ) );
        $commission_data->set_source( $commission_meta['source'] ?? DefaultStrategy::SOURCE );
        $commission_data->set_type( $commission_meta['type'] ?? '' );
        $commission_data->set_total_amount( $commission_meta['total_amount'] ?? 0 );
        $commission_data->set_total_quantity( $commission_meta['total_quantity'] ?? 0 );
        $commission_data->set_parameters( $commission_meta['parameters'] ?? [] );

        return $commission_data;
    }

    /**
     * Additional adjustments for commission calculation.
     *
     * @since DOKAN_SINCE
     *
     * @param \WeDevs\Dokan\Commission\Model\Commission $commission_data
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission
     */
    public function additional_adjustments( Commission $commission_data ): Commission {
        $this->dokan_coupon_infos = apply_filters( 'adjust_commission_with_backward_compatibility_coupon_for_line_item', $this->dokan_coupon_infos, $commission_data, $this->order, $this->item );

        if ( empty( $this->dokan_coupon_infos ) ) {
			return $commission_data;
        }

        $admin_net_commission = 0.0;
        $vendor_net_earning = 0.0;

        foreach ( $this->dokan_coupon_infos as $dokan_coupon_info ) {
            $commission_params     = $commission_data->get_parameters();
            $flat                  = floatval( $commission_params['flat'] ?? 0 );
            $percent               = intval( $commission_params['percentage'] ?? 0 );

            if ( $flat > 0 ) {
                $per_item_percentage       = $percent > 0 ? $commission_data->get_total_amount() / $percent : 0;
                $per_item_flat             = $flat;
                $total_per_item_percentage = $per_item_percentage + $per_item_flat;
                $admin_commission_rate     = $total_per_item_percentage / $commission_data->get_total_amount();
            } else {
                $admin_commission_rate = $percent / 100;
            }

            /**
             * Check if the line item is subsidy supported or the coupon type is default or empty.
             */
            if ( $dokan_coupon_info->is_subsidy_supported() || in_array( $dokan_coupon_info->get_coupon_commissions_type(), [ 'default', '' ], true ) ) {
                /**
                 * Calculate admin commission and vendor earning based on the coupon type.
                 * @see https://github.com/getdokan/plugin-internal-tasks/issues/198#issuecomment-2608895467
                 *
                 *  (100-10)*(10/100)-0
                 */
                $admin_net_commission += ( ( $commission_data->get_total_amount() - $dokan_coupon_info->get_vendor_discount() ) * $admin_commission_rate ) - $dokan_coupon_info->get_admin_discount();
                $vendor_net_earning += floatval( $this->item->get_total() ) - $admin_net_commission;
            } else {
                /**
                 * Calculate admin commission and vendor earning based on the coupon type.
                 */
                $current_admin_net_commission = ( $commission_data->get_total_amount() * $admin_commission_rate ) - $dokan_coupon_info->get_admin_discount();
                $admin_net_commission += $current_admin_net_commission < 0 ? 0 : $current_admin_net_commission;
                $vendor_net_earning += floatval( $this->item->get_subtotal() - $dokan_coupon_info->get_vendor_discount() - $dokan_coupon_info->get_admin_discount() ) - abs( $admin_net_commission );
            }

            $commission_data->set_vendor_discount( $commission_data->get_vendor_discount() + $dokan_coupon_info->get_vendor_discount() );
            $commission_data->set_admin_discount( $commission_data->get_admin_discount() + $dokan_coupon_info->get_admin_discount() );
        }

        $commission_data->set_net_admin_commission( $admin_net_commission );
        $commission_data->set_admin_commission( $admin_net_commission );
        $commission_data->set_per_item_admin_commission( $admin_net_commission / $commission_data->get_total_quantity() );

        $commission_data->set_net_vendor_earning( $vendor_net_earning );

        // If the admin commission is negative, set it to 0 and set the admin subsidy.
        if ( $commission_data->get_net_admin_commission() < 0 ) {
            $commission_data->set_admin_subsidy( abs( $commission_data->get_net_admin_commission() ) );
            $commission_data->set_admin_commission( 0 );
            $commission_data->set_per_item_admin_commission( 0 );
        }

        return $commission_data;
    }
}
