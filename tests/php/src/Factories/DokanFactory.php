<?php
namespace WeDevs\Dokan\Test\Factories;

use WP_UnitTest_Factory;

class DokanFactory extends WP_UnitTest_Factory {
    /**
	 * Generates customer fixtures for use in tests.
     *
     * @var CustomerFactory
     */
    public $customer;

    /**
	 * Generates customer fixtures for use in tests.
     *
     * @var SellerFactory
     */
    public $seller;

    /**
	 * Generates coupon fixtures for use in tests.
     *
     * @var CouponFactory
     */
    public $coupon;

    /**
    * Generates order fixtures for use in tests.
    *
    * @var OrderFactory
    */
    public $order;

    /**
    * Generates Product fixtures for use in tests.
    *
    * @var ProductFactory
    */
    public $product;

    /**
    * Generates Shipping fixtures for use in tests.
    *
    * @var ShippingFactory
    */
    public $shipping;

    public function __construct() {
        parent::__construct();
        $this->customer = new CustomerFactory( $this );
        $this->seller = new SellerFactory( $this );
        $this->coupon = new CouponFactory( $this );
        $this->product = new ProductFactory( $this );
        $this->order = new OrderFactory( $this );
        $this->shipping = new ShippingFactory( $this );
    }
}
