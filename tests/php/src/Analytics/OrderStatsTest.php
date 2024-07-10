<?php
namespace WeDevs\Dokan\Test\Analytics;

use WeDevs\Dokan\Test\DokanUnitTestCase;

class OrderStatsTest extends DokanUnitTestCase {
    public function test_mock_class() {
        $seller_id1 = $this->factory()->seller->create();
        $seller_id2 = $this->factory()->seller->create();

        $order_id = $this->factory()
            ->order
            ->set_item_fee(
                [
					'name' => 'Extra Charge',
					'amount' => 10,
				]
            )
            ->set_item_shipping(
                [
					'name' => 'Shipping Fee',
					'amount' => 10,
				]
            )
            ->create(
                [
					'status'      => 'processing',
					'customer_id' => $this->factory()->customer->create( [] ),
					'line_items'  => array(
						array(
							'product_id' => $this->factory()->product
								->set_seller_id( $seller_id1 )
								->create(
									[
										'name' => 'Test Product 1',
										'regular_price' => 5,
										'price' => 5,
									]
								),
							'quantity'   => 2,
						),
						array(
							'product_id' => $this->factory()->product
								->set_seller_id( $seller_id2 )
								->create(
									[
										'name' => 'Test Product 2',
										'regular_price' => 5,
										'price' => 5,
									]
								),
							'quantity'   => 1,
						),
					),
				]
            );

        $this->run_all_pending();

        $wc_order_stats_table = \Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\DataStore::get_db_table_name();
        $this->assertDatabaseCount( $wc_order_stats_table, 3 );

        $dokan_order_stats_table = \WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore::get_db_table_name();

        $this->assertDatabaseCount( $dokan_order_stats_table, 3 );

        $this->assertDatabaseCount(
            $dokan_order_stats_table, 2, [
				'is_suborder' => 1,
			]
        );

        $this->assertDatabaseCount(
            $dokan_order_stats_table, 1, [
				'seller_id' => $seller_id1,
			]
        );

        $this->assertDatabaseCount(
            $dokan_order_stats_table, 1, [
				'seller_id' => $seller_id2,
			]
        );

        $query = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Query();

        $result = $query->get_data();

		$qr = new \Automattic\WooCommerce\Admin\API\Reports\Orders\Stats\Query();

		$data = $qr->get_data();

		$order = wc_get_order( $order_id );

		// var_dump( 'Order Status -->', $order->get_status() );

		$dokan_order = wc_get_order( $order_id + 1 );

		// var_dump( 'Order Stats -->', $data );
	}
}
