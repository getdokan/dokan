<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Vendor\StoreListsFilter;

/**
 * @group blocks
 */
class StoreListsFilterTest extends DokanTestCase {

    public function tear_down() {
        unset( $_GET['stores_orderby'], $_GET['dokan_seller_search'], $_GET['_store_filter_nonce'] );

        parent::tear_down();
    }

    /**
     * @test
     */
    public function it_falls_back_to_the_marketplace_default_sort() {
        $this->assertSame( 'most_recent', StoreListsFilter::get_requested_sort_by() );
        $this->assertArrayNotHasKey( 'stores_orderby', StoreListsFilter::get_requested_data() );
    }

    /**
     * @test
     */
    public function it_accepts_a_known_sort_without_the_filter_nonce() {
        $_GET['stores_orderby'] = 'total_orders';

        $this->assertSame( 'total_orders', StoreListsFilter::get_requested_sort_by() );
        $this->assertSame( 'total_orders', StoreListsFilter::get_requested_data()['stores_orderby'] );
    }

    /**
     * @test
     */
    public function it_rejects_an_unknown_sort() {
        $_GET['stores_orderby'] = 'DROP TABLE';

        $this->assertSame( 'most_recent', StoreListsFilter::get_requested_sort_by() );
        $this->assertArrayNotHasKey( 'stores_orderby', StoreListsFilter::get_requested_data() );
    }

    /**
     * @test
     */
    public function it_only_reads_the_search_with_a_valid_filter_nonce() {
        $_GET['dokan_seller_search'] = 'Shop';

        $this->assertArrayNotHasKey( 'dokan_seller_search', StoreListsFilter::get_requested_data() );

        $_GET['_store_filter_nonce'] = wp_create_nonce( 'dokan_store_lists_filter_nonce' );

        $this->assertSame( 'Shop', StoreListsFilter::get_requested_data()['dokan_seller_search'] );
    }
}
