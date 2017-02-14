<?php

class Dokan_Test_Seller extends WP_UnitTestCase {

    private $seller_one = 0;
    private $seller_two = 0;

    public function setup() {
        parent::setup();

        $this->create_sellers();
    }

    public function tearDown() {
        parent::tearDown();
    }

    public function create_sellers() {
        $this->seller_one = $this->factory->user->create( array(
            'role'        => 'seller',
            'user_login'  => 'seller_one',
            'description' => 'seller_one',
        ) );

        $this->seller_two = $this->factory->user->create( array(
            'role'        => 'seller',
            'user_login'  => 'seller_two',
            'description' => 'seller_two',
        ) );
    }

    function test_create_seller() {
        $this->assertEquals( 'seller_one', get_userdata( $this->seller_one )->user_login );
        $this->assertEquals( 'seller_two', get_userdata( $this->seller_two )->user_login );
    }

    public function test_create_seller_product() {
        $product_id = Dokan_Test_Helpers::create_product( 'Jetpack', 10, $this->seller_one );

        $this->assertEquals( $this->seller_one, get_post_field( 'post_author', $product_id ) );
        $this->assertInstanceOf( 'WC_Product_Simple', get_product( $product_id ) );
        $this->assertEquals( '10', get_product( $product_id )->get_price() );
    }

}