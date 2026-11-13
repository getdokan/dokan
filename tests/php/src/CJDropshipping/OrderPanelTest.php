<?php

namespace WeDevs\Dokan\Test\CJDropshipping;

use WeDevs\Dokan\CJDropshipping\Data\LinkRepository;
use WeDevs\Dokan\CJDropshipping\Data\Schema;
use WeDevs\Dokan\CJDropshipping\Order\Fulfilment;
use WeDevs\Dokan\CJDropshipping\Order\Panel;
use WeDevs\Dokan\CJDropshipping\Settings;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * CJ panel on the vendor's order page.
 *
 * @since DOKAN_SINCE
 *
 * @group cj-dropshipping
 */
class OrderPanelTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        Schema::install();
        update_option( Settings::OPTION, [ 'enabled' => 'on' ] );
        add_filter( 'pre_wp_mail', '__return_true' );
    }

    protected function cj_order( int $vendor_id, array $warehouses = [ 'CN' ] ): \WC_Order {
        $order = wc_create_order();

        foreach ( $warehouses as $i => $warehouse ) {
            $item = new \WC_Order_Item_Product();
            $item->set_name( 'Case ' . $i );
            $item->set_quantity( 2 );
            $item->add_meta_data( '_dokan_cj_vid', 'V' . $i, true );
            $item->add_meta_data( '_dokan_cj_sku', 'CJ-V' . $i, true );
            $item->add_meta_data( '_dokan_cj_cost', '2.50', true );
            $item->add_meta_data( '_dokan_cj_warehouse', $warehouse, true );
            $order->add_item( $item );
        }

        $order->set_shipping_country( 'MX' );
        $order->set_shipping_address_1( 'Calle 1' );
        $order->set_status( 'processing' );
        $order->update_meta_data( '_dokan_vendor_id', $vendor_id );
        $order->save();

        global $wpdb;
        $wpdb->insert(
            $wpdb->prefix . 'dokan_orders', [
				'order_id'     => $order->get_id(),
				'seller_id'    => $vendor_id,
				'order_total'  => 10,
				'net_amount'   => 10,
				'order_status' => 'wc-processing',
			]
        );

        return $order;
    }

    protected function save( int $order_id, array $body ) {
        $request = new WP_REST_Request( 'POST', '/dokan/v1/cj-dropshipping/orders/' . $order_id );
        $request->set_body_params( $body );

        return rest_do_request( $request );
    }

    public function test_groups_by_warehouse_with_cj_cost() {
        $groups = ( new Fulfilment() )->groups( $this->cj_order( $this->seller_id1, [ 'CN', 'US', 'CN' ] ) );

        $this->assertSame( [ 'CN', 'US' ], array_keys( $groups ) );
        $this->assertCount( 2, $groups['CN']['items'] );
        $this->assertEquals( 10.0, $groups['CN']['cost'], '2 items x 2 qty x 2.50' );
    }

    public function test_only_the_owner_can_save_and_duplicates_are_reported() {
        $order = $this->cj_order( $this->seller_id1 );
        $other = $this->cj_order( $this->seller_id1 );

        wp_set_current_user( $this->seller_id2 );
        $this->assertSame( 404, $this->save( $order->get_id(), [ 'warehouse' => 'CN', 'cj_order_no' => 'X' ] )->get_status() ); // phpcs:ignore

        wp_set_current_user( $this->seller_id1 );
        $this->assertSame( 200, $this->save( $other->get_id(), [ 'warehouse' => 'CN', 'cj_order_no' => 'CJ-1' ] )->get_status() ); // phpcs:ignore

        $response = $this->save( $order->get_id(), [ 'warehouse' => 'CN', 'cj_order_no' => 'CJ-1', 'tracking_no' => 'YT1' ] ); // phpcs:ignore
        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( [ $other->get_order_number() ], $response->get_data()['duplicates'] );
        $this->assertTrue( $response->get_data()['fully_ordered'] );

        $notes = wp_list_pluck( wc_get_order_notes( [ 'order_id' => $order->get_id() ] ), 'content' );
        $this->assertNotEmpty( preg_grep( '/Ordered on CJ: CJ-1/', $notes ) );
        $this->assertNotEmpty( preg_grep( '/CJ tracking number: YT1/', $notes ) );
    }

    public function test_mark_delivered_needs_every_group_ordered_then_completes() {
        $order = $this->cj_order( $this->seller_id1, [ 'CN', 'US' ] );
        wp_set_current_user( $this->seller_id1 );
        $delivered = new WP_REST_Request( 'POST', '/dokan/v1/cj-dropshipping/orders/' . $order->get_id() . '/delivered' );

        $this->save( $order->get_id(), [ 'warehouse' => 'CN', 'cj_order_no' => 'CJ-A' ] ); // phpcs:ignore
        $this->assertSame( 400, rest_do_request( $delivered )->get_status() );

        $this->save( $order->get_id(), [ 'warehouse' => 'US', 'cj_order_no' => 'CJ-B' ] ); // phpcs:ignore
        $this->assertSame( 200, rest_do_request( $delivered )->get_status() );
        $this->assertSame( 'completed', wc_get_order( $order->get_id() )->get_status() );
    }

    public function test_order_changed_after_ordering_on_cj_is_flagged_once() {
        $order = $this->cj_order( $this->seller_id1 );
        ( new Fulfilment() )->save( $order, $this->seller_id1, 'CN', 'CJ-9', '' );
        $order = wc_get_order( $order->get_id() );

        $this->assertFalse( Fulfilment::changed_since_ordered( $order ) );

        $order->set_shipping_address_1( 'Calle 2' );
        $order->save();
        $order = wc_get_order( $order->get_id() );

        $this->assertTrue( Fulfilment::changed_since_ordered( $order ) );
        $this->assertNotEmpty( $order->get_meta( Fulfilment::CHANGED_META ) );
    }

    public function test_cj_products_cannot_be_added_to_manual_orders() {
        $product = $this->factory()->product->create_and_get();
        ( new LinkRepository() )->link( $product->get_id(), $product->get_id(), $this->seller_id1, 'V9', 'P9' );
        $plain = $this->factory()->product->create_and_get();

        $panel = new Panel();
        $this->assertTrue( is_wp_error( $panel->block_manual_add( null, $product ) ) );
        $this->assertNull( $panel->block_manual_add( null, $plain ) );
    }

    public function test_awaiting_lists_paid_orders_not_yet_ordered_on_cj() {
        $waiting = $this->cj_order( $this->seller_id1 );
        $done    = $this->cj_order( $this->seller_id1 );
        ( new Fulfilment() )->save( $done, $this->seller_id1, 'CN', 'CJ-5', '' );

        $this->assertSame( [ $waiting->get_id() ], ( new Fulfilment() )->awaiting( $this->seller_id1 ) );
    }

    public function test_delivered_only_for_processing_orders_and_rest_orders_reject_cj_items() {
        $order = $this->cj_order( $this->seller_id1 );
        ( new Fulfilment() )->save( $order, $this->seller_id1, 'CN', 'CJ-7', '' );
        $order->set_status( 'refunded' );
        $order->save();

        $this->assertSame( 'dokan_cj_not_processing', ( new Fulfilment() )->mark_delivered( wc_get_order( $order->get_id() ) )->get_error_code() );

        $product = $this->factory()->product->create_and_get();
        ( new LinkRepository() )->link( $product->get_id(), $product->get_id(), $this->seller_id1, 'V8', 'P8' );
        $manual = new \WC_Order();
        $item   = new \WC_Order_Item_Product();
        $item->set_product( $product );
        $manual->add_item( $item );

        $this->assertSame( 'dokan_cj_manual_order', ( new Panel() )->block_rest_add( $manual, null, true )->get_error_code() );
    }

    public function test_freight_ignores_shipping_lines_without_cj_routes() {
        $order    = $this->cj_order( $this->seller_id1 );
        $shipping = new \WC_Order_Item_Shipping();
        $shipping->add_meta_data( '_dokan_cj_groups', '', true );
        $order->add_item( $shipping );
        $order->save();

        $this->assertSame( [], Fulfilment::quoted_freight( wc_get_order( $order->get_id() ) ) );
    }
}
