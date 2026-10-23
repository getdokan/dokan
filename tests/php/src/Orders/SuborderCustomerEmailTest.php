<?php

namespace WeDevs\Dokan\Test\Orders;

use Automattic\WooCommerce\Internal\Email\DeferredEmailQueue;
use ReflectionProperty;
use WC_Emails;
use WC_Order;
use WeDevs\Dokan\Order\EmailHooks;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group orders
 * @group order-emails
 */
class SuborderCustomerEmailTest extends DokanTestCase {

    /**
     * Customer email decisions as [ email id, order id, enabled ].
     *
     * @var array
     */
    protected array $decisions = [];

    /**
     * WooCommerce's deferred email queue, when emails are deferred.
     *
     * @var DeferredEmailQueue|null
     */
    protected $queue = null;

    /**
     * Email trigger callbacks, restored for each simulated request.
     *
     * @var array
     */
    protected array $triggers = [];

    public function set_up() {
        global $wp_filter;

        parent::set_up();

        WC()->mailer();

        foreach ( $wp_filter as $hook => $callbacks ) {
            if ( '_notification' === substr( $hook, -13 ) ) {
                $this->triggers[ $hook ] = $callbacks->callbacks;
            }
        }

        foreach ( [ 'on_hold', 'processing', 'completed' ] as $email ) {
            add_filter( "woocommerce_email_enabled_customer_{$email}_order", [ $this, 'record_decision' ], 999, 2 );
        }
    }

    public function tear_down() {
        if ( $this->queue ) {
            $this->set_deferred_queue( null );
        }

        parent::tear_down();
    }

    /**
     * Record the final enabled state of a customer email.
     *
     * @param bool          $enabled Whether the email is enabled.
     * @param WC_Order|null $order   Order the email is for.
     *
     * @return bool
     */
    public function record_decision( $enabled, $order ) {
        if ( $order instanceof WC_Order ) {
            $this->decisions[] = [ str_replace( 'woocommerce_email_enabled_', '', current_filter() ), $order->get_id(), $enabled ];
        }

        return $enabled;
    }

    public function email_modes(): array {
        return [
            'sent immediately' => [ false ],
            'deferred'         => [ true ],
        ];
    }

    /**
     * @dataProvider email_modes
     */
    public function test_status_sync_emails_the_customer_for_the_parent_only( bool $deferred ) {
        $this->maybe_defer( $deferred );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );
        $this->next_request();

        // Two syncs can land before deferred emails go out.
        $parent->update_status( 'on-hold' );
        $parent->update_status( 'processing' );
        $this->next_request();

        $this->assertSame( [ $parent->get_id() ], $this->sent_for( 'customer_on_hold_order' ) );
        $this->assertSame( [ $parent->get_id() ], $this->sent_for( 'customer_processing_order' ) );

        wc_get_order( $parent->get_id() )->update_status( 'completed' );
        $this->next_request();

        $this->assertSame( [ $parent->get_id() ], $this->sent_for( 'customer_completed_order' ) );
    }

    /**
     * @dataProvider email_modes
     */
    public function test_split_of_an_order_with_a_status_emails_the_customer_for_the_parent_only( bool $deferred ) {
        $this->maybe_defer( $deferred );
        [ $parent ] = $this->create_order( 'on-hold' );
        $this->next_request();

        $this->assertSame( [ $parent->get_id() ], $this->sent_for( 'customer_on_hold_order' ) );
    }

    /**
     * @dataProvider email_modes
     */
    public function test_vendor_completing_a_suborder_emails_the_customer( bool $deferred ) {
        $this->maybe_defer( $deferred );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );
        $parent->update_status( 'processing' );
        $this->next_request();
        $this->decisions = [];

        wc_get_order( $suborder_ids[0] )->update_status( 'completed' );
        $this->next_request();

        $this->assertSame( [ $suborder_ids[0] ], $this->sent_for( 'customer_completed_order' ) );
    }

    /**
     * @dataProvider email_modes
     */
    public function test_vendor_reopening_a_suborder_emails_the_customer( bool $deferred ) {
        $this->maybe_defer( $deferred );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );
        $parent->update_status( 'on-hold' );
        $this->next_request();
        $this->decisions = [];

        wc_get_order( $suborder_ids[0] )->update_status( 'cancelled' );
        $this->next_request();
        wc_get_order( $suborder_ids[0] )->update_status( 'on-hold' );
        $this->next_request();

        $this->assertSame( [ $suborder_ids[0] ], $this->sent_for( 'customer_on_hold_order' ) );
    }

    /**
     * @dataProvider email_modes
     */
    public function test_parent_completed_by_its_suborders_skips_the_parent_email( bool $deferred ) {
        $this->maybe_defer( $deferred );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );
        $parent->update_status( 'processing' );
        $this->next_request();
        $this->decisions = [];

        foreach ( $suborder_ids as $suborder_id ) {
            wc_get_order( $suborder_id )->update_status( 'completed' );
            $this->next_request();
        }

        $this->assertSame( 'completed', wc_get_order( $parent->get_id() )->get_status() );
        $this->assertSame( $suborder_ids, $this->sent_for( 'customer_completed_order' ) );
    }

    /**
     * @dataProvider email_modes
     */
    public function test_digital_suborders_auto_completed_with_the_parent_send_one_email_per_stage( bool $deferred ) {
        // Digital-only items paid by a gateway Dokan auto-completes.
        add_filter( 'woocommerce_order_item_needs_processing', '__return_false' );
        $this->maybe_defer( $deferred );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );

        foreach ( array_merge( [ $parent->get_id() ], $suborder_ids ) as $order_id ) {
            $order = wc_get_order( $order_id );
            $order->set_payment_method( 'stripe' );
            $order->save();
        }
        $this->next_request();

        wc_get_order( $parent->get_id() )->update_status( 'processing' );
        $this->next_request();

        $this->assertSame( 'completed', wc_get_order( $parent->get_id() )->get_status() );
        $this->assertSame( [ $parent->get_id() ], $this->sent_for( 'customer_processing_order' ) );
        $this->assertCount( 1, $this->sent_for( 'customer_completed_order' ) );

        if ( $deferred ) {
            $this->assertSame( [ $parent->get_id() ], $this->sent_for( 'customer_completed_order' ) );
            $this->assertNoFlagsLeft( array_merge( [ $parent->get_id() ], $suborder_ids ) );
        }
    }

    /**
     * @dataProvider email_modes
     */
    public function test_digital_suborder_auto_completed_before_the_parent_emails_the_customer( bool $deferred ) {
        $this->maybe_defer( $deferred );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );

        // Only the second vendor's Suborder is digital.
        $digital_suborder_id = $suborder_ids[1];
        add_filter(
            'woocommerce_order_item_needs_processing',
            function ( $needs_processing, $product, $order_id ) use ( $digital_suborder_id ) {
                return $digital_suborder_id === $order_id ? false : $needs_processing;
            },
            10,
            3
        );

        foreach ( array_merge( [ $parent->get_id() ], $suborder_ids ) as $order_id ) {
            $order = wc_get_order( $order_id );
            $order->set_payment_method( 'stripe' );
            $order->save();
        }
        $this->next_request();

        wc_get_order( $parent->get_id() )->update_status( 'processing' );
        $this->next_request();

        $this->assertSame( 'completed', wc_get_order( $digital_suborder_id )->get_status() );
        $this->assertSame( [ $parent->get_id() ], $this->sent_for( 'customer_processing_order' ) );
        $this->assertSame( [ $digital_suborder_id ], $this->sent_for( 'customer_completed_order' ) );

        $this->decisions = [];
        wc_get_order( $suborder_ids[0] )->update_status( 'completed' );
        $this->next_request();

        $this->assertSame( 'completed', wc_get_order( $parent->get_id() )->get_status() );
        $this->assertSame( [ $suborder_ids[0] ], $this->sent_for( 'customer_completed_order' ) );
        $this->assertNoFlagsLeft( array_merge( [ $parent->get_id() ], $suborder_ids ) );
    }

    public function test_skip_filter_on_another_email_keeps_it_enabled() {
        $order = wc_get_order( $this->create_single_vendor_order() );

        add_filter( 'woocommerce_email_enabled_customer_invoice', [ new EmailHooks(), 'skip_synced_status_email' ], 10, 2 );

        $this->assertTrue( apply_filters( 'woocommerce_email_enabled_customer_invoice', true, $order ) );
    }

    /**
     * @dataProvider email_modes
     */
    public function test_vendor_changing_a_suborder_before_deferred_emails_go_out( bool $deferred ) {
        $this->maybe_defer( $deferred );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );
        $this->next_request();

        $parent->update_status( 'on-hold' );
        $this->next_request( false );
        wc_get_order( $suborder_ids[0] )->update_status( 'processing' );
        $this->next_request();

        $this->assertSame( [ $parent->get_id() ], $this->sent_for( 'customer_on_hold_order' ) );
        $this->assertSame( [ $suborder_ids[0] ], $this->sent_for( 'customer_processing_order' ) );
    }

    public function test_deferred_bulk_status_change_emails_every_customer() {
        $this->maybe_defer( true );
        [ $first ]  = $this->create_order( 'pending' );
        [ $second ] = $this->create_order( 'pending' );
        $this->next_request();

        $first->update_status( 'processing' );
        $second->update_status( 'processing' );
        $this->next_request();

        $this->assertSame( [ $first->get_id(), $second->get_id() ], $this->sent_for( 'customer_processing_order' ) );
    }

    public function test_no_flags_are_saved_when_emails_are_sent_immediately() {
        [ $parent, $suborder_ids ] = $this->create_order( 'on-hold' );
        $parent->update_status( 'processing' );

        foreach ( array_merge( [ $parent->get_id() ], $suborder_ids ) as $order_id ) {
            $this->assertSame( '', wc_get_order( $order_id )->get_meta( EmailHooks::SYNCED_STATUS_META ) );
        }
    }

    public function test_deferred_flags_are_used_up_by_the_skipped_emails() {
        $this->maybe_defer( true );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );
        $parent->update_status( 'on-hold' );

        $this->assertSame( [ 'on-hold' ], array_column( wc_get_order( $suborder_ids[0] )->get_meta( EmailHooks::SYNCED_STATUS_META ), 'status' ) );

        $this->next_request();

        foreach ( $suborder_ids as $suborder_id ) {
            $this->assertSame( '', wc_get_order( $suborder_id )->get_meta( EmailHooks::SYNCED_STATUS_META ) );
        }
    }

    public function test_flag_whose_email_never_ran_expires_after_a_day() {
        $this->maybe_defer( true );
        [ $parent, $suborder_ids ] = $this->create_order( 'pending' );
        $parent->update_status( 'on-hold' );

        // The queued email jobs never run, e.g. an admin cancels them.
        $this->take_deferred_emails();
        $this->reset_request_state();

        $expired = wc_get_order( $suborder_ids[0] );
        $flags   = $expired->get_meta( EmailHooks::SYNCED_STATUS_META );
        $flags[0]['time'] -= EmailHooks::FLAG_LIFETIME;
        $expired->update_meta_data( EmailHooks::SYNCED_STATUS_META, $flags );
        $expired->save_meta_data();

        foreach ( $suborder_ids as $suborder_id ) {
            WC()->mailer()->emails['WC_Email_Customer_On_Hold_Order']->trigger( $suborder_id, wc_get_order( $suborder_id ) );
        }

        $this->assertSame( [ $suborder_ids[0] ], $this->sent_for( 'customer_on_hold_order' ) );
        $this->assertContains( [ 'customer_on_hold_order', $suborder_ids[1], false ], $this->decisions );
    }

    public function test_deferred_emails_run_in_one_request_are_not_dropped() {
        $this->maybe_defer( true );
        $order_ids = [];

        $params           = $this->get_multi_vendor_order_data();
        $params['status'] = 'pending';

        for ( $i = 0; $i < 3; $i++ ) {
            $order_ids[] = $this->create_single_vendor_order( 0, $params );
        }
        $this->next_request();

        wc_get_order( $order_ids[0] )->update_status( 'on-hold' );
        wc_get_order( $order_ids[1] )->update_status( 'on-hold' );
        $jobs = array_column( $this->take_deferred_emails(), null, 'order_id' );
        $this->reset_request_state();

        // Action Scheduler runs several jobs in one request, and an order status changes in between.
        $this->queue->send_queued_transactional_email( $jobs[ $order_ids[0] ]['filter'], $jobs[ $order_ids[0] ]['args'] );
        wc_get_order( $order_ids[2] )->update_status( 'on-hold' );
        $this->queue->send_queued_transactional_email( $jobs[ $order_ids[1] ]['filter'], $jobs[ $order_ids[1] ]['args'] );

        $this->assertSame( [ $order_ids[0], $order_ids[1] ], $this->sent_for( 'customer_on_hold_order' ) );
    }

    public function test_single_vendor_order_emails_the_customer() {
        $order = wc_get_order( $this->create_single_vendor_order() );
        $this->next_request();

        $order->update_status( 'processing' );
        $this->next_request();

        $this->assertSame( [ $order->get_id() ], $this->sent_for( 'customer_processing_order' ) );
    }

    /**
     * Create a multi-vendor order and return it with its Suborder IDs.
     *
     * @param string $status Order status.
     *
     * @return array
     */
    protected function create_order( string $status ): array {
        $params           = $this->get_multi_vendor_order_data();
        $params['status'] = $status;

        $parent       = wc_get_order( $this->create_multi_vendor_order( $params ) );
        $suborder_ids = array_map(
            function ( $suborder ) {
                return $suborder->get_id();
            },
            dokan()->order->get_child_orders( $parent->get_id() )
        );
        sort( $suborder_ids );

        $this->assertCount( 2, $suborder_ids );

        return [ $parent, $suborder_ids ];
    }

    /**
     * Switch WooCommerce to its deferred email queue, as the "Deferred emails" feature does.
     *
     * @param bool $deferred Whether to defer emails.
     *
     * @return void
     */
    protected function maybe_defer( bool $deferred ) {
        global $wp_filter;

        if ( ! $deferred ) {
            return;
        }

        if ( ! class_exists( DeferredEmailQueue::class ) ) {
            $this->markTestSkipped( 'This WooCommerce version has no deferred email queue.' );
        }

        $this->queue = wc_get_container()->get( DeferredEmailQueue::class );
        $this->set_deferred_queue( $this->queue );

        foreach ( array_keys( $wp_filter ) as $hook ) {
            if ( 10 === has_action( $hook, [ WC_Emails::class, 'send_transactional_email' ] ) ) {
                remove_action( $hook, [ WC_Emails::class, 'send_transactional_email' ], 10 );
                add_action( $hook, [ WC_Emails::class, 'queue_transactional_email' ], 10, 10 );
            }
        }
    }

    /**
     * Set WooCommerce's deferred email queue.
     *
     * @param DeferredEmailQueue|null $queue Queue, or null to send right away.
     *
     * @return void
     */
    protected function set_deferred_queue( $queue ) {
        $property = new ReflectionProperty( WC_Emails::class, 'deferred_queue' );
        $property->setAccessible( true );
        $property->setValue( null, $queue );
    }

    /**
     * End the current request: run deferred email jobs, each as its own request.
     *
     * @param bool $send_emails Whether the deferred email jobs run now.
     *
     * @return void
     */
    protected function next_request( bool $send_emails = true ) {
        $this->reset_request_state();

        if ( ! $this->queue || ! $send_emails ) {
            return;
        }

        foreach ( $this->take_deferred_emails() as $item ) {
            $this->queue->send_queued_transactional_email( $item['filter'], $item['args'] );
            $this->reset_request_state();
        }
    }

    /**
     * Remove and return the emails WooCommerce has queued so far.
     *
     * @return array
     */
    protected function take_deferred_emails(): array {
        $property = new ReflectionProperty( $this->queue, 'queue' );
        $property->setAccessible( true );
        $items = $property->getValue( $this->queue );
        $property->setValue( $this->queue, [] );

        return array_map(
            function ( $item ) {
                $item['order_id'] = $item['args'][0];

                return $item;
            },
            $items
        );
    }

    /**
     * Reset the per-request state Dokan's immediate-email guard relies on.
     *
     * @return void
     */
    protected function reset_request_state() {
        global $wp_filter, $wp_actions;

        foreach ( $this->triggers as $hook => $callbacks ) {
            $wp_filter[ $hook ]->callbacks = $callbacks;
            unset( $wp_actions[ $hook ] );
        }
    }

    /**
     * Assert no skip flags are left on the orders.
     *
     * @param int[] $order_ids Order IDs.
     *
     * @return void
     */
    protected function assertNoFlagsLeft( array $order_ids ) {
        foreach ( $order_ids as $order_id ) {
            $this->assertSame( '', wc_get_order( $order_id )->get_meta( EmailHooks::SYNCED_STATUS_META ), "Flags left on #{$order_id}." );
        }
    }

    /**
     * Order IDs a customer email was sent for.
     *
     * @param string $email_id Email ID.
     *
     * @return int[]
     */
    protected function sent_for( string $email_id ): array {
        $ids = [];

        foreach ( $this->decisions as [ $id, $order_id, $enabled ] ) {
            if ( $id === $email_id && $enabled ) {
                $ids[] = $order_id;
            }
        }

        sort( $ids );

        return $ids;
    }
}
