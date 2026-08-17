<?php

namespace WeDevs\Dokan\Test\ReverseWithdrawal;

use WeDevs\Dokan\ReverseWithdrawal\Helper;
use WeDevs\Dokan\ReverseWithdrawal\InstallerHelper;
use WeDevs\Dokan\ReverseWithdrawal\Manager;
use WeDevs\Dokan\ReverseWithdrawal\Order;
use WeDevs\Dokan\ReverseWithdrawal\SettingsHelper;
use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Ledger-integrity test for reverse withdrawal payments.
 *
 * Covers audit L12 / plugin-internal-tasks#2174: the payment amount is
 * client-supplied and lands in the vendor's ledger verbatim, so a vendor could
 * mint arbitrary credit — clearing real commission debt for free via the
 * Cash-on-Delivery gateway. The amount must be reconciled against what the
 * vendor actually owes, at the shared sink both callers use.
 *
 * @since DOKAN_SINCE
 *
 * @group dokan-reverse-withdrawal
 * @group security
 *
 * @covers \WeDevs\Dokan\ReverseWithdrawal\Helper::add_payment_to_cart
 * @covers \WeDevs\Dokan\ReverseWithdrawal\Helper::get_awaiting_payment_total
 * @covers \WeDevs\Dokan\ReverseWithdrawal\Helper::get_awaiting_payment_orders
 * @covers \WeDevs\Dokan\ReverseWithdrawal\Order::insert_payment
 */
class PaymentAmountReconciliationTest extends DokanTestCase {

    /**
     * Debt seeded for the vendor under test.
     *
     * @var float
     */
    protected const DUE = 100.0;

    /**
     * Order hook instance registered for the completion test, unhooked again in tear_down.
     *
     * @var Order|null
     */
    protected $order_hooks = null;

    public function set_up() {
        parent::set_up();

        // The cart needs the base payment product, which only the installer creates — and only for a user who can manage options.
        wp_set_current_user( $this->admin_id );
        InstallerHelper::create_reverse_withdrawal_base_product();

        wp_set_current_user( $this->seller_id1 );

        ( new Manager() )->insert(
            [
                'trn_id'    => 990001,
                'trn_type'  => 'order_commission',
                'vendor_id' => $this->seller_id1,
                'note'      => 'Reverse withdrawal reconciliation test',
                'debit'     => self::DUE,
                'credit'    => 0,
            ]
        );
    }

    /**
     * Anything above the outstanding balance is refused, from the reported attack down to the boundary.
     *
     * @dataProvider amounts_over_due_balance
     */
    public function test_amount_over_due_balance_is_rejected( float $amount ) {
        $result = Helper::add_payment_to_cart( $amount );

        $this->assertWPError( $result );
        $this->assertSame( 'amount-exceeds-due-balance', $result->get_error_code() );
    }

    public function amounts_over_due_balance(): array {
        return [
            'the reported attack' => [ 999999.0 ],
            'one unit over due'   => [ self::DUE + 1 ],
        ];
    }

    /**
     * Paying up to the outstanding balance still works, and the cart carries exactly that amount.
     *
     * @dataProvider amounts_within_due_balance
     */
    public function test_amount_within_due_balance_is_accepted( float $amount ) {
        $this->assertTrue( Helper::add_payment_to_cart( $amount ) );
        $this->assertSame( $amount, $this->cart_payment_amount() );
    }

    public function amounts_within_due_balance(): array {
        return [
            'the exact due balance' => [ self::DUE ],
            'a partial payment'     => [ self::DUE / 2 ],
        ];
    }

    /**
     * A vendor who owes nothing cannot mint credit out of thin air.
     */
    public function test_vendor_without_due_balance_cannot_pay() {
        wp_set_current_user( $this->seller_id2 );

        $result = Helper::add_payment_to_cart( 50 );

        $this->assertWPError( $result );
        $this->assertSame( 'no-due-balance', $result->get_error_code() );
    }

    /**
     * Zero and negative amounts keep their original rejection.
     *
     * @dataProvider non_positive_amounts
     */
    public function test_non_positive_amount_is_still_rejected( float $amount ) {
        $result = Helper::add_payment_to_cart( $amount );

        $this->assertWPError( $result );
        $this->assertSame( 'invalid-amount', $result->get_error_code() );
    }

    public function non_positive_amounts(): array {
        return [
            'zero'     => [ 0.0 ],
            'negative' => [ -5.0 ],
        ];
    }

    /**
     * A payment already awaiting completion is deducted, so stacked in-flight orders cannot over-credit.
     *
     * The ledger is only credited when the order completes, so without this the balance still reads full
     * and every stacked payment passes the cap — N orders buying N times the real debt in free credit.
     */
    public function test_payment_awaiting_completion_blocks_a_second_full_payment() {
        $this->assertTrue( Helper::add_payment_to_cart( self::DUE ) );
        $this->create_awaiting_payment_order( self::DUE );

        // Nothing has completed, so the raw balance is untouched — only the awaiting total stands in the way.
        $this->assertSame( self::DUE, (float) Helper::get_vendor_balance( $this->seller_id1 )['balance'] );

        $result = Helper::add_payment_to_cart( self::DUE );

        $this->assertWPError( $result );
        $this->assertSame( 'payment-already-awaiting', $result->get_error_code() );
    }

    /**
     * Only the awaiting amount is held back — the rest of the balance stays payable.
     */
    public function test_remaining_balance_is_still_payable_while_a_payment_awaits() {
        $this->create_awaiting_payment_order( self::DUE / 4 );

        $remaining = self::DUE - ( self::DUE / 4 );

        $this->assertTrue( Helper::add_payment_to_cart( $remaining ) );
        $this->assertSame( $remaining, $this->cart_payment_amount() );

        WC()->cart->empty_cart();

        $result = Helper::add_payment_to_cart( $remaining + 0.01 );

        $this->assertWPError( $result );
        $this->assertSame( 'amount-exceeds-due-balance', $result->get_error_code() );
    }

    /**
     * An order that never went through the cap still cannot push the ledger below zero.
     *
     * Orders placed before this reconciliation existed reach the completion sink unchecked, so the sink
     * clamps the credit to what is actually owed rather than trusting the line item.
     */
    public function test_completion_never_credits_more_than_the_outstanding_balance() {
        $this->register_order_completion_hooks();

        $order = $this->create_awaiting_payment_order( self::DUE * 3 );

        $order->update_status( 'completed' );

        $this->assertSame( 0.0, (float) Helper::get_vendor_balance( $this->seller_id1 )['balance'] );
    }

    /**
     * Put the completion hooks in place — they only register when the feature is on, and the container
     * booted long before this test with reverse withdrawal disabled.
     */
    protected function register_order_completion_hooks() {
        $settings            = (array) get_option( 'dokan_reverse_withdrawal', [] );
        $settings['enabled'] = 'on';
        update_option( 'dokan_reverse_withdrawal', $settings );

        $this->assertTrue( SettingsHelper::is_enabled() );

        // Kept so tear_down can unhook it — hooks are global and would otherwise leak into every later test.
        $this->order_hooks = new Order();
    }

    /**
     * The literal repro from the BUG-001 report: two separate full-due orders, both completed.
     *
     * This is the case the bug report will be re-checked against, so it is asserted end to end rather
     * than through the single oversized order the clamp test uses.
     */
    public function test_two_in_flight_payments_cannot_over_credit() {
        $this->register_order_completion_hooks();

        $first  = $this->create_awaiting_payment_order( self::DUE );
        $second = $this->create_awaiting_payment_order( self::DUE );

        $first->update_status( 'completed' );
        $second->update_status( 'completed' );

        $this->assertGreaterThanOrEqual(
            0.0,
            (float) Helper::get_vendor_balance( $this->seller_id1 )['balance'],
            'A vendor owing the due amount must never end below zero.'
        );
        $this->assertSame( 0.0, (float) Helper::get_vendor_balance( $this->seller_id1 )['balance'] );
    }

    /**
     * A payment clamped to nothing must not be reconsidered when the order is completed again.
     *
     * Without a marker the skipped credit leaves no ledger row, so a completed → refunded → completed
     * cycle would hand the vendor that credit for free against whatever debt exists by then.
     */
    public function test_clamped_payment_is_not_credited_on_a_later_completion() {
        $this->register_order_completion_hooks();

        $paid = $this->create_awaiting_payment_order( self::DUE );
        $paid->update_status( 'completed' );

        $clamped = $this->create_awaiting_payment_order( self::DUE );
        $clamped->update_status( 'completed' );

        $this->assertSame( 0.0, (float) Helper::get_vendor_balance( $this->seller_id1 )['balance'] );

        // New debt, then the admin cycles the clamped order back through completion.
        ( new Manager() )->insert(
            [
                'trn_id'    => 990002,
                'trn_type'  => 'order_commission',
                'vendor_id' => $this->seller_id1,
                'debit'     => 40,
                'credit'    => 0,
            ]
        );

        $clamped->update_status( 'refunded' );
        $clamped->update_status( 'completed' );

        $this->assertSame(
            40.0,
            (float) Helper::get_vendor_balance( $this->seller_id1 )['balance'],
            'Re-completing a clamped order must not wipe newly accrued debt.'
        );
    }

    /**
     * An order already credited to the ledger must not be held back as awaiting.
     *
     * Card gateways credit at `woocommerce_payment_complete` and leave the order in `processing` — the
     * reverse-withdrawal product is virtual but not downloadable, so it never auto-completes. Counting
     * that order again would deduct the same payment twice and lock the vendor out of paying new debt.
     *
     * @dataProvider settled_order_counts
     */
    public function test_already_credited_order_is_not_awaiting( int $extra_awaiting ) {
        $settled = $this->create_awaiting_payment_order( self::DUE );

        ( new Manager() )->insert(
            [
                'trn_id'    => $settled->get_id(),
                'trn_type'  => 'vendor_payment',
                'vendor_id' => $this->seller_id1,
                'credit'    => self::DUE,
            ]
        );

        for ( $i = 0; $i < $extra_awaiting; $i++ ) {
            $this->create_awaiting_payment_order( 25 );
        }

        $this->assertCount( $extra_awaiting, Helper::get_awaiting_payment_orders( $this->seller_id1 ) );
        $this->assertSame( 25.0 * $extra_awaiting, Helper::get_awaiting_payment_total( $this->seller_id1 ) );
    }

    /**
     * One settled order alone is the case where the lookup's page size would otherwise collapse to a single row.
     */
    public function settled_order_counts(): array {
        return [
            'settled order only'            => [ 0 ],
            'settled plus one still waiting' => [ 1 ],
        ];
    }

    /**
     * A credited-but-unfinished order must not block a payment for genuinely new debt.
     */
    public function test_new_debt_is_payable_after_an_earlier_payment_was_credited() {
        $settled = $this->create_awaiting_payment_order( self::DUE );

        ( new Manager() )->insert(
            [
                'trn_id'    => $settled->get_id(),
                'trn_type'  => 'vendor_payment',
                'vendor_id' => $this->seller_id1,
                'credit'    => self::DUE,
            ]
        );

        // The seeded debt is now settled, so only this new commission is outstanding.
        ( new Manager() )->insert(
            [
                'trn_id'    => 990003,
                'trn_type'  => 'order_commission',
                'vendor_id' => $this->seller_id1,
                'debit'     => 40,
                'credit'    => 0,
            ]
        );

        $this->assertTrue( Helper::add_payment_to_cart( 40 ) );
    }

    /**
     * Build a reverse-withdrawal payment order sitting in a status that has not credited the ledger yet.
     */
    protected function create_awaiting_payment_order( float $amount ): \WC_Order {
        $order = wc_create_order( [ 'customer_id' => $this->seller_id1 ] );

        $item = new \WC_Order_Item_Product();
        $item->set_props(
            [
                'product_id' => Helper::get_reverse_withdrawal_base_product(),
                'quantity'   => 1,
                'subtotal'   => $amount,
                'total'      => $amount,
            ]
        );
        $item->add_meta_data( '_dokan_reverse_withdrawal_balance', $amount );

        $order->add_item( $item );
        $order->set_payment_method( 'cod' );
        $order->calculate_totals();
        $order->set_status( 'processing' );
        $order->save();

        return $order;
    }

    /**
     * Amount the reverse-withdrawal cart item actually carries — this is what reaches the ledger.
     */
    protected function cart_payment_amount(): ?float {
        // add_payment_to_cart() empties the cart before adding, so there is only ever the one item.
        $item = current( WC()->cart->get_cart() );

        return isset( $item['dokan_reverse_withdrawal_balance'] ) ? (float) $item['dokan_reverse_withdrawal_balance'] : null;
    }

    public function tear_down() {
        if ( WC()->cart ) {
            WC()->cart->empty_cart();
        }

        if ( $this->order_hooks ) {
            remove_action( 'woocommerce_checkout_create_order_line_item', [ $this->order_hooks, 'store_line_item_metas' ], 10 );
            remove_action( 'woocommerce_payment_complete', [ $this->order_hooks, 'process_payment' ], 10 );
            remove_action( 'woocommerce_order_status_changed', [ $this->order_hooks, 'process_order_status_changed' ], 10 );
            remove_filter( 'woocommerce_order_item_display_meta_key', [ $this->order_hooks, 'hide_order_item_meta_key' ], 999 );
            remove_filter( 'woocommerce_order_item_display_meta_value', [ $this->order_hooks, 'hide_order_item_meta_value' ], 999 );

            $this->order_hooks = null;
        }

        parent::tear_down();
    }
}
