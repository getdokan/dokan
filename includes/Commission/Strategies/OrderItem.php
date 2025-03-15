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
     * @since 3.14.0
     */
    const SOURCE = 'order_item';

    /**
     * Order item id.
     *
     * @since 3.14.0
     *
     * @var mixed|string $order_item_id
     */
    protected $order_item_id;

    /**
     * Total price amount.
     *
     * @since 3.14.0
     *
     * @var int|mixed $total_amount
     */
    protected $total_amount;

    /**
     * Total order quantity.
     *
     * @since 3.14.0
     *
     * @var int|mixed $total_quantity
     */
    protected $total_quantity;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param int|string $order_item_id
     * @param int|float  $total_amount
     * @param int        $total_quantity
     *
     * @return void
     */
    public function __construct( $order_item_id = '', $total_amount = 0, $total_quantity = 1 ) {
        $this->order_item_id             = $order_item_id;
        $this->total_amount              = $total_amount;
        $this->total_quantity = $total_quantity;
    }

    /**
     * Returns order item strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * Returns order item commission settings.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get_settings(): Setting {
        $settings = Builder::build(
            Builder::TYPE_ORDER_ITEM,
            [
                'id' => $this->order_item_id,
                'price' => $this->total_amount,
            ]
        );

        return $settings->get();
    }

    /**
     * Save order item commission meta data.
     *
     * @since 3.14.0
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
                'price' => $this->total_amount,
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
