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
     * @var float
     */
    protected const DUE = 100.0;

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

        parent::tear_down();
    }
}
