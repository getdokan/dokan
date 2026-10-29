<?php

namespace WeDevs\Dokan\Test\Install;

use Automattic\WooCommerce\Admin\ReportsSync;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore;
use WeDevs\Dokan\Install\Installer;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Activation must backfill dokan_order_stats when orders exist but the table is empty.
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
        remove_filter( 'dokan_analytics_backfill_order_stats_on_activation', '__return_false' );
        update_option( 'woocommerce_analytics_enabled', 'yes' );
        parent::tearDown();
    }

    // WC install leaves its own historical import queued, which makes is_importing() true.
    private function reset_import_queue(): void {
        $this->cancel_all_pending_queue();
        ReportsSync::clear_queued_actions();
    }

    // Creating an order queues a WC import and writes the Dokan row; undo both to mimic a stale site.
    private function create_order_without_dokan_stats(): int {
        global $wpdb;

        $order_id = $this->create_single_vendor_order();
        $this->run_all_pending_queue();
        $wpdb->query( 'DELETE FROM ' . DataStore::get_db_table_name() ); // phpcs:ignore

        return $order_id;
    }

    private function regenerate_count(): int {
        return did_action( 'woocommerce_analytics_regenerate_init' );
    }

    public function test_no_regeneration_is_scheduled_without_orders() {
        $before = $this->regenerate_count();

        ( new Installer() )->maybe_backfill_order_stats();

        $this->assertSame( $before, $this->regenerate_count() );
        $this->assertFalse( ReportsSync::is_importing() );
    }

    public function test_no_regeneration_is_scheduled_when_table_already_has_rows() {
        $this->create_single_vendor_order();
        $this->run_all_pending_queue();
        $before = $this->regenerate_count();

        ( new Installer() )->maybe_backfill_order_stats();

        $this->assertSame( $before, $this->regenerate_count() );
    }

    public function test_filter_can_opt_out_of_regeneration() {
        $this->create_order_without_dokan_stats();
        add_filter( 'dokan_analytics_backfill_order_stats_on_activation', '__return_false' );
        $before = $this->regenerate_count();

        ( new Installer() )->maybe_backfill_order_stats();

        $this->assertSame( $before, $this->regenerate_count() );
    }

    public function test_no_regeneration_is_scheduled_when_wc_analytics_is_disabled() {
        $this->create_order_without_dokan_stats();
        update_option( 'woocommerce_analytics_enabled', 'no' );
        $before = $this->regenerate_count();

        ( new Installer() )->maybe_backfill_order_stats();

        $this->assertSame( $before, $this->regenerate_count() );
    }

    public function test_regeneration_is_scheduled_when_orders_exist_and_table_is_empty() {
        $this->create_order_without_dokan_stats();
        $before = $this->regenerate_count();

        ( new Installer() )->maybe_backfill_order_stats();

        $this->assertSame( $before + 1, $this->regenerate_count() );
        $this->assertTrue( ReportsSync::is_importing() );
    }

    public function test_regeneration_fills_dokan_order_stats_for_existing_orders() {
        global $wpdb;

        $order_id = $this->create_order_without_dokan_stats();
        $table    = DataStore::get_db_table_name();

        ( new Installer() )->maybe_backfill_order_stats();
        $this->run_all_pending_queue();

        $row = $wpdb->get_row( $wpdb->prepare( "SELECT order_id, vendor_id FROM {$table} WHERE order_id = %d", $order_id ) ); // phpcs:ignore
        $this->assertNotNull( $row );
        $this->assertSame( (int) wc_get_order( $order_id )->get_meta( '_dokan_vendor_id' ), (int) $row->vendor_id );
    }
}
