<?php

namespace WeDevs\Dokan\Test\Abilities;

use WeDevs\Dokan\Abilities\Definitions\CurrentVendor;
use WeDevs\Dokan\Abilities\Definitions\VendorsQuery;
use WeDevs\Dokan\Abilities\Definitions\VendorStatsGet;
use WeDevs\Dokan\Abilities\Definitions\WithdrawsQuery;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;

/**
 * @group abilities
 *
 * Tests for the Dokan-native abilities: their registration shape, vendor-only permission,
 * and that their data is scoped to the current vendor.
 */
class DokanNativeAbilitiesTest extends DokanTestCase {

    /**
     * Create a pending withdrawal for a vendor.
     *
     * @param int   $vendor_id Vendor user ID.
     * @param float $amount    Amount.
     *
     * @return void
     */
    private function create_pending_withdraw( int $vendor_id, float $amount = 50 ): void {
        dokan()->withdraw->create(
            [
                'user_id' => $vendor_id,
                'amount'  => $amount,
                'status'  => 0, // pending.
                'method'  => 'paypal',
                'date'    => dokan_current_datetime()->format( 'Y-m-d H:i:s' ),
            ]
        );
    }

    public function test_ability_names() {
        $this->assertSame( 'dokan/withdraws-query', WithdrawsQuery::get_name() );
        $this->assertSame( 'dokan/vendor-stats-get', VendorStatsGet::get_name() );
    }

    public function test_registration_args_shape() {
        foreach ( [ WithdrawsQuery::class, VendorStatsGet::class ] as $ability ) {
            $args = $ability::get_registration_args();

            $this->assertArrayHasKey( 'label', $args );
            $this->assertArrayHasKey( 'input_schema', $args );
            $this->assertArrayHasKey( 'output_schema', $args );
            $this->assertSame( 'dokan', $args['category'] );
            $this->assertTrue( is_callable( $args['execute_callback'] ) );
            $this->assertTrue( is_callable( $args['permission_callback'] ) );
            $this->assertTrue( $args['meta']['show_in_rest'] );
            $this->assertTrue( $args['meta']['mcp']['public'] );
            $this->assertTrue( $args['meta']['annotations']['readonly'] );
        }
    }

    /**
     * Every Dokan ability must declare an input-schema `default` so it can be invoked with no
     * arguments. The Abilities API normalizes a null input to that default *before* schema
     * validation (WP_Ability::normalize_input() → validate_input()); without it, a no-parameter
     * MCP tool call sends null, which fails `{"type":"object"}` validation and returns an
     * `ability_invalid_input` error at execution time — even though registration looks valid.
     *
     * Regression guard for `dokan/current-vendor` / `dokan/vendor-stats-get` failing over MCP.
     */
    public function test_object_input_schema_declares_default_for_no_argument_invocation() {
        $abilities = [ CurrentVendor::class, VendorStatsGet::class, WithdrawsQuery::class, VendorsQuery::class ];

        foreach ( $abilities as $ability ) {
            $schema = $ability::get_registration_args()['input_schema'];

            // Only object schemas are affected: a null input must normalize to a valid object.
            if ( isset( $schema['type'] ) && 'object' === $schema['type'] ) {
                $this->assertArrayHasKey(
                    'default',
                    $schema,
                    sprintf( '%s input_schema must declare a `default` so null input normalizes to a valid object.', $ability::get_name() )
                );
                $this->assertSame( [], $schema['default'], sprintf( '%s input_schema default should be an empty object.', $ability::get_name() ) );
            }
        }
    }

    public function test_permission_callback_allows_vendor_denies_non_vendor() {
        wp_set_current_user( $this->seller_id1 );
        $this->assertTrue( WithdrawsQuery::is_current_user_vendor() );
        $this->assertTrue( VendorStatsGet::is_current_user_vendor() );

        wp_set_current_user( $this->customer_id );
        $this->assertFalse( WithdrawsQuery::is_current_user_vendor() );
        $this->assertFalse( VendorStatsGet::is_current_user_vendor() );
    }

    public function test_withdraws_query_returns_only_current_vendor_requests() {
        $this->create_pending_withdraw( $this->seller_id1 );
        $this->create_pending_withdraw( $this->seller_id1 );
        $this->create_pending_withdraw( $this->seller_id2 );

        wp_set_current_user( $this->seller_id1 );
        $result = WithdrawsQuery::execute( [ 'status' => 'pending' ] );

        $this->assertArrayHasKey( 'withdraws', $result );
        $this->assertCount( 2, $result['withdraws'] );

        wp_set_current_user( $this->seller_id2 );
        $result = WithdrawsQuery::execute( [ 'status' => 'pending' ] );

        $this->assertCount( 1, $result['withdraws'] );
    }

    public function test_withdraws_query_forbidden_for_non_vendor() {
        wp_set_current_user( $this->customer_id );

        $result = WithdrawsQuery::execute( [] );

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_ability_forbidden', $result->get_error_code() );
    }

    public function test_vendor_stats_get_is_scoped_to_current_vendor() {
        $this->create_pending_withdraw( $this->seller_id1 );
        $this->create_pending_withdraw( $this->seller_id1 );
        $this->create_pending_withdraw( $this->seller_id2 );

        wp_set_current_user( $this->seller_id1 );
        $result = VendorStatsGet::execute( [] );

        $this->assertSame( $this->seller_id1, $result['vendor_id'] );
        $this->assertArrayHasKey( 'balance', $result );
        $this->assertSame( 2, $result['withdraw_summary']['total'] );
        $this->assertSame( 2, $result['withdraw_summary']['pending'] );
    }

    public function test_vendor_stats_get_forbidden_for_non_vendor() {
        wp_set_current_user( $this->customer_id );

        $result = VendorStatsGet::execute( [] );

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_ability_forbidden', $result->get_error_code() );
    }

    public function test_vendors_query_name_and_args() {
        $this->assertSame( 'dokan/vendors-query', VendorsQuery::get_name() );

        $args = VendorsQuery::get_registration_args();
        $this->assertSame( 'dokan', $args['category'] );
        $this->assertArrayHasKey( 'search', $args['input_schema']['properties'] );
        $this->assertTrue( $args['meta']['annotations']['readonly'] );
    }

    public function test_vendors_query_is_public_like_the_store_directory() {
        $args = VendorsQuery::get_registration_args();

        // Mirrors the public dokan/v1/stores endpoint.
        $this->assertSame( '__return_true', $args['permission_callback'] );
    }

    public function test_vendors_query_returns_vendors_for_any_caller() {
        // A vendor (not an admin) can still browse the public marketplace directory.
        wp_set_current_user( $this->seller_id1 );

        $result = VendorsQuery::execute( [ 'status' => 'all' ] );

        $this->assertArrayHasKey( 'vendors', $result );
        $ids = wp_list_pluck( $result['vendors'], 'id' );
        $this->assertContains( $this->seller_id1, $ids );
        $this->assertContains( $this->seller_id2, $ids );
    }

    public function test_current_vendor_resolves_vendor_identity() {
        wp_set_current_user( $this->seller_id1 );

        $result = CurrentVendor::execute( [] );

        $this->assertSame( $this->seller_id1, $result['user_id'] );
        $this->assertSame( $this->seller_id1, $result['vendor_id'] );
        $this->assertTrue( $result['is_vendor'] );
        $this->assertFalse( $result['is_staff'] );
    }

    public function test_current_vendor_resolves_staff_to_parent_vendor() {
        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $result = CurrentVendor::execute( [] );

        $this->assertSame( $staff_id, $result['user_id'] );
        $this->assertSame( $this->seller_id1, $result['vendor_id'] );
        $this->assertTrue( $result['is_vendor'] );
        $this->assertTrue( $result['is_staff'] );
    }

    public function test_current_vendor_reports_admin_without_store() {
        wp_set_current_user( $this->admin_id );

        $result = CurrentVendor::execute( [] );

        $this->assertTrue( $result['is_admin'] );
        $this->assertFalse( $result['is_vendor'] );
        $this->assertSame( 0, $result['vendor_id'] );
    }

    public function test_current_vendor_responds_for_anonymous_without_error() {
        wp_set_current_user( 0 );

        $result = CurrentVendor::execute( [] );

        $this->assertSame( 0, $result['user_id'] );
        $this->assertFalse( $result['is_vendor'] );
        $this->assertFalse( $result['is_admin'] );
    }

    public function test_current_vendor_recognizes_admin_who_is_also_a_vendor() {
        // An admin can also run a store; selling must actually be enabled for them.
        update_user_meta( $this->admin_id, 'dokan_enable_selling', 'yes' );
        wp_set_current_user( $this->admin_id );

        $result = CurrentVendor::execute( [] );

        $this->assertTrue( $result['is_admin'] );
        $this->assertTrue( $result['is_vendor'] );
        $this->assertSame( $this->admin_id, $result['vendor_id'] );
    }

    /**
     * Create a vendor whose store has not been approved yet.
     *
     * @param int $vendor_id Vendor user ID.
     *
     * @return void
     */
    private function make_vendor_pending( int $vendor_id ): void {
        update_user_meta( $vendor_id, 'dokan_enable_selling', 'no' );
    }

    /**
     * Vendor staff share their vendor's data scope but keep their own, narrower capabilities.
     * Without a capability gate they reach vendor data their staff permissions exclude.
     */
    public function test_withdraws_query_denied_for_staff_without_withdraw_capability() {
        $this->create_pending_withdraw( $this->seller_id1 );

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        // Scope still resolves to the parent vendor — only the capability is missing.
        $this->assertSame( $this->seller_id1, dokan_get_current_user_id() );
        $this->assertFalse( current_user_can( 'dokan_manage_withdraw' ) );

        $result = WithdrawsQuery::execute( [] );

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_ability_forbidden', $result->get_error_code() );
    }

    public function test_withdraws_query_allowed_for_staff_with_withdraw_capability() {
        $this->create_pending_withdraw( $this->seller_id1 );

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        ( new \WP_User( $staff_id ) )->add_cap( 'dokan_manage_withdraw' );
        wp_set_current_user( $staff_id );

        $result = WithdrawsQuery::execute( [] );

        $this->assertIsArray( $result );
        $this->assertCount( 1, $result['withdraws'] );
    }

    public function test_vendor_stats_denied_for_staff_without_overview_capability() {
        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $result = VendorStatsGet::execute( [] );

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_ability_forbidden', $result->get_error_code() );
    }

    public function test_store_admin_bypasses_the_capability_gate() {
        wp_set_current_user( $this->admin_id );

        $this->assertTrue( WithdrawsQuery::check_permission() );
        $this->assertTrue( VendorStatsGet::check_permission() );
    }

    public function test_required_capability_is_filterable() {
        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $this->assertFalse( WithdrawsQuery::check_permission() );

        $drop_requirement = static function ( $capability, $ability_name ) {
            return 'dokan/withdraws-query' === $ability_name ? '' : $capability;
        };

        add_filter( 'dokan_ability_required_capability', $drop_requirement, 10, 2 );
        $permitted = WithdrawsQuery::check_permission();
        remove_filter( 'dokan_ability_required_capability', $drop_requirement, 10 );

        $this->assertTrue( $permitted );
    }

    /**
     * A vendor awaiting approval is not public information, so an anonymous caller asking for
     * pending vendors is served the approved directory instead.
     */
    public function test_vendors_query_pending_is_coerced_to_approved_for_anonymous() {
        $this->make_vendor_pending( $this->seller_id2 );
        wp_set_current_user( 0 );

        $result = VendorsQuery::execute( [ 'status' => 'pending' ] );

        $ids = wp_list_pluck( $result['vendors'], 'id' );
        $this->assertNotContains( $this->seller_id2, $ids );
    }

    public function test_vendors_query_all_is_coerced_to_approved_for_a_vendor() {
        $this->make_vendor_pending( $this->seller_id2 );
        wp_set_current_user( $this->seller_id1 );

        $result = VendorsQuery::execute( [ 'status' => 'all' ] );

        $ids = wp_list_pluck( $result['vendors'], 'id' );
        $this->assertContains( $this->seller_id1, $ids );
        $this->assertNotContains( $this->seller_id2, $ids );
    }

    public function test_vendors_query_pending_is_allowed_for_store_admin() {
        $this->make_vendor_pending( $this->seller_id2 );
        wp_set_current_user( $this->admin_id );

        $result = VendorsQuery::execute( [ 'status' => 'pending' ] );

        $ids = wp_list_pluck( $result['vendors'], 'id' );
        $this->assertContains( $this->seller_id2, $ids );
    }

    public function test_vendors_query_rejects_an_unknown_status() {
        wp_set_current_user( $this->admin_id );

        $result = VendorsQuery::execute( [ 'status' => 'bogus' ] );

        $this->assertIsArray( $result );
        $this->assertArrayHasKey( 'vendors', $result );
    }
}
