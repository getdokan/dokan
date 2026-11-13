<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Data\Cleanup;
use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\OrderRefRepository;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Data\VariantRepository;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * CJ Dropshipping tables and repositories.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class DataRepositoryTest extends DokanTestCase {

    protected VariantRepository $variants;

    protected LinkRepository $links;

    protected OrderRefRepository $orders;

    public function set_up() {
        parent::set_up();

        Schema::install();

        $this->variants = new VariantRepository();
        $this->links    = new LinkRepository();
        $this->orders   = new OrderRefRepository();
    }

    public function test_install_creates_all_tables() {
        global $wpdb;

        foreach ( Schema::tables() as $table ) {
            $this->assertSame( $table, $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) );
        }

        $this->assertSame( Schema::VERSION, get_option( Schema::VERSION_OPTION ) );
    }

    public function test_variant_save_updates_in_place() {
        $this->variants->save(
            'vid-1', [
				'pid'      => 'pid-1',
				'sku'      => 'CJ-1',
				'cost_usd' => 2.34,
				'props'    => [ 'COMMON', 'ELECTRONIC' ],
			]
        );
        $this->variants->save( 'vid-1', [ 'cost_usd' => 3.5 ] );

        $row = $this->variants->get( 'vid-1' );

        $this->assertSame( 'pid-1', $row['pid'] );
        $this->assertEquals( 3.5, (float) $row['cost_usd'] );
        $this->assertSame( 'COMMON,ELECTRONIC', $row['props'] );
        $this->assertCount( 1, $this->variants->for_product( 'pid-1' ) );
    }

    public function test_stock_is_replaced_per_warehouse() {
        $this->variants->save_stock(
            'vid-2', [
				'CN' => [
					'cj'      => 3,
					'factory' => 1000,
				],
				'us' => [
					'cj'      => 15,
					'factory' => 0,
				],
			]
        );
        $this->variants->save_stock(
            'vid-2', [
				'CN' => [
					'cj'      => 0,
					'factory' => 900,
				],
			]
        );

        $this->assertSame(
            [
                'CN' => [
                    'cj'      => 0,
                    'factory' => 900,
                ],
            ],
            $this->variants->get_stock( 'vid-2' )
        );
    }

    public function test_link_marks_product_and_finds_vendor_copy() {
        $product_id = $this->factory()->product->create_and_get()->get_id();

        $this->links->link( $product_id, $product_id, $this->seller_id1, 'vid-3', 'pid-3' );

        $this->assertTrue( $this->links->is_cj_product( $product_id ) );
        $this->assertSame( 'vid-3', $this->links->get( $product_id )['vid'] );
        $this->assertSame( $product_id, $this->links->find_vendor_product( $this->seller_id1, 'vid-3' ) );
        $this->assertSame( 0, $this->links->find_vendor_product( $this->seller_id2, 'vid-3' ) );
        $this->assertSame( [ $product_id ], $this->links->parent_ids( $this->seller_id1 ) );
    }

    public function test_due_for_sync_only_returns_linked_products_oldest_first() {
        $product_id = $this->factory()->product->create_and_get()->get_id();

        $this->variants->save(
            'vid-new', [
				'pid'       => 'pid-new',
				'synced_at' => gmdate( 'Y-m-d H:i:s' ),
			]
        );
        $this->variants->save( 'vid-old', [ 'pid' => 'pid-old' ] );
        $this->variants->save( 'vid-orphan', [ 'pid' => 'pid-orphan' ] );
        $this->links->link( $product_id, $product_id, $this->seller_id1, 'vid-new', 'pid-new' );
        $this->links->link( $product_id + 1000, $product_id + 1000, $this->seller_id1, 'vid-old', 'pid-old' );

        $this->assertSame( [ 'pid-old', 'pid-new' ], $this->variants->due_for_sync( 10 ) );
    }

    public function test_order_refs_detect_duplicate_cj_order_numbers() {
        $this->orders->save( 101, $this->seller_id1, 'CN', [ 'cj_order_no' => 'CJ240512345' ] );
        $this->orders->save( 102, $this->seller_id1, 'US', [ 'cj_order_no' => 'CJ240512345' ] );
        $this->orders->save( 103, $this->seller_id2, 'CN', [ 'cj_order_no' => 'CJ240512345' ] );

        $this->assertSame( [ 102 ], $this->orders->orders_with_number( $this->seller_id1, 'CJ240512345', 101 ) );
        $this->assertTrue( $this->orders->is_fully_ordered( 101, [ 'CN' ] ) );
        $this->assertFalse( $this->orders->is_fully_ordered( 101, [ 'CN', 'US' ] ) );
    }

    public function test_deleting_vendor_and_product_removes_links() {
        $product_id = $this->factory()->product->create_and_get()->get_id();
        $other_id   = $this->factory()->product->create_and_get()->get_id();
        $cleanup    = new Cleanup( $this->links );

        $this->links->link( $product_id, $product_id, $this->seller_id1, 'vid-4', 'pid-4' );
        $this->links->link( $other_id, $other_id, $this->seller_id2, 'vid-4', 'pid-4' );

        $cleanup->delete_vendor_data( $this->seller_id1 );
        $cleanup->delete_product_links( $other_id );

        $this->assertNull( $this->links->get( $product_id ) );
        $this->assertNull( $this->links->get( $other_id ) );
    }
}
