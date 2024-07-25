<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders\Stats;

use WeDevs\Dokan\Contracts\Hookable;

class ScheduleListener implements Hookable {
	public function __construct() {
		$this->register_hooks();
	}

	public function register_hooks(): void {
		add_action( 'woocommerce_analytics_update_order_stats', [ $this, 'sync_dokan_order' ] );
		add_action( 'woocommerce_before_delete_order', [ $this, 'delete_order' ] );
		add_action( 'delete_post', [ $this, 'delete_order' ] );
	}

	public function sync_dokan_order( $order_id ) {
		return \WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore::sync_order( $order_id );
	}

	public function delete_order( $order_id ) {
		return \WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore::delete_order( $order_id );
	}
}
