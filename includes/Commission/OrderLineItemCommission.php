<?php

namespace WeDevs\Dokan\Commission;

use WC_Order;
use WC_Order_Factory;
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
    protected array $dokan_coupon_infos;

    /**
     * OrderLineItemCommission constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param \WC_Order_Item $item
     * @param \WC_Order      $order
     */
    public function __construct( WC_Order_Item $item, WC_Order $order ) {
        $this->item  = $item;
        $this->order = $order;

        $this->vendor_id = (int) $this->order->get_meta( self::VENDOR_ID_META_KEY );

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

    /**
     * Calculate order line item commission.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Model\Commission|null
     */
    public function calculate(): Commission {
        $refund = $this->order->get_total_refunded_for_item( $this->item->get_id() );

        $item_price = apply_filters( 'dokan_earning_by_order_item_price', $this->item->get_subtotal(), $this->item, $this->order );
        $item_price = $refund ? floatval( $item_price ) - floatval( $refund ) : $item_price;

        $order_item_id    = $this->item->get_id();
        $total_quantity   = $this->item->get_quantity();
        $product_id       = $this->item->get_variation_id() ? $this->item->get_variation_id() : $this->item->get_product_id();
        $vendor_id        = $this->vendor_id;
        $category_id      = 0;

        // Todo: Product category may change after order is placed, may falfunction if product category is changed and recalculating order commission.
        // Todo: Expected solution can be save commission setting data in order item meta.
        // Todo: Need discussion multiple category selection.
        // Category commission will not applicable if 'Product Category Selection' is set as 'Multiple' in Dokan settings.
        $product_categories = Helper::get_saved_products_category( $product_id );
        $chosen_categories  = $product_categories['chosen_cat'];
        $category_id        = reset( $chosen_categories );
        $category_id        = $category_id ? $category_id : 0;

        $order_item_strategy = new OrderItem( $order_item_id, $item_price, $total_quantity );

        $strategies = [
            $order_item_strategy,
            new Product( $product_id ),
            new Vendor( $vendor_id, $category_id ),
            new GlobalStrategy( $category_id ),
            new DefaultStrategy(),
        ];

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
                'id'    => $order_item_id,
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
     */
    public function retrieve(): Commission {
        $commission_data = new Commission();
        $commission_meta = $this->item->get_meta( 'dokan_commission_meta', true );

        $commission_data->set_admin_commission( $commission_data->get_admin_commission() + floatval( $commission_meta['admin_commission'] ?? 0 ) );
        $commission_data->set_net_admin_commission( $commission_data->get_net_admin_commission() + floatval( $commission_meta['admin_net_commission'] ?? 0 ) );
        $commission_data->set_admin_discount( $commission_data->get_admin_discount() + floatval( $commission_meta['admin_discount'] ?? 0 ) );
        $commission_data->set_admin_subsidy( $commission_data->get_admin_subsidy() + floatval( $commission_meta['admin_subsidy'] ?? 0 ) );
        $commission_data->set_vendor_discount( $commission_data->get_vendor_discount() + floatval( $commission_meta['vendor_discount'] ?? 0 ) );
        $commission_data->set_vendor_earning( $commission_data->get_vendor_earning() + floatval( $commission_meta['vendor_earning'] ?? 0 ) );
        $commission_data->set_net_vendor_earning( $commission_data->get_net_vendor_earning() + floatval( $commission_meta['vendor_net_earning'] ?? 0 ) );

        // Todo: need to set source.
		//        $commission_data->set_source( $commission_meta->get_source() ?? 0 );

        return $commission_data;
    }

    public function additional_adjustments( Commission $commission_data ): Commission {
        $admin_net_commission = 0;
        $vendor_net_earning = 0;

        /**
         * @var DokanOrderLineItemCouponInfo[] $dokan_coupon_info
         */
        $dokan_coupon_info = $this->item->get_meta( '_dokan_coupon_info', true );

        if ( ! $dokan_coupon_info || ! is_array( $dokan_coupon_info ) ) {
            return $commission_data;
        }

        $line_item_coupon_array = [];
        if ( ! empty( $dokan_coupon_info ) && is_array( $dokan_coupon_info ) ) {
            foreach ( $dokan_coupon_info as $coupon_code => $coupon_meta ) {
                $coupon_line_item = new DokanOrderLineItemCouponInfo();
                $coupon_line_item->set_coupon_info( $coupon_meta );

                $line_item_coupon_array[] = $coupon_line_item;
            }
        }

        foreach ( $line_item_coupon_array as $dokan_coupon_info ) {
            $commission_params     = $commission_data->get_parameters();
            $flat                  = $commission_params['flat'] ?? 0;
            $percent               = $commission_params['percentage'] ?? 0;
            $admin_commission_rate = $flat + ( $percent / 100 );

            $admin_net_commission += ( ( $commission_data->get_total_amount() - $dokan_coupon_info->get_vendor_discount() ) * $admin_commission_rate ) - $dokan_coupon_info->get_admin_discount();
            $vendor_net_earning += floatval( $this->item->get_total() ) - $admin_net_commission;

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
