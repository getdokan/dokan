<?php
namespace WeDevs\Dokan\Test\Analytics;

use Mockery;
use WeDevs\Dokan\Analytics\Reports\Orders\FilterQuery;
use WeDevs\Dokan\Analytics\Reports\Orders\ScheduleListener;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Class OrderStatsTest
 *
 * Unit tests for Order statistics in the Dokan plugin.
 */
class OrderStatsTest extends DokanTestCase {
    /**
     * Test that the order statistics hooks are registered correctly.
     *
     * @see https://giuseppe-mazzapica.gitbook.io/brain-monkey/wordpress-specific-tools/wordpress-hooks-added
     *
     * @return void
     */
    public function test_order_stats_hook_registered() {
        $order_stats_table_listener = dokan_get_container()->get( ScheduleListener::class );
        self::assertNotFalse( has_action( 'woocommerce_analytics_update_order_stats', [ $order_stats_table_listener, 'sync_dokan_order' ] ) );

        $order_stats_query_filter = dokan_get_container()->get( FilterQuery::class );
        // Assert the Join Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_orders_subquery', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_orders_stats_total', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_orders_stats_interval', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        // Assert the Where Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_orders_stats_interval', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
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
	 * Test dokan_order_stats JOIN and WHERE clauses are applied on order_stats select Query.
	 *
	 * Method(partial) mocking @see http://docs.mockery.io/en/latest/reference/partial_mocks.html
	 *
     * @param int $order_id   The order ID.
     * @param int $seller_id1 The first seller ID.
     * @param int $seller_id2 The second seller ID.
     * @return void
	 */
	public function test_dokan_order_states_query_filter_hooks_are_order_stats_update() {
		$order_id = $this->create_multi_vendor_order();

		$this->run_all_pending();

		$service = Mockery::mock( FilterQuery::class . '[add_join_subquery, add_where_subquery]' );
		dokan_get_container()->extend( FilterQuery::class )->setConcrete( $service );

        $service->shouldReceive( 'add_join_subquery' )
            ->atLeast()
			->once()
			->andReturnUsing(
                function ( $clauses ) {
					return $clauses;
				}
            );

		$service->shouldReceive( 'add_where_subquery' )
            ->atLeast()
			->once()
            ->andReturnUsing(
                function ( $clauses ) {
					return $clauses;
				}
            );

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query();

		$wc_stats_query->get_data();
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
				'is_suborder' => 0,
			]
        );

		$sub_order_ids = dokan_get_suborder_ids_by( $order_id );

		foreach ( $sub_order_ids as $sub_id ) {
			$this->assertDatabaseCount(
				$dokan_order_stats_table, 1, [
					'order_id' => $sub_id,
					'is_suborder' => 1,
				]
			);
		}
    }
}
