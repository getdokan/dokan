<?php

namespace WeDevs\Dokan\Commission\Strategies;

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
    * @var \WC_Order_Item_Product $order_item
     */
    protected $order_item;

    /**
     * The vendor id of the order item.
     *
     * @var integer
     */
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
    public function __construct( $order_item = '', $vendor_id = 0 ) {
        $this->order_item = $order_item;

        $this->vendor_id = $vendor_id ? $vendor_id : dokan_get_vendor_by_product( $order_item->get_product_id(), true );

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function set_next(): AbstractStrategy {
        if ( ! $this->next ) {
			$this->next = new Product( $this->order_item->get_product_id(), $this->vendor_id );
        }

        return $this;
    }

    /**
     * Returns order item strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return $this->settings->get_source();
    }

    /**
     * Returns order item commission settings.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function set_settings() {
        $settings = new \WeDevs\Dokan\Commission\Settings\OrderItem( $this->order_item );

        $this->settings = $settings->get();
    }

    /**
     * Returns order item id.
     *
     * @since 4.0.0
     *
     * @return int|mixed|string
     */
    public function get_order_item_id() {
        return $this->order_item->get_id();
    }
}
