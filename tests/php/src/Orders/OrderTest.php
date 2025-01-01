<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Test\DokanTestCase;

class OrderTest extends DokanTestCase {

    public function test_dokan_order_creation_log_on_exception() {
        $error_message = '';
        add_filter(
            'woocommerce_logger_log_message', function ( $message ) use ( &$error_message ) {

				if ( str_starts_with( $message, 'Error in create_sub_order' ) ) {
					$error_message = $message;
				}

				return $message;
			}
        );

        add_action(
            'dokan_create_sub_order_before_calculate_totals', function () {
				throw new \Exception( 'dokan sub order creation error' );
			}
        );

        $parent_order_id = $this->create_multi_vendor_order();

        $order = wc_get_order( $parent_order_id );
        $this->assertCount( 2, $order->get_shipping_methods() );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_order_id );

        $this->assertNull( $sub_order_ids );

        $this->assertStringContainsString( 'Error in create_sub_order', $error_message );
    }

    public function test_dokan_order_creation_log_on_error() {
        $error_message = '';
        add_filter(
            'woocommerce_logger_log_message', function ( $message ) use ( &$error_message ) {

				if ( str_starts_with( $message, 'Error in create_sub_order' ) ) {
					$error_message = $message;
				}

				return $message;
			}
        );

        add_action(
            'dokan_create_sub_order_before_calculate_totals', function () {
				throw new \Error( 'dokan sub order creation error' );
			}
        );

        $parent_order_id = $this->create_multi_vendor_order();

        $order = wc_get_order( $parent_order_id );

        $this->assertCount( 2, $order->get_shipping_methods() );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_order_id );

        $this->assertNull( $sub_order_ids );

        $this->assertStringContainsString( 'Error in create_sub_order', $error_message );
    }

    public function test_dokan_order_creation_log_on_undefined_function() {
        $error_message = '';
        add_filter(
            'woocommerce_logger_log_message', function ( $message ) use ( &$error_message ) {

				if ( str_starts_with( $message, 'Error in create_sub_order' ) ) {
					$error_message = $message;
				}

				return $message;
			}
        );

        add_action(
            'dokan_create_sub_order_before_calculate_totals', function () {
				dokan_undefined_function();
			}
        );

        $parent_order_id = $this->create_multi_vendor_order();

        $order = wc_get_order( $parent_order_id );

        $this->assertCount( 2, $order->get_shipping_methods() );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_order_id );

        $this->assertNull( $sub_order_ids );

        $this->assertStringContainsString( 'Error in create_sub_order', $error_message );
    }

    public function test_dokan_order_creation_log_on_success() {
        $error_message = '';
        add_filter(
            'woocommerce_logger_log_message', function ( $message ) use ( &$error_message ) {

				if ( str_starts_with( $message, 'Error in create_sub_order' ) ) {
					$error_message = $message;
				}

				return $message;
			}
        );

        $parent_order_id = $this->create_multi_vendor_order();

        $order = wc_get_order( $parent_order_id );

        $this->assertCount( 2, $order->get_shipping_methods() );

        $sub_order_ids = dokan_get_suborder_ids_by( $parent_order_id );

        $this->assertNotNull( $sub_order_ids );

        $this->assertEquals( '', $error_message );
        $this->assertCount( 2, $sub_order_ids );
    }
}
