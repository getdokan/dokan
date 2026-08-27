<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Order\RefundHandler;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Vendor balance adjustment for refunds Dokan did not create.
 *
 * Before this change Lite skipped every refund whenever Pro was active, while Pro only
 * intercepted the wp-admin refund button. Refunds created over REST, WP-CLI or by a gateway
 * reduced the WooCommerce order total but never touched the vendor balance, so a fully
 * refunded order stayed withdrawable (plugin-internal-tasks#2314, item 1).
 *
 * Two behaviours are covered: refunds already accounted for elsewhere are skipped, and
 * refunds carrying no line items still produce a vendor credit.
 *
 * @group orders
 * @group refund
 */
class RefundHandlerProGateTest extends DokanTestCase {

    /**
     * Filters registered by a test, removed again in tearDown.
     *
     * @var array<int, array{0: string, 1: callable}>
     */
    private $registered_filters = [];

    /**
     * Remove any filter a test registered.
     */
    public function tearDown(): void {
        foreach ( $this->registered_filters as $filter ) {
            remove_filter( $filter[0], $filter[1], 10 );
        }

        $this->registered_filters = [];

        parent::tearDown();
    }

    /**
     * Register a filter for the duration of one test.
     *
     * @param string   $hook     Filter name.
     * @param callable $callback Callback.
     */
    private function add_temporary_filter( string $hook, callable $callback ) {
        add_filter( $hook, $callback, 10, 3 );

        $this->registered_filters[] = [ $hook, $callback ];
    }

    /**
     * Total credited to a vendor for an order.
     *
     * @param int $order_id Order ID.
     *
     * @return float
     */
    private function get_refund_credit( int $order_id ): float {
        global $wpdb;

        return (float) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COALESCE( SUM( credit ), 0 ) FROM {$wpdb->prefix}dokan_vendor_balance WHERE trn_id = %d AND trn_type = %s",
                $order_id,
                'dokan_refund'
            )
        );
    }

    /**
     * Create a refund the way WooCommerce does for a given caller shape.
     *
     * @param int   $order_id   Order ID.
     * @param float $amount     Refund amount.
     * @param array $line_items Line items, empty for an item-less refund.
     *
     * @return \WC_Order_Refund
     */
    private function create_refund( int $order_id, float $amount, array $line_items ) {
        $refund = wc_create_refund(
            [
                'order_id'   => $order_id,
                'amount'     => $amount,
                'reason'     => 'test refund',
                'line_items' => $line_items,
            ]
        );

        $this->assertNotWPError( $refund );

        return $refund;
    }

    /**
     * A refund another component already accounted for must not be credited again.
     */
    public function test_refund_handled_elsewhere_is_skipped() {
        $order_id = $this->create_single_vendor_order();

        $this->add_temporary_filter( 'dokan_refund_is_handled_externally', '__return_true' );

        $this->create_refund( $order_id, 5, [] );

        $this->assertSame(
            0.0,
            $this->get_refund_credit( $order_id ),
            'A refund reported as handled elsewhere must not be credited by Lite.'
        );
    }

    /**
     * A refund nothing else handled is credited to the vendor.
     */
    public function test_refund_not_handled_elsewhere_is_credited() {
        $order_id = $this->create_single_vendor_order();

        $this->add_temporary_filter( 'dokan_refund_is_handled_externally', '__return_false' );

        $this->create_refund( $order_id, 5, [] );

        $this->assertGreaterThan(
            0.0,
            $this->get_refund_credit( $order_id ),
            'A refund that reached this handler must credit the vendor balance.'
        );
    }

    /**
     * The filter receives the refund and order IDs so Pro can identify its own refunds.
     */
    public function test_filter_receives_the_refund_and_order_ids() {
        $order_id = $this->create_single_vendor_order();
        $seen     = [];

        $this->add_temporary_filter(
            'dokan_refund_is_handled_externally',
            function ( $handled, $refund_id, $filtered_order_id ) use ( &$seen ) {
                $seen = [
                    'refund_id' => (int) $refund_id,
                    'order_id'  => (int) $filtered_order_id,
                ];

                return $handled;
            }
        );

        $refund = $this->create_refund( $order_id, 5, [] );

        $this->assertSame( $refund->get_id(), $seen['refund_id'] );
        $this->assertSame( $order_id, $seen['order_id'] );
    }

    /**
     * An item-less full refund still credits the vendor.
     *
     * WooCommerce's wc_order_fully_refunded() fires on every transition to `wc-refunded` and passes
     * `line_items => []`, as do the wc/v2 REST route and most gateway webhooks. Commission is
     * allocated per refunded item, so without proration the vendor share resolved to 0.0, no
     * balance row was written, and the order stayed withdrawable while fully refunded.
     */
    public function test_item_less_full_refund_credits_the_vendor() {
        $order_id = $this->create_single_vendor_order();
        $order    = wc_get_order( $order_id );

        $this->add_temporary_filter( 'dokan_refund_is_handled_externally', '__return_false' );

        // Exactly what wc_order_fully_refunded() passes.
        $this->create_refund( $order_id, (float) $order->get_total(), [] );

        $this->assertGreaterThan(
            0.0,
            $this->get_refund_credit( $order_id ),
            'A fully refunded order must not leave the vendor holding the earning.'
        );
    }

    /**
     * An item-less partial refund credits a share, not the whole earning.
     */
    public function test_item_less_partial_refund_is_prorated() {
        $order_id = $this->create_single_vendor_order();
        $order    = wc_get_order( $order_id );
        $total    = (float) $order->get_total();

        $this->add_temporary_filter( 'dokan_refund_is_handled_externally', '__return_false' );

        $this->create_refund( $order_id, $total / 2, [] );

        $credit = $this->get_refund_credit( $order_id );

        $this->assertGreaterThan( 0.0, $credit );
        $this->assertLessThan( $total, $credit, 'Half a refund must not credit the whole order total.' );
    }

    /**
     * A refund carrying line items credits the vendor's share of those items.
     */
    public function test_refund_with_line_items_credits_the_item_share() {
        $order_id = $this->create_single_vendor_order();
        $order    = wc_get_order( $order_id );
        $items    = $order->get_items();
        $item     = reset( $items );

        $this->add_temporary_filter( 'dokan_refund_is_handled_externally', '__return_false' );

        $this->create_refund(
            $order_id,
            5,
            [
                $item->get_id() => [
                    'qty'          => 0,
                    'refund_total' => 5,
                    'refund_tax'   => [],
                ],
            ]
        );

        $this->assertEqualsWithDelta(
            5.0,
            $this->get_refund_credit( $order_id ),
            0.01,
            'The credit must match the refunded item amount, not the order total.'
        );
    }

    /**
     * A repeated event for the same refund must not credit the vendor twice.
     *
     * The balance entry is keyed by order rather than by refund, so without a guard a
     * duplicate `woocommerce_order_refunded` would credit twice and drive the vendor's
     * balance negative.
     */
    public function test_duplicate_refund_event_does_not_double_credit() {
        $order_id = $this->create_single_vendor_order();
        $order    = wc_get_order( $order_id );

        $this->add_temporary_filter( 'dokan_refund_is_handled_externally', '__return_false' );

        $refund = $this->create_refund( $order_id, (float) $order->get_total(), [] );

        $after_first = $this->get_refund_credit( $order_id );

        // Fire the same event again, as a retried webhook or a third-party plugin would.
        do_action( 'woocommerce_order_refunded', $order_id, $refund->get_id() );

        $this->assertEqualsWithDelta(
            $after_first,
            $this->get_refund_credit( $order_id ),
            0.01,
            'A duplicate refund event must not credit the vendor a second time.'
        );
    }

    /**
     * A refund ID that resolves to nothing must not fatal or write a balance row.
     */
    public function test_unresolvable_refund_is_ignored() {
        global $wpdb;

        $before = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}dokan_vendor_balance" );

        ( new RefundHandler() )->handle_refund( 999999, 999998 );

        $after = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}dokan_vendor_balance" );

        $this->assertSame( $before, $after, 'An unresolvable refund must not write a balance row.' );
    }
}
