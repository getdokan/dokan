<?php
use Codeception\Util\Locator;

class MultipleOrderFromSingleVendorCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Customer add to cart multiple order
    public function multipleOrderFromSingleVendor(\Step\Acceptance\MultiSteps $I)
    {
      $I->loginAsCustomer();
      $I->viewMultipleProduct();
      $I->placeOrder();

    }

    //Vendore update multiple order status
    public function orderStatusChange(\Step\Acceptance\Login $I,
                                        \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsVendor();
      $vendor->updateOrderStatus();
    }
}
