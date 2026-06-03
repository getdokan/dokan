<?php

namespace WeDevs\Dokan\Test\ReverseWithdrawal;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\ReverseWithdrawal\SettingsHelper;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Behavior contract for ReverseWithdrawal\SettingsHelper.
 *
 * These tests are written against the pre-migration implementation that
 * reads via `dokan_get_option()`. They must remain green after the
 * migration to `dokan()->settings->get()`.
 *
 * @group reverse-withdrawal
 * @group settings-migration
 */
class SettingsHelperTest extends DokanTestCase {

    protected function setUp(): void {
        parent::setUp();
        $this->reset_storage();
    }

    protected function tearDown(): void {
        $this->reset_storage();
        parent::tearDown();
    }

    private function reset_storage(): void {
        ( new SettingsRepository() )->replace( [] );
        delete_option( 'dokan_reverse_withdrawal' );
    }

    public function test_is_enabled_returns_false_when_unset(): void {
        $this->assertFalse( SettingsHelper::is_enabled() );
    }

    public function test_is_enabled_returns_true_when_legacy_on(): void {
        update_option( 'dokan_reverse_withdrawal', [ 'enabled' => 'on' ] );
        $this->assertTrue( SettingsHelper::is_enabled() );
    }

    public function test_get_billing_type_default_is_by_amount(): void {
        $this->assertSame( 'by_amount', SettingsHelper::get_billing_type() );
    }

    public function test_get_billing_type_reads_legacy_value(): void {
        update_option( 'dokan_reverse_withdrawal', [ 'billing_type' => 'by_month' ] );
        $this->assertSame( 'by_month', SettingsHelper::get_billing_type() );
    }

    public function test_get_reverse_balance_threshold_default(): void {
        $this->assertSame( 150.0, SettingsHelper::get_reverse_balance_threshold() );
    }

    public function test_get_reverse_balance_threshold_reads_legacy(): void {
        update_option( 'dokan_reverse_withdrawal', [ 'reverse_balance_threshold' => '275.50' ] );
        $this->assertSame( 275.50, SettingsHelper::get_reverse_balance_threshold() );
    }

    public function test_get_billing_day_default_is_one(): void {
        $this->assertSame( 1, SettingsHelper::get_billing_day() );
    }

    public function test_get_due_period_default_is_seven(): void {
        $this->assertSame( 7, SettingsHelper::get_due_period() );
    }

    public function test_display_payment_notice_defaults_on(): void {
        $this->assertTrue( SettingsHelper::display_payment_notice_on_vendor_dashboard() );
    }

    public function test_send_balance_exceeded_announcement_defaults_off(): void {
        $this->assertFalse( SettingsHelper::send_balance_exceeded_announcement() );
    }

    public function test_is_failed_action_enabled_for_selected_action(): void {
        update_option(
            'dokan_reverse_withdrawal', [
				'failed_actions' => [ 'enable_catalog_mode' => 'enable_catalog_mode' ],
			]
        );
        $this->assertTrue( SettingsHelper::is_failed_action_enabled( 'enable_catalog_mode' ) );
        $this->assertFalse( SettingsHelper::is_failed_action_enabled( 'hide_withdraw_menu' ) );
    }

    public function test_get_failed_actions_returns_selected_actions(): void {
        update_option(
            'dokan_reverse_withdrawal', [
				'failed_actions' => [
					'enable_catalog_mode' => 'enable_catalog_mode',
					'status_inactive'     => 'status_inactive',
				],
			]
        );
        $actions = SettingsHelper::get_failed_actions();
        // Shape may be associative (pre-migration) or list (post-migration with
        // MulticheckArrayTransformer). Assert value membership only, not shape.
        $this->assertContains( 'enable_catalog_mode', $actions );
        $this->assertContains( 'status_inactive', $actions );
        $this->assertNotContains( 'hide_withdraw_menu', $actions );
    }

    public function test_is_gateway_enabled_for_reverse_withdrawal_cod(): void {
        update_option(
            'dokan_reverse_withdrawal', [
				'payment_gateways' => [ 'cod' => 'cod' ],
			]
        );
        $this->assertTrue( SettingsHelper::is_gateway_enabled_for_reverse_withdrawal( 'cod' ) );
        $this->assertFalse( SettingsHelper::is_gateway_enabled_for_reverse_withdrawal( 'stripe' ) );
    }
}
