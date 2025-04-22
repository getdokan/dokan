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
     * @var array $coupon_infos
     */
    protected array $coupon_infos = [];

    public function get_item(): WC_Order_Item {
        return $this->item;
    }

    public function set_item( WC_Order_Item $item ): void {
        $this->item = $item;

        // phpcs:ignore Universal.Operators.DisallowShortTernary.Found
        $this->coupon_infos = $this->item->get_meta( Coupon::DOKAN_COUPON_META_KEY, true ) ?: [];
    }

    public function get_order(): WC_Order {
        return $this->order;
    }

    /**
     * @return array
     */
    protected function get_coupon_infos(): array {
        return empty( $this->coupon_infos ) ? [] : $this->coupon_infos;
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

        $refund_amount = $this->order->get_total_refunded_for_item( $this->item->get_id() );
        $refund_qty = $this->order->get_qty_refunded_for_item( $this->item->get_id() );

        $item_price = apply_filters( 'dokan_earning_by_order_item_price', $this->item->get_subtotal(), $this->item, $this->order );
        $item_price = $refund_amount ? floatval( $item_price ) - floatval( $refund_amount ) : $item_price;

        $total_quantity = $this->item->get_quantity() +  $refund_qty;

        $strategy = apply_filters(
            'dokan_order_line_item_commission_strategies',
            new OrderItem( $this->item, $item_price, $total_quantity, $this->vendor_id )
        );

        /**
         * @var \WeDevs\Dokan\Commission\Model\Setting $settings
         */
        $settings = $strategy->get_settings();

        $this->set_price( $item_price );
        $this->set_quantity( $total_quantity );

        $commission_data = dokan_get_container()->get( Calculator::class )
            ->set_settings( $settings )
            ->set_subtotal( $item_price )
            ->set_quantity( $total_quantity )
            ->set_discount( new CouponInfo( $this->get_coupon_infos() ) )
            ->calculate();

        $parameters = $commission_data->get_parameters() ?? [];
        $percentage = $settings->get_percentage() ?? 0;
        $type       = $settings->get_type() ?? DefaultSetting::TYPE;
        $flat       = $settings->get_flat() ?? 0;

        // Saving commission data to line items for further reuse.
        ( new \WeDevs\Dokan\Commission\Settings\OrderItem(
            [
                'id'    => $this->item->get_id(),
                'price' => $item_price,
            ]
        ) )->save(
            [
                'commission_source'   => $settings->get_source(),
                'type'       => $type,
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

        $commission_settings_info = [
            'type' => $this->item->get_meta('_dokan_commission_type', true),
            'percentage' => $this->item->get_meta( '_dokan_commission_rate', true ),
            'flat' => $this->item->get_meta( '_dokan_additional_fee', true ),
        ];

        /**
         * Before dokan 3.14.0 version dokan did not save commission data in order item meta. When the commission is needed dokan use to calculate them.
         * But now dokan saves the commission data in order item meta. So we need to check if the commission data is available in order item meta or we need to calculate them for backward compatibility.
         */
        if ( empty( $commission_meta ) && ! is_array( $commission_meta ) ) {
            return $this->calculate();
        }

        error_log('order item commission meta: ' . print_r( $commission_meta, true ) );

        $commission_data = new Commission();
        $commission_data->set_admin_commission( $commission_data->get_admin_commission() + floatval( $commission_meta['admin_commission'] ?? 0 ) );
        $commission_data->set_net_admin_commission( $commission_data->get_net_admin_commission() + floatval( $commission_meta['net_admin_commission'] ?? 0 ) );
        $commission_data->set_admin_discount( $commission_data->get_admin_discount() + floatval( $commission_meta['admin_discount'] ?? 0 ) );
        $commission_data->set_per_item_admin_commission( floatval( $commission_meta['per_item_admin_commission'] ?? 0 ) );
        $commission_data->set_vendor_discount( $commission_data->get_vendor_discount() + floatval( $commission_meta['vendor_discount'] ?? 0 ) );
        $commission_data->set_vendor_earning( $commission_data->get_vendor_earning() + floatval( $commission_meta['vendor_earning'] ?? 0 ) );
        $commission_data->set_source( $commission_meta['source'] ?? DefaultStrategy::SOURCE );
        $commission_data->set_type( $commission_meta['type'] ?? '' );
        $commission_data->set_total_amount( $commission_meta['total_amount'] ?? 0 );
        $commission_data->set_total_quantity( $commission_meta['total_quantity'] ?? 0 );
        $commission_data->set_parameters( $commission_settings_info);

        return $commission_data;
    }
}
