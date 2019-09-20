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
    public function addProduct(\Step\Acceptance\Login $I, \Page\Acceptance\AccountPage $vendor,
                                  \Page\Acceptance\ProductPage $product)
    {
      $I->loginAsVendor();
      // $vendor->login('vendor','vendor');
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
      // $I->click('Add to cart');
    	// $I->click('View cart');
    	// $I->click('Proceed to checkout');
      // $I->wait(5);
      // $I->click('//div[@id="payment"]/div/button');




      // // $customer->login('customer','customer');
      // $I->amOnPage(Customer::$URL);
      // $I->click(Customer::$viewProduct);
      // // $I->click(Customer::$addToCart);
      // // $I->click('add-to-cart');
      // $I->click(Locator::contains('//button[@name="add-to-cart"]', 'Add to cart'));
      // $I->click(Customer::$viewOrder);
      // $I->click(Customer::$processOrder);
      // $I->wait(5);
      // $I->click(Customer::$placeOrder);
    }

    public function orderStatusChange(\Step\Acceptance\Login $I, \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsVendor();
      $vendor->updateOrderStatus();

    }
}
