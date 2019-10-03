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
      $product->create('White Watch','250','watch');
    }

    //Customer add to cart single order
    public function singleOrder(AcceptanceTester $I,
                                \Step\Acceptance\Login $customer,
                                \Step\Acceptance\Order $customerSingle)
    {
      $customer->loginAsCustomer();
      $I->amOnPage('store-listing/');
      $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
      $I->click('//div[@id="dokan-content"]/div[4]/ul/li/a/img');
      // $I->amOnPage('/');
      // $I->click('//div[@id="content"]/div[3]/div/div/ul/li/a/img');
      $customerSingle->orderProcessing();
    }

    //Vendor Update order status
    public function orderStatusChange(\Step\Acceptance\Login $I,
                                        \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsVendor();
      $vendor->updateOrderStatus();

    }
}
