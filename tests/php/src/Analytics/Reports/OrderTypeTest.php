<?php

namespace WeDevs\Dokan\Test\Analytics\Reports;

use Exception;
use WeDevs\Dokan\Analytics\Reports\OrderType;
use WeDevs\Dokan\Test\DokanTestCase;

class OrderTypeTest extends DokanTestCase {
    public function test_wc_order_is_dokan_suborder_related_method() {
        $parent_id = $this->create_multi_vendor_order();

        $order_type = new OrderType();

        $parent_order = wc_get_order( $parent_id );

        $this->assertFalse( $order_type->is_dokan_suborder_related( $parent_order ) );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_id );

        foreach ( $sub_order_ids as $sub_id ) {
            $sub_order = wc_get_order( $sub_id );

            $this->assertTrue( $order_type->is_dokan_suborder_related( $sub_order ) );
        }
    }

    public function test_order_type_method_for_multi_vendor() {
        $parent_id = $this->create_multi_vendor_order();

        $order_type = new OrderType();

        $parent_order = wc_get_order( $parent_id );

        $this->assertEquals( OrderType::WC_ORDER, $order_type->get_type( $parent_order ) );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_id );

        foreach ( $sub_order_ids as $sub_id ) {
            $sub_order = wc_get_order( $sub_id );

            $this->assertEquals( OrderType::DOKAN_SUBORDER, $order_type->get_type( $sub_order ) );
        }
    }

    public function test_order_type_method_for_single_vendor() {
        $this->seller_id2 = $this->seller_id1;

        $parent_id = $this->create_multi_vendor_order();

        $order_type = new OrderType();

        $parent_order = wc_get_order( $parent_id );

        $this->assertEquals( OrderType::DOKAN_SINGLE_ORDER, $order_type->get_type( $parent_order ) );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_id );

		$this->assertNull( $sub_order_ids );
    }

    public function test_order_type_for_dokan_sub_refund() {
        $parent_id = $this->create_multi_vendor_order();

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_id );

        $sub_id = $sub_order_ids[0];

        $sub_order = wc_get_order( $sub_id );

        $sub_order_items = $sub_order->get_items();

        foreach ( $sub_order_items as $key => $item ) {
            $item_id = $item->get_id();

            $qty = $item->get_quantity() - 1;
            $amount = $item->get_total();

            $line_items[ $item_id ] = array(
                'qty'          => $qty,
                'refund_total' => $amount,
                'refund_tax'   => array(),
            );

            break;
        }

        // Create the refund object.
        $refund = wc_create_refund(
            array(
                'reason'         => 'Testing Refund',
                'order_id'       => $sub_id,
                'line_items'     => $line_items,
            )
        );

		if ( is_wp_error( $refund ) ) {
			throw new Exception( $refund->get_error_message() );
		}

        $order_type = new OrderType();

        $this->assertEquals( OrderType::DOKAN_SUBORDER_REFUND, $order_type->get_type( $refund ) );
    }

    public function test_order_type_for_wc_refund() {
        $parent_id = $this->create_multi_vendor_order();
        $parent_order = wc_get_order( $parent_id );
        $order_items = $parent_order->get_items();

        foreach ( $order_items as $key => $item ) {
            $item_id = $item->get_id();

            $qty = $item->get_quantity() - 1;
            $amount = $item->get_total();

            $line_items[ $item_id ] = array(
                'qty'          => $qty,
                'refund_total' => $amount,
                'refund_tax'   => array(),
            );

            break;
        }

        // Create the refund object.
        $refund = wc_create_refund(
            array(
                'reason'         => 'Testing Refund',
                'order_id'       => $parent_id,
                'line_items'     => $line_items,
            )
        );

		if ( is_wp_error( $refund ) ) {
			throw new Exception( $refund->get_error_message() );
		}

        $order_type = new OrderType();

        $this->assertEquals( OrderType::WC_ORDER_REFUND, $order_type->get_type( $refund ) );
    }
}
