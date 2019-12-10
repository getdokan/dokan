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
      // $I->amOnPage('store-listing/');
      // $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
      // $I->click('//div[@id="dokan-content"]/div[3]/ul/li/a/img');
      // $I->click('Add to cart');
      // $I->amOnPage('store-listing/');
      // $I->wait(5);
      // $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li[2]/div/div[2]/a');
      // $I->click('//div[@id="dokan-content"]/div[3]/ul/li/a/img');
      // $I->click('Add to cart');
      // $I->waitForElement('.woocommerce-message', 30);
      // $I->click('View cart');
      // $I->click('Proceed to checkout');
      // $I->wait(5);
      // // $I->click('//div[@id="payment"]/div/button');
      // $I->click('Place order');
      // $I->waitForElement('.entry-title', 30);
      // // $I->waitForText('Thank you. Your order has been received.', 30, '.woocommerce-order');
      // // $I->see('Thank you. Your order has been received');
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
