<?php
// use  Page\Acceptance\AccountPage as Vendor;
use  Page\Acceptance\OrderPage as Customer;
use Codeception\Util\Locator;

class AddProductAndSingleOrderCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Vendor Add New Product
    public function addProduct(\Step\Acceptance\Login $I,
                                \Page\Acceptance\ProductPage $product)
    {
      $I->loginAsVendor();
      $product->create('Yellow Watch','250','watch');
    }

    //Customer add to cart single order
    public function singleOrder(\Step\Acceptance\Login $I, 
                                \Step\Acceptance\Product $Customer,
                                \Step\Acceptance\Order $Single)
    {
      $I->loginAsCustomer();
      $Customer->viewSingleProduct();
      $Single->orderProcessing();     
    }

    //Vendor Update order status
    public function orderStatusChange(\Step\Acceptance\Login $I,
                                        \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsVendor();
      $vendor->updateOrderStatus();

    }
}
