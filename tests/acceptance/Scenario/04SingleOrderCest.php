<?php
// use  Page\Acceptance\AccountPage as Vendor;
use  Page\Acceptance\OrderPage as Customer;
use Codeception\Util\Locator;

class AddProductAndSingleOrderCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    //Customer add to cart single order
    public function singleOrder(\Step\Acceptance\MultiSteps $I)
    {
      $I->loginAsCustomer();
      $I->viewSingleProduct();
      $I->placeOrder();    
    }

    //Vendor Update order status
    public function orderStatusChange(\Step\Acceptance\Login $I,
                                        \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsVendor();
      $vendor->updateOrderStatus();

    }
}
