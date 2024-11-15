<?php
namespace WeDevs\Dokan\Test\Analytics\Reports;

use Exception;
use Mockery;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\QueryFilter;
use WeDevs\Dokan\Commission;
use WeDevs\Dokan\Test\Analytics\Reports\ReportTestCase;

/**
 * Class OrderStatsTest
 * @group analytics
 *
 * Unit tests for Order statistics in the Dokan plugin.
 */
class OrderStatsQueryFilterTest extends ReportTestCase {
    /**
     *
     * @var QueryFilter
     */
    private $sut;


    public function setUp(): void {
        parent::setUp();
        $this->sut = dokan_get_container()->get( QueryFilter::class );
    }

    protected function tearDown(): void {
        parent::tearDown();
        dokan_get_container()->extend( QueryFilter::class )->setConcrete( $this->sut );
    }

    /**
     * Test that the order statistics hooks are registered correctly.
     *
     * @see https://giuseppe-mazzapica.gitbook.io/brain-monkey/wordpress-specific-tools/wordpress-hooks-added
     *
     * @return void
     */
    public function test_order_stats_hook_registered() {
        $order_stats_query_filter = dokan_get_container()->get( QueryFilter::class );
        // Assert the Join Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_orders_stats_total', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_orders_stats_interval', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        // Assert the Where Clause filters are registered
        // self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
        // self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_orders_stats_interval', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
    }


	/**
	 * Test dokan_order_stats JOIN and WHERE clauses are applied on order_stats select Query.
	 *
	 * Method(partial) mocking @see http://docs.mockery.io/en/latest/reference/partial_mocks.html
	 *
     * @param int $order_id   The order ID.
     * @param int $vendor_id1 The first seller ID.
     * @param int $vendor_id2 The second seller ID.
     * @return void
	 */
	public function test_dokan_order_states_query_filter_hooks_are_order_stats_update() {
		$order_id = $this->create_multi_vendor_order();

		$this->run_all_pending();

        $mocking_methods = [
            'add_join_subquery',
            // 'add_where_subquery', // For Coupon amount distribution.
            'add_select_subquery_for_total',
        ];

		$service = Mockery::mock( QueryFilter::class . '[' . implode( ',', $mocking_methods ) . ']' );
		dokan_get_container()->extend( QueryFilter::class )->setConcrete( $service );

        foreach ( $mocking_methods as $method ) {
            $service->shouldReceive( $method )
            ->atLeast()
			->once()
			->andReturnUsing(
                function ( $clauses ) {
					return $clauses;
				}
            );
        }

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query( [], 'orders-stats' );

		$wc_stats_query->get_data();
	}


    /**
     * @dataProvider get_dokan_stats_data
     *
     * @return void
     */
    public function test_dokan_order_stats_added_to_wc_select_query_for_total( array $data ) {
        $parent_id = $this->create_multi_vendor_order();
        $this->set_order_meta_for_dokan( $parent_id, $data );
        $mock_commission = Mockery::mock( Commission::class );

        dokan()->get_container()->extend( 'commission' )->setConcrete( $mock_commission );

        $mock_commission->shouldReceive( 'get_earning_by_order' )->andReturnUsing(
            function ( $order, $context = 'seller' ) use ( $data ) {
                if ( $order->get_meta( 'has_sub_order' ) ) {
                    return 0;
                }
                if ( $context === 'admin' ) {
                    return $data['admin_commission'];
                }
                return $data['vendor_earning'];
			}
        );

		$this->run_all_pending();

        remove_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $this->sut, 'add_where_subquery' ], 30 );
        remove_filter( 'woocommerce_analytics_clauses_where_orders_stats_total', [ $this->sut, 'add_where_subquery' ], 30 );

        $orders_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query( [], 'orders-stats' );

		$report_data = $orders_query->get_data();

        $sub_ids = dokan_get_suborder_ids_by( $parent_id );

        $this->assertEquals( 2, $report_data->totals->orders_count );

        $sub_ord_count = count( $sub_ids );
        // Assert dokan order stats totals.
        foreach ( $data as $key => $val ) {
            $expected = floatval( $val * $sub_ord_count );

            $this->assertEquals( $expected, $report_data->totals->{"total_$key"}, $key . ' Mismatch: Expected: ' . $expected . ' Got: ' . $val );
        }
    }
}
