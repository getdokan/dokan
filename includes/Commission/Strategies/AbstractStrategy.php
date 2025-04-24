<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WC_Order_Item;
use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Commission\Settings\OrderItem as OrderItemSetting;
use WeDevs\Dokan\Commission\Strategies\OrderItem as OrderItemStrategy;

abstract class AbstractStrategy {

    protected ?AbstractStrategy $next = null;
    protected ?Setting $settings;

    public function __construct() {
        $this->set_settings();
    }

    /**
     * Returns commission strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    abstract public function get_source(): string;

    /**
     * Returns commission settings.
     *
     * @since 3.14.0
     *
     * @return void
     */
    abstract public function set_settings();

    /**
     * Returns commission settings.
     *
     * @since 3.14.0
     *
     * @return Setting
     */
	public function get_settings(): ?Setting {
        $this->settings->set_source( $this->get_source() );

        if ( $this->settings->is_applicable() ) {
            return $this->settings;
        }
    
        return $this->get_next() ? $this->get_next()->get_settings() : null;
    }


    public function get_next(): ?AbstractStrategy {
        return $this->next;
    }

    public function set_next( AbstractStrategy $next ): AbstractStrategy {
        $this->next = $next;

        return $this;
    }

    public function save_settings_to_order_item( WC_Order_Item $order_item ): void {
        if ( ! $this instanceof OrderItemStrategy ) {
            return; // Already saved in the line item since it was retrieved from the order item.
        }

        $item_settings = new OrderItemSetting($order_item );

        $item_settings->save( $this->settings );
    }
}
