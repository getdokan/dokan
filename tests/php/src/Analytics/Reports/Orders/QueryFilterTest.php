<?php
namespace WeDevs\Dokan\Test\Analytics\Reports\Orders;

use Mockery;
use WeDevs\Dokan\Analytics\Reports\Orders\QueryFilter;
use WeDevs\Dokan\Test\Analytics\Reports\ReportTestCase;

/**
 * Class OrderStatsTest
 *
 * Unit tests for Order statistics in the Dokan plugin.
 */
class QueryFilterTest extends ReportTestCase {
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
    public function test_orders_hook_registered() {
        $order_stats_query_filter = dokan_get_container()->get( QueryFilter::class );
        // Assert the Join Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_orders_subquery', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        // Assert the Where Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
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
	public function test_filter_hooks_are_applied_for_orders_query() {
		$order_id = $this->create_multi_vendor_order();

		$this->run_all_pending();

        $mocking_methods = [
            'add_join_subquery',
            'add_where_subquery',
            'add_select_subquery',
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

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Query();

		$wc_stats_query->get_data();
	}

    /**
     * @dataProvider get_dokan_stats_data
     *
     * @return void
     */
    public function test_dokan_order_stats_fields_are_selected_for_seller( $expected_data ) {
		$order_id = $this->create_multi_vendor_order();

        $this->set_order_meta_for_dokan( $order_id, $expected_data );

		$this->run_all_pending();

        $mocking_methods = [
            'should_filter_by_seller_id',
        ];

		$service = Mockery::mock( QueryFilter::class . '[' . implode( ',', $mocking_methods ) . ']' );

		dokan_get_container()->extend( QueryFilter::class )->setConcrete( $service );

        remove_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $this->sut, 'add_where_subquery' ], 30 );

        $service->shouldReceive( 'should_filter_by_seller_id' )
            ->andReturnTrue();

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Query();

		$data = $wc_stats_query->get_data();

        $sub_ids = dokan_get_suborder_ids_by( $order_id );

        $report_data = $data->data;

        $this->assertEquals( count( $sub_ids ), count( $report_data ) );

        foreach ( $sub_ids as $index => $s_id ) {
            $sub_order = wc_get_order( $s_id );
            $order_data = $report_data[ $index ];

            $this->assertEquals( $s_id, $order_data['order_id'] );
            $this->assertEquals( floatval( $sub_order->get_total() ), $order_data['total_sales'] );

            foreach ( $expected_data as $key => $val ) {
                $this->assertEquals( $val, $order_data[ $key ] );
            }
        }
	}

    /**
     * @dataProvider get_dokan_stats_data
     *
     * @return void
     */
    public function test_dokan_order_stats_fields_are_selected_for_admin( $expected_data ) {
		$order_id = $this->create_multi_vendor_order();

        $this->set_order_meta_for_dokan( $order_id, $expected_data );

		$this->run_all_pending();

        remove_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $this->sut, 'add_where_subquery' ], 30 );

		$service = Mockery::mock( QueryFilter::class . '[should_filter_by_seller_id]' );
		dokan_get_container()->extend( QueryFilter::class )->setConcrete( $service );

        $service->shouldReceive( 'should_filter_by_seller_id' )
            ->andReturnUsing(
                function () {
					return false;
				}
            );

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Query();

		$data = $wc_stats_query->get_data();

        $sub_ids = dokan_get_suborder_ids_by( $order_id );

        $report_data = $data->data;

        $this->assertEquals( 1, count( $report_data ) );

        $report_data = $report_data[0];

        foreach ( $expected_data as $key => $val ) {
            $this->assertArrayHasKey( $key, $report_data );
        }
	}

    public function test_orders_for_dokan_suborder_refund() {
		$order_id = $this->create_multi_vendor_order();
        $sub_ids = dokan_get_suborder_ids_by( $order_id );

        $refund = $this->create_refund( $sub_ids[0] );

		$this->run_all_pending();

        remove_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $this->sut, 'add_where_subquery' ], 30 );

		$service = Mockery::mock( QueryFilter::class . '[should_filter_by_seller_id]' );
		dokan_get_container()->extend( QueryFilter::class )->setConcrete( $service );

        $service->shouldReceive( 'should_filter_by_seller_id' )
            ->andReturnTrue();

        $_GET['refunds'] = 'all';

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Query( [ 'refunds' => 'all' ] );
		$data = $wc_stats_query->get_data();

        $report_data = $data->data;

        $this->assertEquals( 1, count( $report_data ) );

        $report_data = $report_data[0];

        $this->assertEquals( $refund->get_id(), $report_data['order_id'] );
	}

    public function test_orders_for_dokan_parent_order_refund() {
		$order_id = $this->create_multi_vendor_order();
        $sub_ids = dokan_get_suborder_ids_by( $order_id );

        $parent_refund = $this->create_refund( $sub_ids[0], true, true );

		$this->run_all_pending();

        remove_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $this->sut, 'add_where_subquery' ], 30 );

		$service = Mockery::mock( QueryFilter::class . '[should_filter_by_seller_id]' );
		dokan_get_container()->extend( QueryFilter::class )->setConcrete( $service );

        $service->shouldReceive( 'should_filter_by_seller_id' )
            ->andReturnFalse();

        $_GET['refunds'] = 'all';

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Query( [ 'refunds' => 'all' ] );
		$data = $wc_stats_query->get_data();

        $report_data = $data->data;

        $this->assertEquals( 1, count( $report_data ) );

        $report_data = $report_data[0];

        $this->assertEquals( $parent_refund->get_id(), $report_data['order_id'] );
	}

    public function test_orders_for_dokan_single_order_refund() {
        $this->seller_id2 = $this->seller_id1;

		$order_id = $this->create_multi_vendor_order();

        $refund = $this->create_refund( $order_id );

		$this->run_all_pending();

        remove_filter( 'woocommerce_analytics_clauses_where_orders_subquery', [ $this->sut, 'add_where_subquery' ], 30 );

		$service = Mockery::mock( QueryFilter::class . '[should_filter_by_seller_id]' );
		dokan_get_container()->extend( QueryFilter::class )->setConcrete( $service );

        $service->shouldReceive( 'should_filter_by_seller_id' )
            ->andReturnFalse();

        $_GET['refunds'] = 'all';

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Query( [ 'refunds' => 'all' ] );
		$data = $wc_stats_query->get_data();

        $report_data = $data->data;

        $this->assertEquals( 1, count( $report_data ) );

        $report_data = $report_data[0];

        $this->assertEquals( $refund->get_id(), $report_data['order_id'] );
	}
}
