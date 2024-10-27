<?php
namespace WeDevs\Dokan\Test\Analytics\Reports;

use Mockery;
use WeDevs\Dokan\Analytics\Reports\Products\QueryFilter;
use WeDevs\Dokan\Test\Analytics\Reports\ReportTestCase;

/**
 * Class OrderStatsTest
 * @group analytics
 * Unit tests for Order statistics in the Dokan plugin.
 */
class ProductQueryFilterTest extends ReportTestCase {
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
    public function test_products_hook_registered() {
        $order_stats_query_filter = dokan_get_container()->get( QueryFilter::class );
        // Assert the Join Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_join_products_subquery', [ $order_stats_query_filter, 'add_join_subquery' ] ) );
        // Assert the Where Clause filters are registered
        self::assertNotFalse( has_filter( 'woocommerce_analytics_clauses_where_products_subquery', [ $order_stats_query_filter, 'add_where_subquery' ] ) );
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
	public function test_filter_hooks_are_applied_for_products_query() {
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

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\GenericQuery( [], 'products' );

		$wc_stats_query->get_data();
	}

    /**
     *
     * @return void
     */
    public function test_dokan_products_fields_are_selected_for_seller() {
		$order_id = $this->create_multi_vendor_order();

		$this->run_all_pending();

        $mocking_methods = [
            'should_filter_by_vendor_id',
        ];

		$service = Mockery::mock( QueryFilter::class . '[' . implode( ',', $mocking_methods ) . ']' );

		dokan_get_container()->extend( QueryFilter::class )->setConcrete( $service );

        remove_filter( 'woocommerce_analytics_clauses_where_products_subquery', [ $this->sut, 'add_where_subquery' ], 30 );

        $service->shouldReceive( 'should_filter_by_vendor_id' )
            ->andReturnTrue();

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\GenericQuery( [], 'products' );

		$data = $wc_stats_query->get_data();

        $sub_ids = dokan_get_suborder_ids_by( $order_id );

        $report_data = $data->data;

        $this->assertCount( 2, $report_data );

        // Assert that sub order items are fetched.
        foreach ( $sub_ids as $s_id ) {
            $s_order = wc_get_order( $s_id );

            foreach ( $s_order->get_items() as $item ) {
                $this->assertNestedContains(
                    [
						'product_id' => $item->get_product_id(),
						'net_revenue' => floatval( $item->get_total() ),
						'items_sold' => $item->get_quantity(),
						'orders_count' => 1,
					], $report_data
                );
            }
        }
	}

    public function test_dokan_products_fields_are_selected_for_admin() {
		$order_id = $this->create_multi_vendor_order();

		$this->run_all_pending();

        $mocking_methods = [
            'should_filter_by_vendor_id',
        ];

		$service = Mockery::mock( QueryFilter::class . '[' . implode( ',', $mocking_methods ) . ']' );

		dokan_get_container()->extend( QueryFilter::class )->setConcrete( $service );

        remove_filter( 'woocommerce_analytics_clauses_where_products_subquery', [ $this->sut, 'add_where_subquery' ], 30 );

        $service->shouldReceive( 'should_filter_by_vendor_id' )
            ->andReturnFalse();

		$wc_stats_query = new \Automattic\WooCommerce\Admin\API\Reports\GenericQuery( [], 'products' );

		$data = $wc_stats_query->get_data();

        $report_data = $data->data;

        $this->assertCount( 2, $report_data );

        // Assert that parent order items are fetched.
        $s_order = wc_get_order( $order_id );

        foreach ( $s_order->get_items() as $item ) {
            $this->assertNestedContains(
                [
                    'product_id' => $item->get_product_id(),
                    'net_revenue' => floatval( $item->get_total() ),
                    'items_sold' => $item->get_quantity(),
                    'orders_count' => 1,
                ], $report_data
            );
        }
	}
}
