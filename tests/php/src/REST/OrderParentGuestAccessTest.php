<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;

/**
 * Single-order REST routes must not open a multi-vendor parent order to guests (getdokan/dokan-pro#6284).
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-orders
 * @group dokan-authorization
 * @group security
 *
 * @covers \WeDevs\Dokan\REST\OrderController::get_single_order_permissions_check
 */
class OrderParentGuestAccessTest extends DokanTestCase {

    /**
     * Multi-vendor parent order.
     *
     * @var int
     */
    protected int $parent_id;

    public function set_up() {
        parent::set_up();

        $this->parent_id = $this->create_multi_vendor_order();

        $this->assertNotEmpty( dokan_get_suborder_ids_by( $this->parent_id ), 'Fixture must be a parent order.' );
    }

    /**
     * @dataProvider single_order_routes
     */
    public function test_guest_is_denied_on_parent_order_routes( string $method, string $route ) {
        $note_id    = wc_get_order( $this->parent_id )->add_order_note( 'Private note' );
        $note_count = count( wc_get_order_notes( [ 'order_id' => $this->parent_id ] ) );

        wp_set_current_user( 0 );

        // Same body as the WPScan report's proof of concept.
        $request = new WP_REST_Request( $method, str_replace( [ '{id}', '{note_id}' ], [ $this->parent_id, $note_id ], $route ) );
        $request->set_header( 'Content-Type', 'application/json' );
        $request->set_body(
            wp_json_encode(
                [
                    'note'          => 'injected',
                    'status'        => 'processing',
                    'customer_note' => '',
                ]
            )
        );

        $response = $this->server->dispatch( $request );

        $this->assertSame( 401, $response->get_status() );
        $this->assertNotNull( get_comment( $note_id ), 'The note must survive a guest delete.' );
        $this->assertCount( $note_count, wc_get_order_notes( [ 'order_id' => $this->parent_id ] ), 'A guest must not add notes.' );
    }

    public function single_order_routes(): array {
        return [
            'read order'      => [ 'GET', '/dokan/v1/orders/{id}' ],
            'read order v2'   => [ 'GET', '/dokan/v2/orders/{id}' ],
            'list notes'      => [ 'GET', '/dokan/v1/orders/{id}/notes' ],
            'create note'     => [ 'POST', '/dokan/v1/orders/{id}/notes' ],
            'read note'       => [ 'GET', '/dokan/v1/orders/{id}/notes/{note_id}' ],
            'delete note'     => [ 'DELETE', '/dokan/v1/orders/{id}/notes/{note_id}' ],
            'list downloads'  => [ 'GET', '/dokan/v2/orders/{id}/downloads' ],
        ];
    }

    public function test_vendor_cannot_read_parent_order() {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'orders/' . $this->parent_id );

        $this->assertSame( 403, $response->get_status() );
    }

    public function test_vendor_still_reads_own_sub_order() {
        $sub_order_id = $this->own_sub_order_id();

        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( 'orders/' . $sub_order_id );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( $sub_order_id, $response->get_data()['id'] );
    }

    public function test_vendor_without_view_order_capability_is_denied() {
        $sub_order_id = $this->own_sub_order_id();

        $seller = new \WP_User( $this->seller_id1 );
        $seller->add_cap( 'dokan_view_order', false );

        wp_set_current_user( $this->seller_id1 );

        $this->assertSame( 403, $this->get_request( 'orders/' . $sub_order_id )->get_status() );
    }

    public function test_vendor_staff_reads_their_vendors_sub_order() {
        $staff_id = $this->create_vendor_staff( $this->seller_id1 );

        $staff = new \WP_User( $staff_id );
        $staff->add_cap( 'vendor_staff' );
        $staff->add_cap( 'dokan_view_order' );

        wp_set_current_user( $staff_id );

        $this->assertSame( 200, $this->get_request( 'orders/' . $this->own_sub_order_id() )->get_status() );
    }

    /**
     * @dataProvider store_admin_roles
     */
    public function test_store_admins_still_read_parent_order( string $role ) {
        wp_set_current_user( 'administrator' === $role ? $this->admin_id : self::factory()->user->create( [ 'role' => $role ] ) );

        $response = $this->get_request( 'orders/' . $this->parent_id );

        $this->assertSame( 200, $response->get_status() );
    }

    public function store_admin_roles(): array {
        return [
            'administrator' => [ 'administrator' ],
            'shop manager'  => [ 'shop_manager' ],
        ];
    }

    protected function own_sub_order_id(): int {
        return (int) current(
            array_filter(
                dokan_get_suborder_ids_by( $this->parent_id ),
                function ( $id ) {
                    return (int) dokan_get_seller_id_by_order( $id ) === $this->seller_id1;
                }
            )
        );
    }
}
