<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Commission\Settings\Builder;

/**
 * If an order has been purchased previously, calculate the earning with the previously stated commission rate.
 * It's important cause commission rate may get changed by admin during the order table `re-generation`.
 */
class OrderItem extends AbstractStrategy {

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
    protected $order_item_id;

    /**
     * Total price amount.
     *
     * @since DOKAN_SINCE
     *
     * @var int|mixed $product_price_to_calculate_commission
     */
    protected $product_price_to_calculate_commission;

    /**
     * Total order quantity.
     *
     * @since DOKAN_SINCE
     *
     * @var int|mixed $total_order_item_quantity
     */
    protected $total_order_item_quantity;

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
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get_settings(): Setting {
        $settings = Builder::build(
            Builder::TYPE_ORDER_ITEM,
            [
                'id' => $this->order_item_id,
                'price' => $this->product_price_to_calculate_commission,
            ]
        );

        return $settings->get();
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
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function save_line_item_commission_to_meta( $type, $percentage, $flat, $meta_data ) {
        $settings = Builder::build(
            Builder::TYPE_ORDER_ITEM,
            [
                'id'    => $this->order_item_id,
                'price' => $this->product_price_to_calculate_commission,
            ]
        );

        return $settings->save(
            [
                'type'       => $type,
                'percentage' => $percentage,
                'flat'       => $flat,
                'meta_data'  => $meta_data  ,
            ]
        );
    }
}
