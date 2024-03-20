<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator;
use WeDevs\Dokan\Commission\CommissionCalculatorFactory;
use WeDevs\Dokan\Commission\Utils\CommissionSettings;
use WeDevs\Dokan\Commission\Calculators\CommissionCalculatorInterface;

/**
 * If an order has been purchased previously, calculate the earning with the previously stated commission rate.
 * It's important cause commission rate may get changed by admin during the order table `re-generation`.
 */
class OrderItemCommissionSourceStrategy extends AbstractCommissionSourceStrategy {

    /**
     * Order item commission strategy source.
     *
     * @since DOKAN_SINCE
     */
    const SOURCE = 'order_item';

    /**
     * Order item id.
     *
     * @since DOKAN_SINCE
     *
     * @var mixed|string $order_item_id
     */
    private $order_item_id;

    /**
     * Total price amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|mixed $product_price_to_calculate_commission
     */
    private $product_price_to_calculate_commission;

    /**
     * Total order quantity.
     *
     * @since DOKAN_SINCE
     *
     * @var int|mixed $total_order_item_quantity
     */
    private $total_order_item_quantity;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param int|string $order_item_id
     * @param int|float  $product_price_to_calculate_commission
     * @param int        $total_order_item_quantity
     *
     * @return void
     */
    public function __construct( $order_item_id = '', $product_price_to_calculate_commission = 0, $total_order_item_quantity = 1 ) {
        $this->order_item_id                         = $order_item_id;
        $this->product_price_to_calculate_commission = $product_price_to_calculate_commission;
        $this->total_order_item_quantity             = $total_order_item_quantity;
    }

    /**
     * Returns order item strategy source.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns order item commission settings.
     *
     * @since DOKAN_SINCE
     *
     * @return \WeDevs\Dokan\Commission\Utils\CommissionSettings
     */
    public function get_settings(): CommissionSettings {
        $commission_percentage = '';
        $commission_type       = '';
        $additional_flat       = '';
        $commission_meta       = [];

        if ( ! empty( $this->order_item_id ) ) {
            $commission_percentage = wc_get_order_item_meta( $this->order_item_id, '_dokan_commission_rate', true ) ?? '';
            $commission_type       = wc_get_order_item_meta( $this->order_item_id, '_dokan_commission_type', true ) ?? '';
            $additional_flat       = wc_get_order_item_meta( $this->order_item_id, '_dokan_additional_fee', true ) ?? '';
            $commission_meta       = wc_get_order_item_meta( $this->order_item_id, 'dokan_commission_meta', true );

            $commission_meta = empty( $commission_meta ) ? [] : $commission_meta;
        }

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
        $order_id      = wc_get_order_id_by_order_item_id( $this->order_item_id );
        $item_total    = get_post_meta( $order_id, '_dokan_item_total', true );
        $product_price = (float) wc_format_decimal( $this->product_price_to_calculate_commission );
        if ( $order_id && $item_total ) {
            $additional_flat = ( $additional_flat / $item_total ) * $product_price;
        }

        $settings = new CommissionSettings();
        $settings->set_type( $commission_type )
                ->set_flat( $additional_flat )
                ->set_percentage( $commission_percentage )
                ->set_meta_data( $commission_meta );

        if ( $commission_type === CategoryBasedCommissionCalculator::SOURCE && isset( $commission_meta['parameters']['category_id'] ) ) {
            $settings->set_category_id( $commission_meta['parameters']['category_id'] );
            $settings->set_category_commissions(
                [
                    'all'   => [],
                    'items' => [
                        $settings->get_category_id() => [
                            'flat'       => $settings->get_flat(),
                            'percentage' => $settings->get_percentage(),
                        ],
                    ],
                ]
            );
        } else {
            $settings->set_category_commissions(
                [
                    'all'   => [
                        'flat'       => $settings->get_flat(),
                        'percentage' => $settings->get_percentage(),
                    ],
                    'items' => [],
                ]
            );
        }

        return $settings;
    }

    /**
     * Save order item commission meta data.
     *
     * @since DOKAN_SINCE
     *
     * @param string    $type
     * @param int|float $percentage
     * @param int|float $flat
     * @param array     $meta_data
     *
     * @return void
     */
    public function save_line_item_commission_to_meta( $type, $percentage, $flat, $meta_data ) {
        if ( empty( $this->order_item_id ) ) {
            return;
        }

        wc_add_order_item_meta( $this->order_item_id, '_dokan_commission_type', $type );
        wc_add_order_item_meta( $this->order_item_id, '_dokan_commission_rate', $percentage );
        wc_add_order_item_meta( $this->order_item_id, '_dokan_additional_fee', $flat );
        wc_add_order_item_meta( $this->order_item_id, 'dokan_commission_meta', $meta_data );
    }
}
