<?php
use Codeception\Util\Locator;

class MultipleOrderFromSingleVendorCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Customer add to cart multiple order
    public function multipleOrderFromSingleVendor(\Step\Acceptance\Login $I, 
                                                  \Step\Acceptance\Product $Customer,
                                                  \Step\Acceptance\Order $Multiple)
    {
      $I->loginAsCustomer();
      $Customer->viewMultipleProduct();
      $Multiple->orderProcessing();

    }

    //Vendore update multiple order status
    public function orderStatusChange(\Step\Acceptance\Login $I,
                                        \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsVendor();
      $vendor->updateOrderStatus();
    }
}
