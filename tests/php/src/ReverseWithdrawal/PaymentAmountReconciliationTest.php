<?php

namespace WeDevs\Dokan\Test\ReverseWithdrawal;

use WeDevs\Dokan\ReverseWithdrawal\Helper;
use WeDevs\Dokan\ReverseWithdrawal\InstallerHelper;
use WeDevs\Dokan\ReverseWithdrawal\Manager;
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
 */
class PaymentAmountReconciliationTest extends DokanTestCase {

    /**
     * Debt seeded for the vendor under test.
     *
     * @var int
     */
    protected const DUE = 100;

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
                'trn_date'  => dokan_current_datetime()->format( 'Y-m-d H:i:s' ),
            ]
        );
    }

    /**
     * The reported attack: an amount far beyond the real debt must be refused.
     */
    public function test_amount_far_beyond_due_balance_is_rejected() {
        $result = Helper::add_payment_to_cart( 999999 );

        $this->assertWPError( $result );
        $this->assertSame( 'amount-exceeds-due-balance', $result->get_error_code() );
    }

    /**
     * Even one unit over the outstanding balance is refused.
     */
    public function test_amount_just_over_due_balance_is_rejected() {
        $result = Helper::add_payment_to_cart( self::DUE + 1 );

        $this->assertWPError( $result );
        $this->assertSame( 'amount-exceeds-due-balance', $result->get_error_code() );
    }

    /**
     * Paying the exact outstanding balance still works, and the cart carries that amount.
     */
    public function test_exact_due_balance_is_accepted() {
        $this->assertTrue( Helper::add_payment_to_cart( self::DUE ) );
        $this->assertSame( (float) self::DUE, $this->cart_payment_amount() );
    }

    /**
     * Paying part of the outstanding balance still works, and the cart carries that amount.
     */
    public function test_partial_payment_is_accepted() {
        $this->assertTrue( Helper::add_payment_to_cart( self::DUE / 2 ) );
        $this->assertSame( (float) self::DUE / 2, $this->cart_payment_amount() );
    }

    /**
     * Amount the reverse-withdrawal cart item actually carries — this is what reaches the ledger.
     */
    protected function cart_payment_amount() {
        foreach ( WC()->cart->get_cart() as $item ) {
            if ( isset( $item['dokan_reverse_withdrawal_balance'] ) ) {
                return (float) $item['dokan_reverse_withdrawal_balance'];
            }
        }

        return 0.0;
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
     */
    public function test_non_positive_amount_is_still_rejected() {
        $result = Helper::add_payment_to_cart( 0 );

        $this->assertWPError( $result );
        $this->assertSame( 'invalid-amount', $result->get_error_code() );
    }

    public function tear_down() {
        if ( WC()->cart ) {
            WC()->cart->empty_cart();
        }

        parent::tear_down();
    }
}
