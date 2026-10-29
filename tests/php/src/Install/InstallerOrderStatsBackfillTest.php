<?php

namespace WeDevs\Dokan\Test\Install;

use Automattic\WooCommerce\Admin\ReportsSync;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore;
use WeDevs\Dokan\Install\Installer;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Fresh installs must backfill dokan_order_stats for pre-existing orders.
 *
 * @group install
 * @group analytics
 */
class InstallerOrderStatsBackfillTest extends DokanTestCase {
    public function setUp(): void {
        parent::setUp();
        $this->reset_import_queue();
    }

    protected function tearDown(): void {
        $this->reset_import_queue();
        parent::tearDown();
    }

    // WC install leaves its own historical import queued, which makes is_importing() true.
    private function reset_import_queue(): void {
        $this->cancel_all_pending_queue();
        ReportsSync::clear_queued_actions();
    }

    public function test_no_regeneration_is_scheduled_without_orders() {
        $before = did_action( 'woocommerce_analytics_regenerate_init' );

        ( new Installer() )->sync_existing_orders_to_order_stats();

        $this->assertSame( $before, did_action( 'woocommerce_analytics_regenerate_init' ) );
        $this->assertFalse( ReportsSync::is_importing() );
    }

    public function test_regeneration_is_scheduled_when_orders_exist() {
        $this->create_single_vendor_order();
        $this->run_all_pending_queue(); // Creating an order queues a WC import, which blocks regeneration.
        $before = did_action( 'woocommerce_analytics_regenerate_init' );

        ( new Installer() )->sync_existing_orders_to_order_stats();

        $this->assertSame( $before + 1, did_action( 'woocommerce_analytics_regenerate_init' ) );
        $this->assertTrue( ReportsSync::is_importing() );
    }

    public function test_regeneration_fills_dokan_order_stats_for_existing_orders() {
        global $wpdb;

        $order_id = $this->create_single_vendor_order();
        $this->run_all_pending_queue();

        $table = DataStore::get_db_table_name();
        $wpdb->query( "DELETE FROM {$table}" ); // phpcs:ignore
        $this->assertSame( '0', $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ) ); // phpcs:ignore

        ( new Installer() )->sync_existing_orders_to_order_stats();
        $this->run_all_pending_queue();

        $row = $wpdb->get_row( $wpdb->prepare( "SELECT order_id, vendor_id FROM {$table} WHERE order_id = %d", $order_id ) ); // phpcs:ignore
        $this->assertNotNull( $row );
        $this->assertSame( (int) wc_get_order( $order_id )->get_meta( '_dokan_vendor_id' ), (int) $row->vendor_id );
    }
}
