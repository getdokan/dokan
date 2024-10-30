<?php

namespace WeDevs\Dokan\Test\Analytics\Reports;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group analytics
 */
class StockProductQueryFilterTest extends DokanTestCase {
    protected $namespace = 'wc-analytics/reports';

    public function tests_stock_reports_are_fetched_with_vendor_filter() {
        $seller1_prod_ids = $this->factory()->product->set_seller_id( $this->seller_id1 )
            ->create_many( 5 );

        $seller2_prod_ids = $this->factory()->product->set_seller_id( $this->seller_id2 )
            ->create_many( 5 );

        wp_set_current_user( $this->admin_id );

        $_GET['sellers'] = $this->seller_id1;

        $response = $this->get_request( 'stock', [ 'sellers' => $this->seller_id1 ] );

        $data = $response->get_data();

        foreach ( $data as $item ) {
            $prod = wc_get_product( $item['id'] );
        }

        $this->assertCount( count( $seller1_prod_ids ), $data );
    }

    public function tests_stock_reports_are_fetched_without_vendor_filter() {
        $seller1_prod_ids = $this->factory()->product->set_seller_id( $this->seller_id1 )
            ->create_many( 5 );

        $seller2_prod_ids = $this->factory()->product->set_seller_id( $this->seller_id2 )
            ->create_many( 5 );

        wp_set_current_user( $this->admin_id );

        $response = $this->get_request( 'stock' );

        $data = $response->get_data();

        foreach ( $data as $item ) {
            $prod = wc_get_product( $item['id'] );
        }

        $this->assertCount( count( $seller1_prod_ids ) + count( $seller2_prod_ids ), $data );
    }
}
