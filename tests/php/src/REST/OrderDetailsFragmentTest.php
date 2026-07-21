<?php

namespace WeDevs\Dokan\Test\REST;

use RuntimeException;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Tests for the Vendor order details HTML fragment endpoint.
 *
 * This endpoint is the whole server-side seam for the Vendor panel order details
 * migration: one request exercises the permission rule, the request-context
 * simulation, the template render, hook dispatch, inline-data harvesting and the
 * response shape together.
 *
 * @group dokan-order-controller
 * @group dokan-authorization
 *
 * @covers \WeDevs\Dokan\REST\OrderController::get_order_details_html
 * @covers \WeDevs\Dokan\REST\OrderController::get_order_details_html_permissions_check
 * @covers \WeDevs\Dokan\Order\DetailsFragment::render
 */
class OrderDetailsFragmentTest extends DokanTestCase {

    /**
     * An order belonging to seller_id1.
     *
     * @var int
     */
    protected int $order_id;

    /**
     * Vendor staff belonging to seller_id1.
     *
     * @var int
     */
    protected int $vendor_staff_id;

    /**
     * Setup test environment.
     *
     * @return void
     */
    protected function setUp(): void {
        parent::setUp();

        $this->order_id        = $this->create_single_vendor_order( $this->seller_id1 );
        $this->vendor_staff_id = $this->create_vendor_staff( $this->seller_id1 );

        // The customer-info block — and the extension point inside it — only renders
        // when the order actually has an address.
        $order = wc_get_order( $this->order_id );
        $order->set_billing_first_name( 'Ada' );
        $order->set_billing_last_name( 'Lovelace' );
        $order->set_billing_address_1( '1 Analytical Engine Way' );
        $order->set_billing_city( 'London' );
        $order->set_billing_country( 'GB' );
        $order->set_billing_email( 'ada@example.test' );
        $order->save();

        // Lite does not register the `vendor_staff` role — Pro does, and grants staff
        // the Vendor's order capabilities. Model that here so the test isolates what
        // this endpoint is actually responsible for: resolving ownership through the
        // staff-aware helper rather than the raw current user id.
        get_user_by( 'id', $this->vendor_staff_id )->add_cap( 'dokan_view_order' );
    }

    /**
     * Build the fragment route for an order.
     *
     * @param int $order_id Order id.
     *
     * @return string
     */
    protected function fragment_route( int $order_id ): string {
        return "orders/{$order_id}/details-html";
    }

    /**
     * The route is registered across every order namespace.
     *
     * @return void
     */
    public function test_route_is_registered_on_every_order_namespace(): void {
        $routes = $this->server->get_routes();

        foreach ( [ 'dokan/v1', 'dokan/v2', 'dokan/v3' ] as $namespace ) {
            $this->assertArrayHasKey(
                "/{$namespace}/orders/(?P<id>[\\d]+)/details-html",
                $routes,
                "Fragment route should be available on {$namespace}"
            );
        }
    }

    /**
     * A Vendor can open their own Vendor order.
     *
     * @return void
     */
    public function test_vendor_can_view_own_order(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertEquals( 200, $response->get_status() );
        $this->assertStringContainsString( 'dokan-order-details-wrap', $response->get_data()['html'] );
    }

    /**
     * A Vendor is refused another Vendor's order.
     *
     * @return void
     */
    public function test_vendor_cannot_view_another_vendors_order(): void {
        wp_set_current_user( $this->seller_id2 );

        $response = $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertEquals( 403, $response->get_status() );
    }

    /**
     * Vendor staff get the same access the legacy page grants them.
     *
     * The legacy template resolves ownership through the staff-aware current-user
     * helper, so staff must be able to open their Vendor's orders.
     *
     * @return void
     */
    public function test_vendor_staff_can_view_their_vendors_order(): void {
        wp_set_current_user( $this->vendor_staff_id );

        $response = $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * A marketplace admin can open any Vendor order.
     *
     * @return void
     */
    public function test_admin_can_view_any_order(): void {
        wp_set_current_user( $this->admin_id );

        $response = $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertEquals( 200, $response->get_status() );
    }

    /**
     * A user without the order-viewing capability is refused.
     *
     * @return void
     */
    public function test_customer_without_capability_is_refused(): void {
        wp_set_current_user( $this->customer_id );

        $response = $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertEquals( 403, $response->get_status() );
    }

    /**
     * A logged-out request is refused.
     *
     * @return void
     */
    public function test_logged_out_request_is_refused(): void {
        wp_set_current_user( 0 );

        $response = $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertEquals( 401, $response->get_status() );
    }

    /**
     * A non-existent order id gets a clean error, not a fatal or a blank view.
     *
     * @return void
     */
    public function test_non_existent_order_returns_not_found(): void {
        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->fragment_route( 99999999 ) );

        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * A trashed order gets a clean error too.
     *
     * @return void
     */
    public function test_trashed_order_returns_not_found(): void {
        $order = wc_get_order( $this->order_id );
        $order->set_status( 'trash' );
        $order->save();

        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertEquals( 404, $response->get_status() );
    }

    /**
     * The compatibility promise, tested as an outcome.
     *
     * Every extension point inside the details template must still fire during a
     * fragment render, and its output must reach the client. Asserting the hook
     * "was fired" would test our implementation; asserting the marker arrives tests
     * the promise Pro and third parties rely on.
     *
     * @return void
     */
    public function test_in_template_extension_hooks_reach_the_html(): void {
        $hooks = [
            'dokan_order_detail_after_order_items',
            'dokan_order_details_after_customer_info',
            'dokan_order_detail_after_order_general_details',
            'dokan_order_detail_after_order_notes',
            'dokan_order_details_fragment_before',
            'dokan_order_details_fragment_after',
        ];

        foreach ( $hooks as $hook ) {
            add_action(
                $hook,
                function () use ( $hook ) {
                    echo '<span class="marker-' . esc_attr( $hook ) . '"></span>';
                }
            );
        }

        wp_set_current_user( $this->seller_id1 );

        $html = $this->get_request( $this->fragment_route( $this->order_id ) )->get_data()['html'];

        foreach ( $hooks as $hook ) {
            $this->assertStringContainsString(
                'marker-' . $hook,
                $html,
                "Output of {$hook} should reach the client"
            );
        }
    }

    /**
     * Filters inside the template are honoured during a fragment render.
     *
     * @return void
     */
    public function test_in_template_filters_apply_during_render(): void {
        add_filter( 'dokan_order_details_billing_address', fn () => 'FILTERED_BILLING_ADDRESS' );

        wp_set_current_user( $this->seller_id1 );

        $html = $this->get_request( $this->fragment_route( $this->order_id ) )->get_data()['html'];

        $this->assertStringContainsString( 'FILTERED_BILLING_ADDRESS', $html );
    }

    /**
     * The render looks like a Vendor dashboard page to extension code, and stops
     * looking like one the moment it is over.
     *
     * @return void
     */
    public function test_dashboard_detection_is_simulated_during_render_and_restored_after(): void {
        $observed = null;

        add_action(
            'dokan_order_detail_after_order_items',
            function () use ( &$observed ) {
                $observed = [
                    'is_dashboard' => dokan_is_seller_dashboard(),
                    'order_id'     => isset( $_GET['order_id'] ) ? absint( $_GET['order_id'] ) : 0, // phpcs:ignore WordPress.Security.NonceVerification.Recommended
                    'nonce_valid'  => isset( $_GET['_wpnonce'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_wpnonce'] ) ), 'dokan_view_order' ), // phpcs:ignore WordPress.Security.NonceVerification.Recommended
                ];
            }
        );

        wp_set_current_user( $this->seller_id1 );

        $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertTrue( $observed['is_dashboard'], 'Dashboard detection should report true during the render' );
        $this->assertSame( $this->order_id, $observed['order_id'], 'The order id should be readable from the request' );
        $this->assertNotFalse( $observed['nonce_valid'], 'A valid order-view nonce should be present' );

        $this->assertFalse( dokan_is_seller_dashboard(), 'Dashboard detection should be restored after the render' );
        $this->assertArrayNotHasKey( 'order_id', $_GET );
        $this->assertArrayNotHasKey( '_wpnonce', $_GET );
    }

    /**
     * The simulated context is restored even when a hooked callback throws.
     *
     * One request must not be able to leak state into the next.
     *
     * @return void
     */
    public function test_context_is_restored_when_a_hooked_callback_throws(): void {
        add_action(
            'dokan_order_detail_after_order_items',
            function () {
                throw new RuntimeException( 'Extension blew up' );
            }
        );

        wp_set_current_user( $this->seller_id1 );

        $before = $_GET; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        try {
            $this->get_request( $this->fragment_route( $this->order_id ) );
        } catch ( RuntimeException $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
            // The endpoint is allowed to surface the failure; what matters is cleanup.
        }

        $this->assertSame( $before, $_GET, 'Request superglobals should be restored' ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $this->assertFalse( dokan_is_seller_dashboard(), 'Dashboard detection should be restored' );
    }

    /**
     * Render-time inline data reaches the browser.
     *
     * Only handles that exist during a REST request can be captured — the fixture
     * therefore registers on `init`, which is the rule published to extension authors.
     *
     * @return void
     */
    public function test_render_time_inline_script_data_is_returned(): void {
        wp_register_script( 'dokan-test-fragment-handle', 'https://example.test/fragment.js', [], '1.0.0', true );

        add_action(
            'dokan_order_detail_after_order_items',
            function () {
                wp_add_inline_script( 'dokan-test-fragment-handle', 'let dokanTestFragmentData = { ok: true };', 'before' );
            }
        );

        wp_set_current_user( $this->seller_id1 );

        $inline_scripts = $this->get_request( $this->fragment_route( $this->order_id ) )->get_data()['inline_scripts'];

        $handles = wp_list_pluck( $inline_scripts, 'handle' );
        $index   = array_search( 'dokan-test-fragment-handle', $handles, true );

        $this->assertNotFalse( $index, 'Inline data attached during the render should be in the response' );
        $this->assertSame( 'before', $inline_scripts[ $index ]['position'] );
        $this->assertStringContainsString( 'dokanTestFragmentData', $inline_scripts[ $index ]['code'] );
    }

    /**
     * Inline data attached to a handle that does not exist is skipped, not fatal.
     *
     * @return void
     */
    public function test_inline_data_for_unregistered_handle_is_skipped(): void {
        add_action(
            'dokan_order_detail_after_order_items',
            function () {
                wp_add_inline_script( 'dokan-handle-that-does-not-exist', 'let nope = 1;', 'before' );
            }
        );

        wp_set_current_user( $this->seller_id1 );

        $response = $this->get_request( $this->fragment_route( $this->order_id ) );

        $this->assertEquals( 200, $response->get_status() );
        $this->assertSame(
            [],
            wp_list_filter( $response->get_data()['inline_scripts'], [ 'handle' => 'dokan-handle-that-does-not-exist' ] )
        );
    }

    /**
     * The response shape is the API contract.
     *
     * @return void
     */
    public function test_response_shape_and_order_metadata(): void {
        wp_set_current_user( $this->seller_id1 );

        $data  = $this->get_request( $this->fragment_route( $this->order_id ) )->get_data();
        $order = wc_get_order( $this->order_id );

        $this->assertSame( [ 'html', 'inline_scripts', 'order' ], array_keys( $data ) );
        $this->assertIsString( $data['html'] );
        $this->assertIsArray( $data['inline_scripts'] );

        $this->assertSame(
            [ 'id', 'number', 'status', 'status_label', 'date_created' ],
            array_keys( $data['order'] )
        );
        $this->assertSame( $this->order_id, $data['order']['id'] );
        $this->assertSame( $order->get_order_number(), $data['order']['number'] );
        $this->assertSame( $order->get_status(), $data['order']['status'] );
        $this->assertNotEmpty( $data['order']['status_label'] );
    }

    /**
     * The fragment reproduces the legacy content class names so third-party CSS
     * written against the legacy page keeps matching.
     *
     * @return void
     */
    public function test_fragment_reproduces_legacy_content_class_names(): void {
        wp_set_current_user( $this->seller_id1 );

        $html = $this->get_request( $this->fragment_route( $this->order_id ) )->get_data()['html'];

        foreach ( [ 'dokan-dashboard-wrap', 'dokan-dashboard-content', 'dokan-orders-content', 'dokan-orders-area' ] as $class ) {
            $this->assertStringContainsString( $class, $html );
        }
    }

    /**
     * The page-level wrapper hooks deliberately do not fire — the panel already
     * renders the navigation and status-filter bar they produce.
     *
     * @return void
     */
    public function test_page_level_wrapper_hooks_do_not_fire(): void {
        foreach ( [ 'dokan_dashboard_wrap_start', 'dokan_order_inside_content', 'dokan_order_content_inside_before' ] as $hook ) {
            add_action(
                $hook,
                function () use ( $hook ) {
                    echo '<span class="page-marker-' . esc_attr( $hook ) . '"></span>';
                }
            );
        }

        wp_set_current_user( $this->seller_id1 );

        $html = $this->get_request( $this->fragment_route( $this->order_id ) )->get_data()['html'];

        $this->assertStringNotContainsString( 'page-marker-', $html );
    }
}
