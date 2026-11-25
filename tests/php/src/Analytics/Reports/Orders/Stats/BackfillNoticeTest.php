<?php

namespace WeDevs\Dokan\Test\Analytics\Reports\Orders\Stats;

use Automattic\WooCommerce\Admin\ReportsSync;
use WeDevs\Dokan\Analytics\Reports\Orders\Stats\BackfillNotice;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * The rebuild notice shows only while a Dokan-started backfill is running.
 *
 * @group analytics
 */
class BackfillNoticeTest extends DokanTestCase {
    /**
     * @var BackfillNotice
     */
    private $notice;

    public function set_up() {
        parent::set_up();
        $this->reset_import_queue();
        $this->notice = new BackfillNotice();
        wp_set_current_user( $this->admin_id );
    }

    public function tear_down() {
        $this->reset_import_queue();
        delete_option( BackfillNotice::OPTION );
        parent::tear_down();
    }

    private function reset_import_queue(): void {
        $this->cancel_all_pending_queue();
        ReportsSync::clear_queued_actions();
    }

    // Queue a real WC import so ReportsSync::is_importing() is true.
    private function start_backfill(): void {
        $this->create_single_vendor_order();
        $this->run_all_pending_queue();
        $this->assertIsString( ReportsSync::regenerate_report_data( false, false ) );
        $this->assertTrue( ReportsSync::is_importing() );
        BackfillNotice::mark_started();
    }

    private function notice_titles(): array {
        return wp_list_pluck( $this->notice->add_notice( [] ), 'title' );
    }

    public function test_hook_is_registered_at_boot() {
        $booted = dokan_get_container()->get( BackfillNotice::class );

        $this->assertNotFalse( has_filter( 'dokan_admin_notices', [ $booted, 'add_notice' ] ) );
    }

    public function test_no_notice_without_a_started_backfill() {
        $this->assertSame( [], $this->notice->add_notice( [] ) );
    }

    public function test_notice_is_global_while_the_backfill_runs() {
        $this->start_backfill();

        $notices = $this->notice->add_notice( [] );

        $this->assertCount( 1, $notices );
        $this->assertSame( 'global', $notices[0]['scope'] );
        $this->assertSame( 'info', $notices[0]['type'] );
        $this->assertStringContainsString( 'path=/analytics/settings', $notices[0]['actions'][0]['action'] );
        $this->assertArrayNotHasKey( 'show_close_button', $notices[0] );
    }

    public function test_existing_notices_are_kept() {
        $this->start_backfill();

        $notices = $this->notice->add_notice( [ [ 'title' => 'Other' ] ] );

        $this->assertSame( 'Other', $notices[0]['title'] );
        $this->assertCount( 2, $notices );
    }

    public function test_vendors_do_not_see_the_notice() {
        $this->start_backfill();
        wp_set_current_user( $this->seller_id1 );

        $this->assertSame( [], $this->notice_titles() );
        $this->assertNotEmpty( get_option( BackfillNotice::OPTION ) );
    }

    public function test_marker_is_cleared_once_the_import_finishes() {
        $this->start_backfill();
        $this->run_all_pending_queue();
        $this->assertFalse( ReportsSync::is_importing() );

        $this->assertSame( [], $this->notice_titles() );
        $this->assertFalse( get_option( BackfillNotice::OPTION ) );
    }

    public function test_stale_marker_is_cleared_even_while_an_import_runs() {
        $this->start_backfill();
        update_option( BackfillNotice::OPTION, time() - BackfillNotice::MAX_AGE - 1 );

        $this->assertTrue( ReportsSync::is_importing() );
        $this->assertSame( [], $this->notice_titles() );
        $this->assertFalse( get_option( BackfillNotice::OPTION ) );
    }

    public function test_marker_without_a_running_import_is_cleared() {
        BackfillNotice::mark_started();

        $this->assertFalse( BackfillNotice::is_running() );
        $this->assertFalse( get_option( BackfillNotice::OPTION ) );
    }
}
