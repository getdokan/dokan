<?php
//namespace Scenario;


class MultipleOrderFromMultipleVendorCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Customer add to cart multiple order from multiple vendor
    public function multipleOrderFromMultipleVendor(\Step\Acceptance\Login $I,
                                  \Step\Acceptance\Login $customer,
                                  \Step\Acceptance\Order $customerMultiple,\Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsCustomer();
      $I->amOnPage('store-listing/');
      $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
      $I->click('//div[@id="dokan-content"]/div[4]/ul/li/a/img');
      $I->click('Add to cart');
      $I->amOnPage('store-listing/');
      $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li[2]/div/div[2]/a');
      $I->click('//div[@id="dokan-content"]/div[3]/ul/li/a/img');
      $customerMultiple->orderProcessing();
      $I->click('Log out');
      $I->loginAsVendor();
      $vendor->updateOrderStatus();

    }


}
