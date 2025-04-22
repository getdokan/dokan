<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Model\Setting;

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
    const SOURCE = '';

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

    protected $vendor_id = 0;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param \WC_Order_Item_Product $order_item
     * @param int|float  $total_amount
     * @param int        $total_quantity
     *
     * @return void
     */
    public function __construct( $order_item = '', $total_amount = 0, $total_quantity = 1, $vendor_id = 0 ) {
        $this->order_item_id             = $order_item->get_id();
        $this->total_amount              = $total_amount;
        $this->total_quantity = $total_quantity;

        $this->vendor_id = $vendor_id ? $vendor_id : dokan_get_vendor_by_product( $order_item->get_product_id(), true );

        parent::__construct();
        
        $this->set_next( new Product( $order_item->get_product_id(), $vendor_id ) );

    }

    /**
     * Returns order item strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {

        return $this->settings->get_source() ?: self::SOURCE;
    }

    /**
     * Returns order item commission settings.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function set_settings() {
        $settings = new \WeDevs\Dokan\Commission\Settings\OrderItem(
            [
                'id'    => $this->order_item_id,
                'price' => $this->total_amount,
            ]
        );

        $this->settings = $settings->get();
    }

    /**
     * Returns order item id.
     *
     * @since DOKAN_SINCE
     *
     * @return int|mixed|string
     */
    public function get_order_item_id() {
        return $this->order_item_id;
    }
}
