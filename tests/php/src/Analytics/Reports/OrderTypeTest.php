<?php

namespace WeDevs\Dokan\Test\Analytics\Reports;

use Exception;
use WeDevs\Dokan\Analytics\Reports\OrderType;

/**
 * @group analytics
 */
class OrderTypeTest extends ReportTestCase {
    /**
     * System under test
     *
     * @var OrderType
     */
    private $sut;

    public function setUp(): void {
        parent::setUp();
        $this->sut = new OrderType();
    }

    public function test_wc_order_is_dokan_suborder_related_method() {
        $parent_id = $this->create_multi_vendor_order();
        $parent_order = wc_get_order( $parent_id );

        $this->assertFalse( $this->sut->is_dokan_suborder_related( $parent_order ) );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_id );

        foreach ( $sub_order_ids as $sub_id ) {
            $sub_order = wc_get_order( $sub_id );

            $this->assertTrue( $this->sut->is_dokan_suborder_related( $sub_order ) );
        }
    }

    public function test_order_type_method_for_multi_vendor() {
        $parent_id = $this->create_multi_vendor_order();
        $parent_order = wc_get_order( $parent_id );

        $this->assertEquals( $this->sut::DOKAN_PARENT_ORDER, $this->sut->get_type( $parent_order ) );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_id );

        foreach ( $sub_order_ids as $sub_id ) {
            $sub_order = wc_get_order( $sub_id );

            $this->assertEquals( $this->sut::DOKAN_SUBORDER, $this->sut->get_type( $sub_order ) );
        }
    }

    public function test_order_type_method_for_single_vendor() {
        $this->seller_id2 = $this->seller_id1;

        $parent_id = $this->create_multi_vendor_order();
        $parent_order = wc_get_order( $parent_id );

        $this->assertEquals( $this->sut::DOKAN_SINGLE_ORDER, $this->sut->get_type( $parent_order ) );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_id );

		$this->assertNull( $sub_order_ids );
    }

    public function test_order_type_for_dokan_sub_refund() {
        $parent_id = $this->create_multi_vendor_order();

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_id );
        $sub_id = $sub_order_ids[0];

        $refund = $this->create_refund( $sub_id );

        $this->assertEquals( $this->sut::DOKAN_SUBORDER_REFUND, $this->sut->get_type( $refund ) );
    }

    public function test_order_type_for_wc_refund() {
        $parent_id = $this->create_multi_vendor_order();

        $refund = $this->create_refund( $parent_id );

        $this->assertEquals( $this->sut::DOKAN_PARENT_ORDER_REFUND, $this->sut->get_type( $refund ) );
    }

    public function test_order_type_for_dokan_single_order_refund() {
        $this->seller_id2 = $this->seller_id1;

        $parent_id = $this->create_multi_vendor_order(); // Create single vendor order.

        $refund = $this->create_refund( $parent_id );

        $this->assertEquals( $this->sut::DOKAN_SINGLE_ORDER_REFUND, $this->sut->get_type( $refund ) );
    }
}
