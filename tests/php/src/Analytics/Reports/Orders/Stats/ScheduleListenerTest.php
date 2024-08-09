<?php

namespace WeDevs\Dokan\Test\Analytics\Reports\Orders\Stats;

use Mockery;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\ScheduleListener;
use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Test\DokanTestCase;

class ScheduleListenerTest extends DokanTestCase {
    public function test_woocommerce_analytics_update_order_stats_hook_is_registered() {
        $order_stats_table_listener = dokan_get_container()->get( ScheduleListener::class );
        self::assertNotFalse( has_action( 'woocommerce_analytics_update_order_stats', [ $order_stats_table_listener, 'sync_dokan_order' ] ) );
    }

	/**
	 * Test the dokan_order_stats table update hooks are executed by ScheduleListener class.
	 *
	 * Method(partial) mocking @see http://docs.mockery.io/en/latest/reference/partial_mocks.html
	 *
     * @param int $order_id   The order ID.
     * @param int $seller_id1 The first seller ID.
     * @param int $seller_id2 The second seller ID.
     * @return void
	 */
	public function test_dokan_order_states_update_hook_execute_on_order_stats_update() {
		$order_id = $this->create_multi_vendor_order();
		$service = Mockery::mock( ScheduleListener::class . '[sync_dokan_order]' );
		dokan_get_container()->extend( ScheduleListener::class )->setConcrete( $service );

        $service->shouldReceive( 'sync_dokan_order' )
            ->atLeast()
			->once()
            ->andReturn( 1 );

        $this->run_all_pending();
	}

    /**
     * Test the mock class for multi-vendor order statistics.
     *
     * @param int $order_id   The order ID.
     * @param int $seller_id1 The first seller ID.
     * @param int $seller_id2 The second seller ID.
     * @return void
     */
    public function test_data_is_inserted_in_dokan_order_stats_table() {
		$order_id = $this->create_multi_vendor_order();

        $this->run_all_pending();

        $wc_order_stats_table = \Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\DataStore::get_db_table_name();

        $dokan_order_stats_table = \WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore::get_db_table_name();

        $this->assertDatabaseCount(
            $wc_order_stats_table, 1, [
				'order_id' => $order_id,
			]
        );

		$this->assertDatabaseCount(
            $dokan_order_stats_table, 1, [
				'order_id' => $order_id,
				'order_type' => OrderType::WC_ORDER,
			]
        );

		$sub_order_ids = dokan_get_suborder_ids_by( $order_id );

		foreach ( $sub_order_ids as $sub_id ) {
			$this->assertDatabaseCount(
				$dokan_order_stats_table, 1, [
					'order_id' => $sub_id,
					'order_type' => OrderType::DOKAN_SUBORDER,
				]
			);
		}
    }
}
