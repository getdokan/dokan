<?php

namespace WeDevs\Dokan\Test\Admin\OnboardingSetup;

use WeDevs\Dokan\Admin\OnboardingSetup\Steps\AppearanceStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\BasicStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\CommissionStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\WithdrawStep;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Onboarding steps converge onto the canonical admin settings schema.
 *
 * @group onboarding
 * @group admin-settings
 */
class StepConvergenceTest extends DokanTestCase {

    /**
     * Each step declares canonical SettingsSchema field ids.
     *
     * @return void
     */
    public function test_steps_declare_canonical_field_ids(): void {
        $this->assertSame(
            [
                'shipping_fee_recipient',
                'product_tax_fee_recipient',
                'shipping_tax_fee_recipient',
                'vendor_can_change_order_status',
                'vendor_auto_enable_selling',
            ],
            dokan_get_container()->get( BasicStep::class )->get_field_ids()
        );

        $this->assertSame(
            [
                'commission_type',
                'admin_commission',
                'reset_sub_category_when_edit_all_category',
                'commission_category_based_values',
            ],
            dokan_get_container()->get( CommissionStep::class )->get_field_ids()
        );

        $this->assertSame(
            [
                'paypal_withdraw',
                'bank_transfer_withdraw',
                'minimum_withdraw_limit',
                'withdraw_order_status',
            ],
            dokan_get_container()->get( WithdrawStep::class )->get_field_ids()
        );

        $this->assertSame(
            [
                'store_contact_form_enabled',
                'store_sidebar_from_theme',
                'store_page_vendor_info_visibility',
            ],
            dokan_get_container()->get( AppearanceStep::class )->get_field_ids()
        );
    }

    /**
     * populate() returns a page subtree (hide_save) plus the harvested fields.
     *
     * @return void
     */
    public function test_populate_returns_page_with_canonical_fields(): void {
        $step     = dokan_get_container()->get( BasicStep::class );
        $elements = $step->populate();

        $page = $elements[0];
        $this->assertSame( 'page', $page['type'] );
        $this->assertSame( 'basic', $page['id'] );
        $this->assertTrue( $page['hide_save'] );

        $field_ids = [];
        foreach ( $elements as $element ) {
            if ( 'field' === ( $element['type'] ?? '' ) ) {
                $field_ids[] = $element['id'];
                // Fields are re-parented under the wizard section.
                $this->assertSame( 'basic_section', $element['section_id'] );
            }
        }

        $this->assertContains( 'shipping_fee_recipient', $field_ids );
        $this->assertContains( 'vendor_can_change_order_status', $field_ids );
    }

    /**
     * save() writes canonical ids into the single dokan_admin_settings option
     * and ignores keys the step does not declare.
     *
     * @return void
     */
    public function test_save_writes_whitelisted_canonical_ids(): void {
        $step = dokan_get_container()->get( BasicStep::class );

        $step->save(
            [
                'shipping_fee_recipient'         => 'admin',
                'vendor_can_change_order_status' => 'off',
                'not_a_basic_field'              => 'x',
            ]
        );

        $stored = get_option( SettingsRepository::OPTION_KEY, [] );

        $this->assertSame( 'admin', $stored['shipping_fee_recipient'] );
        $this->assertSame( 'off', $stored['vendor_can_change_order_status'] );
        $this->assertArrayNotHasKey( 'not_a_basic_field', $stored );
    }

    /**
     * Saving a canonical id is reflected on the legacy option through the
     * settings read-overlay — the step never writes the legacy option directly.
     *
     * @return void
     */
    public function test_save_reflects_on_legacy_option_via_overlay(): void {
        $step = dokan_get_container()->get( BasicStep::class );
        $step->save( [ 'shipping_fee_recipient' => 'admin' ] );

        $selling = get_option( 'dokan_selling', [] );
        $this->assertSame( 'admin', $selling['shipping_fee_recipient'] );
    }

    /**
     * save() marks the step completed; the flag is decoupled from setting values.
     *
     * @return void
     */
    public function test_save_marks_step_completed(): void {
        $step = dokan_get_container()->get( BasicStep::class );
        $this->assertFalse( $step->is_completed() );

        $step->save( [ 'shipping_fee_recipient' => 'seller' ] );

        $this->assertTrue( $step->is_completed() );
    }
}
