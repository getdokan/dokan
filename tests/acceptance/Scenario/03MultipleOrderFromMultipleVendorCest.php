<?php
//namespace Scenario;


class MultipleOrderFromMultipleVendorCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Customer add to cart multiple order from multiple vendor
    public function multipleOrderFromMultipleVendor(\Step\Acceptance\Login $I,
                                  \Step\Acceptance\MultiSteps $Customer,
                                  \Step\Acceptance\Order $MultipleVendor,
                                  \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsCustomer();
      $Customer->viewMultipleVendorMultipleProduct();
      $MultipleVendor->orderProcessing();
      $I->click('Log out');
      $I->loginAsVendor();
      $vendor->updateOrderStatus();

    }


}
