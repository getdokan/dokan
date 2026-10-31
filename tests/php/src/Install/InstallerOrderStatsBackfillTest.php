<?php

namespace WeDevs\Dokan\Test\Install;

use Automattic\WooCommerce\Admin\ReportsSync;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\DataStore;
use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Install\Installer;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Activation must backfill dokan_order_stats when orders exist but the table is empty.
 *
 * @group install
 * @group analytics
 */
class InstallerOrderStatsBackfillTest extends DokanTestCase {
    /**
     * Messages Dokan wrote to the WC logger during a test.
     *
     * @var string[]
     */
    private $logged = [];

    public function setUp(): void {
        parent::setUp();
        $this->reset_import_queue();
        $this->logged = [];
        add_filter( 'woocommerce_logger_log_message', [ $this, 'capture_dokan_log' ], 10, 3 );
    }

    protected function tearDown(): void {
        $this->reset_import_queue();
        remove_filter( 'woocommerce_logger_log_message', [ $this, 'capture_dokan_log' ] );
        remove_filter( 'dokan_analytics_backfill_order_stats_on_activation', '__return_false' );
        update_option( 'woocommerce_analytics_enabled', 'yes' );
        parent::tearDown();
    }

    // Keep unique backfill lines only: WC runs this filter once per log handler, and other Dokan code logs to the same source.
    public function capture_dokan_log( $message, $level, $context ) {
        if ( 'dokan' === ( $context['source'] ?? '' ) && false !== strpos( $message, 'backfill' ) && ! in_array( $message, $this->logged, true ) ) {
            $this->logged[] = $message;
        }

        return $message;
    }

    // WC install leaves its own historical import queued, which makes is_importing() true.
    private function reset_import_queue(): void {
        $this->cancel_all_pending_queue();
        ReportsSync::clear_queued_actions();
    }

    private function truncate_dokan_stats(): void {
        global $wpdb;

        $wpdb->query( 'DELETE FROM ' . DataStore::get_db_table_name() ); // phpcs:ignore
    }

    // Creating an order queues a WC import and writes the Dokan row; undo both to mimic a stale site.
    private function create_order_without_dokan_stats(): int {
        $order_id = $this->create_single_vendor_order();
        $this->run_all_pending_queue();
        $this->truncate_dokan_stats();

        return $order_id;
    }

    // A WooCommerce order placed before Dokan existed: no vendor meta, no Dokan order row.
    private function create_plain_wc_order(): int {
        global $wpdb;

        $product = $this->factory()->product->create_and_get(
            [
				'price' => 10,
				'regular_price' => 10,
			]
        );
        $order   = wc_create_order( [ 'customer_id' => $this->customer_id ] );
        $order->add_product( $product, 2 );
        $order->calculate_totals();
        $order->set_status( 'completed' );
        $order->save();

        $order = wc_get_order( $order->get_id() );
        $order->delete_meta_data( '_dokan_vendor_id' );
        $order->delete_meta_data( 'has_sub_order' );
        $order->save();
        $wpdb->delete( $wpdb->prefix . 'dokan_orders', [ 'order_id' => $order->get_id() ] );

        $this->run_all_pending_queue();
        $this->truncate_dokan_stats();

        return $order->get_id();
    }

    private function get_stats_row( int $order_id ) {
        global $wpdb;

        return $wpdb->get_row( $wpdb->prepare( 'SELECT order_type, vendor_id FROM ' . DataStore::get_db_table_name() . ' WHERE order_id = %d', $order_id ) ); // phpcs:ignore
    }

    private function regenerate_count(): int {
        return did_action( 'woocommerce_analytics_regenerate_init' );
    }

    private function backfill(): void {
        ( new Installer() )->maybe_backfill_order_stats();
    }

    public function test_no_regeneration_is_scheduled_without_orders() {
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( $before, $this->regenerate_count() );
        $this->assertFalse( ReportsSync::is_importing() );
    }

    public function test_no_regeneration_is_scheduled_when_table_already_has_rows() {
        $this->create_single_vendor_order();
        $this->run_all_pending_queue();
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( $before, $this->regenerate_count() );
    }

    public function test_partially_populated_table_is_left_alone() {
        global $wpdb;

        $first = $this->create_single_vendor_order();
        $this->create_single_vendor_order();
        $this->run_all_pending_queue();
        $wpdb->delete( DataStore::get_db_table_name(), [ 'order_id' => $first ] );
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( $before, $this->regenerate_count() );
        $this->assertNull( $this->get_stats_row( $first ) );
    }

    public function test_no_regeneration_is_scheduled_when_only_trashed_orders_exist() {
        $order_id = $this->create_order_without_dokan_stats();
        wc_get_order( $order_id )->delete();
        $this->reset_import_queue();
        $this->truncate_dokan_stats();
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( 'trash', wc_get_order( $order_id )->get_status() );
        $this->assertSame( $before, $this->regenerate_count() );
    }

    public function test_no_regeneration_is_scheduled_when_wc_analytics_is_disabled() {
        $this->create_order_without_dokan_stats();
        update_option( 'woocommerce_analytics_enabled', 'no' );
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( $before, $this->regenerate_count() );
    }

    public function test_missing_wc_analytics_option_counts_as_enabled() {
        $this->create_order_without_dokan_stats();
        delete_option( 'woocommerce_analytics_enabled' );
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( $before + 1, $this->regenerate_count() );
    }

    public function test_filter_can_opt_out_of_regeneration() {
        $this->create_order_without_dokan_stats();
        add_filter( 'dokan_analytics_backfill_order_stats_on_activation', '__return_false' );
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( $before, $this->regenerate_count() );
    }

    public function test_regeneration_is_scheduled_when_orders_exist_and_table_is_empty() {
        $this->create_order_without_dokan_stats();
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( $before + 1, $this->regenerate_count() );
        $this->assertTrue( ReportsSync::is_importing() );
        $this->assertSame( [], $this->logged );
    }

    public function test_wc_refusal_is_logged_when_an_import_is_already_running() {
        $this->create_single_vendor_order(); // Leaves a WC import action pending.
        $this->truncate_dokan_stats();
        $this->assertTrue( ReportsSync::is_importing() );
        $before = $this->regenerate_count();

        $this->backfill();

        $this->assertSame( $before, $this->regenerate_count() );
        $this->assertCount( 1, $this->logged );
        $this->assertStringContainsString( 'backfill skipped', $this->logged[0] );
    }

    public function test_do_install_runs_the_backfill() {
        $this->create_order_without_dokan_stats();
        $before = $this->regenerate_count();

        ( new Installer() )->do_install();

        $this->assertSame( $before + 1, $this->regenerate_count() );
    }

    public function test_regeneration_fills_dokan_order_stats_for_existing_orders() {
        $order_id = $this->create_order_without_dokan_stats();

        $this->backfill();
        $this->run_all_pending_queue();

        $row = $this->get_stats_row( $order_id );
        $this->assertNotNull( $row );
        $this->assertSame( OrderType::DOKAN_SINGLE_ORDER, (int) $row->order_type );
        $this->assertSame( (int) wc_get_order( $order_id )->get_meta( '_dokan_vendor_id' ), (int) $row->vendor_id );
    }

    public function test_regeneration_covers_orders_placed_before_dokan() {
        $order_id = $this->create_plain_wc_order();

        $this->backfill();
        $this->run_all_pending_queue();

        $row = $this->get_stats_row( $order_id );
        $this->assertNotNull( $row );
        $this->assertSame( OrderType::DOKAN_SINGLE_ORDER, (int) $row->order_type );
        $this->assertSame( 0, (int) $row->vendor_id );
    }

    public function test_regeneration_covers_parent_and_suborders() {
        $parent_id = $this->create_multi_vendor_order();
        $this->run_all_pending_queue();
        $this->truncate_dokan_stats();
        $suborder_ids = wc_get_orders(
            [
				'parent' => $parent_id,
				'return' => 'ids',
				'limit' => -1,
			]
        );
        $this->assertCount( 2, $suborder_ids );

        $this->backfill();
        $this->run_all_pending_queue();

        $parent = $this->get_stats_row( $parent_id );
        $this->assertSame( OrderType::DOKAN_PARENT_ORDER, (int) $parent->order_type );
        $this->assertSame( 0, (int) $parent->vendor_id );

        $vendor_ids = [];
        foreach ( $suborder_ids as $suborder_id ) {
            $row = $this->get_stats_row( $suborder_id );
            $this->assertSame( OrderType::DOKAN_SUBORDER, (int) $row->order_type );
            $vendor_ids[] = (int) $row->vendor_id;
        }
        sort( $vendor_ids );
        $this->assertSame( [ $this->seller_id1, $this->seller_id2 ], $vendor_ids );
    }

    public function test_regeneration_covers_refunds() {
        $order_id = $this->create_single_vendor_order();
        $refund   = wc_create_refund(
            [
				'order_id' => $order_id,
				'amount' => 5,
				'reason' => 'corner case',
			]
        );
        $this->assertNotWPError( $refund );
        $this->run_all_pending_queue();
        $this->truncate_dokan_stats();

        $this->backfill();
        $this->run_all_pending_queue();

        $row = $this->get_stats_row( $refund->get_id() );
        $this->assertNotNull( $row );
        $this->assertSame( OrderType::DOKAN_SINGLE_ORDER_REFUND, (int) $row->order_type );
        $this->assertSame( (int) wc_get_order( $order_id )->get_meta( '_dokan_vendor_id' ), (int) $row->vendor_id );
    }
}
