<?php

namespace WeDevs\Dokan\Test\Admin\Settings\Migration\Transformer;

use WeDevs\Dokan\Admin\Settings\Migration\Transformer\SingleProductAppearanceTransformer;
use WP_UnitTestCase;

/**
 * Locks in the slot semantics for the `single_product_page_appearance` field —
 * particularly the inverted `shipping_tab` polarity, which is the only slot
 * that's easy to flip the wrong way during a refactor.
 *
 * @covers \WeDevs\Dokan\Admin\Settings\Migration\Transformer\SingleProductAppearanceTransformer
 */
class SingleProductAppearanceTransformerTest extends WP_UnitTestCase {

    public function test_to_new_passes_through_direct_slots_and_inverts_shipping_tab(): void {
        $transformer = new SingleProductAppearanceTransformer();

        $result = $transformer->to_new(
            [
				'vendor_info'       => 'on',
				'more_products_tab' => '',
				'shipping_tab'      => 'on', // legacy "on" means hidden
			]
        );

        $this->assertSame(
            [
                'vendor_info'       => true,
                'more_products_tab' => false,
                'shipping_tab'      => false, // inverted: legacy "on" → new false
            ],
            $result
        );
    }

    public function test_to_new_treats_missing_shipping_tab_as_visible(): void {
        $transformer = new SingleProductAppearanceTransformer();

        $result = $transformer->to_new(
            [
				'vendor_info'       => 'on',
				'more_products_tab' => 'on',
            // shipping_tab absent from legacy
			]
        );

        $this->assertTrue( $result['shipping_tab'] );
    }

    public function test_to_legacy_inverts_shipping_tab_back_to_disable_flag(): void {
        $transformer = new SingleProductAppearanceTransformer();

        $result = $transformer->to_legacy(
            [
				'vendor_info'       => true,
				'more_products_tab' => false,
				'shipping_tab'      => false, // hide in new
			]
        );

        $this->assertSame(
            [
                'vendor_info'       => 'on',
                'more_products_tab' => 'off',
                'shipping_tab'      => 'on', // inverted back: new false → legacy "on" (disabled)
            ],
            $result
        );
    }

    public function test_round_trip_preserves_visible_shipping_tab(): void {
        $transformer = new SingleProductAppearanceTransformer();

        // Start from canonical legacy values written by to_legacy.
        $legacy = [
            'vendor_info'       => 'on',
            'more_products_tab' => 'on',
            'shipping_tab'      => 'off', // not disabled = visible
        ];
        $new    = $transformer->to_new( $legacy );
        $back   = $transformer->to_legacy( $new );

        $this->assertTrue( $new['shipping_tab'] );
        $this->assertSame( $legacy, $back );
    }

    public function test_non_array_input_is_treated_as_empty(): void {
        $transformer = new SingleProductAppearanceTransformer();

        $this->assertSame(
            [
                'vendor_info'       => false,
                'more_products_tab' => false,
                'shipping_tab'      => true, // no legacy data → tab visible by default
            ],
            $transformer->to_new( null )
        );
    }
}
