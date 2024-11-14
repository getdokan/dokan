<?php

namespace WeDevs\Dokan\Test\Commission\Strategy;

use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Strategies\GlobalStrategy;
use WeDevs\Dokan\Commission\Strategies\Product;
use WeDevs\Dokan\Commission\Strategies\Vendor;
use WeDevs\Dokan\Test\Helpers\WC_Helper_Product;
use WP_UnitTestCase;

class ProductTest extends WP_UnitTestCase {

    /**
     * Test if no setting is saved before.
     *
     * @test
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function test_commission_calculation_for_no_settings() {
        $product = dokan()->product->create(
            [
                'name'          => 'apple',
                'regular_price' => 200,
            ]
        );

        $prodict_strategy = new Product( $product->get_id() );
        $calculator       = $prodict_strategy->create_formula();

        $this->assertNotNull( $calculator );
        $this->assertFalse(  $calculator->is_applicable() );
    }

    /**
     * Different commission data ser.
     *
     * @since DOKAN_SINCE
     *
     * @return array[]
     */
    public function commission_data_settings() {
        return [
            // Fixed commission.
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 0,
                    'percentage'     => 0,
                    'category_id'    => 15,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Fixed',
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 20,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 10,
                    'per_item_admin_commission' => 10,
                    'vendor_earning'            => 140,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Fixed',
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => '',
                    'percentage'     => 10,
                    'category_id'    => 20,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 15,
                    'per_item_admin_commission' => 15,
                    'vendor_earning'            => 135,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Fixed',
                ],
            ],
            [
                [
                    'type'           => 'fixed',
                    'flat'           => null,
                    'percentage'     => null,
                    'category_id'    => 22,
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'fixed',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 400,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Fixed',
                ],
            ],

            // Combine commission.
            [
                [
                    'type'           => 'combine',
                    'flat'           => 0,
                    'percentage'     => 0,
                    'category_id'    => 15,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 150,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => 10,
                    'percentage'     => null,
                    'category_id'    => 20,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 10,
                    'per_item_admin_commission' => 10,
                    'vendor_earning'            => 140,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => '',
                    'percentage'     => 10,
                    'category_id'    => 20,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 15,
                    'per_item_admin_commission' => 15,
                    'vendor_earning'            => 135,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => null,
                    'percentage'     => null,
                    'category_id'    => 22,
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => false,
                    'source'                    => 'combine',
                    'admin_commission'          => 0,
                    'per_item_admin_commission' => 0,
                    'vendor_earning'            => 400,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
            [
                [
                    'type'           => 'combine',
                    'flat'           => 5,
                    'percentage'     => 10,
                    'category_id'    => 22,
                    'total_price'    => 400,
                    'total_quantity' => 4,
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'combine',
                    'admin_commission'          => 45,
                    'per_item_admin_commission' => 11.25,
                    'vendor_earning'            => 355,
                    'total_quantity'            => 4,
                    'calculator'                => 'WeDevs\Dokan\Commission\Formula\Combine',
                ],
            ],
        ];
    }

    /**
     * @test
     *
     * @dataProvider commission_data_settings
     *
     * @param $settings_data
     * @param $expected
     *
     * @return void
     */
    public function test_commission_for_different_data_set( $settings_data, $expected ) {
        $product = dokan()->product->create(
            [
                'name'          => 'apple',
                'regular_price' => 200,
            ]
        );

        dokan()->product->save_commission_settings(
            $product->get_id(),
            [
                'percentage' => $settings_data['percentage'],
                'type'       => $settings_data['type'],
                'flat'       => $settings_data['flat'],
            ]
        );

        $strategy = new Product( $product->get_id() );
        $formula = $strategy->create_formula();

        $this->assertNotNull( $formula );
        $this->assertEquals( $expected['is_applicable'], $formula->is_applicable() );
        $this->assertNotNull( $formula );
        $this->assertTrue( is_a( $formula, 'WeDevs\Dokan\Commission\Formula\AbstractFormula' ) );
        $this->assertTrue( is_a( $formula, $expected['calculator'] ) );

        $formula->set_amount( $settings_data['total_price'] )
                ->set_quantity( $settings_data['total_quantity'] )
                ->calculate();

        $this->assertEquals( $expected['admin_commission'], $formula->get_admin_commission() );
        $this->assertEquals( $expected['vendor_earning'], $formula->get_vendor_earning() );
        $this->assertEquals( $expected['source'], $formula->get_source() );
        $this->assertEquals( $expected['per_item_admin_commission'], $formula->get_per_item_admin_commission() );
        $this->assertEquals( $expected['total_quantity'], $formula->get_items_total_quantity() );
    }

    /**
     * We are test here that for a variation product the commission value will be the same a the parent product.
     *
     * @since DOKAN_SINCE
     *
     * @test
     * @return void
     */
    public function test_that_we_can_get_commission_data_properly_of_a_variation_product() {
        $product    = WC_Helper_Product::create_variation_product();
        $percentage = 19;
        $flat       = 7;

        $parent_commission_data = dokan()->product->save_commission_settings(
            $product->get_id(),
            [
                'percentage' => $percentage,
                'type'       => Percentage::SOURCE,
                'flat'       => $flat,
            ]
        );

        foreach ( $product->get_children() as $variation_id ) {
            $variation_commission_data = dokan()->product->get_commission_settings( $variation_id );

            $this->assertEquals( $parent_commission_data->get_type(), $variation_commission_data->get_type() );
            $this->assertEquals( $parent_commission_data->get_flat(), $variation_commission_data->get_flat() );
            $this->assertEquals( $parent_commission_data->get_percentage(), $variation_commission_data->get_percentage() );
            $this->assertEquals( $parent_commission_data->get_category_commissions(), $variation_commission_data->get_category_commissions() );
            $this->assertEquals( $parent_commission_data->get_meta_data(), $variation_commission_data->get_meta_data() );
            $this->assertEquals( $parent_commission_data->get_category_id(), $variation_commission_data->get_category_id() );
        }
    }
}
