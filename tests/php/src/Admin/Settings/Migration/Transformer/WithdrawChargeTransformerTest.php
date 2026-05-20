<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration\Transformer;

use WeDevs\Dokan\Admin\Settings\Migration\Transformer\WithdrawChargeTransformer;
use WP_UnitTestCase;

/**
 * Locks in the key-flip contract for per-method withdraw charge entries:
 * legacy [fixed, percentage] ⇔ new [admin_percentage, additional_fee].
 *
 * @covers \WeDevs\Dokan\Admin\Settings\Migration\Transformer\WithdrawChargeTransformer
 */
class WithdrawChargeTransformerTest extends WP_UnitTestCase {

    public function test_to_new_flips_keys_and_preserves_values(): void {
        $transformer = new WithdrawChargeTransformer();

        $this->assertSame(
            [
                'admin_percentage' => '10.11',
                'additional_fee'   => '7.89',
            ],
            $transformer->to_new(
                [
                    'fixed'      => '7.89',
                    'percentage' => '10.11',
                ]
            )
        );
    }

    public function test_to_legacy_flips_keys_and_preserves_values(): void {
        $transformer = new WithdrawChargeTransformer();

        $this->assertSame(
            [
                'percentage' => '5.5',
                'fixed'      => '1.25',
            ],
            $transformer->to_legacy(
                [
                    'admin_percentage' => '5.5',
                    'additional_fee'   => '1.25',
                ]
            )
        );
    }

    public function test_missing_keys_become_empty_strings(): void {
        $transformer = new WithdrawChargeTransformer();

        $this->assertSame(
            [
                'admin_percentage' => '',
                'additional_fee'   => '',
            ],
            $transformer->to_new( [] )
        );

        $this->assertSame(
            [
                'percentage' => '',
                'fixed'      => '',
            ],
            $transformer->to_legacy( [] )
        );
    }

    public function test_non_array_input_is_treated_as_empty(): void {
        $transformer = new WithdrawChargeTransformer();

        $this->assertSame(
            [
                'admin_percentage' => '',
                'additional_fee'   => '',
            ],
            $transformer->to_new( null )
        );
        $this->assertSame(
            [
                'percentage' => '',
                'fixed'      => '',
            ],
            $transformer->to_legacy( 'garbage' )
        );
    }

    public function test_round_trip_preserves_legacy_shape(): void {
        $transformer = new WithdrawChargeTransformer();

        $legacy = [ 'fixed' => '1.23', 'percentage' => '4.56' ];
        $back   = $transformer->to_legacy( $transformer->to_new( $legacy ) );

        $this->assertSame( $legacy, $back );
    }
}
