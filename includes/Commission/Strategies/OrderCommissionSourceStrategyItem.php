<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\CommissionCalculatorFactory;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;
use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;

class OrderCommissionSourceStrategyItem extends AbstractCommissionSourceStrategy {
    private $order_item_id;
    private $product_price_to_calculate_commission;
    const SOURCE = 'order_item';

    public function __construct( $order_item_id, $product_price_to_calculate_commission ) {
        $this->order_item_id                         = $order_item_id;
        $this->product_price_to_calculate_commission = $product_price_to_calculate_commission;
    }

    public function get_source(): string {
        return self::SOURCE;
    }

    public function get_settings(): CommissionSettings {
        $commission_percentage = ! empty( $this->order_item_id ) ? wc_get_order_item_meta( $this->order_item_id, '_dokan_commission_rate', true ) : '';
        $commission_type = ! empty( $this->order_item_id ) ? wc_get_order_item_meta( $this->order_item_id, '_dokan_commission_type', true ) : '';
        $additional_flat  = ! empty( $this->order_item_id ) ? wc_get_order_item_meta( $this->order_item_id, '_dokan_additional_fee', true ) : '';

        /**
         * If `_dokan_item_total` returns `non-falsy` value that means, the request comes from the `order refund request`.
         * So modify `additional_fee` to the correct amount to get refunded. (additional_fee/item_total)*product_price.
         * Where `product_price` means item_total - refunded_total_for_item.
         *
         * To understand clearly, how and when these codes work and how dokan commission works, you can also go through dokan-lite previous codes as provided below.
         *
         * @see https://github.com/getdokan/dokan/blob/28888e6824d96747ed65004fbd6de80d0eee5161/includes/Commission.php#L629
         * @see https://github.com/getdokan/dokan/blob/28888e6824d96747ed65004fbd6de80d0eee5161/includes/Commission.php#L567-L653
         * @see https://github.com/getdokan/dokan/blob/28888e6824d96747ed65004fbd6de80d0eee5161/includes/Commission.php
         */
        $order_id = wc_get_order_id_by_order_item_id( $this->order_item_id );
        $item_total    = get_post_meta( $order_id, '_dokan_item_total', true );
        $product_price = (float) wc_format_decimal( $this->product_price_to_calculate_commission );
        if ( $order_id && $item_total ) {
            $additional_flat = ( $additional_flat / $item_total ) * $product_price;
        }

        return new CommissionSettings( $commission_type, $additional_flat, $commission_percentage );
    }
}
