<?php

namespace WeDevs\Dokan\Test\Analytics\Reports\Stock\Stats;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group analytics
 */
class StockStatsQueryFilterTest extends DokanTestCase {

    public function tests_stock_stats_report() {
        $seller1_prod_ids = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create_many( 5 );

        $seller2_prod_ids = $this->factory()->product
            ->set_seller_id( $this->seller_id2 )
            ->create_many( 5 );

        wp_set_current_user( $this->admin_id );

        $query = new \Automattic\WooCommerce\Admin\API\Reports\Stock\Stats\Query();

        $data = $query->get_data();
        $total = count( $seller1_prod_ids ) + count( $seller2_prod_ids );

        $this->assertEquals( $total, $data['instock'] );
        $this->assertEquals( $total, $data['products'] );
    }

    public function tests_stock_stats_report_by_vendor_filter() {
        $seller1_prod_ids = $this->factory()->product
            ->set_seller_id( $this->seller_id1 )
            ->create_many( 5 );

        $seller2_prod_ids = $this->factory()->product
            ->set_seller_id( $this->seller_id2 )
            ->create_many( 5 );

        wp_set_current_user( $this->admin_id );

        $_GET['sellers'] = $this->seller_id1;

        $query = new \Automattic\WooCommerce\Admin\API\Reports\Stock\Stats\Query();

        $data = $query->get_data();
        $total = count( $seller1_prod_ids );

        $this->assertEquals( $total, $data['instock'] );
        $this->assertEquals( $total, $data['products'] );
    }
}
