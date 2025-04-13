<?php

namespace WeDevs\Dokan\Test\Commission;

use WeDevs\Dokan\Commission\Formula\Flat;
use WeDevs\Dokan\Commission\Formula\Percentage;
use WeDevs\Dokan\Commission\Strategies\OrderItem;
use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\Vendor\Coupon;

class BackwordCompatibility extends DokanTestCase {

    private array $category_ids;

    /**
     * Set up
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        $categories = [
            'Category_1',
            'Category_2',
            'Category_3',
            'Category_4',
            'Category_5',
            'Category_6',
            'Category_7',
            'Category_8',
            'Category_9',
            'Category_10',
        ];

        $ids = [];

        foreach ( $categories as $category_name ) {
            if ( ! term_exists( $category_name, 'product_cat' ) ) {
                $term = wp_insert_term(
                    $category_name, // the term
                    'product_cat',  // the taxonomy
                    [
                        'description' => 'Description for ' . $category_name,
                        'slug'        => sanitize_title( $category_name ),
                    ]
                );

                $ids[] = $term['term_id'];
            }
        }

        $this->category_ids = $ids;

        add_action(
            'dokan_after_coupon_info_data_updated_on_order_item_meta', function ( $order_item, $coupon_info ) {
				wc_delete_order_item_meta( $order_item->get_id(), Coupon::DOKAN_COUPON_META_KEY );
			}, 10, 2
        );
    }

    /**
     *
     */
    public function product_settings_data_provider() {
        return [
            [
                [
                    'data_set'        => 1,
                    'product_setting' => [
                        'percentage' => '',
                        'type'       => 'fixed',
                        'flat'       => '',
                    ],
                    'global_setting'  => [
                        'shipping_fee_recipient'           => 'admin',
                        'tax_fee_recipient'                => 'admin',
                        'shipping_tax_fee_recipient'       => 'admin',
                        'new_seller_enable_selling'        => 'on',
                        'commission_type'                  => 'fixed',
                        'admin_percentage'                 => 30,
                        'additional_fee'                   => 0,
                        'order_status_change'              => 'on',
                        'product_category_style'           => 'single',
                        'commission_category_based_values' => [
                            'all'   => [
                                'flat'       => '',
                                'percentage' => '',
                            ],
                            'items' => [
                                'category_1' => [
                                    'flat'       => '5',
                                    'percentage' => '10',
                                ],
                            ],
                        ],
                    ],
                    'vendor_settings' => [
                        'dokan_admin_percentage'      => '',
                        'dokan_admin_percentage_type' => 'fixed',
                        'dokan_admin_additional_fee'  => '',
                        'category_commissions'        => [
                            'all'   => [
                                'flat'       => '',
                                'percentage' => '',
                            ],
                            'items' => [
                                'category_2' => [
                                    'flat'       => '5',
                                    'percentage' => '10',
                                ],
                            ],
                        ],
                    ],
                    'category_id'     => 'category_2',
                    'products' => [
                        [
                            'product_id' => 0,
                            'quantity'   => 1,
                            'price'      => 200,
                            'line_item_meta' => [
                                [
                                    'key'   => '_dokan_commission_rate',
                                    'value' => 10,
                                ],
                                [
                                    'key'   => '_dokan_commission_type',
                                    'value' => 'percentage',
                                ],
                            ],
                        ],
                    ],
                    'coupons'         => [],
                    'order_metas'     => [
                        [
                            'key'    => 'dokan_gateway_fee_paid_by',
                            'value'  => 'admin',
                            'unique' => true,
                        ],
                        [
                            'key'    => 'dokan_gateway_fee',
                            'value'  => 2,
                            'unique' => true,
                        ],
                    ],
                ],
                [
                    'strategy_source'           => OrderItem::SOURCE,
                    'calculator_source'         => Percentage::SOURCE,
                    'is_applicable'             => true,
                    'admin_commission'          => 18,
                    'vendor_earning'            => 180,
                    'total_quantity'            => 1,
                ],
            ],
            [
                [
                    'data_set'        => 1,
                    'product_setting' => [
                        'percentage' => '',
                        'type'       => 'fixed',
                        'flat'       => '',
                    ],
                    'global_setting'  => [
                        'shipping_fee_recipient'           => 'admin',
                        'tax_fee_recipient'                => 'admin',
                        'shipping_tax_fee_recipient'       => 'admin',
                        'new_seller_enable_selling'        => 'on',
                        'commission_type'                  => 'fixed',
                        'admin_percentage'                 => 30,
                        'additional_fee'                   => 0,
                        'order_status_change'              => 'on',
                        'product_category_style'           => 'single',
                        'commission_category_based_values' => [
                            'all'   => [
                                'flat'       => '',
                                'percentage' => '',
                            ],
                            'items' => [
                                'category_1' => [
                                    'flat'       => '5',
                                    'percentage' => '10',
                                ],
                            ],
                        ],
                    ],
                    'vendor_settings' => [
                        'dokan_admin_percentage'      => '',
                        'dokan_admin_percentage_type' => 'fixed',
                        'dokan_admin_additional_fee'  => '',
                        'category_commissions'        => [
                            'all'   => [
                                'flat'       => '',
                                'percentage' => '',
                            ],
                            'items' => [
                                'category_2' => [
                                    'flat'       => '5',
                                    'percentage' => '10',
                                ],
                            ],
                        ],
                    ],
                    'category_id'     => 'category_2',
                    'products' => [
                        [
                            'product_id' => 0,
                            'quantity'   => 5,
                            'price'      => 30,
                            'line_item_meta' => [
                                [
                                    'key'   => '_dokan_commission_rate',
                                    'value' => 20,
                                ],
                                [
                                    'key'   => '_dokan_commission_type',
                                    'value' => 'flat',
                                ],
                            ],
                        ],
                    ],
                    'coupons'         => [],
                    'order_metas'     => [
                        [
                            'key'    => 'dokan_gateway_fee_paid_by',
                            'value'  => 'seller',
                            'unique' => true,
                        ],
                        [
                            'key'    => 'dokan_gateway_fee',
                            'value'  => 2,
                            'unique' => true,
                        ],
                    ],
                ],
                [
                    'strategy_source'           => OrderItem::SOURCE,
                    'calculator_source'         => Flat::SOURCE,
                    'is_applicable'             => true,
                    'admin_commission'          => 100,
                    'vendor_earning'            => 48,
                    'total_quantity'            => 5,
                ],
            ],
        ];
    }

    public function replace_categoty_id( $items ) {
        $data = [];

        foreach ( $items as $key => $values ) {
            $index = str_replace( 'category_', '', $key );

            $data[ $this->category_ids[ $index ] ] = $values;
        }

        return $data;
    }

    protected function create_order_with_coupon( $settings, $expected ) {
        if ( isset( $settings['vendor_settings']['category_commissions'] ) ) {
            $settings['global_setting']['commission_category_based_values']['items'] = $this->replace_categoty_id( $settings['global_setting']['commission_category_based_values']['items'] );
        }

        if ( isset( $settings['vendor_settings']['category_commissions'] ) ) {
            $settings['vendor_settings']['category_commissions']['items'] = $this->replace_categoty_id( $settings['vendor_settings']['category_commissions']['items'] );
        }

        $vendor   = dokan()->vendor->get( $this->seller_id1 );
        $customer = get_user_by( 'id', $this->customer_id );

        wp_set_current_user( $customer->ID );

        $index      = str_replace( 'category_', '', $settings['category_id'] );
        $chosen_cat = $this->category_ids[ $index ];

        $vendor->save_commission_settings( $settings['vendor_settings'] );
        update_option( 'dokan_selling', $settings['global_setting'] );

        $applicable_coupons_data = $settings['coupons'] ?? [];
        $created_coupons         = [];
        if ( ! empty( $applicable_coupons_data ) && is_array( $applicable_coupons_data ) ) {
            foreach ( $applicable_coupons_data as $coupon_data ) {
                $coupon = new \WC_Coupon();
                $coupon->set_code( $coupon_data['code'] );
                $coupon->set_discount_type( $coupon_data['discount_type'] );
                $coupon->set_amount( $coupon_data['amount'] );

                if ( ! empty( $coupon_data['meta_data'] ) && is_array( $coupon_data['meta_data'] ) ) {
                    foreach ( $coupon_data['meta_data'] as $meta_key => $meta_value ) {
                        $coupon->add_meta_data( $meta_key, $meta_value );
                    }
                }

                $coupon->save_meta_data();
                $coupon->save();

                $created_coupons[] = $coupon;
            }
        }

        $fac_order = $this->factory()->order;
        $fac_order->set_seller_id( $vendor->get_id() );

        if ( ! empty( $created_coupons ) ) {
            foreach ( $created_coupons as $coupon ) {
                $fac_order->set_item_coupon( $coupon );
            }
        }

        $fac_order = $fac_order->create(
            [
                'customer_id' => $customer->ID,
                'line_items'  => array_map(
                    function ( $item ) use ( $vendor, $chosen_cat, $settings ) {
                        $product_id = $this->factory()->product
                        ->set_seller_id( $vendor->get_id() )
                        ->create(
                            [
								'name'          => 'Test Product ' . $vendor->get_id() . 'Price ' . $item['price'],
								'regular_price' => $item['price'],
								'categories'    => $this->category_ids,
                            ]
                        );

                        $product = dokan()->product->get( $product_id );
                        $product->update_meta_data( 'chosen_product_cat', [ $chosen_cat ] );
                        $product->save_meta_data();
                        $product->save();
                        dokan()->product->save_commission_settings( $product->get_id(), $settings['product_setting'] );

                        return [
							'product_id' => $product->get_id(),
							'quantity'   => $item['quantity'],
							'meta_data'  => $item['line_item_meta'] ?? [],
                        ];
                    }, $settings['products']
                ),
                'meta_data'   => $settings['order_metas'] ?? [],
            ]
        );

        $order = wc_get_order( $fac_order );

        $items = $order->get_items();
        $item = reset( $items );
        $meta = $item->get_meta( Coupon::DOKAN_COUPON_META_KEY );

        $order_commission = new \WeDevs\Dokan\Commission\OrderCommission( $order );

        $admin_commission = $order_commission->get_admin_total_earning();
        $vendor_earning   = $order_commission->get_vendor_total_earning();

        return [
            'admin_commission' => $admin_commission,
            'vendor_earning'   => $vendor_earning,
            'order'            => $order,
        ];
    }

    /**
     * @test
     * @dataProvider product_settings_data_provider
     * @return void
     */
    public function test_get_earning_by_order_method( $settings, $expected ) {
        $result = $this->create_order_with_coupon( $settings, $expected );

        $this->assertEquals( $expected['admin_commission'], $result ['admin_commission'] );
        $this->assertEquals( $expected['vendor_earning'], $result ['vendor_earning'] );
    }
}
