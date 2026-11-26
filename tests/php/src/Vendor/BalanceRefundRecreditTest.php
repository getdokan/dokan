<?php

namespace WeDevs\Dokan\Test\Vendor;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * The withdraw balance counts a gateway's refund re-credit whatever the withdraw order status setting is.
 *
 * @group vendor
 * @group withdraw
 *
 * @see https://github.com/getdokan/dokan-pro/issues/6440
 */
class BalanceRefundRecreditTest extends DokanTestCase {

    /**
     * Vendor whose balance is read.
     *
     * @var int
     */
    protected $vendor_id;

    /**
     * Books a paid-out order that was refunded and had its payout reversed.
     *
     * @return void
     */
    public function setUp(): void {
        parent::setUp();

        $this->vendor_id = $this->factory()->seller->create();

        // Earning, payout, refund, then the re-credit a gateway writes for the reversed payout.
        $this->add_row( 'dokan_orders', 40.5, 0, 'wc-refunded' );
        $this->add_row( 'dokan_withdraw', 0, 40.5, 'approved' );
        $this->add_row( 'dokan_refund', 0, 40.5, 'approved' );
        $this->add_row( 'dokan_refund', 40.5, 0, 'wc-completed' );
    }

    /**
     * Inserts a vendor balance row.
     *
     * @param string $type   Transaction type.
     * @param float  $debit  Money in.
     * @param float  $credit Money out.
     * @param string $status Row status.
     *
     * @return void
     */
    protected function add_row( $type, $debit, $credit, $status ) {
        global $wpdb;

        $wpdb->insert(
            $wpdb->prefix . 'dokan_vendor_balance',
            [
                'vendor_id'    => $this->vendor_id,
                'trn_id'       => 1001,
                'trn_type'     => $type,
                'perticulars'  => 'test',
                'debit'        => $debit,
                'credit'       => $credit,
                'status'       => $status,
                'trn_date'     => current_time( 'mysql' ),
                'balance_date' => current_time( 'mysql' ),
            ]
        );
    }

    /**
     * Reads the balance with the given withdraw order statuses selected.
     *
     * @param string[] $statuses Selected statuses.
     *
     * @return float
     */
    protected function balance_with( array $statuses ) {
        $option                          = get_option( 'dokan_withdraw', [] );
        $option['withdraw_order_status'] = array_combine( $statuses, $statuses );
        update_option( 'dokan_withdraw', $option );
        wp_cache_flush();

        return (float) dokan()->vendor->get( $this->vendor_id )->get_balance( false );
    }

    /**
     * With Completed not selected, the re-credit still cancels the payout.
     *
     * @return void
     */
    public function test_recredit_counts_when_completed_is_not_selected() {
        $this->assertSame( 0.0, $this->balance_with( [ 'wc-processing' ] ) );
    }

    /**
     * With Completed selected, the re-credit is counted once.
     *
     * @return void
     */
    public function test_recredit_counts_once_when_completed_is_selected() {
        $this->assertSame( 0.0, $this->balance_with( [ 'wc-completed' ] ) );
    }

    /**
     * An order earning in a status that is not selected stays out of the balance.
     *
     * @return void
     */
    public function test_unselected_order_status_is_still_left_out() {
        $this->add_row( 'dokan_orders', 25, 0, 'wc-completed' );

        $this->assertSame( 0.0, $this->balance_with( [ 'wc-processing' ] ) );
        $this->assertSame( 25.0, $this->balance_with( [ 'wc-processing', 'wc-completed' ] ) );
    }
}
