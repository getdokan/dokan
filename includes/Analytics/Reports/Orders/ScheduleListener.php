<?php

namespace WeDevs\Dokan\Analytics\Reports\Orders;

use WeDevs\Dokan\Contracts\Hookable;

class ScheduleListener implements Hookable {
	public function __construct() {
		$this->register_hooks();
	}

	public function register_hooks(): void {
		add_action( 'woocommerce_analytics_update_order_stats', [ $this, 'sync_dokan_order' ] );
	}

	public function sync_dokan_order( $order_id ) {
		\WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore::sync_order( $order_id );
	}
}
