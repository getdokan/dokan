<?php

namespace WeDevs\Dokan\Test\Withdrawal;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Withdraw\Withdraw;

/**
 * A withdraw created without an explicit date must still store a real date.
 *
 * The constructor's default was a DateTimeImmutable, which `wpdb::prepare()` cannot
 * take: it raised `_doing_it_wrong()` and stored an empty string, so every withdraw
 * created through `dokan()->withdraw->create()` without a `date` had no date.
 * Surfaced by the poison-world seeding in the fatal smoke walkers.
 *
 * @since DOKAN_SINCE
 *
 * @group withdraw
 */
class WithdrawDateDefaultTest extends DokanTestCase {

    public function test_default_date_is_a_mysql_datetime_string(): void {
        $withdraw = new Withdraw();

        $this->assertIsString( $withdraw->get_date() );
        $this->assertMatchesRegularExpression( '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $withdraw->get_date() );
    }

    public function test_a_datetime_object_passed_in_is_formatted(): void {
        $date     = new \DateTimeImmutable( '2026-10-09 12:34:56', wp_timezone() );
        $withdraw = new Withdraw( [ 'date' => $date ] );

        $this->assertSame( '2026-10-09 12:34:56', $withdraw->get_date() );
    }

    public function test_create_without_a_date_persists_the_current_time(): void {
        $withdraw = dokan()->withdraw->create(
            [
                'user_id' => $this->seller_id1,
                'amount'  => 5,
                'method'  => 'paypal',
                'ip'      => '127.0.0.1',
            ]
        );

        $this->assertNotWPError( $withdraw );

        $stored = dokan()->withdraw->get( $withdraw->get_id() );

        $this->assertNotNull( $stored );
        $this->assertNotSame( '0000-00-00 00:00:00', $stored->get_date() );
        $this->assertMatchesRegularExpression( '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', (string) $stored->get_date() );
    }
}
