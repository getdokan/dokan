<?php

namespace WeDevs\Dokan\Test\Abilities;

use WeDevs\Dokan\Abilities\Definitions\OrdersSummaryGet;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_Error;

/**
 * @group abilities
 *
 * `dokan/orders-summary-get`: own-store counts for vendors and staff, any store for a Store Admin.
 */
class OrdersSummaryGetTest extends DokanTestCase {

    public function test_registration_shape() {
        $args = OrdersSummaryGet::get_registration_args();

        $this->assertSame( 'dokan/orders-summary-get', OrdersSummaryGet::get_name() );
        $this->assertSame( 'dokan', $args['category'] );
        $this->assertSame( [], $args['input_schema']['default'] );
        $this->assertTrue( $args['meta']['annotations']['readonly'] );
        $this->assertTrue( is_callable( $args['permission_callback'] ) );
    }

    public function test_vendor_gets_their_own_counts_and_cannot_pick_another_store() {
        $this->create_single_vendor_order( $this->seller_id1 );
        $this->create_single_vendor_order( $this->seller_id1 );
        $this->create_single_vendor_order( $this->seller_id2 );

        wp_set_current_user( $this->seller_id1 );

        $result = OrdersSummaryGet::execute( [ 'vendor_id' => $this->seller_id2 ] );

        $this->assertSame( $this->seller_id1, $result['vendor_id'] );
        $this->assertSame( 2, $result['total'] );
        $this->assertArrayHasKey( 'processing', $result['counts'] );
        $this->assertArrayNotHasKey( 'wc-processing', $result['counts'] );
        $this->assertSame( 2, array_sum( $result['counts'] ) );
    }

    public function test_store_admin_may_pick_a_store() {
        $this->create_single_vendor_order( $this->seller_id2 );

        wp_set_current_user( $this->admin_id );

        $result = OrdersSummaryGet::execute( [ 'vendor_id' => $this->seller_id2 ] );

        $this->assertSame( $this->seller_id2, $result['vendor_id'] );
        $this->assertSame( 1, $result['total'] );

        $missing = OrdersSummaryGet::execute( [ 'vendor_id' => $this->customer_id ] );

        $this->assertInstanceOf( WP_Error::class, $missing );
        $this->assertSame( 'dokan_ability_invalid_vendor', $missing->get_error_code() );
    }

    public function test_staff_need_the_order_report_capability() {
        $this->create_single_vendor_order( $this->seller_id1 );

        $staff_id = $this->create_vendor_staff( $this->seller_id1 );
        wp_set_current_user( $staff_id );

        $this->assertFalse( OrdersSummaryGet::check_permission() );
        $this->assertInstanceOf( WP_Error::class, OrdersSummaryGet::execute( [] ) );

        wp_get_current_user()->add_cap( 'dokan_view_order_report' );

        $this->assertTrue( OrdersSummaryGet::check_permission() );

        $result = OrdersSummaryGet::execute( [] );

        $this->assertSame( $this->seller_id1, $result['vendor_id'] );
        $this->assertSame( 1, $result['total'] );
    }

    public function test_customers_are_refused() {
        wp_set_current_user( $this->customer_id );

        $this->assertFalse( OrdersSummaryGet::check_permission() );

        $result = OrdersSummaryGet::execute( [] );

        $this->assertInstanceOf( WP_Error::class, $result );
        $this->assertSame( 'dokan_ability_forbidden', $result->get_error_code() );
    }
}
