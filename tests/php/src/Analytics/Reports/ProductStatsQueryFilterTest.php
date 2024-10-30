<?php
namespace WeDevs\Dokan\Test\Analytics\Reports;

use Mockery;
use WeDevs\Dokan\Analytics\Reports\Products\Stats\QueryFilter;
use WeDevs\Dokan\Test\Analytics\Reports\ReportTestCase;

/**
 * Class OrderStatsTest
 * @group analytics
 * Unit tests for Order statistics in the Dokan plugin.
 */
class ProductStatsQueryFilterTest extends ReportTestCase {
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
    public function test_products_stats_hook_registered() {
        $order_stats_query_filter = dokan_get_container()->get( QueryFilter::class );
        // Assert the Join Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_products_stats_total', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_products_stats_interval', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        // Assert the Where Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_products_stats_total', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_products_stats_interval', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
    }

	/**
	 * Test dokan_order_stats JOIN and WHERE clauses are applied on order_stats select Query.
	 *
	 * Method(partial) mocking @see http://docs.mockery.io/en/latest/reference/partial_mocks.html
	 *
     * @return void
	 */
	public function test_dokan_products_states_query_filter_hooks_are_order_stats_update() {
		$order_id = $this->create_multi_vendor_order();

		$this->run_all_pending();

        $mocking_methods = [
            'add_join_subquery',
            'add_where_subquery',
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

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\GenericQuery( [], 'products-stats' );

		$wc_stats_query->get_data();
	}

    /**
     *
     * @return void
     */
    public function test_dokan_products_stats_added_to_wc_select_query_for_seller() {
        $parent_id = $this->create_multi_vendor_order();

		$this->run_all_pending();

        $filter = Mockery::mock( QueryFilter::class . '[should_filter_by_vendor_id]' );

        dokan_get_container()->extend( QueryFilter::class )->setConcrete( $filter );

        $filter->shouldReceive( 'should_filter_by_vendor_id' )
            ->atLeast()
            ->once()
            ->andReturnTrue();

        $orders_query = new \Automattic\WooCommerce\Admin\API\Reports\GenericQuery( [], 'products-stats' );

		$report_data = $orders_query->get_data();

        $sub_ids = dokan_get_suborder_ids_by( $parent_id );

        $this->assertCount( $report_data->totals->orders_count, $sub_ids );

        $order = wc_get_order( $parent_id );

        // Initialize a variable to hold the total
        $line_items_total = 0;

        // Loop through each line item in the order
        foreach ( $order->get_items() as $item_id => $item ) {
            // Add the line item total to the cumulative total
            $line_items_total += $item->get_total();
        }

        $this->assertCount( $report_data->totals->orders_count, $sub_ids );
        $this->assertEquals( $order->get_item_count(), $report_data->totals->items_sold );
        $this->assertEquals( $line_items_total, $report_data->totals->net_revenue );
    }

    /**
     *
     * @return void
     */
    public function test_dokan_products_stats_added_to_wc_select_query_for_admin() {
        $parent_id = $this->create_multi_vendor_order();

		$this->run_all_pending();

        $filter = Mockery::mock( QueryFilter::class . '[should_filter_by_vendor_id]' );

        remove_filter( 'woocommerce_analytics_clauses_where_products_stats_total', [ $this->sut, 'add_where_subquery' ], 30 );
        remove_filter( 'woocommerce_analytics_clauses_where_products_stats_total', [ $this->sut, 'add_where_subquery' ], 30 );

        dokan_get_container()->extend( QueryFilter::class )->setConcrete( $filter );

        $filter->shouldReceive( 'should_filter_by_vendor_id' )
            ->atLeast()
            ->once()
            ->andReturnFalse();

        $orders_query = new \Automattic\WooCommerce\Admin\API\Reports\GenericQuery( [], 'products-stats' );

		$report_data = $orders_query->get_data();

        $sub_ids = dokan_get_suborder_ids_by( $parent_id );

        $this->assertEquals( 1, $report_data->totals->orders_count );

        $order = wc_get_order( $parent_id );

        // Initialize a variable to hold the total
        $line_items_total = 0;

        // Loop through each line item in the order
        foreach ( $order->get_items() as $item_id => $item ) {
            // Add the line item total to the cumulative total
            $line_items_total += $item->get_total();
        }

        $this->assertEquals( $order->get_item_count(), $report_data->totals->items_sold );
        $this->assertEquals( $line_items_total, $report_data->totals->net_revenue );
    }
}
