<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Class ScheduleListener
 *
 * Listens to WooCommerce schedule events and triggers Dokan order synchronization and deletion.
 *
 * @since 3.13.0
 */
class ScheduleListener implements Hookable {
    /**
     * ScheduleListener constructor.
     * Registers the hooks on instantiation.
     */
    public function __construct() {
        $this->register_hooks();
    }

    /**
     * Register hooks for WooCommerce analytics order events.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_action( 'woocommerce_analytics_update_order_stats', [ $this, 'sync_dokan_order' ] );
        add_action( 'woocommerce_analytics_delete_order_stats', [ $this, 'delete_order' ] );
    }

    /**
     * Sync Dokan order data when WooCommerce analytics updates order stats.
     *
     * @param int $order_id The ID of the order being updated.
     *
     * @return void
     */
    public function sync_dokan_order( $order_id ) {
        return \WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore::sync_order( $order_id );
    }

    /**
     * Delete Dokan order data when WooCommerce deletes an order.
     *
     * @param int $order_id The ID of the order being deleted.
     *
     * @return void
     */
    public function delete_order( $order_id ) {
        return \WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore::delete_order( $order_id );
    }
}
