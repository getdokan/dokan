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
      $I->amOnPage('/');
      $I->click('//div[@id="content"]/div[3]/div/div/ul/li/a/img');
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
