<?php

namespace Commission;

use WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator;
use WeDevs\Dokan\Commission\CommissionContext;
use WeDevs\Dokan\Commission\Strategies\GlobalCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\OrderItemCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\ProductCommissionSourceStrategy;
use WeDevs\Dokan\Commission\Strategies\VendorCommissionSourceStrategy;
use WeDevs\Dokan\ProductCategory\Helper;
use WP_UnitTestCase;

class CommissionTest extends WP_UnitTestCase {

    /**
     * Set up
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        $categories = [
            'Category 1',
            'Category 2',
            'Category 3',
            'Category 4',
            'Category 5',
            'Category 6',
            'Category 7',
            'Category 8',
            'Category 9',
            'Category 10',
        ];

        foreach ( $categories as $category_name ) {
            if ( ! term_exists( $category_name, 'product_cat' ) ) {
                wp_insert_term(
                    $category_name, // the term
                    'product_cat',  // the taxonomy
                    [
                        'description' => 'Description for ' . $category_name,
                        'slug'        => sanitize_title( $category_name ),
                    ]
                );
            }
        }
    }

    /**
     * Test the calculation with no data saved.
     *
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @return void
     */
    public function test_that_we_can_get_commission_with_non_existed_product_and_vendor() {
        $orderItemId = 1; // Example IDs
        $productId   = 103;
        $vendorId    = 2;
        $category_id = 15;     // Example cat

        $strategies = [
            new OrderItemCommissionSourceStrategy( $orderItemId ),
            new ProductCommissionSourceStrategy( $productId ),
            new VendorCommissionSourceStrategy( $vendorId, $category_id ),
            new GlobalCommissionSourceStrategy( $category_id ),
        ];

        $context      = new CommissionContext( $strategies );
        $productPrice = 100.00; // Example product price
        $commission   = $context->calculate_commission( $productPrice, 1 );

        $this->assertTrue( is_a( $commission, 'WeDevs\Dokan\Commission\Utils\CommissionData' ) );
        $this->assertIsArray( $commission->get_data() );
        $this->assertEquals( 'none', $commission->get_source() );
        $this->assertEquals( 0, $commission->get_per_item_admin_commission() );
        $this->assertEquals( 0, $commission->get_admin_commission() );
        $this->assertEquals( $productPrice, $commission->get_vendor_earning() );
        $this->assertEquals( 1, $commission->get_total_quantity() );
        $this->assertEquals( $productPrice, $commission->get_total_amount() );
        $this->assertEquals( 'none', $commission->get_type() );
        $this->assertEquals( [], $commission->get_parameters() );
    }

    /**
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @throws \WC_Data_Exception
     *
     * @return void
     */
    public function test_fixed_commission_calculation_works_properly_for_smaller_amount_then_commission_amount_in_global() {
        $commission_global_options = [
            "shipping_fee_recipient"           => "admin",
            "tax_fee_recipient"                => "admin",
            "shipping_tax_fee_recipient"       => "admin",
            "new_seller_enable_selling"        => "on",
            "commission_type"                  => "fixed",
            "admin_percentage"                 => "5",
            "additional_fee"                   => "5",
            "order_status_change"              => "on",
            "commission_category_based_values" => [
                "all"   => [
                    "flat"       => "",
                    "percentage" => "",
                ],
                "items" => [
                    17 => [
                        "flat"       => "5",
                        "percentage" => "10",
                    ],
                ],
            ],
        ];
        update_option( 'dokan_selling', $commission_global_options );

        $vendor = dokan()->vendor->create(
            [
                'user_login' => 'custom-vendor-' . rand(),
            ],
        );
        wp_set_current_user( $vendor->get_id() );

        $product = dokan()->product->create(
            [
                'name'          => 'custom_product_' . rand(),
                'regular_price' => 2,
                'categories'    => [ 15 ],
            ]
        );

        dokan_override_product_author( $product, $vendor->get_id() );

        $chosen_cat = Helper::get_saved_products_category( $product->get_id() )['chosen_cat'];
        Helper::generate_and_set_chosen_categories( $product->get_id(), $chosen_cat );

        $vendor_earning   = dokan()->commission->get_earning_by_product( $product, 'seller' );
        $admin_commission = dokan()->commission->get_earning_by_product( $product, 'admin' );

        $this->assertEquals( 0, $vendor_earning );
        $this->assertEquals( 2, $admin_commission );
    }

    /**
     * @since DOKAN_SINCE
     *
     * @test
     *
     * @return void
     */
    public function test_that_we_can_get_the_legacy_commission_types() {
        $this->assertTrue( method_exists( dokan()->commission, 'get_legacy_commission_types' ) );

        $legacy_commission_types = dokan()->commission->get_legacy_commission_types();

        $this->assertSame(
            array_keys( $legacy_commission_types ),
            [
                'combine',
                'percentage',
                'flat',
            ]
        );
    }

    public function product_settings_data_provider() {
        return [
            [
                [
                    'product_setting' => [
                        'percentage' => 5,
                        'type'       => 'fixed',
                        'flat'       => 5,
                    ],
                    'global_setting'  => [
                        "shipping_fee_recipient"           => "admin",
                        "tax_fee_recipient"                => "admin",
                        "shipping_tax_fee_recipient"       => "admin",
                        "new_seller_enable_selling"        => "on",
                        "commission_type"                  => "fixed",
                        "admin_percentage"                 => "5",
                        "additional_fee"                   => "5",
                        "order_status_change"              => "on",
                        "commission_category_based_values" => [
                            "all"   => [
                                "flat"       => "",
                                "percentage" => "",
                            ],
                            "items" => [
                                17 => [
                                    "flat"       => "5",
                                    "percentage" => "10",
                                ],
                            ],
                        ],
                    ],
                    'vendor_settings' => [
                        'dokan_admin_percentage'      => 5,
                        'dokan_admin_percentage_type' => 'fixed',
                        'dokan_admin_additional_fee'  => 5,
                        'admin_category_commission'   => [
                            "all"   => [
                                "flat"       => "",
                                "percentage" => "",
                            ],
                            "items" => [
                                17 => [
                                    "flat"       => "5",
                                    "percentage" => "10",
                                ],
                            ],
                        ],
                    ],
                    'category_id'    => 20,
                    'total_price'    => 150,
                    'total_quantity' => 1,
                    'category' => [
                        15
                    ],

                ],
                [
                    'is_applicable'             => true,
                    'source'                    => 'fixed',
                    'admin_commission'          => 12.5,
                    'per_item_admin_commission' => 12.5,
                    'vendor_earning'            => 137.5,
                    'total_quantity'            => 1,
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\FixedCommissionCalculator',
                ],
            ],
            [
                [
                    'product_setting' => '',
                    'global_setting'  => [
                        "shipping_fee_recipient"           => "admin",
                        "tax_fee_recipient"                => "admin",
                        "shipping_tax_fee_recipient"       => "admin",
                        "new_seller_enable_selling"        => "on",
                        "commission_type"                  => "fixed",
                        "admin_percentage"                 => "5",
                        "additional_fee"                   => "5",
                        "order_status_change"              => "on",
                        "commission_category_based_values" => [
                            "all"   => [
                                "flat"       => "",
                                "percentage" => "",
                            ],
                            "items" => [
                                17 => [
                                    "flat"       => "5",
                                    "percentage" => "10",
                                ],
                            ],
                        ],
                    ],
                    'vendor_settings' => [
                        'percentage'      => 5,
                        'type' => CategoryBasedCommissionCalculator::SOURCE,
                        'flat'  => 5,
                        'category_commissions'   => [
                            "all"   => [
                                "flat"       => "",
                                "percentage" => "",
                            ],
                            "items" => [
                                17 => [
                                    "flat"       => "5",
                                    "percentage" => "10",
                                ],
                            ],
                        ],
                    ],
                    'category_id'    => 17,
                    'total_price'    => 300,
                    'category' => [
                        '15',
                        '17',
                        '20',
                    ],
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => CategoryBasedCommissionCalculator::SOURCE,
                    'admin_commission'          => 35,
                    'per_item_admin_commission' => 15,
                    'vendor_earning'            => 265,
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator',
                ],
            ],
            [
                [
                    'product_setting' => '',
                    'global_setting'  => [
                        "shipping_fee_recipient"           => "admin",
                        "tax_fee_recipient"                => "admin",
                        "shipping_tax_fee_recipient"       => "admin",
                        "new_seller_enable_selling"        => "on",
                        "commission_type"                  => "fixed",
                        "admin_percentage"                 => "10",
                        "additional_fee"                   => "5",
                        "order_status_change"              => "on",
                        "commission_category_based_values" => [
                            "all"   => [
                                "flat"       => "",
                                "percentage" => "",
                            ],
                            "items" => [
                                17 => [
                                    "flat"       => "5",
                                    "percentage" => "10",
                                ],
                            ],
                        ],
                    ],
                    'vendor_settings' => [],
                    'category_id'    => 17,
                    'total_price'    => 300,
                    'category' => [
                        '15',
                        '17',
                        '20',
                    ],
                ],
                [
                    'is_applicable'             => true,
                    'source'                    => CategoryBasedCommissionCalculator::SOURCE,
                    'admin_commission'          => 35,
                    'per_item_admin_commission' => 15,
                    'vendor_earning'            => 265,
                    'calculator'                => 'WeDevs\Dokan\Commission\Calculators\CategoryBasedCommissionCalculator',
                ],
            ],
        ];
    }

    /**
     * @dataProvider product_settings_data_provider
     * @test
     * @throws \WC_Data_Exception
     * @return void
     */
    public function test_get_earning_by_product_method( $settings, $expected ) {

        $vendor = dokan()->vendor->create(
            [
                'user_login' => 'custom-vendor-' . rand(),
            ],
        );
        wp_set_current_user( $vendor->get_id() );

        $product = dokan()->product->create(
            [
                'name'          => 'custom_product_' . rand(),
                'regular_price' => $settings['total_price'],
                'categories'    => $settings['category'],
            ]
        );

        dokan()->product->save_commission_settings( $product->get_id(), $settings['product_setting'] );
        $vendor->save_commission_settings( $settings['vendor_settings'] );
        update_option( 'dokan_selling', $settings['global_setting'] );

        dokan_override_product_author( $product, $vendor->get_id() );

        $chosen_cat = Helper::get_saved_products_category( $product->get_id() )['chosen_cat'];
        Helper::generate_and_set_chosen_categories( $product->get_id(), $chosen_cat );

        $vendor_earning   = dokan()->commission->get_earning_by_product( $product, 'seller' );
        $admin_commission = dokan()->commission->get_earning_by_product( $product, 'admin' );

        $this->assertEquals( $expected['admin_commission'], $admin_commission );
        $this->assertEquals( $expected['vendor_earning'], $vendor_earning );
    }
}
