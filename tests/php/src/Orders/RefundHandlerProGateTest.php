<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Order\RefundHandler;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Pro-aware gate on the refund handler.
 *
 * Before this gate, Lite skipped every refund whenever Pro was active, while Pro only
 * intercepted the wp-admin refund button. Refunds created over REST, WP-CLI or by a
 * third-party plugin therefore reduced the WooCommerce order total but never touched the
 * vendor balance, so a fully refunded order stayed withdrawable
 * (plugin-internal-tasks#2314, item 1).
 *
 * Pro now marks the refunds it creates, and Lite handles only the unmarked ones. Pro
 * releases too old to mark their refunds must still be skipped entirely — Lite and Pro
 * are versioned independently, and double-debiting a vendor is worse than the original bug.
 *
 * @group orders
 * @group refund
 */
class RefundHandlerProGateTest extends DokanTestCase {

    /**
     * Invoke the protected gate on a handler.
     *
     * @param RefundHandler $handler   Handler under test.
     * @param int           $refund_id Refund ID.
     *
     * @return bool
     */
    private function invoke_gate( RefundHandler $handler, int $refund_id ): bool {
        $method = new \ReflectionMethod( $handler, 'should_handle_while_pro_active' );
        $method->setAccessible( true );

        return $method->invoke( $handler, $refund_id );
    }

    /**
     * Build a handler that resolves Pro's refund class to the given stand-in.
     *
     * @param string $pro_class Fully qualified class name to substitute.
     *
     * @return RefundHandler
     */
    private function handler_using( string $pro_class ): RefundHandler {
        return new class( $pro_class ) extends RefundHandler {

            /**
             * Substituted Pro refund class.
             *
             * @var string
             */
            private $pro_class;

            /**
             * @param string $pro_class Class name to return.
             */
            public function __construct( string $pro_class ) {
                $this->pro_class = $pro_class;
            }

            protected function get_pro_refund_class(): string {
                return $this->pro_class;
            }
        };
    }

    /**
     * A Pro too old to mark its refunds cannot be told apart, so Lite must stand down.
     *
     * This is the version-skew case: new Lite paired with an older Pro. Handling the
     * refund here would debit the vendor a second time.
     */
    public function test_gate_stands_down_when_pro_cannot_mark_refunds() {
        $handler = $this->handler_using( '\Dokan\Test\NoSuchProRefundClass' );

        $this->assertFalse(
            $this->invoke_gate( $handler, 123 ),
            'An unmarkable Pro must be treated as "Pro handles it" to avoid a double debit.'
        );
    }

    /**
     * A class that exists but lacks is_dokan_refund() is also treated as too old.
     */
    public function test_gate_stands_down_when_pro_class_lacks_the_marker_api() {
        $legacy_pro = get_class(
            new class() {
                // A Pro release from before the refund marker existed.
            }
        );

        $handler = $this->handler_using( $legacy_pro );

        $this->assertFalse(
            $this->invoke_gate( $handler, 123 ),
            'A Pro class without is_dokan_refund() must not be probed for markers.'
        );
    }

    /**
     * A refund Pro created is already accounted for, so Lite must skip it.
     */
    public function test_gate_skips_refunds_created_by_pro() {
        $marked_pro = get_class(
            new class() {
                public static function is_dokan_refund( $refund_id ) {
                    return true;
                }
            }
        );

        $this->assertFalse(
            $this->invoke_gate( $this->handler_using( $marked_pro ), 456 ),
            'Pro-created refunds are adjusted by Pro and must not be handled twice.'
        );
    }

    /**
     * A refund from REST, WP-CLI or a third-party plugin is unmarked and must be handled.
     */
    public function test_gate_handles_refunds_not_created_by_pro() {
        $unmarked_pro = get_class(
            new class() {
                public static function is_dokan_refund( $refund_id ) {
                    return false;
                }
            }
        );

        $this->assertTrue(
            $this->invoke_gate( $this->handler_using( $unmarked_pro ), 789 ),
            'Refunds that never passed through Pro still need the vendor balance adjusting.'
        );
    }

    /**
     * The refund ID is passed through to Pro unchanged.
     */
    public function test_gate_passes_the_refund_id_to_pro() {
        $recording_pro = get_class(
            new class() {
                /**
                 * Last refund ID received.
                 *
                 * @var int
                 */
                public static $received_id = 0;

                public static function is_dokan_refund( $refund_id ) {
                    self::$received_id = (int) $refund_id;

                    return false;
                }
            }
        );

        $this->invoke_gate( $this->handler_using( $recording_pro ), 4242 );

        $this->assertSame( 4242, $recording_pro::$received_id );
    }

    /**
     * Without Pro the handler keeps its original behaviour and records the refund.
     *
     * Guards against the gate accidentally changing Lite-only sites.
     */
    public function test_lite_only_site_still_records_the_refund_credit() {
        global $wpdb;

        $order_id = $this->create_single_vendor_order();
        $order    = wc_get_order( $order_id );
        $items    = $order->get_items();
        $item     = reset( $items );

        // The refund must carry line items: commission is allocated per item, so an
        // amount-only refund resolves to a zero vendor share and writes nothing.
        $refund = wc_create_refund(
            [
                'order_id'   => $order_id,
                'amount'     => 5,
                'reason'     => 'Lite-only refund',
                'line_items' => [
                    $item->get_id() => [
                        'qty'          => 0,
                        'refund_total' => 5,
                        'refund_tax'   => [],
                    ],
                ],
            ]
        );

        $this->assertNotWPError( $refund );

        $credit = (float) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COALESCE( SUM( credit ), 0 ) FROM {$wpdb->prefix}dokan_vendor_balance WHERE trn_id = %d AND trn_type = %s",
                $order->get_id(),
                'dokan_refund'
            )
        );

        $this->assertGreaterThan( 0.0, $credit, 'A Lite-only refund must still credit the vendor balance.' );
    }

    /**
     * A refund ID that resolves to nothing must not fatal or write a balance row.
     */
    public function test_unresolvable_refund_is_ignored() {
        global $wpdb;

        $before = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}dokan_vendor_balance" );

        $handler = new RefundHandler();
        $handler->handle_refund( 999999, 999998 );

        $after = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}dokan_vendor_balance" );

        $this->assertSame( $before, $after, 'An unresolvable refund must not write a balance row.' );
    }
}
