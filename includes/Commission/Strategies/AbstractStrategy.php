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
     * Returns the commission settings from the first applicable strategy in the chain.
     *
     * @since 4.0.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting|null
     */
    public function get_settings(): ?Setting {
        return $this->get_eligible_strategy() ? $this->get_eligible_strategy()->settings : null;
    }

    /**
     * Returns the first strategy in the chain that has applicable commission settings.
     *
     * @since 4.0.0
     *
     * @return \WeDevs\Dokan\Commission\Strategies\AbstractStrategy|null
     */
    public function get_eligible_strategy(): ?AbstractStrategy {
        $this->settings->set_source( $this->get_source() );

        if ( $this->settings->is_applicable() ) {
            return $this;
        }

        return $this->get_next() ? $this->get_next()->get_eligible_strategy() : null;
    }

    /**
     * Gets the next fallback strategy in the chain.
     *
     * @since 4.0.0
     *
     * @return \WeDevs\Dokan\Commission\Strategies\AbstractStrategy|null
     */
    public function get_next(): ?AbstractStrategy {
        if ( ! $this->next ) {
            $this->set_next();
        }

        return $this->next;
    }

    /**
     * Sets the next fallback strategy in the chain.
     *
     * @since 4.0.0
     *
     * @return \WeDevs\Dokan\Commission\Strategies\AbstractStrategy
     */
    abstract public function set_next(): AbstractStrategy;

    /**
     * Saves the applicable commission settings to the order item.
     *
     * Only applies if this is an instance of OrderItemStrategy and a valid setting is found.
     *
     * @since 4.0.0
     *
     * @param \WC_Order_Item $order_item WooCommerce order item instance.
     *
     * @return void
     */
    public function save_settings_to_order_item( WC_Order_Item $order_item ): void {
        $settings = $this->get_settings();

        if ( ! $settings || ! $this instanceof OrderItemStrategy ) {
            return;
        }

        $this->get_order_item_setting_saver( $order_item )->save( $settings->to_array() );
    }

    /**
     * Returns an instance of OrderItemSetting to save commission settings to the order item.
     * Useful for mocking during unit tests.
     *
     * @since 4.0.0
     *
     * @param \WC_Order_Item $order_item WooCommerce order item.
     *
     * @return \WeDevs\Dokan\Commission\Settings\OrderItem
     */
    protected function get_order_item_setting_saver( WC_Order_Item $order_item ): OrderItemSetting {
        return new OrderItemSetting( $order_item );
    }
}
