<?php
//namespace Scenario;


class MultipleOrderFromMultipleVendorCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Customer add to cart multiple order from multiple vendor
    public function multipleOrderFromMultipleVendor(\Step\Acceptance\MultiSteps $I)
    {
      $I->loginAsCustomer();
      $I->viewMultipleVendorMultipleProduct();
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
