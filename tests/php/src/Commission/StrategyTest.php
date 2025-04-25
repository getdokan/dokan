<?php

namespace WeDevs\Dokan\Test\Commission;

use Mockery;
use WeDevs\Dokan\Commission\Strategies\AbstractStrategy;
use WeDevs\Dokan\Commission\Strategies\DefaultStrategy;
use WeDevs\Dokan\Commission\Strategies\OrderItem;
use WeDevs\Dokan\Commission\Strategies\Product as ProductStrategy;
use WeDevs\Dokan\Commission\Strategies\Vendor as VendorStrategy;
use WeDevs\Dokan\Test\DokanTestCase;

class StrategyTest extends DokanTestCase {
    protected $product;

    public function setUp(): void {
        parent::setUp();
        $this->product = $this->factory()->product->set_seller_id( $this->seller_id1 )->create_and_get(
            [
				'post_title' => 'Test Product',
				'post_type'  => 'product',
			]
        );
    }

    public function test_order_item_strategy(){
        $order_item = $this->get_order_item();
        $order_item->add_meta_data( '_dokan_commission_source', 'order_item' );
        $order_item->add_meta_data( '_dokan_commission_type', 'fixed' );
        $order_item->add_meta_data( '_dokan_commission_rate', '12' );
        $order_item->add_meta_data( '_dokan_additional_fee', '7' );

        $order_item_strategy = new OrderItem( $order_item );
        $settings = $order_item_strategy->get_settings();

        $this->assert_save_settings( $order_item_strategy, $settings );

        $this->assertEquals( $settings->get_percentage(), 12 );
        $this->assertEquals( $settings->get_flat(), 7 );

        $this->assertInstanceOf( 'WeDevs\Dokan\Commission\Model\Setting', $settings );
        $this->assertEquals( OrderItem::SOURCE, $settings->get_source() );
    }

    public function test_order_item_strategy_propagated_to_product() {
        $order_item = $this->get_order_item();
        $product = wc_get_product( $order_item->get_product_id() );

        $product->add_meta_data( '_per_product_admin_commission_type', 'fixed', true );
        $product->add_meta_data( '_per_product_admin_commission', '15', true );
        $product->add_meta_data( '_per_product_admin_additional_fee', '5', true );
        $product->save();

        $order_item_strategy = new OrderItem( $order_item );

        $settings = $order_item_strategy->get_settings();

        $this->assert_save_settings( $order_item_strategy, $settings );

        $this->assertEquals( $settings->get_percentage(), 15 );
        $this->assertEquals( $settings->get_flat(), 5 );

        $this->assertInstanceOf( 'WeDevs\Dokan\Commission\Model\Setting', $settings );
        $this->assertEquals( ProductStrategy::SOURCE, $settings->get_source() );
    }

    public function test_order_item_strategy_propagated_to_vendor() {
        $order_item = $this->get_order_item();
        $vendor_id = dokan_get_vendor_by_product( $order_item->get_product_id(), true );

        $vendor = dokan()->vendor->get( $vendor_id );

        $vendor->update_meta( 'dokan_admin_percentage', '10' );
        $vendor->update_meta( 'dokan_admin_percentage_type', 'fixed' );
        $vendor->update_meta( 'dokan_admin_additional_fee', '6' );

        $order_item_strategy = new OrderItem( $order_item );

        $settings = $order_item_strategy->get_settings();

        $this->assert_save_settings( $order_item_strategy, $settings );

        $this->assertInstanceOf( 'WeDevs\Dokan\Commission\Model\Setting', $settings );
        $this->assertEquals( $settings->get_percentage(), 10 );
        $this->assertEquals( $settings->get_flat(), 6 );

        $this->assertEquals( VendorStrategy::SOURCE, $settings->get_source() );
    }

    public function test_order_item_strategy_propagated_to_default() {
        $order_item = $this->get_order_item();
        $order_item_strategy = new OrderItem( $order_item );
        $settings = $order_item_strategy->get_settings();

        $this->assert_save_settings( $order_item_strategy, $settings );

        $this->assertInstanceOf( 'WeDevs\Dokan\Commission\Model\Setting', $settings );
        $this->assertEquals( DefaultStrategy::SOURCE, $settings->get_source() );
    }

    protected function assert_save_settings( AbstractStrategy $order_item_strategy, $settings ) {
        $mock_order_item = Mockery::mock( \WC_Order_Item_Product::class, );
        $mock_order_item
            ->shouldReceive( 'save' )
            ->andReturn( true );
        $mock_order_item->shouldReceive( 'save_meta_data' )
            ->andReturn( true );

        $mock_order_item
            ->shouldReceive( 'update_meta_data' )
            ->andReturnUsing(
                function ( $key, $value ) use ( $settings ) {
                    if ( '_dokan_commission_source' === $key ) {
                            $this->assertEquals( $value, $settings->get_source() );
                    }
                    if ( '_dokan_commission_type' === $key ) {
                        $this->assertEquals( $value, $settings->get_type() );
                    }

                    if ( '_dokan_commission_rate' === $key ) {
                        $this->assertEquals( floatval( $value ), $settings->get_percentage() );
                    }
                    if ( '_dokan_additional_fee' === $key ) {
                        $this->assertEquals( floatval( $value ), $settings->get_flat() );
                    }
                }
            );

        $order_item_strategy->save_settings_to_order_item( $mock_order_item );
	}

    protected function get_order_item() {
        $order_item = new \WC_Order_Item_Product();
        $order_item->set_product_id( $this->product->get_id() );
        $order_item->set_quantity( 2 );

        return $order_item;
    }
}
